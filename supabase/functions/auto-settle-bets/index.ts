import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DIAMOND_API_BASE = "http://130.250.191.174:3009";
const DIAMOND_API_KEY = "mahi4449839dbabkadbakwq1qqd";

interface SettlementRequest {
  bet_id?: string; // Settle specific bet
  auto?: boolean; // Auto-settle all pending bets
}

function json(status: number, payload: any) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceKey) {
      return json(500, { success: false, error: "Server misconfigured" });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { bet_id, auto }: SettlementRequest = await req.json();

    console.log(`[AutoSettle] Request:`, { bet_id, auto });

    let betsToSettle: any[] = [];

    if (bet_id) {
      // Settle specific bet
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("id", bet_id)
        .eq("status", "pending")
        .single();

      if (error || !data) {
        return json(404, { success: false, error: "Bet not found or already settled" });
      }
      betsToSettle = [data];
    } else if (auto) {
      // Auto-settle all pending bets
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("status", "pending");

      if (error) {
        return json(500, { success: false, error: "Failed to fetch pending bets" });
      }
      betsToSettle = data || [];
    } else {
      return json(400, { success: false, error: "Provide bet_id or auto=true" });
    }

    console.log(`[AutoSettle] Found ${betsToSettle.length} bets to settle`);

    let settledCount = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalPayout = 0;

    for (const bet of betsToSettle) {
      try {
        // Determine if it's casino or sports bet
        const isCasino = bet.sport === "CASINO" || bet.bet_on === "fancy";

        let result: any = null;

        if (isCasino) {
          // Casino bet - use casino result API
          result = await fetchCasinoResult(bet);
        } else {
          // Sports bet - use sports result API
          result = await fetchSportsResult(bet);
        }

        if (!result) {
          console.log(`[AutoSettle] No result found for bet ${bet.id}`);
          continue;
        }

        const isWin = checkWin(bet, result);
        const status = isWin ? "won" : "lost";
        const payout = isWin ? bet.potential_payout : 0;

        console.log(`[AutoSettle] Bet ${bet.id}: ${status} (payout: ${payout})`);

        // Update bet status
        const { error: updateError } = await supabase
          .from("bets")
          .update({
            status,
            payout,
            settled_at: new Date().toISOString(),
            api_result: result,
            auto_settled: true,
          })
          .eq("id", bet.id);

        if (updateError) {
          console.error(`[AutoSettle] Error updating bet ${bet.id}:`, updateError);
          continue;
        }

        // Credit wallet if won
        if (isWin) {
          const { data: walletData, error: walletError } = await supabase.rpc(
            "increment_balance",
            {
              p_user_id: bet.user_id,
              p_amount: payout,
            }
          );

          if (walletError || !walletData?.success) {
            console.error(`[AutoSettle] Error crediting wallet:`, walletError || walletData);
            continue;
          }

          // Create win transaction
          await supabase.from("transactions").insert({
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
      `[AutoSettle] Complete: ${settledCount} settled (${wonCount} won, ${lostCount} lost, ₹${totalPayout} paid)`
    );

    return json(200, {
      success: true,
      settled: settledCount,
      won: wonCount,
      lost: lostCount,
      total_payout: totalPayout,
    });
  } catch (err: any) {
    console.error("[AutoSettle] Exception:", err);
    return json(500, {
      success: false,
      error: "Internal server error",
      details: err?.message || String(err),
    });
  }
});

/**
 * Fetch casino game result from Diamond API
 */
async function fetchCasinoResult(bet: any): Promise<any> {
  try {
    // Extract game type from event_name (e.g., "teen62 - Round 195260212134756")
    let gameType = null;

    if (bet.event_name) {
      const eventNameLower = bet.event_name.toLowerCase();
      if (eventNameLower.includes('teen')) gameType = 'teen62';
      else if (eventNameLower.includes('dolidana')) gameType = 'dolidana';
      else if (eventNameLower.includes('dragon') || eventNameLower.includes('tiger')) gameType = 'dt20';
      else if (eventNameLower.includes('andar') || eventNameLower.includes('bahar')) gameType = 'ab20';
      else if (eventNameLower.includes('poker')) gameType = 'poker20';
      else if (eventNameLower.includes('baccarat')) gameType = 'baccarat';
      else if (eventNameLower.includes('teen20')) gameType = 'teen20';
      else if (eventNameLower.includes('teen8')) gameType = 'teen8';
      else if (eventNameLower.includes('3card')) gameType = '3cardjud';
    }

    // Fallback: try provider_bet_id format (casino_teen62_1234567)
    if (!gameType && bet.provider_bet_id) {
      const parts = bet.provider_bet_id.split('_');
      if (parts.length >= 2 && parts[0] === 'casino') {
        gameType = parts[1];
      }
    }

    if (!gameType) {
      console.error(`[Casino] Cannot determine game type for bet ${bet.id}. event_name="${bet.event_name}", provider_bet_id="${bet.provider_bet_id}"`);
      return null;
    }

    console.log(`[Casino] Determined game type: ${gameType} from event_name="${bet.event_name}"`);

    const roundId = bet.event; // Round ID from bet.event field

    // Try detail_result first (for specific round)
    if (roundId) {
      const detailUrl = `${DIAMOND_API_BASE}/casino/detail_result?type=${gameType}&mid=${roundId}&key=${DIAMOND_API_KEY}`;
      console.log(`[Casino] Fetching detail result:`, detailUrl);

      const response = await fetch(detailUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          console.log(`[Casino] Found detail result for round ${roundId}`);
          return data.data;
        }
      }
    }

    // Fallback to latest result
    const resultUrl = `${DIAMOND_API_BASE}/casino/result?type=${gameType}&key=${DIAMOND_API_KEY}`;
    console.log(`[Casino] Fetching latest result:`, resultUrl);

    const response = await fetch(resultUrl);
    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.res && data.data.res.length > 0) {
        const latestResult = data.data.res[0];
        console.log(`[Casino] Latest result: roundId=${latestResult.mid}, winner=${latestResult.win}`);

        // Only return if it matches the bet's round
        if (roundId && latestResult.mid && latestResult.mid.toString() === roundId.toString()) {
          return latestResult;
        } else {
          console.log(`[Casino] Latest result round (${latestResult.mid}) doesn't match bet round (${roundId})`);
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[Casino] Error fetching result:", err);
    return null;
  }
}

/**
 * Fetch sports result from Diamond API
 */
async function fetchSportsResult(bet: any): Promise<any> {
  try {
    const url = `${DIAMOND_API_BASE}/get-result?key=${DIAMOND_API_KEY}`;

    const body = {
      event_id: bet.event || bet.api_event_id,
      event_name: bet.event_name,
      market_id: bet.market || bet.market_id,
      market_name: bet.market_name,
    };

    console.log(`[Sports] Fetching result:`, body);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data) {
        return data.data;
      }
    }

    return null;
  } catch (err) {
    console.error("[Sports] Error fetching result:", err);
    return null;
  }
}

