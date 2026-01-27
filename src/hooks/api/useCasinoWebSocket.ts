import { useEffect, useState, useRef } from "react";

interface CasinoWebSocketData {
  mid: string;
  lt: number;
  ft: number;
  card: string;
  gtype: string;
  remark: string;
  grp: number;
  sub: Array<{
    sid: number;
    nat: string;
    b: number;
    bs: number;
    sr: number;
    gstatus: "ACTIVE" | "SUSPENDED";
    min: number;
    max: number;
    subtype: string;
    etype: string;
  }>;
}

interface CasinoResultData {
  res: Array<{
    mid: string;
    win: string;
  }>;
  res1: {
    cname: string;
  };
}

export function useCasinoWebSocket(gameType: string) {
  const [gameData, setGameData] = useState<CasinoWebSocketData | null>(null);
  const [resultData, setResultData] = useState<CasinoResultData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const dataIntervalRef = useRef<NodeJS.Timeout>();
  const resultIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!gameType) return;

    const API_BASE = import.meta.env.VITE_DIAMOND_API_HOST?.startsWith("/")
      ? `${window.location.origin}${import.meta.env.VITE_DIAMOND_API_HOST}`
      : import.meta.env.VITE_DIAMOND_API_HOST || `${window.location.origin}/api/diamond`;
    const API_KEY = import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

    // Fetch game data via HTTP polling (since WebSocket might not be available)
    const fetchGameData = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/casino/data?type=${gameType}&key=${API_KEY}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setGameData(data.data);
            setIsConnected(true);
            setError(null);
          }
        }
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError("Failed to fetch game data");
      }
    };

    const fetchResultData = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/casino/result?type=${gameType}&key=${API_KEY}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setResultData(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching result data:", err);
      }
    };

    // Initial fetch
    fetchGameData();
    fetchResultData();

    // Poll every 1 second for game data (live odds)
    dataIntervalRef.current = setInterval(fetchGameData, 1000);

    // Poll every 3 seconds for results
    resultIntervalRef.current = setInterval(fetchResultData, 3000);

    // Cleanup
    return () => {
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
      }
      if (resultIntervalRef.current) {
        clearInterval(resultIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [gameType]);

  return {
    gameData,
    resultData,
    isConnected,
    error,
  };
}
