// supabase/functions/market-settlement/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

type SettlementMode = "normal" | "void" | "half_win" | "half_lost";

interface SettleMarketRequest {
  marketId: string;
  resultCode: string;
  settlementMode?: SettlementMode;
}

interface SettlementResponse {
  success: boolean;
  market_id?: string;
  result_code?: string;
  settlement_mode?: string;
  total_bets?: number;
  total_won?: number;
  total_lost?: number;
  total_void?: number;
  total_payout?: number;
  settled_at?: string;
  error?: string;
  error_detail?: string;
}

function json(status: number, payload: any) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      return json(500, {
        success: false,
        error: "Server misconfigured - missing environment variables",
      });
    }

    // Create admin client with service role key (bypasses RLS)
    const admin = createClient(supabaseUrl, serviceKey);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // ===============================================
    // ACTION: settle - Settle a market
    // ===============================================
    if (action === "settle" && req.method === "POST") {
      const body: SettleMarketRequest = await req.json();

      const { marketId, resultCode, settlementMode = "normal" } = body;

      // Validate input
      if (!marketId) {
        return json(400, {
          success: false,
          error: "marketId is required",
        });
      }

      if (!resultCode) {
        return json(400, {
          success: false,
          error: "resultCode is required",
        });
      }

      const validModes: SettlementMode[] = [
        "normal",
        "void",
        "half_win",
        "half_lost",
      ];
      if (!validModes.includes(settlementMode)) {
        return json(400, {
          success: false,
          error: `Invalid settlementMode. Must be one of: ${validModes.join(", ")}`,
        });
      }

      console.log(
        `[MarketSettlement] Settling market ${marketId} with result ${resultCode} (mode: ${settlementMode})`,
      );

      // Call the settlement RPC function
      const { data, error } = await admin.rpc("settle_market", {
        p_market_id: marketId,
        p_result_code: resultCode,
        p_settlement_mode: settlementMode,
      });

      if (error) {
        console.error("[MarketSettlement] RPC error:", error);
        return json(500, {
          success: false,
          error: "Settlement RPC failed",
          details: error.message,
        });
      }

      const result = data as SettlementResponse;

      if (!result.success) {
        console.error("[MarketSettlement] Settlement failed:", result.error);
        return json(400, result);
      }

      console.log(
        `[MarketSettlement] ✅ Market ${marketId} settled successfully:`,
        {
          total_bets: result.total_bets,
          won: result.total_won,
          lost: result.total_lost,
          void: result.total_void,
          payout: result.total_payout,
        },
      );

      return json(200, result);
    }

    // ===============================================
    // ACTION: get-pending - Get pending bets for market
    // ===============================================
    if (action === "get-pending" && req.method === "GET") {
      const marketId = searchParams.get("marketId");

      if (!marketId) {
        return json(400, {
          success: false,
          error: "marketId query parameter is required",
        });
      }

      const { data: bets, error } = await admin
        .from("bets")
        .select("*")
        .eq("market", marketId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        return json(500, {
          success: false,
          error: "Failed to fetch pending bets",
          details: error.message,
        });
      }

      return json(200, {
        success: true,
        market_id: marketId,
        pending_bets: bets?.length || 0,
        bets: bets || [],
      });
    }

    // ===============================================
    // ACTION: get-market - Get market details
    // ===============================================
    if (action === "get-market" && req.method === "GET") {
      const marketId = searchParams.get("marketId");

      if (!marketId) {
        return json(400, {
          success: false,
          error: "marketId query parameter is required",
        });
      }

      const { data: market, error } = await admin
        .from("markets")
        .select("*")
        .eq("id", marketId)
        .maybeSingle();

      if (error) {
        return json(500, {
          success: false,
          error: "Failed to fetch market",
          details: error.message,
        });
      }

      if (!market) {
        return json(404, {
          success: false,
          error: "Market not found",
        });
      }

      return json(200, {
        success: true,
        market,
      });
    }

    // ===============================================
    // ACTION: batch-settle - Settle multiple markets
    // ===============================================
    if (action === "batch-settle" && req.method === "POST") {
      const body: {
        markets: Array<{
          marketId: string;
          resultCode: string;
          settlementMode?: SettlementMode;
        }>;
      } = await req.json();

      if (!body.markets || !Array.isArray(body.markets)) {
        return json(400, {
          success: false,
          error: "markets array is required",
        });
      }

      console.log(
        `[MarketSettlement] Batch settling ${body.markets.length} markets`,
      );

      const results = [];

      for (const market of body.markets) {
        const { data, error } = await admin.rpc("settle_market", {
          p_market_id: market.marketId,
          p_result_code: market.resultCode,
          p_settlement_mode: market.settlementMode || "normal",
        });

        results.push({
          market_id: market.marketId,
          success: !error && data?.success,
          result: data,
          error: error?.message,
        });
      }

      const successCount = results.filter((r) => r.success).length;

      return json(200, {
        success: true,
        total: body.markets.length,
        settled: successCount,
        failed: body.markets.length - successCount,
        results,
      });
    }

    // ===============================================
    // ACTION: auto-settle - Auto-settle using Diamond API
    // ===============================================
    if (action === "auto-settle" && req.method === "POST") {
      const DIAMOND_API_BASE = "http://130.250.191.174:3009";
      const DIAMOND_API_KEY = "mahi4449839dbabkadbakwq1qqd";

      console.log("[AutoSettle] Starting auto-settlement from Diamond API...");

      // Fetch all pending bets
      const { data: pendingBets, error: fetchError } = await admin
        .from("bets")
        .select("*")
        .eq("status", "pending");

      if (fetchError) {
        return json(500, {
          success: false,
          error: "Failed to fetch pending bets",
          details: fetchError.message,
        });
      }

      if (!pendingBets || pendingBets.length === 0) {
        return json(200, {
          success: true,
          message: "No pending bets to settle",
          settled: 0,
        });
      }

      console.log(`[AutoSettle] Found ${pendingBets.length} pending bets`);

      let settledCount = 0;
      let wonCount = 0;
      let lostCount = 0;
      let totalPayout = 0;

      for (const bet of pendingBets) {
        try {
          const isCasino = bet.sport === "CASINO" || bet.bet_on === "fancy";
          let result: any = null;

          // Fetch result from Diamond API
          if (isCasino) {
            const gameType = bet.market_id || bet.event || "dt20";
            const roundId = bet.provider_bet_id || bet.event;

            // Try detail result first
            if (roundId) {
              const detailUrl = `${DIAMOND_API_BASE}/casino/detail_result?type=${gameType}&mid=${roundId}&key=${DIAMOND_API_KEY}`;
              const response = await fetch(detailUrl);
              if (response.ok) {
                const data = await response.json();
                if (data?.data) result = data.data;
              }
            }

            // Fallback to latest result
            if (!result) {
              const resultUrl = `${DIAMOND_API_BASE}/casino/result?type=${gameType}&key=${DIAMOND_API_KEY}`;
              const response = await fetch(resultUrl);
              if (response.ok) {
                const data = await response.json();
                if (data?.data?.[0]) result = data.data[0];
              }
            }
          } else {
            // Sports bet
            const resultUrl = `${DIAMOND_API_BASE}/get-result?key=${DIAMOND_API_KEY}`;
            const response = await fetch(resultUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event_id: bet.event || bet.api_event_id,
                event_name: bet.event_name,
                market_id: bet.market || bet.market_id,
                market_name: bet.market_name,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data?.data) result = data.data;
            }
          }

          if (!result) {
            console.log(`[AutoSettle] No result for bet ${bet.id}`);
            continue;
          }

          // Determine win/loss
          const betType = bet.bet_type?.toUpperCase() || "BACK";
          const selection = bet.selection?.toLowerCase() || "";
          const winner = (result.result || result.winner || "")
            .toString()
            .toLowerCase();

          let isWin = false;
          if (betType === "BACK") {
            isWin =
              selection === winner ||
              selection.includes(winner) ||
              winner.includes(selection);
          } else if (betType === "LAY") {
            isWin = !(
              selection === winner ||
              selection.includes(winner) ||
              winner.includes(selection)
            );
          }

          const status = isWin ? "won" : "lost";
          const payout = isWin ? bet.potential_payout : 0;

          // Update bet
          await admin
            .from("bets")
            .update({
              status,
              payout,
              settled_at: new Date().toISOString(),
              api_result: result,
              auto_settled: true,
            })
            .eq("id", bet.id);

          // Credit wallet if won
          if (isWin) {
            await admin.rpc("increment_balance", {
              p_user_id: bet.user_id,
              p_amount: payout,
            });

            await admin.from("transactions").insert({
              user_id: bet.user_id,
              type: "win",
              amount: payout,
              status: "completed",
              description: `Won bet on ${bet.selection_name} @ ${bet.odds}`,
              provider_ref_id: bet.provider_bet_id,
            });

            wonCount++;
            totalPayout += payout;
          } else {
            lostCount++;
          }

          settledCount++;
        } catch (err) {
          console.error(`[AutoSettle] Error settling bet ${bet.id}:`, err);
        }
      }

      console.log(
        `[AutoSettle] Complete: ${settledCount} settled (${wonCount} won, ${lostCount} lost)`,
      );

      return json(200, {
        success: true,
        settled: settledCount,
        won: wonCount,
        lost: lostCount,
        total_payout: totalPayout,
      });
    }

    return json(400, {
      success: false,
      error:
        "Invalid action. Use: action=settle (POST), action=get-pending (GET), action=get-market (GET), action=batch-settle (POST), or action=auto-settle (POST)",
    });
  } catch (err: any) {
    console.error("[MarketSettlement] Unexpected error:", err);
    return json(500, {
      success: false,
      error: "Internal server error",
      details: err?.message || String(err),
    });
  }
});
