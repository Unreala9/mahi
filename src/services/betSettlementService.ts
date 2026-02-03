// Bet Settlement Service for Admin/Backend Operations
// This service uses the service role key for secure bet settlements

import { createClient } from "@supabase/supabase-js";

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export interface SettlementResult {
  success: boolean;
  message: string;
  market_id: string;
  total_bets: number;
  total_won: number;
  total_lost: number;
  total_void: number;
  total_half_won: number;
  total_half_lost: number;
  total_payout: number;
  settlement_mode: string;
}

export type SettlementMode = "normal" | "void" | "half_win" | "half_lost";

export class BetSettlementService {
  /**
   * Settle a market with proper security and transaction safety
   */
  static async settleMarket(
    marketId: string,
    resultCode: string,
    settlementMode: SettlementMode = "normal",
  ): Promise<SettlementResult> {
    try {
      console.log(
        `🎯 Settling market ${marketId} with result ${resultCode} (${settlementMode})`,
      );

      const { data, error } = await supabaseAdmin.rpc("settle_market", {
        p_market_id: marketId,
        p_result_code: resultCode,
        p_settlement_mode: settlementMode,
      });

      if (error) {
        console.error("❌ Settlement error:", error);
        throw new Error(`Settlement failed: ${error.message}`);
      }

      const result = data[0] as SettlementResult;

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log(`✅ Settlement completed:`, {
        market: result.market_id,
        bets: result.total_bets,
        won: result.total_won,
        lost: result.total_lost,
        void: result.total_void,
        payout: result.total_payout,
      });

      return result;
    } catch (error) {
      console.error("❌ Settlement service error:", error);
      throw error;
    }
  }

  /**
   * Settle multiple markets in batch (useful for end-of-event settlements)
   */
  static async settleMarketsInBatch(
    settlements: Array<{
      marketId: string;
      resultCode: string;
      settlementMode?: SettlementMode;
    }>,
  ): Promise<SettlementResult[]> {
    const results: SettlementResult[] = [];

    for (const settlement of settlements) {
      try {
        const result = await this.settleMarket(
          settlement.marketId,
          settlement.resultCode,
          settlement.settlementMode || "normal",
        );
        results.push(result);
      } catch (error) {
        console.error(
          `❌ Failed to settle market ${settlement.marketId}:`,
          error,
        );
        // Continue with other settlements
        results.push({
          success: false,
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          market_id: settlement.marketId,
          total_bets: 0,
          total_won: 0,
          total_lost: 0,
          total_void: 0,
          total_half_won: 0,
          total_half_lost: 0,
          total_payout: 0,
          settlement_mode: settlement.settlementMode || "normal",
        });
      }
    }

    return results;
  }

  /**
   * Get pending markets that need settlement
   */
  static async getPendingMarkets(eventId?: string) {
    const query = supabaseAdmin
      .from("markets")
      .select(
        `
        id,
        event_id,
        type,
        status,
        events!inner(id, name, sport, status)
      `,
      )
      .eq("status", "active")
      .eq("events.status", "finished");

    if (eventId) {
      query.eq("event_id", eventId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch pending markets: ${error.message}`);
    }

    return data;
  }

  /**
   * Get market settlement history
   */
  static async getSettlementHistory(marketId: string) {
    const { data, error } = await supabaseAdmin
      .from("bets")
      .select(
        `
        *,
        selections!inner(code),
        user_wallets!inner(user_id),
        transactions(amount, type, created_at)
      `,
      )
      .eq("market_id", marketId)
      .neq("status", "pending");

    if (error) {
      throw new Error(`Failed to fetch settlement history: ${error.message}`);
    }

    return data;
  }
}

// Example usage for different settlement scenarios
export const SettlementExamples = {
  // Normal win/loss settlement
  normalSettlement: async (marketId: string, winningSelectionCode: string) => {
    return await BetSettlementService.settleMarket(
      marketId,
      winningSelectionCode,
      "normal",
    );
  },

  // Void entire market (match cancelled)
  voidMarket: async (marketId: string) => {
    return await BetSettlementService.settleMarket(marketId, "", "void");
  },

  // Asian Handicap half-win (e.g., -0.5 goal handicap when exactly 1 goal difference)
  halfWin: async (marketId: string, selectionCode: string) => {
    return await BetSettlementService.settleMarket(
      marketId,
      selectionCode,
      "half_win",
    );
  },

  // Asian Handicap half-loss
  halfLoss: async (marketId: string, selectionCode: string) => {
    return await BetSettlementService.settleMarket(
      marketId,
      selectionCode,
      "half_lost",
    );
  },

  // Settle all markets for a completed event
  settleEventMarkets: async (
    eventId: string,
    results: Record<string, string>,
  ) => {
    const settlements = Object.entries(results).map(
      ([marketId, resultCode]) => ({
        marketId,
        resultCode,
        settlementMode: "normal" as SettlementMode,
      }),
    );

    return await BetSettlementService.settleMarketsInBatch(settlements);
  },
};

export default BetSettlementService;
