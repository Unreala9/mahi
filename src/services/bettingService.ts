/**
 * Betting Service - Edge Function Based
 * Handles all bet placement and settlement through Supabase Edge Functions
 */

import { callEdgeFunction } from "@/lib/edge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BetPlacement {
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

export interface BetResult {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
}

class BettingService {
  /**
   * Place a bet using edge function
   */
  async placeBet(bet: BetPlacement): Promise<{
    success: boolean;
    betId?: string;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[BettingService] Placing bet via edge function:", bet);

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("[BettingService] User not authenticated");
        toast({
          title: "Authentication Required",
          description: "Please login to place bets",
          variant: "destructive",
        });
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      const result = await callEdgeFunction("bet-placement?action=place", bet);

      if (!result.success) {
        console.error("[BettingService] Bet placement failed:", result.error);
        toast({
          title: "Bet Failed",
          description: result.error || "Failed to place bet",
          variant: "destructive",
        });
        return {
          success: false,
          error: result.error,
        };
      }

      console.log("[BettingService] Bet placed successfully:", result);

      toast({
        title: "Bet Placed",
        description: `₹${bet.stake} on ${bet.selection} @ ${bet.odds}`,
      });

      return {
        success: true,
        betId: result.betId,
        balance: result.balance,
      };
    } catch (error: any) {
      console.error("[BettingService] Error placing bet:", error);

      let errorMessage = error.message || "Failed to place bet";

      // Handle specific error cases
      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        errorMessage = "Please login to place bets";
      } else if (error.message?.includes("Edge Function returned a non-2xx")) {
        errorMessage = "Service unavailable. Please try again.";
      }

      toast({
        title: "Bet Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Settle a bet using edge function
   */
  async settleBet(
    betId: string,
    status: "won" | "lost" | "void",
    payout?: number,
  ): Promise<{
    success: boolean;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[BettingService] Settling bet:", { betId, status, payout });

      const result = await callEdgeFunction("bet-settlement?action=settle", {
        betId,
        status,
        payout,
      });

      if (!result.success) {
        console.error("[BettingService] Bet settlement failed:", result.error);
        return {
          success: false,
          error: result.error,
        };
      }

      console.log("[BettingService] Bet settled successfully:", result);

      return {
        success: true,
        balance: result.balance,
      };
    } catch (error: any) {
      console.error("[BettingService] Error settling bet:", error);
      return {
        success: false,
        error: error.message || "Failed to settle bet",
      };
    }
  }

  /**
   * Auto-settle casino bet based on result
   */
  async autoSettleCasinoBet(
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
      console.log("[BettingService] Auto-settling casino bet:", {
        betId,
        result,
        winningSelection,
      });

      const response = await callEdgeFunction(
        "bet-settlement?action=auto-settle-casino",
        {
          betId,
          result,
          winningSelection,
        },
      );

      if (!response.success) {
        console.error(
          "[BettingService] Auto-settlement failed:",
          response.error,
        );
        return {
          success: false,
          error: response.error,
        };
      }

      console.log("[BettingService] Casino bet auto-settled:", response);

      if (response.status === "won") {
        toast({
          title: "You Won! 🎉",
          description: `Congratulations! You won ₹${response.payout}`,
        });
      }

      return {
        success: true,
        status: response.status,
        payout: response.payout,
        balance: response.balance,
      };
    } catch (error: any) {
      console.error("[BettingService] Error auto-settling casino bet:", error);
      return {
        success: false,
        error: error.message || "Failed to settle casino bet",
      };
    }
  }

  /**
   * Get user's bets
   */
  async getMyBets(
    limit: number = 50,
    offset: number = 0,
    status?: string,
  ): Promise<any[]> {
    try {
      console.log("[BettingService] Fetching user bets");

      let url = `bet-placement?action=my-bets&limit=${limit}&offset=${offset}`;
      if (status) {
        url += `&status=${status}`;
      }

      const result = await callEdgeFunction(url, {}, { method: "GET" });

      if (!result.success) {
        console.error("[BettingService] Failed to fetch bets:", result.error);
        return [];
      }

      return result.bets || [];
    } catch (error: any) {
      console.error("[BettingService] Error fetching bets:", error);
      return [];
    }
  }

  /**
   * Get bet by ID
   */
  async getBetById(betId: string): Promise<any | null> {
    try {
      console.log("[BettingService] Fetching bet:", betId);

      const result = await callEdgeFunction(
        `bet-placement?action=get-bet&betId=${betId}`,
        {},
        { method: "GET" },
      );

      if (!result.success) {
        console.error("[BettingService] Failed to fetch bet:", result.error);
        return null;
      }

      return result.bet;
    } catch (error: any) {
      console.error("[BettingService] Error fetching bet:", error);
      return null;
    }
  }
}

export const bettingService = new BettingService();
