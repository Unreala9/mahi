// Diamond API WebSocket Service
import { useRef, useEffect } from "react";

// Use environment variables with fallback to proxied relative path
const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const WS_PROTOCOL = import.meta.env.VITE_DIAMOND_WS_PROTOCOL || "ws";
const WS_BASE_URL = `${WS_PROTOCOL}://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

export type WebSocketMessage = {
  type: "sports" | "matches" | "odds" | "details" | "casino";
  data: unknown;
  timestamp: number;
};

export type WebSocketCallback = (message: WebSocketMessage) => void;

class DiamondWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<WebSocketCallback>> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private subscriptions: Set<string> = new Set();
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-connect on instantiation
    this.connect();
  }

  connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    // Build WebSocket URL - handle both direct connection and proxy
    let wsUrl: string;
    if (API_HOST.startsWith("/")) {
      // Relative path for proxy - use current origin
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}${API_HOST}?key=${API_KEY}`;
    } else {
      // Direct connection to API server
      wsUrl = `${WS_BASE_URL}?key=${API_KEY}`;
    }

    try {
      console.log("[Diamond WS] Connecting to:", wsUrl);
      this.ws = new WebSocket(wsUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.warn("[Diamond WS] Connection timeout, closing...");
          this.ws.close();
        }
      }, 2000);

      this.ws.onopen = () => {
        console.log("[Diamond WS] Connected successfully");
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Re-subscribe to all topics
        this.subscriptions.forEach((topic) => {
          this.sendSubscribe(topic);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("[Diamond WS] Message received:", message.type);
          this.notifySubscribers(message.type, message);
        } catch (error) {
          console.error("[Diamond WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[Diamond WS] Error:", error);
      };

      this.ws.onclose = () => {
        console.log("[Diamond WS] Connection closed");
        this.isConnecting = false;
        this.ws = null;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("[Diamond WS] Connection error:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[Diamond WS] Max reconnection attempts reached, giving up",
      );
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    console.log(
      `[Diamond WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private sendSubscribe(topic: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        action: "subscribe",
        topic,
        key: API_KEY,
      };
      console.log("[Diamond WS] Subscribing to:", topic);
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendUnsubscribe(topic: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        action: "unsubscribe",
        topic,
        key: API_KEY,
      };
      console.log("[Diamond WS] Unsubscribing from:", topic);
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(topic: string, callback: WebSocketCallback): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);
    this.subscriptions.add(topic);

    // Send subscribe message
    this.sendSubscribe(topic);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(topic);
          this.subscriptions.delete(topic);
          this.sendUnsubscribe(topic);
        }
      }
    };
  }

  private notifySubscribers(type: string, message: WebSocketMessage) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("[Diamond WS] Subscriber error:", error);
        }
      });
    }
  }

  // Request specific data
  requestSports() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "getSports",
          key: API_KEY,
        }),
      );
    }
  }

  requestMatches(sportId?: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "getMatches",
          sportId,
          key: API_KEY,
        }),
      );
    }
  }

  requestOdds(gmid: number, sid: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "getOdds",
          gmid,
          sid,
          key: API_KEY,
        }),
      );
    }
  }

  requestDetails(gmid: number, sid: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "getDetails",
          gmid,
          sid,
          key: API_KEY,
        }),
      );
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribers.clear();
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const diamondWebSocket = new DiamondWebSocketService();

// Helper hooks for React components
export function useDiamondWebSocket(
  topic: string,
  callback: WebSocketCallback,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = diamondWebSocket.subscribe(topic, (message) => {
      callbackRef.current(message);
    });

    return () => {
      unsubscribe();
    };
  }, [topic]);
}
