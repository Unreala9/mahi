// WebSocket service for real-time updates from Diamond API
import { MatchEvent, SportId } from "./diamondApi";

type EventCallback<T = any> = (data: T) => void;

interface WebSocketConfig {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class DiamondWebSocketService {
  // Note: Diamond API does NOT support WebSocket
  // This service uses HTTP polling to simulate real-time updates
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;
  private isPolling = false; // Track if polling is active

  // Store interval IDs for cleanup
  private pollingIntervals: NodeJS.Timeout[] = [];

  private config: Required<WebSocketConfig> = {
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000, // 30 seconds
  };

  // In-memory cache for data
  private cache: {
    sports: SportId[];
    matches: MatchEvent[];
    odds: Map<number, any>; // gmid -> odds data
    lastUpdate: number;
  } = {
    sports: [],
    matches: [],
    odds: new Map(),
    lastUpdate: 0,
  };

  // Track which matches we're actively polling for odds
  private activeOddsPolling: Map<number, { gmid: number; sid: number }> =
    new Map();

  // Blacklist matches that return 404 (no odds available)
  private oddsBlacklist: Map<number, number> = new Map(); // gmid -> timestamp
  private blacklistDuration = 5 * 60 * 1000; // 5 minutes

  constructor(config?: WebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Connect to service (uses HTTP polling only - no WebSocket)
   * This method sets up a polling mechanism for real-time updates
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isPolling) {
      console.log("[Diamond WS] Already connected or connecting");
      return;
    }

    // Check if already polling
    if (this.pollingIntervals.length > 0) {
      console.log("[Diamond WS] Already polling, skipping reconnect");
      return;
    }

    // Use HTTP polling only (Diamond API has no WebSocket support)
    this.isConnecting = true;
    this.shouldReconnect = true;

    console.log("[Diamond WS] Starting HTTP polling service...");

    // Fetch initial data before starting polling intervals
    console.log("[Diamond WS] Fetching initial data...");
    await this.fetchAndEmitData();
    console.log("[Diamond WS] Initial data fetched");

    // Now start polling intervals for continuous updates
    this.startPollingIntervals();

    // Emit connected event after data is ready
    this.isConnecting = false;
    this.isPolling = true;
    this.emit("connected", { status: "polling_active" });
  }

  /**
   * Disconnect from service
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.isPolling = false;

    this.clearTimers();
    this.clearPollingIntervals();
    this.emit("disconnected", { reason: "manual" });
  }

  /**
   * Start intelligent polling for live data
   */
  private startPollingIntervals(): void {
    // Clear any existing intervals first
    this.clearPollingIntervals();

    // Set up polling intervals and store their IDs
    // Sports list: every 60 seconds (rarely changes, but faster than before)
    this.pollingIntervals.push(
      setInterval(() => this.fetchSports(), 60 * 1000),
    );

    // Matches: every 5 seconds for faster live updates (reduced from 10s)
    this.pollingIntervals.push(
      setInterval(() => this.fetchMatches(), 5 * 1000),
    );

    // Live matches odds: every 1.5 seconds for real-time feel (reduced from 3s)
    this.pollingIntervals.push(
      setInterval(() => this.fetchLiveMatchUpdates(), 1500),
    );

    console.log(
      "[WebSocket] Polling intervals started:",
      this.pollingIntervals.length,
    );
  }

  /**
   * Clear all polling intervals
   */
  private clearPollingIntervals(): void {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals = [];
    console.log("[WebSocket] Polling intervals cleared");
  }

  /**
   * Fetch and emit all data
   */
  private async fetchAndEmitData(): Promise<void> {
    await Promise.all([this.fetchSports(), this.fetchMatches()]);
  }

  /**
   * Fetch sports list
   */
  private async fetchSports(): Promise<void> {
    try {
      const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
      const base = apiHost.startsWith("/")
        ? apiHost
        : protocol
          ? `${protocol}://${apiHost}`
          : `http://${apiHost}`;

      // Add timeout and keepalive for faster requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${base}/allSportid?key=${apiKey}`, {
        signal: controller.signal,
        keepalive: true, // Reuse connections
        headers: {
          Connection: "keep-alive",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[WebSocket] Sports API returned ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data && data.data) {
        const sports: SportId[] = (Array.isArray(data.data) ? data.data : [])
          .filter((sport: any) => sport.active !== false)
          .map((sport: any) => ({
            sid: Number(sport.eid),
            name: sport.ename || sport.name,
            icon: this.getSportIcon(Number(sport.eid)),
          }));

        // Only emit if data has changed
        if (JSON.stringify(sports) !== JSON.stringify(this.cache.sports)) {
          this.cache.sports = sports;
          this.emit("sports:update", sports);
        }
      }
    } catch (error) {
      // Silent fail for polling errors - don't spam console or emit error events
      console.debug("[WebSocket] Sports fetch error (will retry):", error);
    }
  }

