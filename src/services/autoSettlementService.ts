/**
 * Automatic Bet Settlement Service
 * Monitors game results and automatically settles bets
 */

import { supabase } from "@/integrations/supabase/client";
import { callEdgeFunction } from "@/lib/edge";
import { diamondApi } from "./diamondApi";
import { fetchCasinoResult } from "./casino";

export interface SettlementResult {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
  oldStatus: string;
}

/**
 * Settle a single bet via edge function
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

    const result = await callEdgeFunction(
      "bet-settlement?action=settle",
      { betId, status, payout },
      { method: "POST" },
    );

    if (!result?.success) {
      console.error(
        `[AutoSettle] Failed to settle bet ${betId}:`,
        result?.error,
      );
      return false;
    }

    console.log(
      `[AutoSettle] ✅ Bet ${betId} settled successfully. Status: ${status}, Payout: ${payout || 0}, New balance: ${result.balance}`,
    );
    return true;
  } catch (error) {
    console.error(`[AutoSettle] Error settling bet ${betId}:`, error);
    return false;
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
    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .eq("sport", gameId);

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
      if (betRoundId && betRoundId !== resultRoundId.toString()) {
        console.log(
          `[AutoSettle] Skipping bet ${bet.id}: different round (bet=${betRoundId}, result=${resultRoundId})`,
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