/**
 * Check if bet won based on result
 */
function checkWin(bet: any, result: any): boolean {
  const betType = bet.bet_type?.toUpperCase() || "BACK";
  const selection = bet.selection?.toLowerCase() || "";
  const selectionName = bet.selection_name?.toLowerCase() || "";

  console.log(`[CheckWin] Bet:`, {
    selection,
    selectionName,
    betType,
    resultWinner: result.win || result.winner || result.result,
    resultRoundId: result.mid || result.round_id
  });

  // Casino games - check result.win field
  if (bet.sport === "CASINO" || bet.sport === "casino" || result.win || result.winner) {
    const winner = (result.win || result.winner || result.result || "").toString().toLowerCase();

    // Normalize selection for comparison
    const normalizedSelection = (selection || selectionName).replace(/[\s_-]/g, "");
    const normalizedWinner = winner.replace(/[\s_-]/g, "");

    console.log(`[CheckWin] Casino comparison: "${normalizedSelection}" vs "${normalizedWinner}"`);

    // For BACK bets - selection should match winner
    if (betType === "BACK") {
      const isWin = normalizedSelection === normalizedWinner ||
                    normalizedSelection.includes(normalizedWinner) ||
                    normalizedWinner.includes(normalizedSelection);
      console.log(`[CheckWin] BACK bet result: ${isWin ? 'WON' : 'LOST'}`);
      return isWin;
    }

    // For LAY bets - selection should NOT match winner
    if (betType === "LAY") {
      const isWin = !(normalizedSelection === normalizedWinner ||
                      normalizedSelection.includes(normalizedWinner) ||
                      normalizedWinner.includes(normalizedSelection));
      console.log(`[CheckWin] LAY bet result: ${isWin ? 'WON' : 'LOST'}`);
      return isWin;
    }
  }

  // Sports - Match Odds
  if (bet.market_name?.toLowerCase().includes("match odds") ||
      bet.market_name?.toLowerCase().includes("match winner")) {
    const winner = (result.winner || result.result || "").toString().toLowerCase();

    if (betType === "BACK") {
      return selection === winner || selectionName.includes(winner);
    }

    if (betType === "LAY") {
      return !(selection === winner || selectionName.includes(winner));
    }
  }

  // Sports - Fancy/Session markets
  if (bet.market_name?.toLowerCase().includes("runs") ||
      bet.market_name?.toLowerCase().includes("wickets") ||
      bet.market_name?.toLowerCase().includes("over")) {
    const resultValue = parseFloat(result.result || result.runs || result.score || "0");

    // Parse selection (e.g., "Over 10.5" or "Under 10.5")
    if (selectionName.includes("over")) {
      const threshold = parseFloat(selectionName.match(/[\d.]+/)?.[0] || "0");
      const won = resultValue > threshold;
      return betType === "BACK" ? won : !won;
    }

    if (selectionName.includes("under")) {
      const threshold = parseFloat(selectionName.match(/[\d.]+/)?.[0] || "0");
      const won = resultValue < threshold;
      return betType === "BACK" ? won : !won;
    }

    // Exact match
    const exactMatch = parseFloat(selection);
    if (!isNaN(exactMatch)) {
      const won = resultValue === exactMatch;
      return betType === "BACK" ? won : !won;
    }
  }

  console.warn(`[CheckWin] Unknown market type:`, bet.market_name);
  return false;
}
