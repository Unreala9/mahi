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

      // Use parsed values
      betData.stake = stake;
      betData.odds = odds;

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
        `[BetPlacement] User: ${user.id}, Wallet Balance: ${balance}, Stake: ${betData.stake}`,
      );

      if (balance < betData.stake) {
        return json(400, {
          success: false,
          error: "Insufficient balance",
          balance,
          required: betData.stake,
          userId: user.id,
        });
      }

      const potentialPayout =
        betData.betType === "BACK"
          ? betData.stake * betData.odds
          : betData.stake * (betData.odds - 1);

      const providerBetId = `${betData.gameType.toLowerCase()}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      const betInsert = await admin
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

      if (betInsert.error) {
        return json(500, {
          success: false,
          error: "Failed to create bet",
          details: betInsert.error.message,
          hint: betInsert.error.hint ?? null,
          code: betInsert.error.code ?? null,
        });
      }

      const bet = betInsert.data;

      const txInsert = await admin
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "bet",
          amount: betData.stake,
          status: "completed",
          provider_ref_id: providerBetId, // mapping reference to provider_ref_id due to schema
          description: `${betData.betType} bet on ${betData.selection} @ ${betData.odds} in ${betData.gameName}`,
        })
        .select()
        .single();

      if (txInsert.error) {
        await admin.from("bets").delete().eq("id", bet.id);

        return json(500, {
          success: false,
          error: "Transaction failed",
          details: txInsert.error.message,
          hint: txInsert.error.hint ?? null,
          code: txInsert.error.code ?? null,
        });
      }

      return json(200, {
        success: true,
        betId: bet.id,
        providerBetId,
        balance: balance - betData.stake,
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