  /**
   * Fetch matches list
   */
  private async fetchMatches(): Promise<void> {
    try {
      const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

      // If apiHost starts with /, use it as is (proxy path)
      // Otherwise, prepend protocol
      const base = apiHost.startsWith("/")
        ? apiHost
        : protocol
          ? `${protocol}://${apiHost}`
          : `http://${apiHost}`;

      // Add timeout and keepalive for faster requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${base}/tree?key=${apiKey}`, {
        signal: controller.signal,
        keepalive: true, // Reuse connections
        headers: {
          Connection: "keep-alive",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[WebSocket] Matches API returned ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data && data.data) {
        const matches = this.parseMatches(data.data);

        // Only emit if data has changed
        const currentHash = this.getMatchesHash(matches);
        const cachedHash = this.getMatchesHash(this.cache.matches);

        if (currentHash !== cachedHash) {
          this.cache.matches = matches;
          this.cache.lastUpdate = Date.now();
          this.emit("matches:update", matches);

          // Emit specific events for live matches
          const liveMatches = matches.filter((m) => m.is_live);
          if (liveMatches.length > 0) {
            this.emit("matches:live", liveMatches);
          }
        }
      }
    } catch (error) {
      // Silent fail for polling errors - don't spam console
      console.debug("[WebSocket] Matches fetch error (will retry):", error);
    }
  }

