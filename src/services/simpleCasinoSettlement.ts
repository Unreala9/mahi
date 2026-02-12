/**
 * Simple Casino Settlement Service
 *
 * No external dependencies, no cron jobs, no workers.
 * Just simple bet calculation and settlement logic.
 */

import { supabase } from "@/lib/supabase";

export interface CasinoBetSettlement {
  betId: number;
  gameId: string;
  roundId: string;
  selection: string;
  stake: number;
  odds: number;
  result: string;
  isWin: boolean;
  payout: number;
}

class SimpleCasinoSettlementService {
  /**
   * Settle a single casino bet
   *
   * @param betId - Bet ID from database
   * @param result - Winning selection from casino result
   * @returns Settlement details
   */
  async settleBet(
    betId: number,
    result: string,
  ): Promise<CasinoBetSettlement | null> {
    try {
      console.log(
        `[CasinoSettlement] Settling bet ${betId} with result: ${result}`,
      );

      // Get bet details
      const { data: bet, error: betError } = await supabase
        .from("casino_bets")
        .select("*")
        .eq("id", betId)
        .single();

      if (betError || !bet) {
        console.error("[CasinoSettlement] Bet not found:", betError);
        return null;
      }

      // Check if already settled
      if (bet.status !== "PENDING") {
        console.log("[CasinoSettlement] Bet already settled");
        return null;
      }

      // Calculate win/loss
      const isWin = bet.selection.toLowerCase() === result.toLowerCase();
      const payout = isWin ? bet.stake * bet.odds : 0;
      const status = isWin ? "WIN" : "LOSS";

      // Update bet status
      const { error: updateError } = await supabase
        .from("casino_bets")
        .update({
          status,
          win_amount: payout,
          settled_at: new Date().toISOString(),
        })
        .eq("id", betId);

      if (updateError) {
        console.error("[CasinoSettlement] Error updating bet:", updateError);
        return null;
      }

      // If win, credit wallet
      if (isWin && payout > 0) {
        await this.creditWallet(bet.user_id, payout, betId);
      }

      console.log(
        `[CasinoSettlement] Bet ${betId} settled: ${status}, payout: ${payout}`,
      );

      return {
        betId: bet.id,
        gameId: bet.game_id,
        roundId: bet.round_id,
        selection: bet.selection,
        stake: bet.stake,
        odds: bet.odds,
        result,
        isWin,
        payout,
      };
    } catch (error) {
      console.error("[CasinoSettlement] Error settling bet:", error);
      return null;
    }
  }

  /**
   * Settle all bets for a specific game round
   *
   * @param gameId - Game ID (e.g., 'dt20')
   * @param roundId - Round ID
   * @param result - Winning selection
   * @returns Array of settlement results
   */
  async settleRound(
    gameId: string,
    roundId: string,
    result: string,
  ): Promise<CasinoBetSettlement[]> {
    try {
      console.log(
        `[CasinoSettlement] Settling round: ${gameId} - ${roundId} - ${result}`,
      );

      // Get all pending bets for this round
      const { data: bets, error } = await supabase
        .from("casino_bets")
        .select("*")
        .eq("game_id", gameId)
        .eq("round_id", roundId)
        .eq("status", "PENDING");

      if (error) {
        console.error("[CasinoSettlement] Error fetching bets:", error);
        return [];
      }

      if (!bets || bets.length === 0) {
        console.log("[CasinoSettlement] No pending bets found for this round");
        return [];
      }

      console.log(`[CasinoSettlement] Found ${bets.length} pending bets`);

      // Settle each bet
      const settlements: CasinoBetSettlement[] = [];

      for (const bet of bets) {
        const settlement = await this.settleBet(bet.id, result);
        if (settlement) {
          settlements.push(settlement);
        }
      }

      console.log(`[CasinoSettlement] Settled ${settlements.length} bets`);

      return settlements;
    } catch (error) {
      console.error("[CasinoSettlement] Error settling round:", error);
      return [];
    }
  }

  /**
   * Calculate potential payout for a bet (before placing)
   *
   * @param stake - Bet amount
   * @param odds - Bet odds
   * @returns Potential payout
   */
  calculatePayout(stake: number, odds: number): number {
    return Number((stake * odds).toFixed(2));
  }

  /**
   * Check if a bet is a winner
   *
   * @param selection - User's selection
   * @param result - Actual result
   * @returns True if bet won
   */
  isWinningBet(selection: string, result: string): boolean {
    return selection.toLowerCase() === result.toLowerCase();
  }

  /**
   * Get settlement summary for a user
   *
   * @param userId - User ID
   * @returns Settlement statistics
   */
  async getUserSettlementStats(userId: string): Promise<{
    totalBets: number;
    wonBets: number;
    lostBets: number;
    totalWagered: number;
    totalWon: number;
    totalLost: number;
    netProfit: number;
  }> {
    try {
      const { data: bets, error } = await supabase
        .from("casino_bets")
        .select("*")
        .eq("user_id", userId);

      if (error || !bets) {
        return {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          totalWagered: 0,
          totalWon: 0,
          totalLost: 0,
          netProfit: 0,
        };
      }

      const wonBets = bets.filter((b) => b.status === "WIN");
      const lostBets = bets.filter((b) => b.status === "LOSS");
      const totalWagered = bets.reduce((sum, b) => sum + Number(b.stake), 0);
      const totalWon = wonBets.reduce(
        (sum, b) => sum + Number(b.win_amount),
        0,
      );
      const totalLost = lostBets.reduce((sum, b) => sum + Number(b.stake), 0);

      return {
        totalBets: bets.length,
        wonBets: wonBets.length,
        lostBets: lostBets.length,
        totalWagered,
        totalWon,
        totalLost,
        netProfit: totalWon - totalLost,
      };
    } catch (error) {
      console.error("[CasinoSettlement] Error getting stats:", error);
      return {
        totalBets: 0,
        wonBets: 0,
        lostBets: 0,
        totalWagered: 0,
        totalWon: 0,
        totalLost: 0,
        netProfit: 0,
      };
    }
  }

  /**
   * Credit user wallet (private helper)
   */
  private async creditWallet(
    userId: string,
    amount: number,
    betId: number,
  ): Promise<void> {
    try {
      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (walletError || !wallet) {
        console.error("[CasinoSettlement] Wallet not found:", walletError);
        return;
      }

      // Update wallet balance
      const newBalance = Number(wallet.balance) + amount;

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) {
        console.error("[CasinoSettlement] Error updating wallet:", updateError);
        return;
      }

      // Log transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "CREDIT",
        amount,
        ref_id: betId,
        description: `Casino win payout`,
      });

      console.log(`[CasinoSettlement] Credited ${amount} to user ${userId}`);
    } catch (error) {
      console.error("[CasinoSettlement] Error crediting wallet:", error);
    }
  }
}

// Export singleton instance
export const simpleCasinoSettlement = new SimpleCasinoSettlementService();

// Export helper functions for easy use
export const settleCasinoBet = (betId: number, result: string) =>
  simpleCasinoSettlement.settleBet(betId, result);

export const settleCasinoRound = (
  gameId: string,
  roundId: string,
  result: string,
) => simpleCasinoSettlement.settleRound(gameId, roundId, result);

export const calculateCasinoPayout = (stake: number, odds: number) =>
  simpleCasinoSettlement.calculatePayout(stake, odds);
