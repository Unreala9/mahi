/**
 * Complete Betting Engine
 * Handles all bet placement, tracking, and settlement for sports and casino
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BetPlacement {
  userId: string;
  gameType: "SPORTS" | "CASINO";
  gameId: string;
  gameName: string;
  marketId: string;
  marketName: string;
  selection: string;
  selectionId: number;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
}

export interface BetResult {
  betId: string;
  status: "WON" | "LOST" | "VOID";
  payout?: number;
}

class BettingEngine {
  /**
   * Place a bet and deduct from wallet
   */
  async placeBet(bet: BetPlacement): Promise<{
    success: boolean;
    betId?: string;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[BettingEngine] Placing bet:", bet);

      // 1. Get current balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", bet.userId)
        .maybeSingle();

      let currentBalance = wallet?.balance ? Number(wallet.balance) : 0;
      console.log("[BettingEngine] Current balance:", currentBalance);

      // 2. Check if user has sufficient balance
      if (currentBalance < bet.stake) {
        return {
          success: false,
          error: `Insufficient balance. You have ₹${currentBalance.toFixed(2)} but need ₹${bet.stake}`,
        };
      }

      // 3. Calculate potential payout
      const potentialPayout =
        bet.betType === "BACK"
          ? bet.stake * bet.odds
          : bet.stake * (bet.odds - 1);

      // 4. Create bet record
      const { data: betRecord, error: betError } = await supabase
        .from("bets")
        .insert({
          user_id: bet.userId,
          provider_bet_id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sport: bet.gameType.toLowerCase(),
          event: bet.gameId,
          event_name: bet.gameName,
          market: bet.marketId,
          market_name: bet.marketName,
          selection: bet.selectionId.toString(),
          selection_name: bet.selection,
          odds: bet.odds,
          stake: bet.stake,
          potential_payout: potentialPayout,
          bet_type: bet.betType,
          status: "pending",
        })
        .select()
        .single();

      if (betError) {
        console.error("[BettingEngine] Error creating bet:", betError);
        return {
          success: false,
          error: "Failed to create bet record",
        };
      }

      console.log("[BettingEngine] Bet created:", betRecord);

      // 5. Deduct stake from wallet
      const newBalance = currentBalance - bet.stake;

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", bet.userId);

      if (walletError) {
        console.error("[BettingEngine] Error updating wallet:", walletError);
        // Rollback bet creation
        await supabase.from("bets").delete().eq("id", betRecord.id);
        return {
          success: false,
          error: "Failed to update wallet balance",
        };
      }

      // 6. Create transaction record
      await supabase.from("transactions").insert({
        user_id: bet.userId,
        type: "bet",
        amount: bet.stake,
        status: "completed",
        provider: "internal",
        provider_ref_id: betRecord.provider_bet_id,
        description: `Bet on ${bet.selection} @ ${bet.odds}`,
      });

      console.log(
        "[BettingEngine] Bet placed successfully. New balance:",
        newBalance,
      );

      return {
        success: true,
        betId: betRecord.id,
        balance: newBalance,
      };
    } catch (error) {
      console.error("[BettingEngine] Error placing bet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Settle a bet (mark as won/lost and credit winnings)
   */
  async settleBet(betId: string, result: BetResult): Promise<boolean> {
    try {
      console.log("[BettingEngine] Settling bet:", betId, result);

      // 1. Get bet details
      const { data: bet } = await supabase
        .from("bets")
        .select("*")
        .eq("id", betId)
        .single();

      if (!bet) {
        console.error("[BettingEngine] Bet not found:", betId);
        return false;
      }

      // 2. Update bet status
      await supabase
        .from("bets")
        .update({
          status: result.status.toLowerCase(),
          settled_at: new Date().toISOString(),
        })
        .eq("id", betId);

      // 3. If won, credit payout to wallet
      if (result.status === "WON" && result.payout) {
        // Get current balance
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", bet.user_id)
          .single();

        const currentBalance = wallet?.balance ? Number(wallet.balance) : 0;
        const newBalance = currentBalance + result.payout;

        // Update wallet
        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", bet.user_id);

        // Create transaction record
        await supabase.from("transactions").insert({
          user_id: bet.user_id,
          type: "win",
          amount: result.payout,
          status: "completed",
          provider: "internal",
          provider_ref_id: `win_${bet.provider_bet_id}`,
          description: `Won bet on ${bet.selection_name}`,
        });

        console.log(
          "[BettingEngine] Bet settled and payout credited:",
          result.payout,
        );
      }

      return true;
    } catch (error) {
      console.error("[BettingEngine] Error settling bet:", error);
      return false;
    }
  }

  /**
   * Get user's active bets
   */
  async getUserBets(userId: string, status?: string) {
    const query = supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[BettingEngine] Error fetching bets:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Auto-settle casino bets based on result
   */
  async autoSettleCasinoBet(
    betId: string,
    winnerSelectionId: number,
  ): Promise<void> {
    try {
      const { data: bet } = await supabase
        .from("bets")
        .select("*")
        .eq("id", betId)
        .single();

      if (!bet || bet.status !== "pending") {
        return;
      }

      const isWinner = Number(bet.selection) === winnerSelectionId;

      if (isWinner) {
        const payout = bet.potential_payout || bet.stake * bet.odds;
        await this.settleBet(betId, {
          betId,
          status: "WON",
          payout,
        });
      } else {
        await this.settleBet(betId, {
          betId,
          status: "LOST",
        });
      }
    } catch (error) {
      console.error("[BettingEngine] Error auto-settling bet:", error);
    }
  }
}

export const bettingEngine = new BettingEngine();
