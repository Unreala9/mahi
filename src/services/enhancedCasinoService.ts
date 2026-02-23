/**
 * Enhanced Casino Service with comprehensive WebSocket and API integration
 * Supports individual game data, live streaming URLs, and real-time updates
 */

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : `${API_PROTOCOL}://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

// Casino streaming URLs
export const CASINO_STREAM_URL =
  "https://casino-stream-v2.cricketid.xyz/casino-tv";
export const LIVE_STREAM_BASE = "https://live.cricketid.xyz/directStream";

export interface CasinoGameData {
  mid: string;
  gmid: string;
  gname: string;
  type: string;
  status: "active" | "inactive" | "suspended";
  data: {
    cards?: any[];
    result?: any;
    timer?: number;
    roundId?: string;
    lastResult?: any[];
  };
  odds: CasinoOdds[];
  timestamp: number;
}

export interface CasinoOdds {
  nation: string;
  selectionId: number;
  back: OddsValue[];
  lay: OddsValue[];
  status: "active" | "suspended" | "closed";
}

export interface OddsValue {
  price: number;
  size: number;
}

export interface CasinoResultData {
  mid: string;
  result: string;
  winner: string;
  cards?: any[];
  timestamp: number;
}

export interface PlacedBet {
  bet_id: string;
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
  market_type: "MATCH_ODDS" | "BOOKMAKER" | "FANCY" | "CASINO";
  user_id: string;
  selection: string;
  stake: number;
  odds: number;
  bet_type: "BACK" | "LAY";
  status: "PENDING" | "MATCHED" | "SETTLED";
  placed_at: string;
}

export interface CasinoResultRequest {
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
}

class EnhancedCasinoService {
  private wsConnections: Map<string, WebSocket> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, Set<(data: CasinoGameData) => void>> =
    new Map();

  /**
   * Fetch casino game data by type
   * @param type - Casino game type (e.g., "dt20", "teen20", "card32", "ab20")
   */
  async getCasinoData(type: string): Promise<CasinoGameData | null> {
    try {
      const url = `${BASE_URL}/casino/data?type=${type}&key=${API_KEY}`;
      console.log(`[Enhanced Casino] Fetching data for type: ${type}`);

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data) {
        console.warn(`[Enhanced Casino] No data returned for type: ${type}`);
        return null;
      }

      // Transform API response to CasinoGameData
      const gameData: CasinoGameData = {
        mid: result.data.mid,
        gmid: result.data.gmid || type,
        gname: result.data.gname || type,
        type: type,
        status: result.data.gstatus === "1" ? "active" : "suspended",
        data: {
          cards: result.data.C1 || [],
          result: result.data.result,
          timer: result.data.autotime,
          roundId: result.data.mid,
          lastResult: result.data.lastresult || [],
        },
        odds: this.transformOdds(result.data.t1 || []),
        timestamp: Date.now(),
      };

      return gameData;
    } catch (error) {
      console.error(`[Enhanced Casino] Error fetching casino data:`, error);
      return null;
    }
  }

  /**
   * Transform odds data from API format
   */
  private transformOdds(oddsArray: any[]): CasinoOdds[] {
    if (!Array.isArray(oddsArray)) return [];

    return oddsArray.map((odd) => ({
      nation: odd.nation || odd.nat || "Unknown",
      selectionId: odd.sid || odd.selectionId || 0,
      back: Array.isArray(odd.b1)
        ? odd.b1.filter(Boolean).map((b: any) => ({
            price: parseFloat(b.rate || b.price || b.odds || 0),
            size: parseFloat(b.size || 0),
          }))
        : [],
      lay: Array.isArray(odd.l1)
        ? odd.l1.filter(Boolean).map((l: any) => ({
            price: parseFloat(l.rate || l.price || l.odds || 0),
            size: parseFloat(l.size || 0),
          }))
        : [],
      status:
        odd.gstatus === "1" || odd.gstatus === "ACTIVE"
          ? "active"
          : "suspended",
    }));
  }

  /**
   * Subscribe to real-time updates for a casino game
   */
  subscribe(
    type: string,
    callback: (data: CasinoGameData) => void,
  ): () => void {
    console.log(`[Enhanced Casino] Subscribing to ${type}`);

    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);

    // Start polling for updates
    this.startPolling(type);

    return () => {
      this.unsubscribe(type, callback);
    };
  }

  /**
   * Unsubscribe from updates
   */
  private unsubscribe(type: string, callback: (data: CasinoGameData) => void) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopPolling(type);
      }
    }
  }

  /**
   * Start polling for updates
   */
  private startPolling(type: string) {
    if (this.pollingIntervals.has(type)) return;

    const poll = async () => {
      const data = await this.getCasinoData(type);
      if (data) {
        this.notifySubscribers(type, data);
      }
    };

    // Initial fetch
    poll();

    // Poll every 2 seconds
    const interval = setInterval(poll, 2000);
    this.pollingIntervals.set(type, interval);
  }

  /**
   * Stop polling
   */
  private stopPolling(type: string) {
    const interval = this.pollingIntervals.get(type);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(type);
    }
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(type: string, data: CasinoGameData) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Enhanced Casino] Error in callback:`, error);
        }
      });
    }
  }

  /**
   * Get casino stream URL
   */
  getCasinoStreamUrl(gameId: string): string {
    return `${CASINO_STREAM_URL}?id=${gameId}`;
  }

  /**
   * Get live stream URL for a match
   */
  getLiveStreamUrl(gmid: string): string {
    return `${LIVE_STREAM_BASE}?gmid=${gmid}&key=${API_KEY}`;
  }

  /**
   * Place a bet
   */
  async placeBet(betData: {
    event_id: number;
    event_name: string;
    market_id: number;
    market_name: string;
    market_type: string;
    selection: string;
    odds: number;
    stake: number;
    bet_type: "BACK" | "LAY";
  }): Promise<any> {
    try {
      const url = `${BASE_URL}/placed_bets?key=${API_KEY}`;
      console.log(`[Enhanced Casino] Placing bet:`, betData);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(betData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[Enhanced Casino] Bet placed successfully:`, result);
      return result;
    } catch (error) {
      console.error(`[Enhanced Casino] Error placing bet:`, error);
      throw error;
    }
  }

  /**
   * Get result for a market
   */
  async getResult(request: CasinoResultRequest): Promise<any> {
    try {
      const url = `${BASE_URL}/get-result?key=${API_KEY}`;
      console.log(`[Enhanced Casino] Getting result:`, request);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[Enhanced Casino] Result fetched:`, result);
      return result;
    } catch (error) {
      console.error(`[Enhanced Casino] Error getting result:`, error);
      throw error;
    }
  }

  /**
   * Get all placed bets for an event
   */
  async getPlacedBets(eventId: number): Promise<PlacedBet[]> {
    try {
      const url = `${BASE_URL}/get_placed_bets?event_id=${eventId}&key=${API_KEY}`;
      console.log(
        `[Enhanced Casino] Getting placed bets for event: ${eventId}`,
      );

      const response = await fetch(url, {
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`[Enhanced Casino] Error getting placed bets:`, error);
      return [];
    }
  }

  /**
   * Cleanup all connections and intervals
   */
  cleanup() {
    // Stop all polling
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();

    // Close all WebSocket connections
    this.wsConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();

    // Clear subscribers
    this.subscribers.clear();
  }
}

// Export singleton instance
export const enhancedCasinoService = new EnhancedCasinoService();

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    enhancedCasinoService.cleanup();
  });
}
