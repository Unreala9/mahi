import { useEffect, useState, useCallback, useRef } from "react";
import {
  diamondWebSocket,
  type WebSocketMessage,
} from "@/services/diamondWebSocket";
import {
  diamondApi,
  type SportId,
  type MatchEvent,
  type OddsData,
  type MatchDetails,
} from "@/services/diamondApi";
import { diamondWS } from "@/services/websocket";

// Hook to get sports via WebSocket with HTTP fallback
export function useWebSocketSports() {
  const [data, setData] = useState<SportId[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === "sports" && mounted) {
        setData(message.data as SportId[]);
        setIsLoading(false);
      }
    };

    // Subscribe to WebSocket
    const unsubscribe = diamondWebSocket.subscribe("sports", handleMessage);

    // Request initial data
    diamondWebSocket.requestSports();

    // Fallback to HTTP if WebSocket doesn't respond in 1 second
    const fallbackTimer = setTimeout(async () => {
      if (mounted && !data) {
        try {
          console.log("[WS Hooks] Using HTTP fallback for sports");
          const httpData = await diamondApi.getAllSportIds();
          if (mounted) {
            setData(httpData);
            setIsLoading(false);
          }
        } catch (err) {
          if (mounted) {
            setError(err as Error);
            setIsLoading(false);
          }
        }
      }
    }, 1000);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    isLoading,
    error,
    isWebSocket: diamondWebSocket.isConnected(),
  };
}

// Hook to get matches by sport via WebSocket with HTTP fallback
export function useWebSocketMatches(sportId: number | null) {
  const [data, setData] = useState<MatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sportIdRef = useRef(sportId);

  useEffect(() => {
    sportIdRef.current = sportId;
  }, [sportId]);

  useEffect(() => {
    if (sportId === null) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const handleMessage = (message: WebSocketMessage) => {
      if (
        message.type === "matches" &&
        mounted &&
        sportIdRef.current === sportId
      ) {
        setData((message.data as MatchEvent[]) || []);
        setIsLoading(false);
      }
    };

    // Subscribe to WebSocket
    const unsubscribe = diamondWebSocket.subscribe("matches", handleMessage);

    // Request matches
    diamondWebSocket.requestMatches(sportId);

    // Fallback to HTTP if WebSocket doesn't respond
    const fallbackTimer = setTimeout(async () => {
      if (mounted && isLoading) {
        try {
          console.log("[WS Hooks] Using HTTP fallback for matches");
          const httpData = await diamondApi.getMatchesBySport(sportId);
          if (mounted) {
            setData(httpData);
            setIsLoading(false);
          }
        } catch (err) {
          if (mounted) {
            setError(err as Error);
            setIsLoading(false);
          }
        }
      }
    }, 1000);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportId]);

  return {
    data,
    isLoading,
    error,
    isWebSocket: diamondWebSocket.isConnected(),
  };
}

// Hook to get match odds via WebSocket with HTTP fallback
export function useWebSocketOdds(gmid: number | null, sid: number | null) {
  const [data, setData] = useState<OddsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const paramsRef = useRef({ gmid, sid });

  useEffect(() => {
    paramsRef.current = { gmid, sid };
  }, [gmid, sid]);

  useEffect(() => {
    if (gmid === null || sid === null) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === "odds" && mounted) {
        const msgData = message.data as { gmid?: number; odds?: OddsData };
        if (msgData?.gmid === paramsRef.current.gmid) {
          setData(msgData.odds || null);
          setIsLoading(false);
        }
      }
    };

    // Subscribe to WebSocket
    const unsubscribe = diamondWebSocket.subscribe("odds", handleMessage);

    // Request odds
    diamondWebSocket.requestOdds(gmid, sid);

    // Fallback to HTTP
    const fallbackTimer = setTimeout(async () => {
      if (mounted && isLoading) {
        try {
          console.log("[WS Hooks] Using HTTP fallback for odds");
          const httpData = await diamondApi.getMatchOdds(gmid, sid);
          if (mounted) {
            setData(httpData);
            setIsLoading(false);
          }
        } catch (err) {
          if (mounted) {
            setError(err as Error);
            setIsLoading(false);
          }
        }
      }
    }, 800);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmid, sid]);

  return {
    data,
    isLoading,
    error,
    isWebSocket: diamondWebSocket.isConnected(),
  };
}

