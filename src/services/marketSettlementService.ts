/**
 * Market Settlement Service
 * Handles batch settlement of all bets for a market
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SettlementMode = "normal" | "void" | "half_win" | "half_lost";

export interface SettlementSummary {
  total_bets: number;
  total_won: number;
  total_lost: number;
  total_void: number;
  total_payout: number;
}

export interface SettlementResult {
  success: boolean;
  market_id?: string;
  result_code?: string;
  settlement_mode?: SettlementMode;
  summary?: SettlementSummary;
  error?: string;
  detail?: string;
}

class MarketSettlementService {
  /**
   * Settle all pending bets for a market
   * @param marketId - The market ID to settle
   * @param resultCode - The winning selection code (e.g., "A", "PLAYER_A")
   * @param settlementMode - Settlement mode: normal, void, half_win, half_lost
   */
  async settleMarket(
    marketId: string,
    resultCode: string,
    settlementMode: SettlementMode = "normal",
  ): Promise<SettlementResult> {
    try {
      console.log(
        `[MarketSettlement] Settling market ${marketId} with result ${resultCode} (mode: ${settlementMode})`,
      );

      // Call the RPC function
      const { data, error } = await supabase.rpc("settle_market", {
        p_market_id: marketId,
        p_result_code: resultCode,
        p_settlement_mode: settlementMode,
      });

      if (error) {
        console.error("[MarketSettlement] RPC error:", error);
        return {
          success: false,
          error: error.message,
          detail: error.details,
        };
      }

      // Parse the JSONB response
      const result = data as SettlementResult;

      if (!result.success) {
        console.error("[MarketSettlement] Settlement failed:", result.error);
        return result;
      }

      console.log(
        `[MarketSettlement] ✅ Settled ${result.summary?.total_bets} bets`,
        result.summary,
      );

      return result;
    } catch (error: any) {
      console.error("[MarketSettlement] Exception:", error);
      return {
        success: false,
        error: error.message || "Settlement failed",
      };
    }
  }

  /**
   * Settle market by event ID and market name
   * Convenience method when you don't have the exact market ID
   */
  async settleMarketByEvent(
    eventId: string,
    marketName: string,
    resultCode: string,
    settlementMode: SettlementMode = "normal",
  ): Promise<SettlementResult> {
    try {
      console.log(
        `[MarketSettlement] Settling event ${eventId}, market ${marketName}`,
      );

      const { data, error } = await supabase.rpc("settle_market_by_event", {
        p_event_id: eventId,
        p_market_name: marketName,
        p_result_code: resultCode,
        p_settlement_mode: settlementMode,
      });

      if (error) {
        console.error("[MarketSettlement] RPC error:", error);
        return {
          success: false,
          error: error.message,
          detail: error.details,
        };
      }

      const result = data as SettlementResult;

      if (!result.success) {
        console.error("[MarketSettlement] Settlement failed:", result.error);
        return result;
      }

      console.log(
        `[MarketSettlement] ✅ Settled ${result.summary?.total_bets} bets`,
        result.summary,
      );

      return result;
    } catch (error: any) {
      console.error("[MarketSettlement] Exception:", error);
      return {
        success: false,
        error: error.message || "Settlement failed",
      };
    }
  }

  /**
   * Settle casino game round
   * Automatically uses the round ID as market and game type
   */
  async settleCasinoRound(
    gameType: string,
    roundId: string,
    winnerCode: string,
    settlementMode: SettlementMode = "normal",
  ): Promise<SettlementResult> {
    try {
      console.log(
        `[MarketSettlement] Settling casino ${gameType} round ${roundId}, winner: ${winnerCode}`,
      );

      // For casino games, market_id is typically the market.sid (selection ID)
      // But we can use the market_name to find bets
      const { data: bets, error: betError } = await supabase
        .from("bets")
        .select("market")
        .eq("sport", gameType)
        .eq("event", roundId)
        .eq("status", "pending")
        .limit(1);

      if (betError || !bets || bets.length === 0) {
        return {
          success: false,
          error: "No pending bets found for this round",
        };
      }

      const marketId = bets[0].market;

      return await this.settleMarket(marketId, winnerCode, settlementMode);
    } catch (error: any) {
      console.error("[MarketSettlement] Exception:", error);
      return {
        success: false,
        error: error.message || "Settlement failed",
      };
    }
  }

  /**
   * Settle with UI feedback
   */
  async settleMarketWithToast(
    marketId: string,
    resultCode: string,
    settlementMode: SettlementMode = "normal",
  ): Promise<SettlementResult> {
    const result = await this.settleMarket(
      marketId,
      resultCode,
      settlementMode,
    );

    if (result.success && result.summary) {
      const { total_bets, total_won, total_payout } = result.summary;

      if (total_won > 0) {
        toast({
          title: "🎉 Bets Settled!",
          description: `${total_won} of ${total_bets} bets won! ₹${total_payout.toLocaleString()} credited.`,
          duration: 5000,
        });
      } else {
        toast({
          title: "Bets Settled",
          description: `${total_bets} bet${total_bets !== 1 ? "s" : ""} processed.`,
        });
      }
    } else {
      toast({
        title: "Settlement Failed",
        description: result.error || "Could not settle market",
        variant: "destructive",
      });
    }

    return result;
  }
}

export const marketSettlementService = new MarketSettlementService();
