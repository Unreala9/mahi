// src/services/resultFetchingService.ts
/**
 * Result Fetching Service
 *
 * Provides comprehensive result fetching capabilities for sports betting markets
 * with support for MATCH_ODDS, Bookmaker, and FANCY market types.
 *
 * Features:
 * - Manual result fetching for individual markets
 * - Batch result fetching for multiple markets
 * - Auto-polling for event results
 * - Proper market ID mapping based on market type
 */

import { diamondApi } from "./diamondApi";
import type {
  ResultRequest,
  MarketResult,
  EventResults,
  ResultFetchResponse,
} from "@/types/sports-betting";

class ResultFetchingService {
  private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();
  private pollingCallbacks: Map<number, Set<(results: EventResults) => void>> =
    new Map();

  /**
   * Fetch result for a specific market
   *
   * IMPORTANT: This will first register/track the bet via /placed_bets,
   * then fetch the result. This is required by the API.
   *
   * @param request - Result request with event and market details
   * @returns Market result or null if not available
   */
  async fetchMarketResult(
    request: ResultRequest,
  ): Promise<MarketResult | null> {
    try {
      console.log("[ResultFetchingService] Fetching market result:", request);

      // Step 1: First track/register the bet (REQUIRED by API)
      console.log(
        "[ResultFetchingService] Step 1: Tracking bet via /bet-incoming...",
      );
      const trackResult = await diamondApi.registerPlacedBet({
        event_id: request.event_id,
        event_name: request.event_name,
        market_id: request.market_id,
        market_name: request.market_name,
        market_type: request.market_type || "MATCH_ODDS",
        sport_id: request.sport_id || 4,
      });

      if (!trackResult.success) {
        console.warn(
          "[ResultFetchingService] Failed to track bet, continuing anyway...",
        );
      } else {
        console.log("[ResultFetchingService] Bet tracked successfully");
      }

      // Step 2: Now fetch the result
      console.log(
        "[ResultFetchingService] Step 2: Fetching result via /get-result...",
      );
      const response = await diamondApi.getMarketResult({
        event_id: request.event_id,
        event_name: request.event_name,
        market_id: request.market_id,
        market_name: request.market_name,
        market_type: request.market_type || "MATCH_ODDS",
      });

      if (!response) {
        console.warn("[ResultFetchingService] No result data returned");
        return null;
      }

      // Parse the response and extract result
      const result = this.parseMarketResult(response, request);
      console.log("[ResultFetchingService] Parsed result:", result);

      return result;
    } catch (error) {
      console.error(
        "[ResultFetchingService] Error fetching market result:",
        error,
      );
      return null;
    }
  }

  /**
   * Fetch results for all markets of an event
   *
   * @param eventId - Event ID to fetch results for
   * @returns Event results with all market results
   */
  async fetchEventResults(eventId: number): Promise<EventResults | null> {
    try {
      console.log(
        `[ResultFetchingService] Fetching event results for: ${eventId}`,
      );

      const response = await diamondApi.getPlacedBetsResults(eventId);

      if (!response || response.length === 0) {
        console.warn(`[ResultFetchingService] No results for event ${eventId}`);
        return null;
      }

      // Parse all market results
      const markets: MarketResult[] = response.map((item: any) => ({
        market_id: item.market_id || item.mid,
        market_name: item.market_name || item.mname || "Unknown",
        result: this.normalizeResultStatus(item.result || item.status),
        settlement_status: item.settlement_status,
        winner: item.winner || item.winner_name,
        winner_id: item.winner_id || item.sid,
        declared_at: item.declared_at || item.settled_at,
        result_value: item.result_value || item.runs,
      }));

      const eventResults: EventResults = {
        event_id: eventId,
        event_name: response[0]?.event_name || `Event ${eventId}`,
        markets,
        fetched_at: new Date().toISOString(),
      };

      console.log("[ResultFetchingService] Event results:", eventResults);
      return eventResults;
    } catch (error) {
      console.error(
        "[ResultFetchingService] Error fetching event results:",
        error,
      );
      return null;
    }
  }

  /**
   * Fetch results for multiple markets in parallel
   *
   * @param requests - Array of result requests
   * @returns Array of market results
   */
  async fetchBatchResults(requests: ResultRequest[]): Promise<MarketResult[]> {
    try {
      console.log(
        `[ResultFetchingService] Fetching batch results for ${requests.length} markets`,
      );

      const promises = requests.map((request) =>
        this.fetchMarketResult(request),
      );
      const results = await Promise.all(promises);

      // Filter out null results
      const validResults = results.filter((r): r is MarketResult => r !== null);

      console.log(
        `[ResultFetchingService] Fetched ${validResults.length}/${requests.length} results`,
      );
      return validResults;
    } catch (error) {
      console.error(
        "[ResultFetchingService] Error fetching batch results:",
        error,
      );
      return [];
    }
  }