// Hook to get match details via WebSocket with HTTP fallback
export function useWebSocketDetails(gmid: number | null, sid: number | null) {
  const [data, setData] = useState<MatchDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const paramsRef = useRef({ gmid, sid });

  useEffect(() => {
    paramsRef.current = { gmid, sid };
  }, [gmid, sid]);

  useEffect(() => {
    if (gmid === null || sid === null) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === "details" && mounted) {
        const msgData = message.data as
          | (MatchDetails & { gmid?: number })
          | null;
        if (msgData?.gmid === paramsRef.current.gmid) {
          setData(msgData || null);
          setIsLoading(false);
        }
      }
    };

    // Subscribe to WebSocket
    const unsubscribe = diamondWebSocket.subscribe("details", handleMessage);

    // Request details
    diamondWebSocket.requestDetails(gmid, sid);

    // Fallback to HTTP
    const fallbackTimer = setTimeout(async () => {
      if (mounted && isLoading) {
        try {
          console.log("[WS Hooks] Using HTTP fallback for details");
          const httpData = await diamondApi.getMatchDetails(gmid, sid);
          if (mounted) {
            setData(httpData);
            setIsLoading(false);
          }
        } catch (err) {
          if (mounted) {
            setError(err as Error);
            setIsLoading(false);
          }
        }
      }
    }, 800);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gmid, sid]);

  return {
    data,
    isLoading,
    error,
    isWebSocket: diamondWebSocket.isConnected(),
  };
}

// Connection status hook
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = useState(
    diamondWebSocket.isConnected(),
  );

  useEffect(() => {
    const checkConnection = setInterval(() => {
      setIsConnected(diamondWebSocket.isConnected());
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  return { isConnected };
}

/**
 * Hook to get live match odds via polling WebSocket service
 * This uses the intelligent polling service that automatically fetches odds for live matches
 */
export function useLiveMatchOdds(gmid: number | null, sid: number | null) {
  const [data, setData] = useState<OddsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    if (!gmid || !sid) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Check if we have cached odds first
    const cachedOdds = diamondWS.getCachedOdds(gmid);
    if (cachedOdds) {
      setData(cachedOdds);
      setIsLoading(false);
      setLastUpdate(Date.now());
    }

    // Listen for odds updates from the polling service
    const handleOddsUpdate = (updateData: any) => {
      if (mounted && updateData.gmid === gmid) {
        console.log(`[Odds Update] Received for match ${gmid}`, updateData);
        setData(updateData.odds);
        setIsLoading(false);
        setLastUpdate(updateData.timestamp);
        setError(null);
      }
    };

    // Subscribe to odds updates
    const unsubscribe = diamondWS.on("odds:update", handleOddsUpdate);

    // Request odds for this specific match
    diamondWS.requestMatchOdds(gmid, sid);

    // Fallback to HTTP if no update within 3 seconds
    const fallbackTimer = setTimeout(async () => {
      if (mounted && !data) {
        try {
          console.log(`[Odds Fallback] Fetching via HTTP for match ${gmid}`);
          const httpData = await diamondApi.getMatchOdds(gmid, sid);
          if (mounted) {
            setData(httpData);
            setIsLoading(false);
            setLastUpdate(Date.now());
          }
        } catch (err) {
          if (mounted) {
            console.error("[Odds Fallback] Error:", err);
            setError(err as Error);
            setIsLoading(false);
          }
        }
      }
    }, 3000);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [gmid, sid]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    isLive: !!data,
  };
}
