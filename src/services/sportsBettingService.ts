/**
 * Sports Betting Service - Edge Function Based
 * Handles sports-specific bet placement with wallet integration
 */

import { bettingService, type BetPlacement } from "./bettingService";
import { toast } from "@/hooks/use-toast";
import type { BetSlipItem, PlacedBet } from "@/types/sports-betting";

export interface SportsBet {
  eventId: number;
  eventName: string;
  marketId: string | number;
  marketName: string;
  marketType: string;
  selection: string;
  selectionId?: number;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
}

export interface SportsBetResult {
  success: boolean;
  betId?: string;
  balance?: number;
  error?: string;
  bet?: PlacedBet;
}

/**
 * Place a sports bet with wallet integration
 */
export async function placeSportsBetWithWallet(
  bet: SportsBet,
  userId: string,
): Promise<SportsBetResult> {
  try {
    console.log("[SportsBetting] Placing sports bet:", bet);

    // Validate stake
    if (bet.stake < 100) {
      return {
        success: false,
        error: "Minimum stake is ₹100",
      };
    }

    if (bet.stake > 25000) {
      return {
        success: false,
        error: "Maximum stake is ₹25,000",
      };
    }

    // Prepare bet placement data
    const betData: BetPlacement = {
      gameType: "SPORTS",
      gameId: "sports",
      gameName: bet.eventName,
      marketId: bet.marketId.toString(),
      marketName: bet.marketName,
      selection: bet.selection,
      selectionId: bet.selectionId?.toString() || "0",
      odds: bet.odds,
      stake: bet.stake,
      betType: bet.betType,
      eventId: bet.eventId.toString(),
      eventName: bet.eventName,
    };

    // Place bet via betting service
    const result = await bettingService.placeBet(betData);

    if (result.success) {
      return {
        success: true,
        betId: result.betId,
        balance: result.balance,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to place bet",
      };
    }
  } catch (error: any) {
    console.error("[Sports Betting] Error placing bet:", error);

    return {
      success: false,
      error: error.message || "Failed to place bet",
    };
  }
}

/**
 * Place multiple bets from bet slip
 */
