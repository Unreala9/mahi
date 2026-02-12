/**
 * Automatic Bet Settlement Service
 * Monitors game results and automatically settles bets
 */

import { supabase } from "@/integrations/supabase/client";
import { callEdgeFunction } from "@/lib/edge";
import { diamondApi } from "./diamondApi";
import { fetchCasinoResult, fetchCasinoDetailResult } from "./casino";

export interface SettlementResult {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
  oldStatus: string;
}

/**
 * Settle a single bet via RPC function
 */
async function settleBet(
  betId: string,
  status: "won" | "lost" | "void",
  payout?: number,
): Promise<boolean> {
  try {
    console.log(
      `[AutoSettle] Settling bet ${betId} as ${status} with payout: ${payout || 0}`,
    );

    // Call RPC function to settle bet (uses SECURITY DEFINER to bypass RLS)
    console.log(`[AutoSettle] Calling settle_single_bet RPC function...`);
    const { data, error } = await supabase.rpc("settle_single_bet", {
      p_bet_id: betId,
      p_status: status,
      p_payout: payout || 0,
    });

    console.log(`[AutoSettle] RPC response:`, data);

    if (error) {
      console.error(`[AutoSettle] ❌ RPC error:`, error);
      return false;
    }

    if (!data || !data.success) {
      console.error(
        `[AutoSettle] ❌ RPC failed to settle bet ${betId}:`,
        data?.error || "No response received",
      );
      console.error(`[AutoSettle] Full response:`, JSON.stringify(data, null, 2));
      return false;
    }

    console.log(`[AutoSettle] ✅ RPC success! Bet ${betId} settled.`);
    console.log(`[AutoSettle] Settlement details:`, {
      bet_id: data.bet_id,
      old_status: data.old_status,
      new_status: data.new_status,
      payout: data.payout,
      transaction_id: data.transaction_id,
    });

    console.log(
      `[AutoSettle] ✅ Bet ${betId} settled successfully via RPC. Status: ${status}, Payout: ${payout || 0}`,
    );
    return true;
  } catch (error) {
    console.error(`[AutoSettle] ❌ Error settling bet ${betId}:`, error);
    console.error(`[AutoSettle] Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return false;
  }
}

/**
 * Settle a single casino bet by bet ID
 * Used when we don't know the game type from bet structure
 */
export async function settleSingleCasinoBet(
  betId: string,
): Promise<SettlementResult[]> {
  try {
    console.log(`[AutoSettle] Settling single casino bet: ${betId}`);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Get the specific bet
    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("id", betId)
      .eq("status", "pending");

    if (error || !bets || bets.length === 0) {
      console.log(`[AutoSettle] Bet ${betId} not found or already settled`);
      return [];
    }

    const bet = bets[0];
    console.log(`[AutoSettle] Bet structure:`, bet);

    // Try to determine game type from event_name or provider_bet_id
    let gameType = null;

    // Check if event_name contains game name
    if (bet.event_name) {
      const eventNameLower = bet.event_name.toLowerCase();
      // Common game names
      if (eventNameLower.includes("teen")) gameType = "teen62";
      else if (
        eventNameLower.includes("dolidana") ||
        eventNameLower.includes("doli")
      )
        gameType = "dolidana";
      else if (eventNameLower.includes("mogambo")) gameType = "mogambo";
      else if (eventNameLower.includes("poison")) gameType = "poison20";
      else if (eventNameLower.includes("abj") || eventNameLower.includes("andar bahar jili")) 
        gameType = "abj";
      else if (
        eventNameLower.includes("dragon") ||
        eventNameLower.includes("tiger")
      )
        gameType = "dt20";
      else if (
        eventNameLower.includes("andar") ||
        eventNameLower.includes("bahar")
      )
        gameType = "ab20";
      else if (eventNameLower.includes("poker")) gameType = "poker20";
      else if (eventNameLower.includes("baccarat")) gameType = "baccarat";
    }

    // If still no game type, try provider_bet_id format
    if (!gameType && bet.provider_bet_id) {
      // Format might be: casino_teen62_1234567
      const parts = bet.provider_bet_id.split("_");
      if (parts.length >= 2 && parts[0] === "casino") {
        gameType = parts[1];
      }
    }

    if (!gameType) {
      console.error(`[AutoSettle] Cannot determine game type for bet ${betId}`);
      return [];
    }

    console.log(`[AutoSettle] Determined game type: ${gameType}`);

    const betRoundId = bet.event;
    let gameResult;
    let resultData;

    // First, check if we already have this result in our database
    if (betRoundId) {
      try {
        const { data: cachedResult, error: cacheError } = await supabase
          .from("casino_results")
          .select("*")
          .eq("game_id", gameType)
          .eq("round_id", betRoundId)
          .maybeSingle();

        if (cachedResult && !cacheError) {
          console.log(
            `[AutoSettle] ✅ Found cached result in database for round ${betRoundId}`,
          );
          resultData = cachedResult.raw;

          // If cached result doesn't have t1 format, convert it
          if (!resultData.t1 && cachedResult.result) {
            resultData = {
              t1: {
                rid: cachedResult.round_id,
                win: cachedResult.result,
              },
            };
          }
        }
      } catch (err) {
        console.log(
          `[AutoSettle] Cache check failed, will fetch from API:`,
          err,
        );
      }
    }

    // Try to fetch specific round result first (if not found in cache)
    if (!resultData && betRoundId) {
      try {
        console.log(
          `[AutoSettle] Fetching detail result for round ${betRoundId}`,
        );
        const detailResult = await fetchCasinoDetailResult(
          gameType,
          betRoundId,
        );

        if (detailResult?.data) {
          console.log(
            `[AutoSettle] Found detail result for round ${betRoundId}:`,
            detailResult.data,
          );
          console.log(
            `[AutoSettle] Detail result full structure:`,
            JSON.stringify(detailResult.data, null, 2),
          );
          resultData = detailResult.data;
        }
      } catch (err: any) {
        console.log(
          `[AutoSettle] Detail result not available (${err.message}), trying latest result`,
        );
      }
    }

    // Fallback to latest result if detail result not found
    if (!resultData) {
      try {
        gameResult = await fetchCasinoResult(gameType);
        console.log(
          `[AutoSettle] Fetched latest result for ${gameType}:`,
          gameResult,
        );

        if (!gameResult?.data?.res || gameResult.data.res.length === 0) {
          console.log(`[AutoSettle] No results available for ${gameType}`);
          return [];
        }

        const latestResult = gameResult.data.res[0];
        const resultRoundId = latestResult.mid;

        console.log(
          `[AutoSettle] Latest result: winner = ${latestResult.win}, roundId = ${resultRoundId}`,
        );

        // Check if bet is for this round
        if (betRoundId && betRoundId !== resultRoundId.toString()) {
          console.warn(
            `[AutoSettle] ⚠️ Result not available yet. Bet round=${betRoundId}, Latest result=${resultRoundId}. Please try again in a moment.`,
          );
          return [];
        }

        resultData = latestResult;
      } catch (err) {
        console.error(
          `[AutoSettle] Failed to fetch result for ${gameType}:`,
          err,
        );
        return [];
      }
    }

    // Extract winner from result data
    // Detail result format: {t1: {rid, mtime, ename, rdesc, card, nat, ...}, t2: null}
    // Regular result format: {win, mid, desc}
    let winner;
    let resultRoundId;

    if (resultData.t1) {
      // Detail result format
      const t1 = resultData.t1;
      console.log(`[AutoSettle] Detail result format - t1:`, t1);
      console.log(`[AutoSettle] All t1 keys:`, Object.keys(t1));

      // Try different common fields for winner
      winner =
        t1.nat || t1.win || t1.result || t1.C3 || t1.C1 || t1.desc || t1.winner;
      resultRoundId = t1.rid || t1.mid || betRoundId;

      // For dolidana, rdesc might be "Player A#Player B", winner might be in nat field
      if (!winner && t1.rdesc) {
        console.log(`[AutoSettle] rdesc found: ${t1.rdesc}`);
        // Check if there's a nat or result field we missed
        console.log(`[AutoSettle] Checking for winner in other fields...`);
      }
    } else {
      // Regular result format
      winner = resultData.win;
      resultRoundId = resultData.mid;
    }

    if (!winner) {
      console.error(
        `[AutoSettle] Cannot extract winner from result:`,
        resultData,
      );
      console.error(
        `[AutoSettle] Available fields in resultData:`,
        Object.keys(resultData),
      );
      if (resultData.t1) {
        console.error(
          `[AutoSettle] Available fields in t1:`,
          Object.keys(resultData.t1),
        );
      }
      return [];
    }

    console.log(
      `[AutoSettle] Extracted winner: ${winner}, roundId: ${resultRoundId}`,
    );

    // Store result in database for future reference
    try {
      // First check if result already exists
      const { data: existingResult } = await supabase
        .from("casino_results")
        .select("id")
        .eq("game_id", gameType)
        .eq("round_id", resultRoundId.toString())
        .maybeSingle();

      if (!existingResult) {
        const { error: insertError } = await supabase
          .from("casino_results")
          .insert({
            game_id: gameType,
            round_id: resultRoundId.toString(),
            result: winner.toString(),
            raw: resultData,
          });

        if (insertError) {
          console.warn(
            `[AutoSettle] Failed to store result in database:`,
            insertError,
          );
          // Don't stop settlement if storage fails
        } else {
          console.log(
            `[AutoSettle] ✅ Stored result in casino_results: game=${gameType}, round=${resultRoundId}, winner=${winner}`,
          );
        }
      } else {
        console.log(
          `[AutoSettle] Result already exists in database for game=${gameType}, round=${resultRoundId}`,
        );
      }
    } catch (storageErr) {
      console.warn(`[AutoSettle] Result storage error:`, storageErr);
      // Continue with settlement even if storage fails
    }

    // Determine winner
    const betSelection = bet.selection_name || bet.selection || bet.selectionId;
    const normalizedBetSelection = betSelection
      .toString()
      .toUpperCase()
      .replace(/[\s_-]/g, "");
    const normalizedWinner = winner
      .toString()
      .toUpperCase()
      .replace(/[\s_-]/g, "");

    const isWin =
      normalizedBetSelection === normalizedWinner ||
      normalizedBetSelection.includes(normalizedWinner) ||
      normalizedWinner.includes(normalizedBetSelection);

    const status = isWin ? "won" : "lost";
    const payout = isWin ? bet.stake * bet.odds : 0;

    console.log(
      `[AutoSettle] Bet ${betId}: selection="${betSelection}", winner="${winner}", status=${status}`,
    );

    const success = await settleBet(bet.id, status, payout);

    if (success) {
      return [
        {
          betId: bet.id,
          status,
          payout,
          oldStatus: bet.status,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error(`[AutoSettle] Error settling bet ${betId}:`, error);
    return [];
  }
}

/**
 * Check and settle casino bets based on game results
 */
export async function settleCasinoBets(
  gameId: string,
): Promise<SettlementResult[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Get pending casino bets for this game
    console.log(
      `[AutoSettle] Querying bets for user ${user.id}, game ${gameId}`,
    );

    // Casino bets are identified by sport field containing game type (dt20, teen20, dolidana, etc)
    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .eq("sport", gameId);

    console.log(`[AutoSettle] Query result: ${bets?.length || 0} bets found`);
    if (bets && bets.length > 0) {
      console.log(`[AutoSettle] Sample bet structure:`, bets[0]);
    }

    if (error) {
      console.error("[AutoSettle] Error querying bets:", error);
      return [];
    }

    if (!bets || bets.length === 0) {
      console.log(
        "[AutoSettle] No pending casino bets found for game:",
        gameId,
      );
      return [];
    }

    console.log(
      `[AutoSettle] Found ${bets.length} pending bets for casino game ${gameId}`,
    );

    // Here you would fetch the game result from your casino API
    // For now, we'll mark them as won/lost based on random selection
    // In real implementation, compare bet.selection with actual result

    const results: SettlementResult[] = [];

    // Fetch the latest casino result for this game type
    let gameResult;
    try {
      gameResult = await fetchCasinoResult(gameId);
      console.log(
        `[AutoSettle] Fetched casino result for ${gameId}:`,
        gameResult,
      );
    } catch (err) {
      console.error(
        `[AutoSettle] Failed to fetch casino result for ${gameId}:`,
        err,
      );
      return []; // Don't settle without API result
    }

    // Only proceed if we have actual results from API
    if (!gameResult?.data?.res || gameResult.data.res.length === 0) {
      console.log(
        `[AutoSettle] No results available for casino game ${gameId}`,
      );
      return []; // Don't settle without results
    }

    // Get the latest result (first in array)
    const latestResult = gameResult.data.res[0];
    const winner = latestResult.win;
    const resultRoundId = latestResult.mid;

    console.log(
      `[AutoSettle] Latest result for ${gameId}: winner = ${winner}, roundId = ${resultRoundId}`,
    );

    for (const bet of bets) {
      // Check if bet is for this round (match roundId with bet.event)
      const betRoundId = bet.event;

      console.log(
        `[AutoSettle] Checking bet ${bet.id}: betRoundId="${betRoundId}", resultRoundId="${resultRoundId}"`,
      );

      if (betRoundId && betRoundId !== resultRoundId.toString()) {
        console.log(
          `[AutoSettle] ⚠️ Skipping bet ${bet.id}: different round (bet=${betRoundId}, result=${resultRoundId})`,
        );
        continue;
      }

      const betSelection =
        bet.selection_name || bet.selection || bet.selectionId;

      // Normalize both bet selection and winner for comparison
      // Handle formats like: "Player A", "PLAYER A", "player_a", "A", "a"
      const normalizedBetSelection = betSelection
        .toString()
        .toUpperCase()
        .replace(/[\s_-]/g, "");
      const normalizedWinner = winner
        .toString()
        .toUpperCase()
        .replace(/[\s_-]/g, "");

      // Check exact match or contains match
      const isWin =
        normalizedBetSelection === normalizedWinner ||
        normalizedBetSelection.includes(normalizedWinner) ||
        normalizedWinner.includes(normalizedBetSelection);

      const status = isWin ? "won" : "lost";
      const payout = isWin ? bet.stake * bet.odds : 0;

      console.log(
        `[AutoSettle] Settling bet ${bet.id}: selection="${betSelection}" (normalized: ${normalizedBetSelection}), winner="${winner}" (normalized: ${normalizedWinner}), match=${isWin}, status=${status}`,
      );
      const success = await settleBet(bet.id, status, payout);

      if (success) {
        results.push({
          betId: bet.id,
          status,
          payout,
          oldStatus: bet.status,
        });
      }
    }

    if (results.length === 0) {
      console.warn(
        `[AutoSettle] ⚠️ No bets were settled for ${gameId}. Check logs above for reasons.`,
      );
    }

    return results;
  } catch (error) {
    console.error("[AutoSettle] Error settling casino bets:", error);
    return [];
  }
}

/**
 * Check and settle sports bets based on match results
 */
export async function settleSportsBets(
  eventId: number,
  winnerId?: number,
): Promise<SettlementResult[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Get pending sports bets for this event
    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .or(`event_id.eq.${eventId},eventId.eq.${eventId}`);

    if (error || !bets || bets.length === 0) {
      console.log(
        "[AutoSettle] No pending sports bets found for event:",
        eventId,
      );
      return [];
    }

    console.log(
      `[AutoSettle] Found ${bets.length} pending bets for event ${eventId}`,
    );

    // Fetch match result from Diamond API
    let matchResult;
    try {
      // Try to get result using the getResult API
      // We need event details, let's get them from the bets
      if (bets.length > 0) {
        const sampleBet = bets[0];
        const resultData = {
          event_id: parseInt(
            sampleBet.event_id || sampleBet.eventId || eventId.toString(),
          ),
          event_name:
            sampleBet.event_name || sampleBet.eventName || sampleBet.event,
          market_id: parseInt(sampleBet.market_id || sampleBet.marketId || "1"),
          market_name:
            sampleBet.market_name || sampleBet.marketName || sampleBet.market,
        };

        matchResult = await diamondApi.getResult(resultData);
        console.log(
          `[AutoSettle] Fetched match result for event ${eventId}:`,
          matchResult,
        );
      }
    } catch (err) {
      console.error(`[AutoSettle] Failed to fetch match result:`, err);
      return []; // Don't settle without API result
    }

    const results: SettlementResult[] = [];

    // Only settle if we have actual result from API
    let resultWinner = winnerId;
    if (!resultWinner && matchResult?.data) {
      resultWinner = matchResult.data.winner || matchResult.data.result;
    }

    if (!resultWinner) {
      console.log(
        `[AutoSettle] No result available for event ${eventId}, skipping settlement`,
      );
      return []; // Don't settle without result
    }

    for (const bet of bets) {
      const isWin =
        bet.selection_id === resultWinner.toString() ||
        bet.selectionId === resultWinner ||
        bet.selection === resultWinner;
      const status = isWin ? "won" : "lost";
      const payout = isWin ? bet.stake * bet.odds : 0;

      console.log(
        `[AutoSettle] Settling bet ${bet.id}: selection=${bet.selection_id || bet.selection}, winner=${resultWinner}, status=${status}`,
      );

      const success = await settleBet(bet.id, status, payout);

      if (success) {
        results.push({
          betId: bet.id,
          status,
          payout,
          oldStatus: bet.status,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[AutoSettle] Error settling sports bets:", error);
    return [];
  }
}

/**
 * Auto-settle all pending bets older than a certain time
 * (Useful for cleanup of stuck bets - only for very old bets)
 */
export async function autoSettleOldBets(
  hoursOld: number = 24,
): Promise<SettlementResult[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .lt("created_at", cutoffTime.toISOString());

    if (error || !bets || bets.length === 0) {
      return [];
    }

    console.log(
      `[AutoSettle] Found ${bets.length} very old pending bets (older than ${hoursOld} hours) to void`,
    );

    const results: SettlementResult[] = [];

    for (const bet of bets) {
      // For very old bets, mark as void to return stake
      console.log(
        `[AutoSettle] Voiding very old bet ${bet.id} (${bet.game_id || bet.game})`,
      );
      const success = await settleBet(bet.id, "void", bet.stake);

      if (success) {
        results.push({
          betId: bet.id,
          status: "void",
          payout: bet.stake,
          oldStatus: bet.status,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[AutoSettle] Error settling old bets:", error);
    return [];
  }
}

/**
 * Monitor and settle bets periodically
 */
export class BetSettlementMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalSeconds: number = 30) {
    if (this.isRunning) {
      console.log("[SettlementMonitor] Already running");
      return;
    }

    console.log(
      `[SettlementMonitor] Starting with ${intervalSeconds}s interval`,
    );
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      console.log("[SettlementMonitor] Cleanup check...");

      try {
        // Only void very old bets (24+ hours old) as cleanup
        const oldBets = await autoSettleOldBets(24);
        if (oldBets.length > 0) {
          console.log(
            `[SettlementMonitor] Voided ${oldBets.length} very old bets`,
          );
        }
      } catch (error) {
        console.error("[SettlementMonitor] Error:", error);
      }
    }, intervalSeconds * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("[SettlementMonitor] Stopped");
    }
  }
}

export const settlementMonitor = new BetSettlementMonitor();