  /**
   * Start auto-polling for event results
   *
   * @param eventId - Event ID to poll results for
   * @param callback - Callback function to receive results
   * @param interval - Polling interval in milliseconds (default: 30000 = 30 seconds)
   * @returns Cleanup function to stop polling
   */
  startAutoPolling(
    eventId: number,
    callback: (results: EventResults) => void,
    interval: number = 30000,
  ): () => void {
    console.log(
      `[ResultFetchingService] Starting auto-polling for event ${eventId} (interval: ${interval}ms)`,
    );

    // Add callback to set
    if (!this.pollingCallbacks.has(eventId)) {
      this.pollingCallbacks.set(eventId, new Set());
    }
    this.pollingCallbacks.get(eventId)!.add(callback);

    // If already polling, just add the callback
    if (this.pollingIntervals.has(eventId)) {
      console.log(
        `[ResultFetchingService] Already polling event ${eventId}, added callback`,
      );
      return () => this.removePollingCallback(eventId, callback);
    }

    // Start polling
    const poll = async () => {
      const results = await this.fetchEventResults(eventId);
      if (results) {
        this.notifyPollingCallbacks(eventId, results);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.pollingIntervals.set(eventId, intervalId);

    // Return cleanup function
    return () => this.removePollingCallback(eventId, callback);
  }

  /**
   * Stop auto-polling for an event
   *
   * @param eventId - Event ID to stop polling for
   */
  stopAutoPolling(eventId: number): void {
    console.log(
      `[ResultFetchingService] Stopping auto-polling for event ${eventId}`,
    );

    const intervalId = this.pollingIntervals.get(eventId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(eventId);
    }

    this.pollingCallbacks.delete(eventId);
  }

  /**
   * Stop all auto-polling
   */
  stopAllPolling(): void {
    console.log("[ResultFetchingService] Stopping all auto-polling");

    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });

    this.pollingIntervals.clear();
    this.pollingCallbacks.clear();
  }

  /**
   * Parse market result from API response
   *
   * @param response - API response
   * @param request - Original request
   * @returns Parsed market result
   */
  private parseMarketResult(
    response: any,
    request: ResultRequest,
  ): MarketResult {
    return {
      market_id: request.market_id,
      market_name: request.market_name,
      result: this.normalizeResultStatus(
        response.result || response.status || response.data?.result,
      ),
      settlement_status:
        response.settlement_status || response.data?.settlement_status,
      winner: response.winner || response.data?.winner || response.winner_name,
      winner_id: response.winner_id || response.data?.winner_id,
      declared_at: response.declared_at || response.data?.declared_at,
      result_value:
        response.result_value || response.data?.result_value || response.runs,
    };
  }

  /**
   * Normalize result status to standard format
   *
   * @param status - Raw status from API
   * @returns Normalized status
   */
  private normalizeResultStatus(
    status: any,
  ): "WON" | "LOST" | "VOID" | "PENDING" | "SUSPENDED" {
    if (!status) return "PENDING";

    const statusStr = String(status).toUpperCase();

    if (
      statusStr.includes("WON") ||
      statusStr === "WIN" ||
      statusStr === "WINNER"
    ) {
      return "WON";
    }
    if (
      statusStr.includes("LOST") ||
      statusStr === "LOSE" ||
      statusStr === "LOSER"
    ) {
      return "LOST";
    }
    if (
      statusStr.includes("VOID") ||
      statusStr === "CANCELLED" ||
      statusStr === "CANCEL"
    ) {
      return "VOID";
    }
    if (statusStr.includes("SUSPENDED") || statusStr === "SUSPEND") {
      return "SUSPENDED";
    }

    return "PENDING";
  }

  /**
   * Remove a polling callback and stop polling if no more callbacks
   *
   * @param eventId - Event ID
   * @param callback - Callback to remove
   */
  private removePollingCallback(
    eventId: number,
    callback: (results: EventResults) => void,
  ): void {
    const callbacks = this.pollingCallbacks.get(eventId);
    if (callbacks) {
      callbacks.delete(callback);

      // If no more callbacks, stop polling
      if (callbacks.size === 0) {
        this.stopAutoPolling(eventId);
      }
    }
  }

  /**
   * Notify all polling callbacks for an event
   *
   * @param eventId - Event ID
   * @param results - Event results
   */
  private notifyPollingCallbacks(eventId: number, results: EventResults): void {
    const callbacks = this.pollingCallbacks.get(eventId);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(results);
        } catch (error) {
          console.error(
            "[ResultFetchingService] Error in polling callback:",
            error,
          );
        }
      });
    }
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopAllPolling();
  }
}

// Export singleton instance
export const resultFetchingService = new ResultFetchingService();

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    resultFetchingService.cleanup();
  });
}
