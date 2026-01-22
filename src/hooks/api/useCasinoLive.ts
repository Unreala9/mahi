import { useState, useEffect, useCallback } from "react";
import {
  casinoWebSocket,
  CasinoGameData,
  CasinoWebSocketMessage,
  CasinoOdds,
  CasinoResult,
} from "@/services/casinoWebSocket";

/**
 * Hook to get live data for a single casino game
 */
export function useCasinoLive(gmid: string | null) {
  const [data, setData] = useState<CasinoGameData | null>(null);
  const [odds, setOdds] = useState<CasinoOdds | null>(null);
  const [result, setResult] = useState<CasinoResult | null>(null);
  const [status, setStatus] = useState<
    "connected" | "connecting" | "polling" | "disconnected"
  >("disconnected");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gmid) {
      setData(null);
      setOdds(null);
      setResult(null);
      setStatus("disconnected");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const handleMessage = (message: CasinoWebSocketMessage) => {
      setIsLoading(false);
      setError(null);

      switch (message.type) {
        case "casino_data":
          setData(message.data as CasinoGameData);
          break;
        case "casino_odds":
          setOdds(message.data as CasinoOdds);
          break;
        case "casino_result":
          setResult(message.data as CasinoResult);
          break;
      }
    };

    // Subscribe to updates
    const unsubscribe = casinoWebSocket.subscribe(gmid, handleMessage);

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(casinoWebSocket.getStatus(gmid));
    }, 1000);

    // Set timeout for loading
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      setError("Connection timeout");
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
      clearTimeout(loadingTimeout);
    };
  }, [gmid]);

  return {
    data,
    odds,
    result,
    status,
    isLoading,
    error,
    isConnected: status === "connected" || status === "polling",
  };
}

/**
 * Hook to get live data for multiple casino games
 */
export function useCasinoLiveMultiple(gmids: string[]) {
  const [dataMap, setDataMap] = useState<Map<string, CasinoGameData>>(
    new Map(),
  );
  const [oddsMap, setOddsMap] = useState<Map<string, CasinoOdds>>(new Map());
  const [statusMap, setStatusMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const gmidsKey = gmids.join(",");

  useEffect(() => {
    if (!gmids || gmids.length === 0) {
      setDataMap(new Map());
      setOddsMap(new Map());
      setStatusMap(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribers: Array<() => void> = [];

    gmids.forEach((gmid) => {
      const handleMessage = (message: CasinoWebSocketMessage) => {
        setIsLoading(false);

        if (message.type === "casino_data") {
          setDataMap((prev) => {
            const next = new Map(prev);
            next.set(gmid, message.data as CasinoGameData);
            return next;
          });
        } else if (message.type === "casino_odds") {
          setOddsMap((prev) => {
            const next = new Map(prev);
            next.set(gmid, message.data as CasinoOdds);
            return next;
          });
        }
      };

      const unsubscribe = casinoWebSocket.subscribe(gmid, handleMessage);
      unsubscribers.push(unsubscribe);
    });

    // Update status for all games (reduced frequency from 2s to 5s)
    const statusInterval = setInterval(() => {
      const newStatusMap = new Map<string, string>();
      gmids.forEach((gmid) => {
        newStatusMap.set(gmid, casinoWebSocket.getStatus(gmid));
      });
      setStatusMap(newStatusMap);
    }, 5000); // Increased from 2000ms to 5000ms

    return () => {
      unsubscribers.forEach((fn) => fn());
      clearInterval(statusInterval);
    };
  }, [gmidsKey, gmids]);

  const getData = useCallback((gmid: string) => dataMap.get(gmid), [dataMap]);
  const getOdds = useCallback((gmid: string) => oddsMap.get(gmid), [oddsMap]);
  const getStatus = useCallback(
    (gmid: string) => statusMap.get(gmid) || "disconnected",
    [statusMap],
  );

  return {
    getData,
    getOdds,
    getStatus,
    dataMap,
    oddsMap,
    statusMap,
    isLoading,
    connectedCount: Array.from(statusMap.values()).filter(
      (s) => s === "connected" || s === "polling",
    ).length,
  };
}

/**
 * Hook to track recent casino results
 */
export function useCasinoResults(gmid: string | null, limit = 10) {
  const [results, setResults] = useState<CasinoResult[]>([]);

  useEffect(() => {
    if (!gmid) {
      setResults([]);
      return;
    }

    const handleMessage = (message: CasinoWebSocketMessage) => {
      if (message.type === "casino_result") {
        const result = message.data as CasinoResult;
        setResults((prev) => {
          const next = [result, ...prev];
          return next.slice(0, limit);
        });
      }
    };

    const unsubscribe = casinoWebSocket.subscribe(gmid, handleMessage);

    return () => {
      unsubscribe();
    };
  }, [gmid, limit]);

  return results;
}
