/**
 * Casino Betting Service - Edge Function Based
 * Handles casino-specific bet placement with wallet integration
 */

import { bettingService, type BetPlacement } from "./bettingService";
import { toast } from "@/hooks/use-toast";

export interface CasinoBet {
  gameId: string;
  gameName: string;
  roundId: string;
  marketId: string;
  marketName: string;
  selection: string;
  odds: number;
  stake: number;
  betType?: "BACK" | "LAY";
}

export interface CasinoBetResult {
  success: boolean;
  betId?: string;
  balance?: number;
  error?: string;
}

class CasinoBettingService {
  /**
   * Place a casino bet with wallet deduction
   */
  async placeCasinoBet(casinoBet: CasinoBet): Promise<CasinoBetResult> {
    try {
      console.log("[CasinoBettingService] Placing casino bet:", casinoBet);

      // Validate stake
      if (!casinoBet.stake || casinoBet.stake <= 0) {
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
        gameType: "CASINO",
        gameId: casinoBet.gameId,
        gameName: casinoBet.gameName,
        marketId: casinoBet.marketId,
        marketName: casinoBet.marketName,
        selection: casinoBet.selection,
        selectionId: casinoBet.selection,
        odds: casinoBet.odds,
        stake: casinoBet.stake,
        betType: casinoBet.betType || "BACK",
        eventId: casinoBet.roundId,
        eventName: `${casinoBet.gameName} - Round ${casinoBet.roundId}`,
      };

      // Place bet via betting service
      const result = await bettingService.placeBet(betData);

      if (!result.success) {
        return result;
      }

      console.log(
        "[CasinoBettingService] Casino bet placed successfully:",
        result,
      );

      return result;
    } catch (error: any) {
      console.error("[CasinoBettingService] Error placing casino bet:", error);

      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place casino bet",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message || "Failed to place casino bet",
      };
    }
  }

  /**
   * Auto-settle casino bet when result is received
   */
  async settleCasinoBet(
    betId: string,
    result: string,
    winningSelection: string,
  ): Promise<{
    success: boolean;
    status?: "won" | "lost";
    payout?: number;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[CasinoBettingService] Settling casino bet:", {
        betId,
        result,
        winningSelection,
      });

      return await bettingService.autoSettleCasinoBet(
        betId,
        result,
        winningSelection,
      );
    } catch (error: any) {
      console.error("[CasinoBettingService] Error settling casino bet:", error);
      return {
        success: false,
        error: error.message || "Failed to settle casino bet",
      };
    }
  }

  /**
   * Get user's casino bets
   */
  async getMyCasinoBets(
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      const allBets = await bettingService.getMyBets(limit, offset);
      // Filter for casino bets only
      return allBets.filter((bet) => bet.sport === "CASINO");
    } catch (error: any) {
      console.error(
        "[CasinoBettingService] Error fetching casino bets:",
        error,
      );
      return [];
    }
  }
}

export const casinoBettingService = new CasinoBettingService();

// Legacy export for backward compatibility
export async function placeCasinoBetWithWallet(
  bet: CasinoBet & { userId: string },
): Promise<CasinoBetResult> {
  return await casinoBettingService.placeCasinoBet(bet);
}

export async function getCasinoBetHistory() {
  return await casinoBettingService.getMyCasinoBets();
}

/**
 * Hook for casino betting with wallet integration
 */
export function useCasinoBetting() {
  const placeBet = async (bet: CasinoBet, userId?: string) => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return null;
    }

    const result = await casinoBettingService.placeCasinoBet(bet);

    if (result.success) {
      return result;
    } else {
      return null;
    }
  };

  const getBetHistory = async () => {
    return await casinoBettingService.getMyCasinoBets();
  };

  return {
    placeBet,
    getBetHistory,
  };
}
