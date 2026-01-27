/**
 * Custom React Hooks for Sports Betting
 * Hooks for WebSocket connections and betting logic
 */

import { useEffect, useState, useCallback } from "react";
import { enhancedSportsWebSocket } from "@/services/enhancedSportsWebSocket";
import { enhancedPlacedBetsService } from "@/services/enhancedPlacedBetsService";
import type {
  SportsBettingMessage,
  MatchOddsData,
  PlacedBet,
  BetPlacedMessage,
  BetSettledMessage,
} from "@/types/sports-betting";

/**
 * Hook for real-time match odds updates
 */
export function useLiveMatchOdds(
  eventId: number | null,
  sid: number | null,
  options?: {
    markets?: string[];
    includeScore?: boolean;
  },
) {
  const [oddsData, setOddsData] = useState<MatchOddsData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (!eventId || !sid) {
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    const handleMessage = (message: SportsBettingMessage) => {
      if (message.type === "odds_update") {
        setOddsData((prev) => {
          const updated = { ...prev };
          if (message.market_type === "MATCH_ODDS") {
            updated.match_odds = message.data;
          } else if (message.market_type === "BOOKMAKER") {
            updated.bookmaker = message.data;
          } else if (message.market_type === "FANCY") {
            updated.fancy = message.data;
          } else if (message.market_type === "SESSION") {
            updated.session = message.data;
          }
          return updated;
        });
        setLastUpdate(Date.now());
      }
    };

    const unsubscribe = enhancedSportsWebSocket.subscribe(
      eventId,
      sid,
      handleMessage,
      options,
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [eventId, sid, options]);

  return { oddsData, isConnected, lastUpdate };
}

/**
 * Hook for monitoring placed bets for an event
 */
export function usePlacedBetsMonitor(eventId: number | null) {
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (!eventId) {
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    const handleMessage = (message: BetPlacedMessage | BetSettledMessage) => {
      if (message.type === "bet_placed") {
        setPlacedBets((prev) => [...prev, message.bet]);
      } else if (message.type === "bet_settled") {
        setPlacedBets((prev) =>
          prev.map((bet) =>
            bet.bet_id === message.bet_id
              ? {
                  ...bet,
                  status: "SETTLED",
                  result: message.result?.winner ? "WON" : "LOST",
                }
              : bet,
          ),
        );
      }
      setLastUpdate(Date.now());
    };

    const unsubscribe = enhancedPlacedBetsService.subscribeToEvent(
      eventId,
      handleMessage,
    );

    // Load initial placed bets
    enhancedPlacedBetsService.getPlacedBets(eventId).then((response) => {
      if (response.success) {
        setPlacedBets(response.bets);
      }
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [eventId]);

  return { placedBets, isConnected, lastUpdate };
}

/**
 * Hook for placing bets with validation
 */
export function usePlaceBet() {
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = useCallback(
    async (
      eventId: number,
      eventName: string,
      marketId: string | number,
      marketName: string,
      marketType:
        | "MATCH_ODDS"
        | "BOOKMAKER"
        | "FANCY"
        | "SESSION"
        | "TOSS"
        | "OTHER",
      selection: string,
      odds: number,
      betType: "BACK" | "LAY",
      stake: number,
      selectionId?: number,
    ) => {
      setIsPlacing(true);
      setError(null);

      try {
        const result = await enhancedPlacedBetsService.placeBet({
          event_id: eventId,
          event_name: eventName,
          market_id: marketId,
          market_name: marketName,
          market_type: marketType,
          selection,
          selection_id: selectionId,
          stake,
          odds,
          bet_type: betType,
        });

        if (!result.success) {
          setError(result.message || "Failed to place bet");
          return null;
        }

        return result.bet || null;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to place bet";
        setError(message);
        return null;
      } finally {
        setIsPlacing(false);
      }
    },
    [],
  );

  return { placeBet, isPlacing, error };
}

/**
 * Hook for getting bet results
 */
export function useBetResults(eventId: number | null) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(
    async (
      marketId: string | number,
      marketName: string,
      eventName: string,
    ) => {
      if (!eventId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await enhancedPlacedBetsService.getResults({
          event_id: eventId,
          event_name: eventName,
          market_id: marketId,
          market_name: marketName,
        });

        if (!result.success) {
          setError("Failed to fetch results");
          return;
        }

        setResults(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch results";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [eventId],
  );

  return { results, fetchResults, isLoading, error };
}

/**
 * Hook for connection status across all WebSocket services
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState({
    odds: false,
    bets: false,
  });

  // This is a simplified status check - in production you'd want more detailed monitoring
  const checkStatus = useCallback(() => {
    setStatus({
      odds: enhancedSportsWebSocket.getActiveSubscriptions() > 0,
      bets: true, // Simplified
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return status;
}
