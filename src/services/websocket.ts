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
  private activeOddsPolling: Set<number> = new Set();

  constructor(config?: WebSocketConfig) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Connect to service (uses HTTP polling only - no WebSocket)
   * This method sets up a polling mechanism for real-time updates
   */
  connect(): void {
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

    // Start polling for live updates
    this.startPolling();

    // Emit connected event
    setTimeout(() => {
      this.isConnecting = false;
      this.isPolling = true;
      this.emit("connected", { status: "polling_active" });
    }, 100);
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
  private startPolling(): void {
    // Clear any existing intervals first
    this.clearPollingIntervals();

    // Initial fetch
    this.fetchAndEmitData();

    // Set up polling intervals and store their IDs
    // Sports list: every 5 minutes (rarely changes)
    this.pollingIntervals.push(
      setInterval(() => this.fetchSports(), 5 * 60 * 1000),
    );

    // Matches: every 15 seconds for live updates
    this.pollingIntervals.push(
      setInterval(() => this.fetchMatches(), 15 * 1000),
    );

    // Live matches odds: every 5 seconds (if any live matches)
    this.pollingIntervals.push(
      setInterval(() => this.fetchLiveMatchUpdates(), 5 * 1000),
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
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
      const base = apiHost.startsWith("/")
        ? apiHost
        : `${protocol}://${apiHost}`;
      const response = await fetch(`${base}/allSportid?key=${apiKey}`);

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
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
      const base = apiHost.startsWith("/")
        ? apiHost
        : `${protocol}://${apiHost}`;
      const response = await fetch(`${base}/tree?key=${apiKey}`);

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
   * Fetch updates for live matches (including odds)
   */
  private async fetchLiveMatchUpdates(): Promise<void> {
    const liveMatches = this.cache.matches.filter((m) => m.is_live);

    if (liveMatches.length === 0) {
      // Clear odds polling if no live matches
      this.activeOddsPolling.clear();
      return;
    }

    // Fetch odds for each live match
    const oddsPromises = liveMatches.slice(0, 10).map(async (match) => {
      try {
        this.activeOddsPolling.add(match.gmid);
        const apiHost =
          import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
        const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
        const apiKey =
          import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
        const response = await fetch(
          `${protocol}://${apiHost}/Getmatchdatawithidhop?gmid=${match.gmid}&sid=${match.sid}&key=${apiKey}`,
        );
        const data = await response.json();

        if (data && data.data) {
          const oddsData = data.data;
          const previousOdds = this.cache.odds.get(match.gmid);

          // Only emit if odds have changed
          const oddsHash = JSON.stringify(oddsData);
          const prevHash = previousOdds ? JSON.stringify(previousOdds) : null;

          if (oddsHash !== prevHash) {
            this.cache.odds.set(match.gmid, oddsData);
            this.emit("odds:update", {
              gmid: match.gmid,
              sid: match.sid,
              odds: oddsData,
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

    // Emit live match update event
    this.emit("matches:live:tick", {
      count: liveMatches.length,
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
    const match = this.cache.matches.find((m) => m.gmid === gmid);
    if (!match) {
      // Add a temporary match entry to poll odds
      this.cache.matches.push({
        gmid,
        sid,
        sname: "",
        name: "",
        is_live: true,
      });
    }

    // Trigger immediate fetch
    this.fetchMatchOdds(gmid, sid);
  }

  /**
   * Fetch odds for a specific match
   */
  private async fetchMatchOdds(gmid: number, sid: number): Promise<void> {
    try {
      const apiHost =
        import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
      const protocol = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
      const apiKey =
        import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";
      const response = await fetch(
        `${protocol}://${apiHost}/Getmatchdatawithidhop?gmid=${gmid}&sid=${sid}&key=${apiKey}`,
      );
      const data = await response.json();

      if (data && data.data) {
        const oddsData = data.data;
        this.cache.odds.set(gmid, oddsData);
        this.emit("odds:update", {
          gmid,
          sid,
          odds: oddsData,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error(
        `[WebSocket] Error fetching odds for match ${gmid}:`,
        error,
      );
      this.emit("error", { message: "Failed to fetch odds", gmid, error });
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
