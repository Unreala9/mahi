// supabase/functions/bet-placement/index.ts
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

function json(status: number, payload: any) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const startedAt = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !anonKey) {
      return json(500, {
        success: false,
        error: "Server misconfigured",
        details: "Missing SUPABASE_URL or SUPABASE_ANON_KEY in function env",
      });
    }

    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const userRes = await userClient.auth.getUser();

    if (action === "debug-auth") {
      return json(200, {
        success: true,
        hasAuthHeader: !!authHeader,
        authHeaderStartsWithBearer: authHeader.startsWith("Bearer "),
        user: userRes.data.user
          ? { id: userRes.data.user.id, email: userRes.data.user.email }
          : null,
        userError: userRes.error?.message ?? null,
        latency_ms: Date.now() - startedAt,
      });
    }

    if (userRes.error || !userRes.data.user) {
      return json(401, {
        success: false,
        error: "Unauthorized",
        details: userRes.error?.message || "No user from token",
        hasAuthHeader: !!authHeader,
      });
    }

    const user = userRes.data.user;

    if (!serviceKey) {
      return json(500, {
        success: false,
        error: "Server misconfigured",
        details: "Missing SUPABASE_SERVICE_ROLE_KEY (add in Function secrets)",
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    if (action === "place" && req.method === "POST") {
      const betData: BetPlacement = await req.json();

      // Parse and validate stake/odds with explicit casting
      const stake = Number(betData?.stake);
      const odds = Number(betData?.odds);

      if (!stake || isNaN(stake) || stake <= 0) {
        return json(400, {
          success: false,
          error: `Invalid stake amount: ${betData?.stake} (parsed: ${stake})`,
          received: betData,
        });
      }
      if (!odds || isNaN(odds) || odds <= 0) {
        return json(400, {
          success: false,
          error: `Invalid odds: ${betData?.odds} (parsed: ${odds})`,
          received: betData,
        });
      }

      // [HARDENING] Pre-placement time check
      // Ideally we would fetch the match status from Diamond API here
      // to ensure the market is not CLOSED or SUSPENDED.
      // For now, let's add a placeholder comment for the next step of integration.
      console.log(
        `[BetPlacement] Placement request at ${new Date().toISOString()}`,
      );

      // Use parsed values
      betData.stake = stake;
      betData.odds = odds;

      // Calculate Exposure (Liability)
      // BACK: Risk = Stake
      // LAY: Risk = (Odds - 1) * Stake
      let exposure = betData.stake;
      if (betData.betType === "LAY") {
        exposure = betData.stake * (betData.odds - 1);
      }

      // Fetch wallet balance once
      const walletRes = await admin
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (walletRes.error) {
        return json(500, {
          success: false,
          error: "Wallet fetch failed",
          details: walletRes.error.message,
          hint: walletRes.error.hint ?? null,
          code: walletRes.error.code ?? null,
        });
      }

      let balance = walletRes.data?.balance
        ? Number(walletRes.data.balance)
        : 0;

      console.log(
        `[BetPlacement] User: ${user.id}, Wallet Balance: ${balance}, Stake: ${betData.stake}, Exposure: ${exposure}`,
      );

      // Check if balance covers the exposure (not just stake)
      if (balance < exposure) {
        return json(400, {
          success: false,
          error: "Insufficient balance to cover exposure",
          balance,
          required: exposure,
          userId: user.id,
        });
      }

      const potentialPayout = betData.stake * betData.odds;

      const providerBetId = `${betData.gameType.toLowerCase()}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      const { data: bet, error: betError } = await admin
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
          exposure: exposure,
          bet_on: betData.marketName.toLowerCase().includes("fancy")
            ? "fancy"
            : betData.marketName.toLowerCase().includes("bookmaker")
              ? "bookmaker"
              : "odds",
          rate: 100,
          api_event_id: betData.eventId || betData.gameId,
          api_market_type: betData.marketName.toLowerCase().includes("fancy")
            ? "fancy"
            : betData.marketName.toLowerCase().includes("bookmaker")
              ? "bookmaker"
              : "match_odds",
        })
        .select()
        .single();

      if (betError || !bet) {
        return json(500, {
          success: false,
          error: "Failed to create bet",
          details: betError?.message,
        });
      }

      // Deduct balance and create transaction record in one atomic step
      const { data: walletData, error: updateError } = await admin.rpc(
        "deduct_balance",
        {
          p_user_id: user.id,
          p_amount: exposure,
          p_type: "bet_place",
          p_description: `${betData.betType} bet on ${betData.selection} @ ${betData.odds} in ${betData.gameName}`,
          p_reference_id: bet.id,
        },
      );

      if (updateError || !walletData?.success) {
        console.error(
          "Failed to update wallet balance (RPC):",
          updateError || walletData,
        );
        // Rollback bet if money couldn't be deducted
        await admin.from("bets").delete().eq("id", bet.id);

        return json(400, {
          success: false,
          error: walletData?.message || "Deduction failed",
          details:
            updateError?.message ||
            walletData?.message ||
            "Insufficient balance or wallet not found",
          balance: balance, // From previous fetch
          required: exposure,
        });
      }

      const newBalance = walletData?.new_balance ?? balance - betData.stake;

      return json(200, {
        success: true,
        betId: bet.id,
        providerBetId,
        balance: newBalance,
        latency_ms: Date.now() - startedAt,
      });
    }

    if (action === "my-bets" && req.method === "GET") {
      const limit = Number(searchParams.get("limit") || "50");
      const offset = Number(searchParams.get("offset") || "0");
      const status = searchParams.get("status");

      let query = admin
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        return json(500, {
          success: false,
          error: "Failed to fetch bets",
          details: error.message,
        });
      }

      return json(200, { success: true, bets: data });
    }

    return json(400, {
      success: false,
      error:
        "Invalid action. Use: action=place (POST), action=my-bets (GET), or action=debug-auth (GET)",
    });
  } catch (err: any) {
    return json(500, {
      success: false,
      error: "Internal server error",
      details: err?.message || String(err),
    });
  }
});