  /**
   * Fetch updates for actively requested matches (including odds)
   */
  private async fetchLiveMatchUpdates(): Promise<void> {
    // Fetch odds for all actively tracked matches (requested by components)
    if (this.activeOddsPolling.size === 0) {
      return;
    }

    // Get all tracked matches for polling
    const trackedMatches = Array.from(this.activeOddsPolling.values());

    // Clean up expired blacklist entries
    const now = Date.now();
    for (const [gmid, timestamp] of this.oddsBlacklist.entries()) {
      if (now - timestamp > this.blacklistDuration) {
        this.oddsBlacklist.delete(gmid);
      }
    }

    // Filter out blacklisted matches
    const availableMatches = trackedMatches.filter(
      (m) => !this.oddsBlacklist.has(m.gmid),
    );

    // Fetch odds for each tracked match (up to 50 for better throughput)
    const oddsPromises = availableMatches.slice(0, 50).map(async (match) => {
      try {
        const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
        const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
        const apiKey =
          import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

        // If apiHost starts with /, use it as is (proxy path)
        // Otherwise, prepend protocol
        const base = apiHost.startsWith("/")
          ? apiHost
          : protocol
            ? `${protocol}://${apiHost}`
            : `http://${apiHost}`;

        // Add timeout for faster failure and retry
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout for real-time odds

        const response = await fetch(
          `${base}/getPriveteData?gmid=${match.gmid}&sid=${match.sid}&key=${apiKey}`,
          {
            signal: controller.signal,
            keepalive: true, // Reuse connections
            headers: {
              Connection: "keep-alive",
            },
          },
        );

        clearTimeout(timeoutId);

        // If 404, add to blacklist and skip
        if (response.status === 404) {
          this.oddsBlacklist.set(match.gmid, Date.now());
          console.debug(
            `[WebSocket] Match ${match.gmid} has no odds - blacklisted for 5 minutes`,
          );
          return;
        }

        // Skip other error responses
        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data && data.data) {
          // Parse odds data using the same format as diamondApi
          const parsedOdds = this.parseOddsData(data.data);
          const previousOdds = this.cache.odds.get(match.gmid);

          // Only emit if odds have changed
          const oddsHash = JSON.stringify(parsedOdds);
          const prevHash = previousOdds ? JSON.stringify(previousOdds) : null;

          if (oddsHash !== prevHash) {
            this.cache.odds.set(match.gmid, parsedOdds);
            this.emit("odds:update", {
              gmid: match.gmid,
              sid: match.sid,
              odds: parsedOdds,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        // Silent fail for individual match odds errors
        console.debug(
          `[WebSocket] Odds fetch error for match ${match.gmid} (will retry)`,
        );
      }
    });

    await Promise.allSettled(oddsPromises);

    // Emit update event
    this.emit("matches:live:tick", {
      count: trackedMatches.length,
      timestamp: Date.now(),
    });
  }

  /**
   * Parse matches from API response
   */
  private parseMatches(data: any): MatchEvent[] {
    const allMatches: MatchEvent[] = [];

    // Process t1 (main matches)
    if (data.t1 && Array.isArray(data.t1)) {
      data.t1.forEach((sport: any) => {
        const sportId = sport.etid;
        const sportName = sport.name;

        if (sport.children && Array.isArray(sport.children)) {
          sport.children.forEach((competition: any) => {
            const competitionName = competition.name;

            if (competition.children && Array.isArray(competition.children)) {
              competition.children.forEach((match: any) => {
                allMatches.push({
                  gmid: match.gmid,
                  sid: sportId,
                  sname: sportName,
                  name: match.name || match.ename,
                  is_live: match.iplay || false,
                  start_date: match.stime,
                  cname: competitionName,
                  srno: match.srno || 0,
                });
              });
            }
          });
        }
      });
    }

    // Process t2 (additional matches)
    if (data.t2 && Array.isArray(data.t2)) {
      data.t2.forEach((match: any) => {
        allMatches.push({
          gmid: match.gmid,
          sid: match.etid,
          sname: match.cname || "Virtual",
          name: match.ename,
          is_live: match.iplay || false,
          start_date: match.stime,
          cname: match.cname,
          srno: 0,
        });
      });
    }

    return allMatches;
  }

  /**
   * Get a hash of matches for change detection
   */
  private getMatchesHash(matches: MatchEvent[]): string {
    return matches
      .map((m) => `${m.gmid}:${m.is_live}:${m.start_date}`)
      .join("|");
  }

  /**
   * Get sport icon
   */
  private getSportIcon(sid: number): string {
    const icons: Record<number, string> = {
      1: "⚽",
      2: "🎾",
      4: "🏏",
      5: "🏀",
      6: "🏈",
      7: "🏐",
      8: "🏒",
      9: "🥊",
      10: "🏉",
    };
    return icons[sid] || "🏆";
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[WebSocket] Error in event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  /**
   * Parse odds data from Diamond API format
   */
  private parseOddsData(markets: any[]): any {
    if (!Array.isArray(markets)) return null;

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
        odds: odds,
        back: bestBack
          ? { price: Number(bestBack.odds), size: bestBack.size }
          : null,
        lay: bestLay
          ? { price: Number(bestLay.odds), size: bestLay.size }
          : null,
      };
    };

    const toArray = (market: any | undefined) => {
      if (!market?.section) return [];
      return Array.isArray(market.section)
        ? market.section.map(normalizeSection)
        : [];
    };

    const matchMarket = getMarket("MATCH_ODDS");
    const bookmakerMarket = getMarket("BOOKMAKER");
    const fancyMarket = getMarket("NORMAL");

    const normalizeFancy = (sec: any) => {
      const base = normalizeSection(sec);
      return {
        ...base,
        runs: typeof sec.runs === "number" ? sec.runs : undefined,
      };
    };

    return {
      match_odds: toArray(matchMarket),
      bookmaker: toArray(bookmakerMarket),
      fancy: Array.isArray(fancyMarket?.section)
        ? fancyMarket.section.map(normalizeFancy)
        : [],
    };
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Get cached data
   */
  getCachedData(): {
    sports: SportId[];
    matches: MatchEvent[];
    lastUpdate: number;
  } {
    return {
      sports: this.cache.sports,
      matches: this.cache.matches,
      lastUpdate: this.cache.lastUpdate,
    };
  }

  /**
   * Get cached odds for a specific match
   */
  getCachedOdds(gmid: number): any | null {
    return this.cache.odds.get(gmid) || null;
  }

  /**
   * Request odds for a specific match (adds to active polling)
   */
  requestMatchOdds(gmid: number, sid: number): void {
    // Add to active polling map
    this.activeOddsPolling.set(gmid, { gmid, sid });

    // Trigger immediate fetch
    this.fetchMatchOdds(gmid, sid);
  }

  /**
   * Stop requesting odds for a specific match
   */
  stopRequestingOdds(gmid: number): void {
    this.activeOddsPolling.delete(gmid);
  }

  /**
   * Fetch odds for a specific match
   */
  private async fetchMatchOdds(gmid: number, sid: number): Promise<void> {
    try {
      const apiHost = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
      const base = apiHost.startsWith("/")
        ? apiHost
        : protocol
          ? `${protocol}://${apiHost}`
          : `http://${apiHost}`;
      const response = await fetch(
        `${base}/getPriveteData?gmid=${gmid}&sid=${sid}&key=${apiKey}`,
      );

      // Silently skip 404s - match odds not available yet
      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data && data.data) {
        const parsedOdds = this.parseOddsData(data.data);
        this.cache.odds.set(gmid, parsedOdds);
        this.emit("odds:update", {
          gmid,
          sid,
          odds: parsedOdds,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Silent fail - odds not available or network error
      console.debug(`[WebSocket] Odds not available for match ${gmid}`);
    }
  }

  /**
   * Check if service is active
   */
  isActive(): boolean {
    return this.shouldReconnect && !this.isConnecting;
  }
}

// Export singleton instance
export const diamondWS = new DiamondWebSocketService();

// Export types
export type { WebSocketConfig };
