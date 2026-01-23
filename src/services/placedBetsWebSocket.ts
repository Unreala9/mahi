/**
 * Placed Bets WebSocket Service
 * Monitors real-time updates for placed bets across all games
 */

const API_HOST =
  import.meta.env.VITE_DIAMOND_API_HOST || "130.250.191.174:3009";
const HTTP_API_HOST =
  import.meta.env.VITE_DIAMOND_API_HOST || "http://130.250.191.174:3009";
const WS_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "ws";
const API_KEY = import.meta.env.VITE_DIAMOND_API_KEY || "YOUR_SECRET_TOKEN";

// Build WebSocket URL for placed bets
const WS_URL = `${WS_PROTOCOL}://${API_HOST}/ws/placed_bets?key=${API_KEY}`;

export interface PlacedBetData {
  bet_id: string;
  event_id: number;
  event_name: string;
  market_id: number;
  market_name: string;
  market_type: "MATCH_ODDS" | "BOOKMAKER" | "FANCY" | "TOSS" | "OTHER";
  user_id: string;
  username?: string;
  selection: string;
  selection_id?: number;
  stake: number;
  odds: number;
  potential_profit: number;
  bet_type: "BACK" | "LAY";
  status:
    | "PENDING"
    | "MATCHED"
    | "UNMATCHED"
    | "SETTLED"
    | "CANCELLED"
    | "VOID";
  result?: "WON" | "LOST" | "VOID";
  payout?: number;
  placed_at: string;
  settled_at?: string;
  ip_address?: string;
  device?: string;
}

export interface PlacedBetsMessage {
  type:
    | "bet_placed"
    | "bet_updated"
    | "bet_settled"
    | "bet_cancelled"
    | "connection"
    | "error";
  data: PlacedBetData | PlacedBetData[] | { status?: string; message?: string };
  timestamp: number;
  event_id?: number;
}

export type PlacedBetsCallback = (message: PlacedBetsMessage) => void;

class PlacedBetsWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: number | null = null;
  private callbacks = new Map<string, PlacedBetsCallback>();
  private eventSubscriptions = new Set<number>(); // Track which event IDs we're subscribed to
  private allEventsMode = false; // Track if monitoring all events

  constructor() {
    // Auto-connect on instantiation
    this.connect();
  }

  /**
   * Connect to the placed bets WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[PlacedBets WS] Already connected");
      return;
    }

    try {
      console.log("[PlacedBets WS] Connecting to:", WS_URL);
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("[PlacedBets WS] Connected successfully");
        this.reconnectAttempts = 0;
        this.startHeartbeat();

        // Notify all callbacks of connection
        this.broadcast({
          type: "connection",
          data: { status: "connected" },
          timestamp: Date.now(),
        });

        // Re-subscribe to events after reconnection
        if (this.allEventsMode) {
          this.subscribeToAllEvents();
        } else {
          this.eventSubscriptions.forEach((eventId) => {
            this.subscribeToEvent(eventId);
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: PlacedBetsMessage = JSON.parse(event.data);
          console.log("[PlacedBets WS] Message received:", message);
          this.broadcast(message);
        } catch (error) {
          console.error("[PlacedBets WS] Failed to parse message:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[PlacedBets WS] Error:", error);
        this.broadcast({
          type: "error",
          data: { message: "WebSocket error occurred" },
          timestamp: Date.now(),
        });
      };

      this.ws.onclose = () => {
        console.log("[PlacedBets WS] Connection closed");
        this.stopHeartbeat();
        this.handleReconnect();
      };
    } catch (error) {
      console.error("[PlacedBets WS] Connection error:", error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    console.log("[PlacedBets WS] Disconnecting...");
    this.stopHeartbeat();
    this.eventSubscriptions.clear();
    this.allEventsMode = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to placed bets for a specific event
   */
  subscribeToEvent(eventId: number): void {
    this.eventSubscriptions.add(eventId);
    this.allEventsMode = false;

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "subscribe",
          event_id: eventId,
        }),
      );
      console.log(`[PlacedBets WS] Subscribed to event ${eventId}`);
    }
  }

  /**
   * Unsubscribe from a specific event
   */
  unsubscribeFromEvent(eventId: number): void {
    this.eventSubscriptions.delete(eventId);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "unsubscribe",
          event_id: eventId,
        }),
      );
      console.log(`[PlacedBets WS] Unsubscribed from event ${eventId}`);
    }
  }

  /**
   * Subscribe to all placed bets across all events
   */
  subscribeToAllEvents(): void {
    this.allEventsMode = true;
    this.eventSubscriptions.clear();

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "subscribe_all",
        }),
      );
      console.log("[PlacedBets WS] Subscribed to all events");
    }
  }

  /**
   * Add a callback for messages
   */
  addCallback(id: string, callback: PlacedBetsCallback): () => void {
    this.callbacks.set(id, callback);
    return () => this.callbacks.delete(id);
  }

  /**
   * Broadcast message to all callbacks
   */
  private broadcast(message: PlacedBetsMessage): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("[PlacedBets WS] Callback error:", error);
      }
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[PlacedBets WS] Max reconnection attempts reached");
      this.broadcast({
        type: "error",
        data: { message: "Failed to reconnect after maximum attempts" },
        timestamp: Date.now(),
      });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `[PlacedBets WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: "ping" }));
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get current connection status
   */
  getStatus():
    | "CONNECTING"
    | "CONNECTED"
    | "CLOSING"
    | "DISCONNECTED"
    | "UNKNOWN" {
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

/**
 * Fetch placed bets for a specific event (REST API)
 */
export async function getPlacedBets(eventId: number): Promise<PlacedBetData[]> {
  const response = await fetch(
    `${HTTP_API_HOST}/get_placed_bets?event_id=${eventId}&key=${API_KEY}`,
    {
      headers: {
        Accept: "*/*",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch placed bets: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch placed bets for multiple events
 */
export async function getMultipleEventBets(
  eventIds: number[],
): Promise<Map<number, PlacedBetData[]>> {
  const results = await Promise.allSettled(
    eventIds.map(async (eventId) => ({
      eventId,
      bets: await getPlacedBets(eventId),
    })),
  );

  const betsMap = new Map<number, PlacedBetData[]>();

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      betsMap.set(result.value.eventId, result.value.bets);
    }
  });

  return betsMap;
}

/**
 * Fetch all placed bets for current user (if API supports it)
 */
export async function getUserPlacedBets(
  userId?: string,
): Promise<PlacedBetData[]> {
  const url = userId
    ? `${HTTP_API_HOST}/get_placed_bets?user_id=${userId}&key=${API_KEY}`
    : `${HTTP_API_HOST}/get_placed_bets?key=${API_KEY}`;

  const response = await fetch(url, {
    headers: {
      Accept: "*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user bets: ${response.statusText}`);
  }

  return response.json();
}

// Export singleton instance
export const placedBetsWS = new PlacedBetsWebSocketService();
