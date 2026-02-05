// Casino WebSocket Service for Real-time Game Data
import { CasinoGame } from "@/types/casino";
import { fetchCasinoGameData } from "./casino";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const WS_PROTOCOL = API_PROTOCOL === "https" ? "wss" : "ws";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
    ? `${API_PROTOCOL}://${API_HOST}`
    : `http://${API_HOST}`;
const WS_BASE_URL = API_HOST.startsWith("/")
  ? `${WS_PROTOCOL}://${window.location.host}${API_HOST}`
  : `${WS_PROTOCOL}://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

// Casino game data types
export interface CasinoGameData {
  gmid: string;
  gname: string;
  status: "active" | "inactive" | "suspended";
  odds?: CasinoOdds;
  result?: CasinoResult;
  timer?: number;
  roundId?: string;
  timestamp: number;
  sub?: any[]; // Raw API markets data
}

export interface CasinoOdds {
  gmid: string;
  markets: CasinoMarket[];
}

export interface CasinoMarket {
  mid: string;
  name: string;
  runners: CasinoRunner[];
}

export interface CasinoRunner {
  rid: string;
  name: string;
  odds: number;
  status: "active" | "suspended" | "closed";
}

export interface CasinoResult {
  gmid: string;
  roundId: string;
  winner: string;
  result: string;
  timestamp: number;
}

export type CasinoWebSocketMessage = {
  type: "casino_data" | "casino_odds" | "casino_result" | "casino_status";
  gmid: string;
  data: CasinoGameData | CasinoOdds | CasinoResult;
  timestamp: number;
};

export type CasinoWSCallback = (message: CasinoWebSocketMessage) => void;

class CasinoWebSocketService {
  private connections: Map<string, WebSocket> = new Map();
  private subscribers: Map<string, Set<CasinoWSCallback>> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private pollingTimers: Map<string, NodeJS.Timeout> = new Map();
  private maxReconnectAttempts = 3; // Reduced from 5
  private reconnectDelay = 5000; // Increased from 3000
  private usePolling = true; // Fallback to polling if WebSocket fails
  private maxConnections = 10; // Limit simultaneous connections
  private pollingInterval = 4000; // Increased from 2000ms to 4000ms

  /**
   * Subscribe to real-time updates for a specific casino game
   */
  subscribe(gmid: string, callback: CasinoWSCallback): () => void {
    console.log(`[Casino WS] Subscribing to game: ${gmid}`);

    // Add subscriber
    if (!this.subscribers.has(gmid)) {
      this.subscribers.set(gmid, new Set());
    }
    this.subscribers.get(gmid)!.add(callback);

    // Start connection if not already connected
    this.connect(gmid);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(gmid, callback);
    };
  }

  /**
   * Unsubscribe from updates
   */
  private unsubscribe(gmid: string, callback: CasinoWSCallback) {
    console.log(`[Casino WS] Unsubscribing from game: ${gmid}`);

    const callbacks = this.subscribers.get(gmid);
    if (callbacks) {
      callbacks.delete(callback);

      // If no more subscribers, close connection
      if (callbacks.size === 0) {
        this.disconnect(gmid);
      }
    }
  }

  /**
   * Connect to WebSocket or start polling for a game
   */
  private connect(gmid: string) {
    // Check connection limit
    if (this.connections.size >= this.maxConnections) {
      console.warn(
        `[Casino WS] Connection limit reached (${this.maxConnections}), using polling for ${gmid}`,
      );
      this.startPolling(gmid);
      return;
    }

    // Don't reconnect if already connected
    const ws = this.connections.get(gmid);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log(`[Casino WS] Already connected to ${gmid}`);
      return;
    }

    // Try WebSocket first
    if (!this.usePolling) {
      this.connectWebSocket(gmid);
    } else {
      // Use HTTP polling as fallback
      this.startPolling(gmid);
    }
  }

  /**
   * Connect via WebSocket (if supported by API)
   */
  private connectWebSocket(gmid: string) {
    try {
      const wsUrl = `${WS_BASE_URL}/casino/stream?gmid=${gmid}&key=${API_KEY}`;
      console.log(`[Casino WS] Connecting to: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      this.connections.set(gmid, ws);

      ws.onopen = () => {
        console.log(`[Casino WS] Connected to ${gmid}`);
        this.reconnectAttempts.set(gmid, 0);

        // Send subscribe message
        ws.send(
          JSON.stringify({
            action: "subscribe",
            gmid,
            type: 4, // Casino type
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as CasinoWebSocketMessage;
          console.log(
            `[Casino WS] Message received for ${gmid}:`,
            message.type,
          );
          this.notifySubscribers(gmid, message);
        } catch (error) {
          console.error(
            `[Casino WS] Failed to parse message for ${gmid}:`,
            error,
          );
        }
      };

      ws.onerror = (error) => {
        console.error(`[Casino WS] Error for ${gmid}:`, error);
        // Fallback to polling
        this.usePolling = true;
        this.disconnect(gmid);
        this.startPolling(gmid);
      };

      ws.onclose = () => {
        console.log(`[Casino WS] Connection closed for ${gmid}`);
        this.connections.delete(gmid);

        // Attempt reconnection if there are still subscribers
        const attempts = this.reconnectAttempts.get(gmid) || 0;
        if (
          this.subscribers.get(gmid)?.size &&
          attempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect(gmid);
        }
      };
    } catch (error) {
      console.error(
        `[Casino WS] Failed to create WebSocket for ${gmid}:`,
        error,
      );
      // Fallback to polling
      this.startPolling(gmid);
    }
  }

  /**
   * Start HTTP polling for a game (fallback method)
   */
  private startPolling(gmid: string) {
    // Don't start if already polling
    if (this.pollingTimers.has(gmid)) {
      return;
    }

    console.log(`[Casino WS] Starting HTTP polling for ${gmid}`);

    console.log(`[Casino WS] Starting HTTP polling for ${gmid}`);

    const poll = async () => {
      try {
        // Fetch actual casino data from API
        // Use the centralized service which handles mapping and keys
        const data = await fetchCasinoGameData(gmid);

        if (!data || !data.data) {
          return;
        }

        const apiData = data.data;

        // Send main game data
        const dataMessage: CasinoWebSocketMessage = {
          type: "casino_data",
          gmid,
          data: {
            gmid,
            gname: apiData.gtype || gmid, // The API returns gtype which might be the name or ID
            status: "active", // Default to active if data is present
            timer:
              apiData.lt && apiData.ft
                ? Math.max(0, Math.floor(apiData.ft - apiData.lt))
                : 0, // Calculate remaining time
            roundId: apiData.mid?.toString(),
            timestamp: Date.now(),
            // Pass through the raw sub array so the UI component (which expects 'sub') can render markets immediately
            sub: apiData.sub,
          },
          timestamp: Date.now(),
        };

        this.notifySubscribers(gmid, dataMessage);

        // Map API markets (sub) to internal structure
        // API returns "sub": [{ "sid": 1, "nat": "Dragon", "b": 2, ... }]
        if (apiData.sub && Array.isArray(apiData.sub)) {
          const markets: CasinoMarket[] = [];

          // Group runners into a main market since API returns flat list of runners
          // We'll create a single "Match Odds" market for simplicity or group by subtype if needed
          const mainRunners: CasinoRunner[] = apiData.sub.map(
            (runner: any) => ({
              rid: runner.sid?.toString() || runner.nat,
              name: runner.nat,
              odds: runner.b, // Back odds
              status: runner.gstatus === "SUSPENDED" ? "suspended" : "active",
            }),
          );

          markets.push({
            mid: "main",
            name: "Main Bets",
            runners: mainRunners,
          });

          const oddsMessage: CasinoWebSocketMessage = {
            type: "casino_odds",
            gmid,
            data: {
              gmid,
              markets,
            },
            timestamp: Date.now(),
          };

          this.notifySubscribers(gmid, oddsMessage);
        }
      } catch (error) {
        console.error(`[Casino WS] Polling error for ${gmid}:`, error);
      }
    };

    // Poll immediately and then at interval
    poll();
    const timer = setInterval(poll, this.pollingInterval);
    this.pollingTimers.set(gmid, timer);
  }

  /**
   * Stop HTTP polling
   */
  private stopPolling(gmid: string) {
    const timer = this.pollingTimers.get(gmid);
    if (timer) {
      clearInterval(timer);
      this.pollingTimers.delete(gmid);
      console.log(`[Casino WS] Stopped polling for ${gmid}`);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(gmid: string) {
    const attempts = (this.reconnectAttempts.get(gmid) || 0) + 1;
    this.reconnectAttempts.set(gmid, attempts);

    console.log(
      `[Casino WS] Scheduling reconnect for ${gmid} (attempt ${attempts}/${this.maxReconnectAttempts})`,
    );

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(gmid);
      this.connect(gmid);
    }, this.reconnectDelay * attempts);

    this.reconnectTimers.set(gmid, timer);
  }

  /**
   * Notify all subscribers for a game
   */
  private notifySubscribers(gmid: string, message: CasinoWebSocketMessage) {
    const callbacks = this.subscribers.get(gmid);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error(
            `[Casino WS] Subscriber callback error for ${gmid}:`,
            error,
          );
        }
      });
    }
  }

  /**
   * Disconnect from a game
   */
  private disconnect(gmid: string) {
    console.log(`[Casino WS] Disconnecting from ${gmid}`);

    // Close WebSocket
    const ws = this.connections.get(gmid);
    if (ws) {
      ws.close();
      this.connections.delete(gmid);
    }

    // Stop polling
    this.stopPolling(gmid);

    // Clear reconnect timer
    const timer = this.reconnectTimers.get(gmid);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(gmid);
    }

    // Clear subscribers
    this.subscribers.delete(gmid);
    this.reconnectAttempts.delete(gmid);
  }

  /**
   * Disconnect all connections
   */
  disconnectAll() {
    console.log(`[Casino WS] Disconnecting all connections`);
    Array.from(this.connections.keys()).forEach((gmid) => {
      this.disconnect(gmid);
    });
  }

  /**
   * Get connection status for a game
   */
  getStatus(
    gmid: string,
  ): "connected" | "connecting" | "polling" | "disconnected" {
    const ws = this.connections.get(gmid);
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) return "connected";
      if (ws.readyState === WebSocket.CONNECTING) return "connecting";
    }

    if (this.pollingTimers.has(gmid)) {
      return "polling";
    }

    return "disconnected";
  }
}

// Export singleton instance
export const casinoWebSocket = new CasinoWebSocketService();

// Export hook for React components
export function useCasinoWebSocket(gmid: string | null) {
  const [data, setData] = React.useState<CasinoGameData | null>(null);
  const [status, setStatus] = React.useState<
    "connected" | "connecting" | "polling" | "disconnected"
  >("disconnected");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!gmid) {
      setData(null);
      setStatus("disconnected");
      return;
    }

    const handleMessage = (message: CasinoWebSocketMessage) => {
      if (message.type === "casino_data") {
        setData(message.data as CasinoGameData);
        setError(null);
      }
    };

    // Subscribe to updates
    const unsubscribe = casinoWebSocket.subscribe(gmid, handleMessage);

    // Update status
    const statusInterval = setInterval(() => {
      setStatus(casinoWebSocket.getStatus(gmid));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, [gmid]);

  return { data, status, error };
}

// Need React import for the hook
import React from "react";
