import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface BetPlacement {
  gameType: "SPORTS" | "CASINO";
  gameId: string;
  gameName: string;
  marketId: string;
  marketName: string;
  selection: string;
  selectionId?: string;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
  eventId?: string;
  eventName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Service role client for admin operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Place a bet
    if (action === "place" && req.method === "POST") {
      const betData: BetPlacement = await req.json();

      // Validate bet data
      if (!betData.stake || betData.stake <= 0) {
        return new Response(JSON.stringify({ error: "Invalid stake amount" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (!betData.odds || betData.odds <= 0) {
        return new Response(JSON.stringify({ error: "Invalid odds" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Step 1: Check wallet balance
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      const { data: transactions } = await serviceClient
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (transactions) {
        transactions.forEach((tx) => {
          const amt = Number(tx.amount);
          if (["deposit", "win", "bonus"].includes(tx.type)) {
            balance += amt;
          } else if (["withdraw", "bet"].includes(tx.type)) {
            balance -= amt;
          }
        });
      }

      if (balance < betData.stake) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Insufficient balance",
            balance,
            required: betData.stake,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Step 2: Calculate potential payout
      const potentialPayout =
        betData.betType === "BACK"
          ? betData.stake * betData.odds
          : betData.stake * (betData.odds - 1);

      // Step 3: Create bet record
      const providerBetId = `${betData.gameType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: bet, error: betError } = await serviceClient
        .from("bets")
        .insert({
          user_id: user.id,
          provider_bet_id: providerBetId,
          sport: betData.gameType,
          event: betData.eventId || betData.gameId,
          event_name: betData.eventName || betData.gameName,
          market: betData.marketId,
          market_name: betData.marketName,
          selection: betData.selectionId || betData.selection,
          selection_name: betData.selection,
          odds: betData.odds,
          stake: betData.stake,
          status: "pending",
          bet_type: betData.betType,
          potential_payout: potentialPayout,
        })
        .select()
        .single();

      if (betError) {
        console.error("Error creating bet:", betError);
        throw new Error(`Failed to create bet: ${betError.message}`);
      }

      // Step 4: Deduct from wallet
      const { data: transaction, error: txError } = await serviceClient
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "bet",
          amount: betData.stake,
          status: "completed",
          reference: providerBetId,
          description: `${betData.betType} bet on ${betData.selection} @ ${betData.odds} in ${betData.gameName}`,
        })
        .select()
        .single();

      if (txError) {
        // Rollback: Delete the bet if transaction fails
        await serviceClient.from("bets").delete().eq("id", bet.id);

        throw new Error(`Transaction failed: ${txError.message}`);
      }

      // Step 5: Log the operation
      await serviceClient.from("api_logs").insert({
        user_id: user.id,
        area: "bets",
        endpoint: "place",
        request_json: betData,
        response_json: { bet, transaction },
        status_code: 200,
        latency_ms: Date.now() - parseInt(providerBetId.split("_")[1]),
      });

      const newBalance = balance - betData.stake;

      return new Response(
        JSON.stringify({
          success: true,
          betId: bet.id,
          providerBetId,
          balance: newBalance,
          bet,
          transaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Get user's bets
    if (action === "my-bets") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // pending, won, lost, void

      let query = serviceClient
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data: bets, error: betsError } = await query;

      if (betsError) {
        throw new Error(`Failed to fetch bets: ${betsError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          bets,
          count: bets?.length || 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Get bet by ID
    if (action === "get-bet") {
      const betId = searchParams.get("betId");

      if (!betId) {
        return new Response(JSON.stringify({ error: "betId is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const { data: bet, error: betError } = await serviceClient
        .from("bets")
        .select("*")
        .eq("id", betId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (betError || !bet) {
        return new Response(JSON.stringify({ error: "Bet not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          bet,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: place, my-bets, get-bet" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  } catch (error) {
    console.error("Bet placement error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