export async function placeBetSlipWithWallet(
  betSlip: BetSlipItem[],
  userId: string,
): Promise<{
  success: number;
  failed: number;
  results: SportsBetResult[];
  finalBalance?: number;
}> {
  const results: SportsBetResult[] = [];
  let successCount = 0;
  let failedCount = 0;
  let finalBalance: number | undefined;

  for (const item of betSlip) {
    const bet: SportsBet = {
      eventId: item.event_id,
      eventName: item.event_name,
      marketId: item.market_id,
      marketName: item.market_name,
      marketType: item.market_type,
      selection: item.selection,
      selectionId: item.selection_id,
      odds: item.odds,
      stake: item.stake,
      betType: item.bet_type,
    };

    const result = await placeSportsBetWithWallet(bet, userId);
    results.push(result);

    if (result.success) {
      successCount++;
      finalBalance = result.balance;
    } else {
      failedCount++;
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    results,
    finalBalance,
  };
}

/**
 * Get sports betting history
 */
export async function getSportsBetHistory() {
  return await sportsBettingService.getMySportsBets();
}

// Sports betting service class
class SportsBettingService {
  /**
   * Place a sports bet with wallet deduction
   */
  async placeSportsBet(sportsBet: SportsBet): Promise<SportsBetResult> {
    try {
      console.log("[SportsBettingService] Placing sports bet:", sportsBet);

      // Validate stake
      if (!sportsBet.stake || sportsBet.stake <= 0) {
        toast({
          title: "Invalid Bet",
          description: "Please enter a valid stake amount",
          variant: "destructive",
        });
        return {
          success: false,
          error: "Invalid stake amount",
        };
      }

      // Prepare bet placement data
      const betData: BetPlacement = {
        gameType: "SPORTS",
        gameId: "sports",
        gameName: sportsBet.eventName,
        marketId: sportsBet.marketId.toString(),
        marketName: sportsBet.marketName,
        selection: sportsBet.selection,
        selectionId: sportsBet.selectionId?.toString() || "0",
        odds: sportsBet.odds,
        stake: sportsBet.stake,
        betType: sportsBet.betType,
        eventId: sportsBet.eventId.toString(),
        eventName: sportsBet.eventName,
      };

      // Place bet via betting service
      const result = await bettingService.placeBet(betData);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      console.log(
        "[SportsBettingService] Sports bet placed successfully:",
        result,
      );

      return {
        success: true,
        betId: result.betId,
        balance: result.balance,
      };
    } catch (error: any) {
      console.error("[SportsBettingService] Error placing sports bet:", error);

      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place sports bet",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message || "Failed to place sports bet",
      };
    }
  }

  /**
   * Place multiple bets from bet slip
   */
  async placeBetSlip(betSlip: BetSlipItem[]): Promise<{
    success: boolean;
    placedBets: string[];
    failedBets: Array<{ bet: BetSlipItem; error: string }>;
    balance?: number;
  }> {
    try {
      console.log("[SportsBettingService] Placing bet slip:", betSlip);

      const placedBets: string[] = [];
      const failedBets: Array<{ bet: BetSlipItem; error: string }> = [];
      let finalBalance: number | undefined;

      for (const bet of betSlip) {
        const result = await this.placeSportsBet(bet as unknown as SportsBet);

        if (result.success && result.betId) {
          placedBets.push(result.betId);
          finalBalance = result.balance;
        } else {
          failedBets.push({
            bet,
            error: result.error || "Unknown error",
          });
        }
      }

      if (placedBets.length > 0) {
        toast({
          title: "Bets Placed",
          description: `Successfully placed ${placedBets.length} of ${betSlip.length} bets`,
        });
      }

      if (failedBets.length > 0) {
        toast({
          title: "Some Bets Failed",
          description: `${failedBets.length} bets could not be placed`,
          variant: "destructive",
        });
      }

      return {
        success: placedBets.length > 0,
        placedBets,
        failedBets,
        balance: finalBalance,
      };
    } catch (error: any) {
      console.error("[SportsBettingService] Error placing bet slip:", error);

      toast({
        title: "Bet Slip Failed",
        description: error.message || "Failed to place bets",
        variant: "destructive",
      });

      return {
        success: false,
        placedBets: [],
        failedBets: betSlip.map((bet) => ({ bet, error: error.message })),
      };
    }
  }

  /**
   * Get user's sports bets
   */
  async getMySportsBets(
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      const allBets = await bettingService.getMyBets(limit, offset);
      // Filter for sports bets only
      return allBets.filter(
        (bet) => bet.sport === "SPORTS" || bet.sport === "4",
      );
    } catch (error: any) {
      console.error(
        "[SportsBettingService] Error fetching sports bets:",
        error,
      );
      return [];
    }
  }

  /**
   * Settle sports bet manually (for admin or automated system)
   */
  async settleSportsBet(
    betId: string,
    status: "won" | "lost" | "void",
  ): Promise<{
    success: boolean;
    status?: string;
    payout?: number;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[SportsBettingService] Settling sports bet:", {
        betId,
        status,
      });

      return await bettingService.settleBet(betId, status);
    } catch (error: any) {
      console.error("[SportsBettingService] Error settling sports bet:", error);
      return {
        success: false,
        error: error.message || "Failed to settle sports bet",
      };
    }
  }
}

export const sportsBettingService = new SportsBettingService();

/**
 * Hook for sports betting with wallet integration
 */
export function useSportsBetting() {
  const placeBet = async (bet: SportsBet, userId?: string) => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return null;
    }

    const result = await placeSportsBetWithWallet(bet, userId);

    if (result.success) {
      toast({
        title: "Bet Placed",
        description: `Successfully placed ₹${bet.stake} on ${bet.selection} @ ${bet.odds}`,
      });
      return result;
    } else {
      toast({
        title: "Bet Failed",
        description: result.error || "Failed to place bet",
        variant: "destructive",
      });
      return null;
    }
  };

  const placeBetSlip = async (betSlip: BetSlipItem[], userId?: string) => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return null;
    }

    const result = await placeBetSlipWithWallet(betSlip, userId);

    if (result.success > 0) {
      toast({
        title: "Bets Placed",
        description: `${result.success} bet(s) placed successfully${
          result.failed > 0 ? `, ${result.failed} failed` : ""
        }`,
      });
    } else {
      toast({
        title: "All Bets Failed",
        description: "No bets were placed successfully",
        variant: "destructive",
      });
    }

    return result;
  };

  const getBetHistory = async () => {
    return await getSportsBetHistory();
  };

  return {
    placeBet,
    placeBetSlip,
    getBetHistory,
  };
}
