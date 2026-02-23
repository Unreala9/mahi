/**
 * Betting WebSocket Service
 * Manages real-time odds and betting data for sports markets
 */

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const HTTP_API_HOST = import.meta.env.VITE_DIAMOND_API_HOST?.startsWith("/")
  ? `${window.location.origin}${import.meta.env.VITE_DIAMOND_API_HOST}`
  : import.meta.env.VITE_DIAMOND_API_HOST ||
    `${window.location.origin}/api/diamond`;
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "ws";
const API_KEY = import.meta.env.VITE_DIAMOND_API_KEY;

// Build WebSocket URL
const WS_URL = `${API_PROTOCOL}://${API_HOST}/ws?key=${API_KEY}`;

export type BettingMarketType = "MATCH_ODDS" | "BOOKMAKER" | "FANCY" | "ALL";

export interface PlacedBet {
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
  market_type: BettingMarketType;
  stake?: number;
  odds?: number;
  selection?: string;
  bet_type?: "BACK" | "LAY";
  user_id?: string;
  timestamp?: string;
}

export interface OddsUpdate {
  market_id: number;
  market_type: BettingMarketType;
  runners: Array<{
    selection_id: number;
    selection_name: string;
    back: Array<{ price: number; size: number }>;
    lay: Array<{ price: number; size: number }>;
    status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  }>;
  timestamp: string;
}

export interface BettingMessage {
  type:
    | "odds_update"
    | "bet_placed"
    | "bet_matched"
    | "market_status"
    | "error";
  data: OddsUpdate | PlacedBet | { message?: string; status?: string };
  timestamp: number;
}

export type BettingCallback = (message: BettingMessage) => void;

class BettingWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<BettingCallback>> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private subscriptions: Set<string> = new Set();
  private connectionTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log("[Betting WS] Service initialized");
  }

  connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;
    console.log("[Betting WS] Connecting to:", WS_URL);

    try {
      this.ws = new WebSocket(WS_URL);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.warn("[Betting WS] Connection timeout");
          this.ws.close();
        }
      }, 5000);

      this.ws.onopen = () => {
        console.log("[Betting WS] Connected successfully");
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Start heartbeat
        this.startHeartbeat();

        // Re-subscribe to all topics
        this.subscriptions.forEach((topic) => {
          this.sendSubscribe(topic);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: BettingMessage = JSON.parse(event.data);
          console.log("[Betting WS] Message received:", message.type);
          this.notifySubscribers(message.type, message);
        } catch (error) {
          console.error("[Betting WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[Betting WS] Error:", error);
      };

      this.ws.onclose = () => {
        console.log("[Betting WS] Connection closed");
        this.isConnecting = false;
        this.stopHeartbeat();

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay =
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
          console.log(`[Betting WS] Reconnecting in ${delay}ms...`);
          this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, delay);
        } else {
          console.error("[Betting WS] Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("[Betting WS] Failed to create WebSocket:", error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

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

    this.subscriptions.clear();
    console.log("[Betting WS] Disconnected");
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(data: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("[Betting WS] Cannot send, not connected");
    }
  }

  private sendSubscribe(topic: string) {
    this.send({
      type: "subscribe",
      topic,
    });
  }

  private sendUnsubscribe(topic: string) {
    this.send({
      type: "unsubscribe",
      topic,
    });
  }

  /**
   * Subscribe to odds updates for a specific market
   * @param marketId - Market ID to subscribe to
   * @param callback - Callback function for updates
   */
  subscribeToMarket(marketId: number, callback: BettingCallback) {
    const topic = `market:${marketId}`;
    this.subscriptions.add(topic);

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscribe(topic);
    } else {
      this.connect();
    }

    return () => this.unsubscribeFromMarket(marketId, callback);
  }

  /**
   * Unsubscribe from market updates
   */
  unsubscribeFromMarket(marketId: number, callback: BettingCallback) {
    const topic = `market:${marketId}`;
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(topic);
        this.subscriptions.delete(topic);
        this.sendUnsubscribe(topic);
      }
    }
  }

  /**
   * Subscribe to all odds updates for a specific event
   * @param eventId - Event ID (match ID)
   * @param callback - Callback function for updates
   */
  subscribeToEvent(eventId: number, callback: BettingCallback) {
    const topic = `event:${eventId}`;
    this.subscriptions.add(topic);

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscribe(topic);
    } else {
      this.connect();
    }

    return () => this.unsubscribeFromEvent(eventId, callback);
  }

  /**
   * Unsubscribe from event updates
   */
  unsubscribeFromEvent(eventId: number, callback: BettingCallback) {
    const topic = `event:${eventId}`;
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(topic);
        this.subscriptions.delete(topic);
        this.sendUnsubscribe(topic);
      }
    }
  }

  /**
   * Subscribe to specific market type updates (MATCH_ODDS, BOOKMAKER, FANCY)
   * @param marketType - Type of market
   * @param callback - Callback function for updates
   */
  subscribeToMarketType(
    marketType: BettingMarketType,
    callback: BettingCallback,
  ) {
    const topic = `type:${marketType}`;
    this.subscriptions.add(topic);

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscribe(topic);
    } else {
      this.connect();
    }

    return () => this.unsubscribeFromMarketType(marketType, callback);
  }

  /**
   * Unsubscribe from market type updates
   */
  unsubscribeFromMarketType(
    marketType: BettingMarketType,
    callback: BettingCallback,
  ) {
    const topic = `type:${marketType}`;
    const callbacks = this.subscribers.get(topic);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(topic);
        this.subscriptions.delete(topic);
        this.sendUnsubscribe(topic);
      }
    }
  }

  /**
   * Place a bet via WebSocket
   * @param bet - Bet details
   */
  placeBet(bet: PlacedBet) {
    this.send({
      type: "place_bet",
      data: bet,
    });
  }

  /**
   * Get placed bets for a specific event
   * @param eventId - Event ID
   * @param marketType - Optional market type filter
   */
  getPlacedBets(eventId: number, marketType?: BettingMarketType) {
    this.send({
      type: "get_placed_bets",
      data: {
        event_id: eventId,
        market_type: marketType,
      },
    });
  }

  private notifySubscribers(type: string, message: BettingMessage) {
    // Notify specific topic subscribers
    this.subscribers.forEach((callbacks, topic) => {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("[Betting WS] Callback error:", error);
        }
      });
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    if (!this.ws) return "DISCONNECTED";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "CONNECTED";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "DISCONNECTED";
      default:
        return "UNKNOWN";
    }
  }
}

