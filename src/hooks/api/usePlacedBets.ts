import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  placedBetsWS,
  getPlacedBets,
  getMultipleEventBets,
  getUserPlacedBets,
  type PlacedBetData,
  type PlacedBetsMessage,
} from "@/services/placedBetsWebSocket";

/**
 * Hook to subscribe to real-time placed bets for a specific event
 * @param eventId - Event ID to monitor
 * @param enabled - Whether to enable the subscription
 */
export function usePlacedBetsStream(
  eventId: number | null,
  enabled: boolean = true,
) {
  const [bets, setBets] = useState<PlacedBetData[]>([]);
  const [latestBet, setLatestBet] = useState<PlacedBetData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !eventId) return;

    const handleMessage = (message: PlacedBetsMessage) => {
      if (message.event_id && message.event_id !== eventId) return;

      switch (message.type) {
        case "bet_placed": {
          const newBet = message.data as PlacedBetData;
          setLatestBet(newBet);
          setBets((prev) => [newBet, ...prev]);
          setError(null);
          break;
        }

        case "bet_updated": {
          const updatedBet = message.data as PlacedBetData;
          setBets((prev) =>
            prev.map((bet) =>
              bet.bet_id === updatedBet.bet_id ? updatedBet : bet,
            ),
          );
          break;
        }

        case "bet_settled": {
          const settledBet = message.data as PlacedBetData;
          setBets((prev) =>
            prev.map((bet) =>
              bet.bet_id === settledBet.bet_id ? settledBet : bet,
            ),
          );
          break;
        }

        case "bet_cancelled": {
          const cancelledBet = message.data as PlacedBetData;
          setBets((prev) =>
            prev.map((bet) =>
              bet.bet_id === cancelledBet.bet_id ? cancelledBet : bet,
            ),
          );
          break;
        }

        case "error": {
          const errorData = message.data as {
            message?: string;
            status?: string;
          };
          setError(errorData.message || "Unknown error");
          break;
        }
      }
    };

    const unsubscribe = placedBetsWS.addCallback(
      `event-${eventId}`,
      handleMessage,
    );
    placedBetsWS.subscribeToEvent(eventId);

    const checkConnection = setInterval(() => {
      setIsConnected(placedBetsWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      placedBetsWS.unsubscribeFromEvent(eventId);
      clearInterval(checkConnection);
    };
  }, [eventId, enabled]);

  const clearBets = useCallback(() => {
    setBets([]);
    setLatestBet(null);
  }, []);

  return { bets, latestBet, isConnected, error, clearBets };
}

/**
 * Hook to subscribe to all placed bets across all events
 * @param enabled - Whether to enable the subscription
 */
export function useAllPlacedBetsStream(enabled: boolean = true) {
  const [bets, setBets] = useState<PlacedBetData[]>([]);
  const [latestBet, setLatestBet] = useState<PlacedBetData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [betsByEvent, setBetsByEvent] = useState<Map<number, PlacedBetData[]>>(
    new Map(),
  );

  useEffect(() => {
    if (!enabled) return;

    const handleMessage = (message: PlacedBetsMessage) => {
      switch (message.type) {
        case "bet_placed": {
          const newBet = message.data as PlacedBetData;
          setLatestBet(newBet);
          setBets((prev) => [newBet, ...prev].slice(0, 100)); // Keep last 100 bets

          // Update bets by event
          setBetsByEvent((prev) => {
            const eventBets = prev.get(newBet.event_id) || [];
            return new Map(prev).set(newBet.event_id, [newBet, ...eventBets]);
          });
          setError(null);
          break;
        }

        case "bet_updated":
        case "bet_settled":
        case "bet_cancelled": {
          const updatedBet = message.data as PlacedBetData;
          setBets((prev) =>
            prev.map((bet) =>
              bet.bet_id === updatedBet.bet_id ? updatedBet : bet,
            ),
          );

          // Update in event map
          setBetsByEvent((prev) => {
            const eventBets = prev.get(updatedBet.event_id) || [];
            const updated = eventBets.map((bet) =>
              bet.bet_id === updatedBet.bet_id ? updatedBet : bet,
            );
            return new Map(prev).set(updatedBet.event_id, updated);
          });
          break;
        }

        case "error": {
          const errorData = message.data as {
            message?: string;
            status?: string;
          };
          setError(errorData.message || "Unknown error");
          break;
        }
      }
    };

    const unsubscribe = placedBetsWS.addCallback("all-events", handleMessage);
    placedBetsWS.subscribeToAllEvents();

    const checkConnection = setInterval(() => {
      setIsConnected(placedBetsWS.getStatus() === "CONNECTED");
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, [enabled]);

  const clearBets = useCallback(() => {
    setBets([]);
    setLatestBet(null);
    setBetsByEvent(new Map());
  }, []);

  return { bets, latestBet, betsByEvent, isConnected, error, clearBets };
}

/**
 * Hook to fetch placed bets for a specific event (REST API)
 * @param eventId - Event ID
 * @param enabled - Whether to enable the query
 */
export function usePlacedBets(eventId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["placed-bets", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return getPlacedBets(eventId);
    },
    enabled: enabled && !!eventId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
  });
}

/**
 * Hook to fetch placed bets for multiple events
 * @param eventIds - Array of event IDs
 * @param enabled - Whether to enable the query
 */
export function useMultipleEventBets(
  eventIds: number[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["multiple-event-bets", eventIds],
    queryFn: () => getMultipleEventBets(eventIds),
    enabled: enabled && eventIds.length > 0,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Hook to fetch all placed bets for current user
 * @param userId - Optional user ID filter
 * @param enabled - Whether to enable the query
 */
export function useUserPlacedBets(userId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-placed-bets", userId],
    queryFn: () => getUserPlacedBets(userId),
    enabled: enabled,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Hook to manage placed bets WebSocket connection
 */
export function usePlacedBetsConnection() {
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkStatus = setInterval(() => {
      const currentStatus = placedBetsWS.getStatus();
      setStatus(currentStatus);
      setIsConnected(currentStatus === "CONNECTED");
    }, 1000);

    return () => {
      clearInterval(checkStatus);
    };
  }, []);

  const reconnect = useCallback(() => {
    placedBetsWS.disconnect();
    setTimeout(() => placedBetsWS.connect(), 100);
  }, []);

  return { status, isConnected, reconnect };
}
