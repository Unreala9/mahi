import { useState, useEffect, useCallback, useRef } from "react";
import { diamondWS } from "@/services/websocket";
import { SportId, MatchEvent } from "@/services/diamondApi";

interface UseLiveSportsDataOptions {
  autoConnect?: boolean;
  onError?: (error: any) => void;
}

interface LiveSportsDataState {
  sports: SportId[];
  matches: MatchEvent[];
  liveMatches: MatchEvent[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  lastUpdate: number;
}

/**
 * Custom hook for real-time sports data with WebSocket/polling
 */
export function useLiveSportsData(options: UseLiveSportsDataOptions = {}) {
  const { autoConnect = true, onError } = options;

  const [state, setState] = useState<LiveSportsDataState>({
    sports: [],
    matches: [],
    liveMatches: [],
    isLoading: true,
    isConnected: false,
    error: null,
    lastUpdate: 0,
  });

  const unsubscribeRef = useRef<(() => void)[]>([]);

  // Update state helper
  const updateState = useCallback((updates: Partial<LiveSportsDataState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle sports update
  const handleSportsUpdate = useCallback(
    (sports: SportId[]) => {
      console.log("[useLiveSportsData] Sports updated:", sports.length);
      updateState({ sports, isLoading: false });
    },
    [updateState],
  );

  // Handle matches update
  const handleMatchesUpdate = useCallback(
    (matches: MatchEvent[]) => {
      console.log("[useLiveSportsData] Matches updated:", matches.length);
      const liveMatches = matches.filter((m) => m.is_live);
      updateState({
        matches,
        liveMatches,
        isLoading: false,
        lastUpdate: Date.now(),
      });
    },
    [updateState],
  );

  // Handle live matches update
  const handleLiveMatchesUpdate = useCallback(
    (liveMatches: MatchEvent[]) => {
      console.log(
        "[useLiveSportsData] Live matches updated:",
        liveMatches.length,
      );
      updateState({ liveMatches });
    },
    [updateState],
  );

  // Handle connection status
  const handleConnected = useCallback(() => {
    console.log("[useLiveSportsData] Connected");
    updateState({ isConnected: true, error: null });
  }, [updateState]);

  const handleDisconnected = useCallback(() => {
    console.log("[useLiveSportsData] Disconnected");
    updateState({ isConnected: false });
  }, [updateState]);

  // Handle errors
  const handleError = useCallback(
    (error: any) => {
      console.error("[useLiveSportsData] Error:", error);
      updateState({
        error: error.message || "Connection error",
        isLoading: false,
      });
      onError?.(error);
    },
    [updateState, onError],
  );

  // Connect to WebSocket service
  useEffect(() => {
    if (!autoConnect) return;

    console.log("[useLiveSportsData] Initializing connection...");

    // Get cached data immediately
    const cached = diamondWS.getCachedData();
    if (cached.sports.length > 0 || cached.matches.length > 0) {
      console.log("[useLiveSportsData] Using cached data");
      setState({
        sports: cached.sports,
        matches: cached.matches,
        liveMatches: cached.matches.filter((m) => m.is_live),
        isLoading: false,
        isConnected: false,
        error: null,
        lastUpdate: cached.lastUpdate,
      });
    }

    // Subscribe to events
    const unsubscribers = [
      diamondWS.on("connected", handleConnected),
      diamondWS.on("disconnected", handleDisconnected),
      diamondWS.on("sports:update", handleSportsUpdate),
      diamondWS.on("matches:update", handleMatchesUpdate),
      diamondWS.on("matches:live", handleLiveMatchesUpdate),
      diamondWS.on("error", handleError),
    ];

    unsubscribeRef.current = unsubscribers;

    // Connect to service
    diamondWS.connect();

    // Cleanup
    return () => {
      console.log("[useLiveSportsData] Cleaning up...");
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]); // Only depend on autoConnect

  // Manual refresh
  const refresh = useCallback(() => {
    console.log("[useLiveSportsData] Manual refresh triggered");
    updateState({ isLoading: true, error: null });
    // Don't disconnect, just force a data fetch
    diamondWS.getCachedData(); // This will trigger the polling to refresh
  }, [updateState]);

  return {
    ...state,
    refresh,
  };
}

/**
 * Hook for getting matches by sport ID with live updates
 */
export function useLiveSportMatches(sportId: number | "all") {
  const { matches, liveMatches, isLoading, error, lastUpdate } =
    useLiveSportsData();

  const filteredMatches =
    sportId === "all" ? matches : matches.filter((m) => m.sid === sportId);

  const filteredLiveMatches =
    sportId === "all"
      ? liveMatches
      : liveMatches.filter((m) => m.sid === sportId);

  return {
    matches: filteredMatches,
    liveMatches: filteredLiveMatches,
    isLoading,
    error,
    lastUpdate,
  };
}

/**
 * Hook for getting live match count
 */
export function useLiveMatchCount(sportId?: number) {
  const { liveMatches } = useLiveSportsData();

  if (!sportId) {
    return liveMatches.length;
  }

  return liveMatches.filter((m) => m.sid === sportId).length;
}
