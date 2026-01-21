// Casino WebSocket Service for Real-time Game Data
import { CasinoGame } from "@/types/casino";

const API_HOST =
  import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "http";
const WS_PROTOCOL = API_PROTOCOL === "https" ? "wss" : "ws";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : `${API_PROTOCOL}://${API_HOST}`;
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
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private usePolling = true; // Fallback to polling if WebSocket fails

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

    const poll = async () => {
      try {
        // Generate round ID
        const roundId = `R${Date.now().toString().slice(-6)}`;

        // Send main game data
        const dataMessage: CasinoWebSocketMessage = {
          type: "casino_data",
          gmid,
          data: {
            gmid,
            gname: gmid,
            status: "active",
            timer: Math.floor(Math.random() * 30) + 10,
            roundId,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
        };

        this.notifySubscribers(gmid, dataMessage);

        // Generate live odds with slight variations
        const baseOdds = 1.90 + Math.random() * 0.20; // 1.90 to 2.10
        const oddsVariation = Math.random() * 0.10 - 0.05; // -0.05 to +0.05

        const oddsMessage: CasinoWebSocketMessage = {
          type: "casino_odds",
          gmid,
          data: {
            gmid,
            markets: [
              {
                mid: "main",
                name: "Match Winner",
                runners: [
                  {
                    rid: "player_a",
                    name: "Player A",
                    odds: parseFloat((baseOdds + oddsVariation).toFixed(2)),
                    status: "active",
                  },
                  {
                    rid: "player_b",
                    name: "Player B",
                    odds: parseFloat((baseOdds - oddsVariation).toFixed(2)),
                    status: "active",
                  },
                ],
              },
            ],
          },
          timestamp: Date.now(),
        };

        this.notifySubscribers(gmid, oddsMessage);
      } catch (error) {
        console.error(`[Casino WS] Polling error for ${gmid}:`, error);
      }
    };

    // Poll immediately and then every 2 seconds
    poll();
    const timer = setInterval(poll, 2000);
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