// Betting Results Types
export interface BettingResultRequest {
  event_id: number;
  market_id: number;
}

export interface BettingResult {
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
  market_type: BettingMarketType;
  result_status: "DECLARED" | "PENDING" | "CANCELLED" | "VOIDED";
  winning_selection?: {
    selection_id: number;
    selection_name: string;
  };
  declared_at?: string;
  settled_at?: string;
  bets: Array<{
    bet_id: string;
    user_id: string;
    selection: string;
    stake: number;
    odds: number;
    bet_type: "BACK" | "LAY";
    result: "WON" | "LOST" | "VOID" | "CANCELLED";
    payout?: number;
  }>;
}

/**
 * Fetch betting result for a specific market
 * @param request Event and market IDs
 * @returns Betting result data
 */
export async function getBettingResult(
  request: BettingResultRequest,
): Promise<BettingResult> {
  const response = await fetch(`${HTTP_API_HOST}/get-result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch betting result: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch betting results for multiple markets
 * @param requests Array of event/market ID pairs
 * @returns Array of betting results
 */
export async function getBettingResults(
  requests: BettingResultRequest[],
): Promise<BettingResult[]> {
  const results = await Promise.allSettled(
    requests.map((req) => getBettingResult(req)),
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<BettingResult> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
}

/**
 * Fetch all betting results for an event
 * @param eventId The event ID
 * @returns Array of betting results for all markets
 */
export async function getEventResults(
  eventId: number,
): Promise<BettingResult[]> {
  // Note: This assumes you have a way to get market IDs for an event
  // You may need to adjust this based on your API structure
  const response = await fetch(
    `${HTTP_API_HOST}/get-result?event_id=${eventId}`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch event results: ${response.statusText}`);
  }

  return response.json();
}

// Export singleton instance
export const bettingWS = new BettingWebSocketService();
