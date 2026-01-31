/**
 * Enhanced Sports WebSocket Service
 * Handles real-time updates for match odds, scores, and market status
 * Uses polling fallback since Diamond API primarily uses HTTP
 */

import type {
  SportsBettingMessage,
  OddsUpdateMessage,
  ScoreUpdateMessage,
  MarketOdds,
  LiveScoreData,
  RunnerOdds,
  MatchOddsData,
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
const SCORE_API_BASE = "https://score.akamaized.uk";

export type SportsWebSocketCallback = (message: SportsBettingMessage) => void;

interface SubscriptionConfig {
  eventId: number;
  sid: number;
  markets: string[]; // ["match_odds", "bookmaker", "fancy"]
  includeScore: boolean;
}

class EnhancedSportsWebSocketService {
  private callbacks = new Map<string, Set<SportsWebSocketCallback>>();
  private subscriptions = new Map<number, SubscriptionConfig>();
  private oddsPollingIntervals = new Map<number, NodeJS.Timeout>();
  private scorePollingIntervals = new Map<number, NodeJS.Timeout>();
  private oddsCache = new Map<number, MatchOddsData>();
  private scoreCache = new Map<number, LiveScoreData>();
  private isActive = false;

  // Polling intervals
  private readonly ODDS_POLL_INTERVAL = 2000; // 2 seconds
  private readonly SCORE_POLL_INTERVAL = 3000; // 3 seconds

  constructor() {
    console.log("[Enhanced Sports WS] Service initialized");
  }

  /**
   * Subscribe to updates for a specific event
   */
  subscribe(
    eventId: number,
    sid: number,
    callback: SportsWebSocketCallback,
    options: {
      markets?: string[];
      includeScore?: boolean;
    } = {},
  ): () => void {
    const callbackId = `event_${eventId}_${Date.now()}`;

    // Store callback
    if (!this.callbacks.has(callbackId)) {
      this.callbacks.set(callbackId, new Set());
    }
    this.callbacks.get(callbackId)!.add(callback);

    // Store subscription config
    if (!this.subscriptions.has(eventId)) {
      const config: SubscriptionConfig = {
        eventId,
        sid,
        markets: options.markets || ["match_odds", "bookmaker", "fancy"],
        includeScore: options.includeScore !== false,
      };
      this.subscriptions.set(eventId, config);
      this.startPolling(eventId);
    }

    console.log(`[Enhanced Sports WS] Subscribed to event ${eventId}`);

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
        this.stopPolling(eventId);
        this.subscriptions.delete(eventId);
        console.log(`[Enhanced Sports WS] Unsubscribed from event ${eventId}`);
      }
    };
  }

  /**
   * Start polling for updates
   */
  private startPolling(eventId: number): void {
    if (this.oddsPollingIntervals.has(eventId)) {
      console.log(`[Enhanced Sports WS] Already polling for event ${eventId}`);
      return;
    }

    const config = this.subscriptions.get(eventId);
    if (!config) {
      console.warn(`[Enhanced Sports WS] No config found for event ${eventId}`);
      return;
    }

    console.log(
      `[Enhanced Sports WS] Starting polling for event ${eventId} (sid: ${config.sid})`,
    );

    // Poll odds - separate interval for each event
    const oddsInterval = setInterval(() => {
      this.pollOdds(eventId, config);
    }, this.ODDS_POLL_INTERVAL);

    this.oddsPollingIntervals.set(eventId, oddsInterval);

    // Poll score if needed - separate interval for each event
    if (config.includeScore) {
      const scoreInterval = setInterval(() => {
        this.pollScore(eventId, config);
      }, this.SCORE_POLL_INTERVAL);

      this.scorePollingIntervals.set(eventId, scoreInterval);

      // Initial score fetch
      this.pollScore(eventId, config);
    }

    // Initial odds fetch
    this.pollOdds(eventId, config);

    console.log(
      `[Enhanced Sports WS] Started polling for event ${eventId} with markets:`,
      config.markets,
    );
  }

  /**
   * Stop polling for updates
   */
  private stopPolling(eventId: number): void {
    // Stop odds polling
    const oddsInterval = this.oddsPollingIntervals.get(eventId);
    if (oddsInterval) {
      clearInterval(oddsInterval);
      this.oddsPollingIntervals.delete(eventId);
    }

    // Stop score polling
    const scoreInterval = this.scorePollingIntervals.get(eventId);
    if (scoreInterval) {
      clearInterval(scoreInterval);
      this.scorePollingIntervals.delete(eventId);
    }

    // Clear caches for this event
    this.oddsCache.delete(eventId);
    this.scoreCache.delete(eventId);

    console.log(`[Enhanced Sports WS] Stopped polling for event ${eventId}`);
  }

  /**
   * Poll odds from Diamond API
   */
  private async pollOdds(
    eventId: number,
    config: SubscriptionConfig,
  ): Promise<void> {
    try {
      const url = buildApiUrl("getPriveteData", {
        gmid: eventId.toString(),
        sid: config.sid.toString(),
      });

      console.log(
        `[Enhanced Sports WS] Fetching odds for event ${eventId}, sid ${config.sid}`,
      );

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(
          `[Enhanced Sports WS] HTTP ${response.status} for event ${eventId}`,
        );
        return;
      }

      const result = await response.json();

      if (!result || !result.data) {
        console.warn(
          `[Enhanced Sports WS] No data returned for event ${eventId}`,
        );
        return;
      }

      // Parse the markets from Diamond API response
      const markets: any[] = Array.isArray(result.data) ? result.data : [];

      console.log(
        `[Enhanced Sports WS] Event ${eventId} has ${markets.length} markets:`,
        markets.map((m) => m?.mname || "unnamed"),
      );

      const getMarket = (name: string) =>
        markets.find(
          (m) => (m?.mname || "").toUpperCase() === name.toUpperCase(),
        );

      const normalizeSection = (sec: any) => {
        const odds: any[] = Array.isArray(sec?.odds) ? sec.odds : [];
        const bestBack = odds
          .filter((o) => o.otype === "back")
          .sort((a, b) => b.odds - a.odds)[0];
        const bestLay = odds
          .filter((o) => o.otype === "lay")
          .sort((a, b) => a.odds - b.odds)[0];
        return {
          runner_name: sec.nat || sec.runner_name || sec.name || "Runner",
          runner_id: sec.selectionId || sec.id,
          nat: sec.nat,
          odds: odds,
          back: bestBack
            ? { price: Number(bestBack.odds), size: bestBack.size }
            : null,
          lay: bestLay
            ? { price: Number(bestLay.odds), size: bestLay.size }
            : null,
          status: sec.status || "ACTIVE",
        };
      };

      const toArray = (market: any | undefined) => {
        if (!market?.section) return [];
        return Array.isArray(market.section)
          ? market.section.map(normalizeSection)
          : [];
      };

      const normalizeFancy = (sec: any) => {
        const base = normalizeSection(sec);
        return {
          ...base,
          runs: typeof sec.runs === "number" ? sec.runs : undefined,
        };
      };

      const matchMarket = getMarket("MATCH_ODDS");
      const bookmakerMarket = getMarket("BOOKMAKER");
      const fancyMarket = getMarket("NORMAL");
      const tossMarket = getMarket("TOSS");

      const data: MatchOddsData = {
        match_odds: toArray(matchMarket),
        bookmaker: toArray(bookmakerMarket),
        fancy: Array.isArray(fancyMarket?.section)
          ? fancyMarket.section.map(normalizeFancy)
          : [],
        toss: toArray(tossMarket),
      };

      // Check if data has changed for THIS specific event
      const cached = this.oddsCache.get(eventId);
      const dataString = JSON.stringify(data);
      const cachedString = cached ? JSON.stringify(cached) : null;

      if (cachedString === dataString) {
        // No changes for this event
        return;
      }

      // Update cache for THIS specific event
      this.oddsCache.set(eventId, data);

      console.log(
        `[Enhanced Sports WS] ✅ NEW ODDS for event ${eventId} (sid: ${config.sid}):`,
        {
          match_odds: data.match_odds?.length || 0,
          bookmaker: data.bookmaker?.length || 0,
          fancy: data.fancy?.length || 0,
          toss: data.toss?.length || 0,
        },
      );

      // Emit updates for each market type - ONLY to subscribers of THIS event
      if (
        data.match_odds &&
        data.match_odds.length > 0 &&
        config.markets.includes("match_odds")
      ) {
        this.broadcastToEvent(eventId, {
          type: "odds_update",
          event_id: eventId,
          market_id: `${eventId}_match_odds`,
          market_type: "MATCH_ODDS",
          data: data.match_odds,
          timestamp: Date.now(),
        });
      }

      if (
        data.bookmaker &&
        data.bookmaker.length > 0 &&
        config.markets.includes("bookmaker")
      ) {
        this.broadcastToEvent(eventId, {
          type: "odds_update",
          event_id: eventId,
          market_id: `${eventId}_bookmaker`,
          market_type: "BOOKMAKER",
          data: data.bookmaker,
          timestamp: Date.now(),
        });
      }

      if (
        data.fancy &&
        data.fancy.length > 0 &&
        config.markets.includes("fancy")
      ) {
        this.broadcastToEvent(eventId, {
          type: "odds_update",
          event_id: eventId,
          market_id: `${eventId}_fancy`,
          market_type: "FANCY",
          data: data.fancy,
          timestamp: Date.now(),
        });
      }

      if (
        data.toss &&
        data.toss.length > 0 &&
        config.markets.includes("toss")
      ) {
        this.broadcastToEvent(eventId, {
          type: "odds_update",
          event_id: eventId,
          market_id: `${eventId}_toss`,
          market_type: "TOSS",
          data: data.toss,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error(
        `[Enhanced Sports WS] Failed to poll odds for ${eventId}:`,
        error,
      );
    }
  }

  /**
   * Poll live score data
   */
  private async pollScore(
    eventId: number,
    config: SubscriptionConfig,
  ): Promise<void> {
    try {
      const url = `${SCORE_API_BASE}/diamond-live-score?gmid=${eventId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          `[Enhanced Sports WS] Score API returned non-JSON response for ${eventId}: ${contentType}`,
        );
        return;
      }

      const text = await response.text();

      // Validate it's actually JSON before parsing
      if (!text || text.trim().startsWith("<")) {
        console.warn(
          `[Enhanced Sports WS] Score API returned HTML instead of JSON for ${eventId}`,
        );
        return;
      }

      let scoreData: LiveScoreData;
      try {
        scoreData = JSON.parse(text);
      } catch (parseError) {
        console.warn(
          `[Enhanced Sports WS] Failed to parse score JSON for ${eventId}:`,
          parseError,
        );
        return;
      }

      // Check if data has changed for THIS specific event
      const cached = this.scoreCache.get(eventId);
      const dataString = JSON.stringify(scoreData);
      const cachedString = cached ? JSON.stringify(cached) : null;

      if (cachedString === dataString) {
        return; // No changes
      }

      this.scoreCache.set(eventId, scoreData);

      // Broadcast score update ONLY to subscribers of THIS event
      this.broadcastToEvent(eventId, {
        type: "score_update",
        event_id: eventId,
        data: scoreData,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Only log meaningful errors, not HTML pages
      const errorMsg = String(error);
      if (!errorMsg.includes("HTML") && !errorMsg.includes("<!DOCTYPE")) {
        console.error(
          `[Enhanced Sports WS] Failed to poll score for ${eventId}:`,
          error,
        );
      }
    }
  }

  /**
   * Broadcast message to subscribers of a SPECIFIC event only
   */
  private broadcastToEvent(
    eventId: number,
    message: SportsBettingMessage,
  ): void {
    let callbackCount = 0;

    // Find all callbacks for THIS SPECIFIC event
    this.callbacks.forEach((callbacks, key) => {
      if (key.startsWith(`event_${eventId}_`)) {
        callbacks.forEach((callback) => {
          try {
            callback(message);
            callbackCount++;
          } catch (error) {
            console.error(
              `[Enhanced Sports WS] Callback error for event ${eventId}:`,
              error,
            );
          }
        });
      }
    });

    if (callbackCount === 0) {
      console.warn(
        `[Enhanced Sports WS] No callbacks found for event ${eventId}, message type: ${message.type}`,
      );
    }
  }

  /**
   * Get current odds data from cache
   */
  getOddsCache(eventId: number): MatchOddsData | undefined {
    return this.oddsCache.get(eventId);
  }

  /**
   * Get current score data from cache
   */
  getScoreCache(eventId: number): LiveScoreData | undefined {
    return this.scoreCache.get(eventId);
  }

  /**
   * Clear all subscriptions and stop polling
   */
  disconnect(): void {
    // Stop all odds polling
    this.oddsPollingIntervals.forEach((interval) => clearInterval(interval));
    this.oddsPollingIntervals.clear();

    // Stop all score polling
    this.scorePollingIntervals.forEach((interval) => clearInterval(interval));
    this.scorePollingIntervals.clear();

    // Clear all data
    this.subscriptions.clear();
    this.callbacks.clear();
    this.oddsCache.clear();
    this.scoreCache.clear();

    console.log("[Enhanced Sports WS] Disconnected all events");
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptions(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if service is connected/active
   */
  isConnected(): boolean {
    return this.subscriptions.size > 0;
  }
}

// Export singleton instance
export const enhancedSportsWebSocket = new EnhancedSportsWebSocketService();

// Export hook for React components
export function useEnhancedSportsWebSocket(
  eventId: number | null,
  sid: number | null,
  callback: SportsWebSocketCallback,
  options?: {
    markets?: string[];
    includeScore?: boolean;
  },
) {
  const { useEffect } = require("react");

  useEffect(() => {
    if (!eventId || !sid) return;

    const unsubscribe = enhancedSportsWebSocket.subscribe(
      eventId,
      sid,
      callback,
      options,
    );

    return unsubscribe;
  }, [eventId, sid, callback, options]);
}
