import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bettingWS,
  type BettingMessage,
  type BettingMarketType,
  type PlacedBet,
  type OddsUpdate,
  getBettingResult,
  getBettingResults,
  getEventResults,
  type BettingResultRequest,
  type BettingResult,
} from "@/services/bettingWebSocket";

/**
 * Hook to subscribe to real-time odds updates for a specific market
 * @param marketId - Market ID to subscribe to
 * @param enabled - Whether to enable the subscription
 */
export function useBettingMarket(
  marketId: number | null,
  enabled: boolean = true,
) {
  const [oddsData, setOddsData] = useState<OddsUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !marketId) return;

    const handleMessage = (message: BettingMessage) => {
      if (message.type === "odds_update") {
        setOddsData(message.data as OddsUpdate);
        setError(null);
      } else if (message.type === "error") {
        const errorData = message.data as { message?: string; status?: string };
        setError(errorData.message || "Unknown error");
      }
    };

    const unsubscribe = bettingWS.subscribeToMarket(marketId, handleMessage);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(bettingWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [marketId, enabled]);

  return { oddsData, isConnected, error };
}

/**
 * Hook to subscribe to all odds updates for a specific event (match)
 * @param eventId - Event ID (gmid) to subscribe to
 * @param enabled - Whether to enable the subscription
 */
export function useBettingEvent(
  eventId: number | null,
  enabled: boolean = true,
) {
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !eventId) return;

    const handleMessage = (message: BettingMessage) => {
      if (message.type === "odds_update") {
        setOddsUpdates((prev) => {
          const update = message.data as OddsUpdate;
          // Replace existing update for this market or add new one
          const filtered = prev.filter((o) => o.market_id !== update.market_id);
          return [...filtered, update];
        });
        setError(null);
      } else if (message.type === "error") {
        const errorData = message.data as { message?: string; status?: string };
        setError(errorData.message || "Unknown error");
      }
    };

    const unsubscribe = bettingWS.subscribeToEvent(eventId, handleMessage);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(bettingWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [eventId, enabled]);

  return { oddsUpdates, isConnected, error };
}

/**
 * Hook to subscribe to specific market type updates (MATCH_ODDS, BOOKMAKER, FANCY)
 * @param marketType - Type of market to subscribe to
 * @param enabled - Whether to enable the subscription
 */
export function useBettingMarketType(
  marketType: BettingMarketType,
  enabled: boolean = true,
) {
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleMessage = (message: BettingMessage) => {
      if (message.type === "odds_update") {
        const update = message.data as OddsUpdate;
        if (update.market_type === marketType || marketType === "ALL") {
          setOddsUpdates((prev) => {
            const filtered = prev.filter(
              (o) => o.market_id !== update.market_id,
            );
            return [...filtered, update].slice(-50); // Keep last 50 updates
          });
          setError(null);
        }
      } else if (message.type === "error") {
        const errorData = message.data as { message?: string; status?: string };
        setError(errorData.message || "Unknown error");
      }
    };

    const unsubscribe = bettingWS.subscribeToMarketType(
      marketType,
      handleMessage,
    );

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(bettingWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [marketType, enabled]);

  return { oddsUpdates, isConnected, error };
}

/**
 * Hook to place bets and track placed bets
 * @param eventId - Event ID
 */
export function usePlacedBets(eventId: number | null) {
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const handleMessage = (message: BettingMessage) => {
      if (message.type === "bet_placed") {
        const bet = message.data as PlacedBet;
        if (bet.event_id === eventId) {
          setPlacedBets((prev) => [bet, ...prev]);
          setIsPlacing(false);
          setError(null);
        }
      } else if (message.type === "bet_matched") {
        // Update bet status when matched
        const bet = message.data as PlacedBet;
        setPlacedBets((prev) =>
          prev.map((b) =>
            b.market_id === bet.market_id && b.timestamp === bet.timestamp
              ? { ...b, ...bet }
              : b,
          ),
        );
      } else if (message.type === "error") {
        const errorData = message.data as { message?: string; status?: string };
        setError(errorData.message || "Failed to place bet");
        setIsPlacing(false);
      }
    };

    const unsubscribe = bettingWS.subscribeToEvent(eventId, handleMessage);

    // Request placed bets on mount
    bettingWS.getPlacedBets(eventId);

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(bettingWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [eventId]);

  const placeBet = useCallback(
    (bet: PlacedBet) => {
      if (!eventId) {
        setError("Event ID is required");
        return;
      }

      setIsPlacing(true);
      setError(null);
      bettingWS.placeBet({ ...bet, event_id: eventId });
    },
    [eventId],
  );

  const refreshBets = useCallback(() => {
    if (eventId) {
      bettingWS.getPlacedBets(eventId);
    }
  }, [eventId]);

  return {
    placedBets,
    placeBet,
    refreshBets,
    isPlacing,
    isConnected,
    error,
  };
}

/**
 * Hook to get betting websocket connection status
 */
export function useBettingConnection() {
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkStatus = setInterval(() => {
      const currentStatus = bettingWS.getStatus();
      setStatus(currentStatus);
      setIsConnected(currentStatus === "CONNECTED");
    }, 1000);

    // Connect on mount
    bettingWS.connect();

    return () => {
      clearInterval(checkStatus);
    };
  }, []);

  const reconnect = useCallback(() => {
    bettingWS.disconnect();
    setTimeout(() => bettingWS.connect(), 100);
  }, []);

  return { status, isConnected, reconnect };
}

/**
 * Hook to fetch betting result for a specific market
 * @param request - Event and market IDs
 * @param enabled - Whether to enable the query
 */
export function useBettingResult(
  request: BettingResultRequest | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["betting-result", request?.event_id, request?.market_id],
    queryFn: () => {
      if (!request) throw new Error("Request is required");
      return getBettingResult(request);
    },
    enabled: enabled && !!request,
    staleTime: 60000, // Results don't change once declared
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch betting results for multiple markets
 * @param requests - Array of event/market ID pairs
 * @param enabled - Whether to enable the query
 */
export function useBettingResults(
  requests: BettingResultRequest[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["betting-results", requests],
    queryFn: () => getBettingResults(requests),
    enabled: enabled && requests.length > 0,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch all betting results for an event
 * @param eventId - The event ID
 * @param enabled - Whether to enable the query
 */
export function useEventResults(
  eventId: number | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["event-results", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return getEventResults(eventId);
    },
    enabled: enabled && !!eventId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch betting result with automatic polling for pending results
 * @param request - Event and market IDs
 * @param enabled - Whether to enable the query
 */
export function useBettingResultPolling(
  request: BettingResultRequest | null,
  enabled: boolean = true,
) {
  const [isPending, setIsPending] = useState(true);

  const query = useQuery({
    queryKey: ["betting-result-polling", request?.event_id, request?.market_id],
    queryFn: () => {
      if (!request) throw new Error("Request is required");
      return getBettingResult(request);
    },
    enabled: enabled && !!request && isPending,
    refetchInterval: (query) => {
      // Stop polling if result is declared
      const data = query.state.data;
      if (
        data?.result_status === "DECLARED" ||
        data?.result_status === "CANCELLED" ||
        data?.result_status === "VOIDED"
      ) {
        setIsPending(false);
        return false;
      }
      // Poll every 10 seconds for pending results
      return 10000;
    },
    staleTime: 5000,
  });

  return {
    ...query,
    isPending: query.data?.result_status === "PENDING",
  };
}
