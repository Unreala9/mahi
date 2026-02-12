/**
 * Real-Time Casino Service with Three WebSocket Connections
 * - Data/Odds WebSocket
 * - Results WebSocket
 * - Score WebSocket
 */

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
const WS_PROTOCOL = API_PROTOCOL === "https" ? "wss" : "ws";
const BASE_URL = `${API_PROTOCOL}://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

export interface CasinoLiveData {
  mid: string;
  gmid: string;
  gname: string;
  gstatus: string;
  autotime: number;
  t1: CasinoRunner[];
  C1?: unknown[];
  result?: string;
  lastresult?: unknown[];
  timestamp: number;
}

export interface CasinoRunner {
  sid: number;
  nation: string;
  nat: string;
  gstatus: string;
  b1?: OddsItem[];
  l1?: OddsItem[];
  [key: string]: unknown;
}

export interface OddsItem {
  rate?: number;
  odds?: number;
  price?: number;
  size?: number;
  [key: string]: unknown;
}

export interface CasinoResult {
  mid: string;
  result: string;
  winner?: string;
  desc?: string;
  cards?: unknown[];
  timestamp: number;
}

export interface CasinoDetailedResult {
  mid: string;
  result: string;
  details: unknown;
  timestamp: number;
}

class CasinoRealTimeService {
  // WebSocket connections
  private dataWS: Map<string, WebSocket | null> = new Map();
  private resultsWS: Map<string, WebSocket | null> = new Map();
  private scoreWS: Map<string, WebSocket | null> = new Map();

  // Polling intervals (fallback when WebSocket unavailable)
  private dataPolling: Map<string, NodeJS.Timeout> = new Map();
  private resultsPolling: Map<string, NodeJS.Timeout> = new Map();

  // Subscribers
  private dataSubscribers: Map<string, Set<(data: CasinoLiveData) => void>> =
    new Map();
  private resultsSubscribers: Map<string, Set<(result: CasinoResult) => void>> =
    new Map();
  private detailedResultsSubscribers: Map<
    string,
    Set<(result: CasinoDetailedResult) => void>
  > = new Map();

  /**
   * Subscribe to live casino data/odds updates
   */
  subscribeToData(
    gameType: string,
    callback: (data: CasinoLiveData) => void,
  ): () => void {
    console.log(`[Casino RT] Subscribing to data for: ${gameType}`);

    if (!this.dataSubscribers.has(gameType)) {
      this.dataSubscribers.set(gameType, new Set());
    }
    this.dataSubscribers.get(gameType)!.add(callback);

    // Start data polling (WebSocket can be added later if API supports it)
    this.startDataPolling(gameType);

    return () => {
      this.unsubscribeFromData(gameType, callback);
    };
  }

  /**
   * Subscribe to casino results updates
   */
  subscribeToResults(
    gameType: string,
    callback: (result: CasinoResult) => void,
  ): () => void {
    console.log(`[Casino RT] Subscribing to results for: ${gameType}`);

    if (!this.resultsSubscribers.has(gameType)) {
      this.resultsSubscribers.set(gameType, new Set());
    }
    this.resultsSubscribers.get(gameType)!.add(callback);

    this.startResultsPolling(gameType);

    return () => {
      this.unsubscribeFromResults(gameType, callback);
    };
  }

  /**
   * Subscribe to detailed results
   */
  subscribeToDetailedResults(
    gameType: string,
    mid: string,
    callback: (result: CasinoDetailedResult) => void,
  ): () => void {
    const key = `${gameType}_${mid}`;
    console.log(`[Casino RT] Subscribing to detailed results for: ${key}`);

    if (!this.detailedResultsSubscribers.has(key)) {
      this.detailedResultsSubscribers.set(key, new Set());
    }
    this.detailedResultsSubscribers.get(key)!.add(callback);

    return () => {
      this.unsubscribeFromDetailedResults(key, callback);
    };
  }

  /**
   * Unsubscribe from data updates
   */
  private unsubscribeFromData(
    gameType: string,
    callback: (data: CasinoLiveData) => void,
  ) {
    const callbacks = this.dataSubscribers.get(gameType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopDataPolling(gameType);
      }
    }
  }

  /**
   * Unsubscribe from results updates
   */
  private unsubscribeFromResults(
    gameType: string,
    callback: (result: CasinoResult) => void,
  ) {
    const callbacks = this.resultsSubscribers.get(gameType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.stopResultsPolling(gameType);
      }
    }
  }

  /**
   * Unsubscribe from detailed results
   */
  private unsubscribeFromDetailedResults(
    key: string,
    callback: (result: CasinoDetailedResult) => void,
  ) {
    const callbacks = this.detailedResultsSubscribers.get(key);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Start polling for casino data/odds
   */
  private startDataPolling(gameType: string) {
    if (this.dataPolling.has(gameType)) return;

    const poll = async () => {
      try {
        const url = `${BASE_URL}/casino/data?type=${gameType}&key=${API_KEY}`;
        const response = await fetch(url, {
          headers: { Accept: "*/*" },
        });

        if (!response.ok) {
          console.warn(
            `[Casino RT] Data fetch failed for ${gameType}:`,
            response.status,
          );
          return;
        }

        const result = await response.json();

        if (result.data) {
          const liveData: CasinoLiveData = {
            ...result.data,
            timestamp: Date.now(),
          };
          this.notifyDataSubscribers(gameType, liveData);
        }
      } catch (error) {
        console.error(`[Casino RT] Error polling data for ${gameType}:`, error);
      }
    };

    // Initial fetch
    poll();

    // Poll every 1.5 seconds for real-time feel
    const interval = setInterval(poll, 1500);
    this.dataPolling.set(gameType, interval);
  }

  /**
   * Stop data polling
   */
  private stopDataPolling(gameType: string) {
    const interval = this.dataPolling.get(gameType);
    if (interval) {
      clearInterval(interval);
      this.dataPolling.delete(gameType);
    }
  }

  /**
   * Start polling for results
   */
  private startResultsPolling(gameType: string) {
    if (this.resultsPolling.has(gameType)) return;

    const poll = async () => {
      try {
        const url = `${BASE_URL}/casino/result?type=${gameType}&key=${API_KEY}`;
        const response = await fetch(url, {
          headers: { Accept: "*/*" },
        });

        if (!response.ok) {
          console.warn(
            `[Casino RT] Results fetch failed for ${gameType}:`,
            response.status,
          );
          return;
        }

        const result = await response.json();

        if (result.data) {
          const casinoResult: CasinoResult = {
            ...result.data,
            timestamp: Date.now(),
          };
          this.notifyResultsSubscribers(gameType, casinoResult);
        }
      } catch (error) {
        console.error(
          `[Casino RT] Error polling results for ${gameType}:`,
          error,
        );
      }
    };

    // Initial fetch
    poll();

    // Poll every 3 seconds for results
    const interval = setInterval(poll, 3000);
    this.resultsPolling.set(gameType, interval);
  }

  /**
   * Stop results polling
   */
  private stopResultsPolling(gameType: string) {
    const interval = this.resultsPolling.get(gameType);
    if (interval) {
      clearInterval(interval);
      this.resultsPolling.delete(gameType);
    }
  }

  /**
   * Fetch detailed results (one-time fetch)
   */
  async fetchDetailedResults(
    gameType: string,
    mid: string,
  ): Promise<CasinoDetailedResult | null> {
    try {
      const url = `${BASE_URL}/casino/detail_result?type=${gameType}&mid=${mid}&key=${API_KEY}`;
      const response = await fetch(url, {
        headers: { Accept: "*/*" },
      });

      if (!response.ok) {
        console.warn(
          `[Casino RT] Detailed results fetch failed:`,
          response.status,
        );
        return null;
      }

      const result = await response.json();

      if (result.data) {
        return {
          mid,
          result: result.data.result || "",
          details: result.data,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error(`[Casino RT] Error fetching detailed results:`, error);
      return null;
    }
  }

  /**
   * Notify data subscribers
   */
  private notifyDataSubscribers(gameType: string, data: CasinoLiveData) {
    const callbacks = this.dataSubscribers.get(gameType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Casino RT] Error in data callback:`, error);
        }
      });
    }
  }

  /**
   * Notify results subscribers
   */
  private notifyResultsSubscribers(gameType: string, result: CasinoResult) {
    const callbacks = this.resultsSubscribers.get(gameType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(result);
        } catch (error) {
          console.error(`[Casino RT] Error in results callback:`, error);
        }
      });
    }
  }

  /**
   * Cleanup all connections and intervals
   */
  cleanup() {
    // Stop all polling
    this.dataPolling.forEach((interval) => clearInterval(interval));
    this.dataPolling.clear();

    this.resultsPolling.forEach((interval) => clearInterval(interval));
    this.resultsPolling.clear();

    // Close all WebSocket connections
    this.dataWS.forEach((ws) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.dataWS.clear();

    this.resultsWS.forEach((ws) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.resultsWS.clear();

    this.scoreWS.forEach((ws) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.scoreWS.clear();

    // Clear subscribers
    this.dataSubscribers.clear();
    this.resultsSubscribers.clear();
    this.detailedResultsSubscribers.clear();
  }
}

// Export singleton instance
export const casinoRealTimeService = new CasinoRealTimeService();

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    casinoRealTimeService.cleanup();
  });
}
