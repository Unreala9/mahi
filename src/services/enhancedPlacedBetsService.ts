/**
 * Enhanced Placed Bets WebSocket Service
 * Handles real-time monitoring of placed bets and results
 * Uses polling since Diamond API primarily uses HTTP
 */

import type {
  PlacedBet,
  PlaceBetResponse,
  GetResultResponse,
  GetPlacedBetsResponse,
  BetPlacement,
  BetResult,
  BetPlacedMessage,
  BetSettledMessage,
} from "@/types/sports-betting";

// Use proxy in production, direct API in development
const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const IS_PHP_PROXY = API_HOST.includes("proxy.php");
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
    ? `${API_PROTOCOL}://${API_HOST}`
    : `http://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

// Helper to build URL (handles PHP proxy path parameter)
function buildApiUrl(endpoint: string, params: Record<string, string>): string {
  const queryParams = new URLSearchParams({ key: API_KEY, ...params });

  if (IS_PHP_PROXY) {
    queryParams.set("path", endpoint);
    return `${BASE_URL}?${queryParams.toString()}`;
  }

  return `${BASE_URL}/${endpoint}?${queryParams.toString()}`;
}

export type PlacedBetsCallback = (
  message: BetPlacedMessage | BetSettledMessage,
) => void;

interface BetSubscription {
  eventId: number;
  callback: PlacedBetsCallback;
}

class EnhancedPlacedBetsService {
  private callbacks = new Map<string, Set<PlacedBetsCallback>>();
  private eventSubscriptions = new Map<number, NodeJS.Timeout>();
  private placedBetsCache = new Map<number, PlacedBet[]>();
  private resultCache = new Map<number, BetResult[]>();

  private readonly PLACED_BETS_POLL_INTERVAL = 3000; // 3 seconds
  private readonly RESULTS_POLL_INTERVAL = 5000; // 5 seconds

  constructor() {
    console.log("[Enhanced Placed Bets] Service initialized");
  }

  /**
   * Place a new bet
   */
  async placeBet(bet: BetPlacement): Promise<PlaceBetResponse> {
    try {
      const url = buildApiUrl("placed_bets", {});

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: bet.event_id,
          event_name: bet.event_name,
          market_id: bet.market_id,
          market_name: bet.market_name,
          market_type: bet.market_type,
          selection: bet.selection,
          selection_id: bet.selection_id,
          stake: bet.stake,
          odds: bet.odds,
          bet_type: bet.bet_type,
          user_id: bet.user_id,
          ip_address: bet.ip_address,
          device: bet.device,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PlaceBetResponse = await response.json();

      // Broadcast bet placed event
      if (result.success && result.bet) {
        this.broadcast({
          type: "bet_placed",
          bet: result.bet,
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (error) {
      console.error("[Enhanced Placed Bets] Failed to place bet:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to place bet",
      };
    }
  }

  /**
   * Get results for a specific event/market
   */
  async getResults(params: {
    event_id: number;
    event_name: string;
    market_id: number | string;
    market_name: string;
  }): Promise<GetResultResponse> {
    try {
      const url = buildApiUrl("get-result", {});

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GetResultResponse = await response.json();
      return result;
    } catch (error) {
      console.error("[Enhanced Placed Bets] Failed to get results:", error);
      return {
        success: false,
      };
    }
  }

  /**
   * Get all placed bets for an event
   */
  async getPlacedBets(eventId: number): Promise<GetPlacedBetsResponse> {
    try {
      const url = buildApiUrl("get_placed_bets", {
        event_id: eventId.toString(),
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GetPlacedBetsResponse = await response.json();
      return result;
    } catch (error) {
      console.error("[Enhanced Placed Bets] Failed to get placed bets:", error);
      return {
        success: false,
        bets: [],
        total: 0,
      };
    }
  }

  /**
   * Subscribe to placed bets updates for a specific event
   */
  subscribeToEvent(eventId: number, callback: PlacedBetsCallback): () => void {
    const callbackId = `event_${eventId}_${Date.now()}`;

    // Store callback
    if (!this.callbacks.has(callbackId)) {
      this.callbacks.set(callbackId, new Set());
    }
    this.callbacks.get(callbackId)!.add(callback);

    // Start polling if not already started
    if (!this.eventSubscriptions.has(eventId)) {
      this.startPollingEvent(eventId);
    }

    console.log(`[Enhanced Placed Bets] Subscribed to event ${eventId}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(callbackId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.callbacks.delete(callbackId);
        }
      }

      // Check if any callbacks remain for this event
      const hasCallbacks = Array.from(this.callbacks.keys()).some((key) =>
        key.startsWith(`event_${eventId}_`),
      );

      if (!hasCallbacks) {
        this.stopPollingEvent(eventId);
        console.log(
          `[Enhanced Placed Bets] Unsubscribed from event ${eventId}`,
        );
      }
    };
  }

  /**
   * Start polling for placed bets updates
   */
  private startPollingEvent(eventId: number): void {
    if (this.eventSubscriptions.has(eventId)) {
      return;
    }

    const interval = setInterval(async () => {
      await this.pollPlacedBets(eventId);
    }, this.PLACED_BETS_POLL_INTERVAL);

    this.eventSubscriptions.set(eventId, interval);

    // Initial fetch
    this.pollPlacedBets(eventId);

    console.log(`[Enhanced Placed Bets] Started polling for event ${eventId}`);
  }

  /**
   * Stop polling for an event
   */
  private stopPollingEvent(eventId: number): void {
    const interval = this.eventSubscriptions.get(eventId);
    if (interval) {
      clearInterval(interval);
      this.eventSubscriptions.delete(eventId);
    }
    this.placedBetsCache.delete(eventId);
    console.log(`[Enhanced Placed Bets] Stopped polling for event ${eventId}`);
  }

  /**
   * Poll placed bets for an event
   */
  private async pollPlacedBets(eventId: number): Promise<void> {
    try {
      const response = await this.getPlacedBets(eventId);

      if (!response.success) {
        return;
      }

      const newBets = response.bets;
      const cachedBets = this.placedBetsCache.get(eventId) || [];

      // Find newly placed bets
      const newBetIds = new Set(newBets.map((b) => b.bet_id));
      const cachedBetIds = new Set(cachedBets.map((b) => b.bet_id));

      newBets.forEach((bet) => {
        if (!cachedBetIds.has(bet.bet_id)) {
          // New bet placed
          this.broadcastToEvent(eventId, {
            type: "bet_placed",
            bet,
            timestamp: Date.now(),
          });
        } else {
          // Check if bet status changed
          const cachedBet = cachedBets.find((b) => b.bet_id === bet.bet_id);
          if (cachedBet && cachedBet.status !== bet.status) {
            // Bet settled
            if (bet.status === "SETTLED") {
              this.broadcastToEvent(eventId, {
                type: "bet_settled",
                bet_id: bet.bet_id,
                result: {
                  event_id: bet.event_id,
                  event_name: bet.event_name,
                  market_id: bet.market_id,
                  market_name: bet.market_name,
                  market_type: bet.market_type,
                  winner: bet.result === "WON" ? bet.selection : undefined,
                  status: "DECLARED",
                  declared_at: bet.settled_at,
                },
                payout: bet.payout,
                timestamp: Date.now(),
              });
            }
          }
        }
      });

      // Update cache
      this.placedBetsCache.set(eventId, newBets);
    } catch (error) {
      console.error(
        `[Enhanced Placed Bets] Failed to poll placed bets for ${eventId}:`,
        error,
      );
    }
  }

  /**
   * Broadcast message to all subscribers of an event
   */
  private broadcastToEvent(
    eventId: number,
    message: BetPlacedMessage | BetSettledMessage,
  ): void {
    this.callbacks.forEach((callbacks, key) => {
      if (key.startsWith(`event_${eventId}_`)) {
        callbacks.forEach((callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error("[Enhanced Placed Bets] Callback error:", error);
          }
        });
      }
    });
  }

  /**
   * Broadcast message to all subscribers
   */
  private broadcast(message: BetPlacedMessage | BetSettledMessage): void {
    this.callbacks.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("[Enhanced Placed Bets] Callback error:", error);
        }
      });
    });
  }

  /**
   * Get placed bets from cache
   */
  getPlacedBetsCache(eventId: number): PlacedBet[] {
    return this.placedBetsCache.get(eventId) || [];
  }

  /**
   * Clear all subscriptions
   */
  disconnect(): void {
    this.eventSubscriptions.forEach((interval) => clearInterval(interval));
    this.eventSubscriptions.clear();
    this.callbacks.clear();
    this.placedBetsCache.clear();
    this.resultCache.clear();
    console.log("[Enhanced Placed Bets] Disconnected");
  }
}

// Export singleton instance
export const enhancedPlacedBetsService = new EnhancedPlacedBetsService();

// Export hook for React components
export function useEnhancedPlacedBets(
  eventId: number | null,
  callback: PlacedBetsCallback,
) {
  const { useEffect } = require("react");

  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = enhancedPlacedBetsService.subscribeToEvent(
      eventId,
      callback,
    );

    return unsubscribe;
  }, [eventId, callback]);
}
