import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

interface BetSettlement {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
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

    // Settle a bet
    if (action === "settle" && req.method === "POST") {
      const settlementData: BetSettlement = await req.json();

      if (!settlementData.betId) {
        return new Response(JSON.stringify({ error: "betId is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (!["won", "lost", "void"].includes(settlementData.status)) {
        return new Response(
          JSON.stringify({ error: "Invalid status. Use: won, lost, void" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Step 1: Get the bet
      const { data: bet, error: betError } = await serviceClient
        .from("bets")
        .select("*")
        .eq("id", settlementData.betId)
        .maybeSingle();

      if (betError || !bet) {
        return new Response(JSON.stringify({ error: "Bet not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      if (bet.status !== "pending") {
        return new Response(
          JSON.stringify({
            error: "Bet already settled",
            currentStatus: bet.status,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Step 2: Calculate payout
      let payout = 0;
      if (settlementData.status === "won") {
        // Use potential_payout if available, otherwise calculate
        if (bet.potential_payout) {
          payout = Number(bet.potential_payout);
        } else {
          // BACK bet: stake * odds
          // LAY bet: stake * (odds - 1)
          if (bet.bet_type === "BACK") {
            payout = Number(bet.stake) * Number(bet.odds);
          } else if (bet.bet_type === "LAY") {
            payout = Number(bet.stake) * (Number(bet.odds) - 1);
          } else {
            payout = Number(bet.stake) * Number(bet.odds);
          }
        }
      } else if (settlementData.status === "void") {
        // Refund the stake
        payout = Number(bet.stake);
      }
      // For lost bets, payout remains 0

      // Step 3: Update bet status
      const { error: updateError } = await serviceClient
        .from("bets")
        .update({
          status: settlementData.status,
          payout: payout,
          settled_at: new Date().toISOString(),
        })
        .eq("id", settlementData.betId);

      if (updateError) {
        throw new Error(`Failed to update bet: ${updateError.message}`);
      }

      // Step 4: Credit wallet if won or void
      let transaction = null;
      if (payout > 0) {
        const { data: newTransaction, error: txError } = await serviceClient
          .from("wallet_transactions")
          .insert({
            user_id: bet.user_id,
            type: settlementData.status === "void" ? "bonus" : "win",
            amount: payout,
            status: "completed",
            reference: bet.provider_bet_id,
            description:
              settlementData.status === "void"
                ? `Refund for voided bet ${bet.provider_bet_id}`
                : `Win from bet ${bet.provider_bet_id} @ ${bet.odds}`,
          })
          .select()
          .single();

        if (txError) {
          console.error("Transaction error:", txError);
          throw new Error(`Failed to credit wallet: ${txError.message}`);
        }

        transaction = newTransaction;
      }

      // Step 5: Get updated balance
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", bet.user_id)
        .maybeSingle();

      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      const { data: transactions } = await serviceClient
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", bet.user_id)
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

      // Step 6: Log the operation
      await serviceClient.from("api_logs").insert({
        user_id: bet.user_id,
        area: "bets",
        endpoint: "settle",
        request_json: settlementData,
        response_json: { bet, transaction, balance },
        status_code: 200,
        latency_ms: 50,
      });

      return new Response(
        JSON.stringify({
          success: true,
          betId: bet.id,
          status: settlementData.status,
          payout,
          balance,
          transaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Auto-settle casino bet based on result
    if (action === "auto-settle-casino" && req.method === "POST") {
      const { betId, result, winningSelection } = await req.json();

      if (!betId || !result) {
        return new Response(
          JSON.stringify({ error: "betId and result are required" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Get the bet
      const { data: bet, error: betError } = await serviceClient
        .from("bets")
        .select("*")
        .eq("id", betId)
        .maybeSingle();

      if (betError || !bet) {
        return new Response(JSON.stringify({ error: "Bet not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      if (bet.status !== "pending") {
        return new Response(
          JSON.stringify({
            error: "Bet already settled",
            currentStatus: bet.status,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      // Determine if bet won
      const betWon =
        bet.selection === winningSelection ||
        bet.selection_name === winningSelection ||
        bet.selection === result;

      const status = betWon ? "won" : "lost";

      // Use the settle logic
      let payout = 0;
      if (betWon) {
        if (bet.potential_payout) {
          payout = Number(bet.potential_payout);
        } else {
          if (bet.bet_type === "BACK") {
            payout = Number(bet.stake) * Number(bet.odds);
          } else {
            payout = Number(bet.stake) * (Number(bet.odds) - 1);
          }
        }
      }

      // Update bet
      await serviceClient
        .from("bets")
        .update({
          status: status,
          payout: payout,
          settled_at: new Date().toISOString(),
        })
        .eq("id", betId);

      // Credit wallet if won
      let transaction = null;
      if (payout > 0) {
        const { data: newTransaction } = await serviceClient
          .from("wallet_transactions")
          .insert({
            user_id: bet.user_id,
            type: "win",
            amount: payout,
            status: "completed",
            reference: bet.provider_bet_id,
            description: `Win from casino bet ${bet.provider_bet_id}`,
          })
          .select()
          .single();

        transaction = newTransaction;
      }

      // Get balance
      const { data: wallet } = await serviceClient
        .from("wallets")
        .select("balance")
        .eq("user_id", bet.user_id)
        .maybeSingle();

      let balance = wallet?.balance ? Number(wallet.balance) : 0;

      const { data: transactions } = await serviceClient
        .from("wallet_transactions")
        .select("amount, type")
        .eq("user_id", bet.user_id)
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

      return new Response(
        JSON.stringify({
          success: true,
          betId: bet.id,
          status,
          payout,
          balance,
          transaction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action. Use: settle, auto-settle-casino",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  } catch (error) {
    console.error("Bet settlement error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
