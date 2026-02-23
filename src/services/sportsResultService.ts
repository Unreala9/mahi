// src/services/sportsResultService.ts
import { diamondApi } from "./diamondApi";
import { supabase } from "@/integrations/supabase/client";
import { bettingService } from "./bettingService";

export interface MarketResult {
  market_id: number;
  result: string; // 'WON' | 'LOST' | 'VOID'
  settlement_status?: string;
}

class SportsResultService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollIntervalMs = 30000; // Poll every 30 seconds
  private isRunning = false;

  /**
   * Start polling for results
   */
  start() {
    if (this.isRunning) {
      console.log('[ResultService] Already running');
      return;
    }

    console.log('[ResultService] Starting result polling service');
    this.isRunning = true;

    // Initial check
    this.pollResults();

    // Set up interval
    this.pollingInterval = setInterval(() => {
      if (this.isRunning) {
        this.pollResults();
      }
    }, this.pollIntervalMs);
  }

  /**
   * Stop polling
   */
  stop() {
    console.log('[ResultService] Stopping result polling service');
    this.isRunning = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Poll all unsettled sports bets and check for results
   */
  private async pollResults() {
    try {
      console.log('[ResultService] Polling for results...');

      // Get all PLACED sports bets grouped by event_id
      const { data: placedBets, error } = await supabase
        .from('bets')
        .select('id, event_id, market_id, stake, odds, bet_type')
        .eq('game_type', 'SPORTS')
        .eq('status', 'PLACED');

      if (error) {
        console.error('[ResultService] Error fetching placed bets:', error);
        return;
      }

      if (!placedBets || placedBets.length === 0) {
        console.log('[ResultService] No placed bets to check');
        return;
      }

      console.log(`[Result Service] Found ${placedBets.length} placed bets`);

      // Group by event_id
      const betsByEvent: Record<string, any[]> = {};
      placedBets.forEach((bet) => {
        const eventId = bet.event_id;
        if (!betsByEvent[eventId]) {
          betsByEvent[eventId] = [];
        }
        betsByEvent[eventId].push(bet);
      });

      console.log(`[ResultService] Checking ${Object.keys(betsByEvent).length} unique events`);

      // Check results for each event
      for (const [eventId, betsInEvent] of Object.entries(betsByEvent)) {
        await this.fetchAndProcessEventResults(Number(eventId), betsInEvent);
      }
    } catch (error) {
      console.error('[ResultService] Error in pollResults:', error);
    }
  }

  /**
   * Fetch results for a specific event and process them
   */
  private async fetchAndProcessEventResults(eventId: number, bets: any[]) {
    try {
      console.log(`[ResultService] Fetching results for event: ${eventId}`);

      // Fetch results from provider API
      const results = await diamondApi.getPlacedBetsResults(eventId);

      if (!results || results.length === 0) {
        console.log(`[ResultService] No results yet for event ${eventId}`);
        return;
      }

      console.log(`[ResultService] Got ${results.length} market results for event ${eventId}`);

      // Process each result
      for (const result of results) {
        await this.processMarketResult(result, bets);
      }
    } catch (error) {
      console.error(`[ResultService] Error fetching results for event ${eventId}:`, error);
    }
  }

  /**
   * Process a single market result
   */
  private async processMarketResult(marketResult: MarketResult, bets: any[]) {
    const marketId = marketResult.market_id;
    const result = marketResult.result?.toUpperCase();

    if (!result) {
      console.warn(`[ResultService] No result status for market ${marketId}`);
      return;
    }

    console.log(`[ResultService] Processing result for market ${marketId}: ${result}`);

    // Find all bets for this market
    const matchingBets = bets.filter(
      (bet) => Number(bet.market_id) === Number(marketId)
    );

    if (matchingBets.length === 0) {
      console.log(`[ResultService] No bets found for market ${marketId}`);
      return;
    }

    console.log(`[ResultService] Found ${matchingBets.length} bets for market ${marketId}`);

    // Settle each bet
    for (const bet of matchingBets) {
      await this.settleBet(bet, result);
    }
  }

  /**
   * Settle a bet based on result
   */
  private async settleBet(bet: any, result: string) {
    try {
      let status: 'won' | 'lost' | 'void';
      let payout = 0;

      // Determine settlement based on result
      if (result === 'WON') {
        status = 'won';
        payout = bet.stake * bet.odds; // Full payout
      } else if (result === 'LOST') {
        status = 'lost';
        payout = 0; // No payout
      } else if (result === 'VOID') {
        status = 'void';
        payout = bet.stake; // Refund stake
      } else {
        console.warn(`[ResultService] Unknown result status: ${result}`);
        return;
      }

      console.log(`[ResultService] Settling bet ${bet.id} as ${status} with payout ${payout}`);

      // Call the settlement service
      const settlementResult = await bettingService.settleBet(
        bet.id,
        status,
        payout
      );

      if (settlementResult.success) {
        console.log(`[ResultService] ✅ Bet ${bet.id} settled successfully`);
      } else {
        console.error(`[ResultService] ❌ Failed to settle bet ${bet.id}:`, settlementResult.error);
      }
    } catch (error) {
      console.error(`[ResultService] Error settling bet ${bet.id}:`, error);
    }
  }

  /**
   * Manually trigger result check for a specific event
   */
  async checkEventResults(eventId: number): Promise<void> {
    console.log(`[ResultService] Manual result check for event ${eventId}`);

    const { data: bets } = await supabase
      .from('bets')
      .select('*')
      .eq('event_id', String(eventId))
      .eq('status', 'PLACED');

    if (bets && bets.length > 0) {
      await this.fetchAndProcessEventResults(eventId, bets);
    }
  }
}

// Export singleton instance
export const sportsResultService = new SportsResultService();
