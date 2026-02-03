/**
 * Universal Casino Game Hook
 * Provides live API data, odds, results, and betting logic for any casino game
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { casinoBettingService } from "@/services/casinoBettingService";

const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
const BASE_URL = API_HOST.startsWith("/")
  ? API_HOST
  : API_PROTOCOL
    ? `${API_PROTOCOL}://${API_HOST}`
    : `http://${API_HOST}`;
const API_KEY =
  import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

export interface CasinoMarket {
  sid: number;
  nat: string; // market name
  b: number; // back odds
  bs: number; // back size
  l?: number; // lay odds
  ls?: number; // lay size
  sr: number; // sort order
  gstatus: "ACTIVE" | "SUSPENDED";
  min: number;
  max: number;
  subtype: string;
  etype: string;
}

export interface CasinoGameData {
  mid: string; // market/round ID
  lt: number;
  ft: number;
  card: string;
  gtype: string;
  remark: string;
  grp: number;
  sub: CasinoMarket[];
}

export interface CasinoResult {
  mid: string;
  win: string;
  desc?: string;
  cards?: any[];
}

export interface PlacedBet {
  marketId: string;
  marketName: string;
  stake: number;
  odds: number;
  betType: "BACK" | "LAY";
}

interface UseUniversalCasinoGameOptions {
  gameType: string; // e.g., 'dt20', 'ab20', 'teen20'
  gameName: string; // e.g., 'Dragon Tiger 20', 'Andar Bahar 20'
  pollInterval?: number; // milliseconds, default 1000
  resultPollInterval?: number; // milliseconds, default 3000
}

export function useUniversalCasinoGame({
  gameType,
  gameName,
  pollInterval = 1000,
  resultPollInterval = 3000,
}: UseUniversalCasinoGameOptions) {
  const [gameData, setGameData] = useState<CasinoGameData | null>(null);
  const [result, setResult] = useState<CasinoResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedBets, setPlacedBets] = useState<Map<string, PlacedBet>>(
    new Map(),
  );

  // Fetch live game data with odds
  const fetchGameData = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/casino/data?type=${gameType}&key=${API_KEY}`,
        {
          headers: { Accept: "*/*" },
        },
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
      console.error(`[${gameType}] Error fetching game data:`, err);
      setError("Failed to fetch game data");
      setIsConnected(false);
    }
  }, [gameType]);

  // Fetch last round result
  const fetchResult = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/casino/result?type=${gameType}&key=${API_KEY}`,
        {
          headers: { Accept: "*/*" },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.res && data.data.res.length > 0) {
          setResult(data.data.res[0]);
        }
      }
    } catch (err) {
      console.error(`[${gameType}] Error fetching result:`, err);
    }
  }, [gameType]);

  // Place a bet
  const placeBet = useCallback(
    async (
      marketId: string,
      marketName: string,
      selection: string,
      odds: number,
      stake: number,
      betType: "BACK" | "LAY" = "BACK",
    ) => {
      if (!gameData) {
        toast({
          title: "Game not ready",
          description: "Please wait for game data to load",
          variant: "destructive",
        });
        return false;
      }

      try {
        const result = await casinoBettingService.placeCasinoBet({
          gameId: gameType,
          gameName: gameName,
          roundId: gameData.mid,
          marketId,
          marketName,
          selection,
          odds,
          stake,
          betType,
        });

        if (result.success) {
          // Track placed bet locally
          setPlacedBets((prev) => {
            const next = new Map(prev);
            next.set(marketId, {
              marketId,
              marketName,
              stake,
              odds,
              betType,
            });
            return next;
          });

          toast({
            title: "Bet Placed",
            description: `₹${stake} on ${marketName} @ ${odds}`,
          });

          return true;
        }

        return false;
      } catch (err) {
        console.error(`[${gameType}] Error placing bet:`, err);
        return false;
      }
    },
    [gameData, gameType, gameName],
  );

  // Clear all placed bets (UI state only)
  const clearBets = useCallback(() => {
    setPlacedBets(new Map());
  }, []);

  // Get active markets (not suspended)
  const activeMarkets =
    gameData?.sub.filter((m) => m.gstatus === "ACTIVE") || [];

  // Get suspended markets
  const suspendedMarkets =
    gameData?.sub.filter((m) => m.gstatus === "SUSPENDED") || [];

  // Get total stake from placed bets
  const totalStake = Array.from(placedBets.values()).reduce(
    (sum, bet) => sum + bet.stake,
    0,
  );

  // Get potential win
  const potentialWin = Array.from(placedBets.values()).reduce(
    (sum, bet) => sum + bet.stake * bet.odds,
    0,
  );

  // Get market by name
  const getMarket = useCallback(
    (marketName: string) => {
      return gameData?.sub.find(
        (m) => m.nat.toLowerCase() === marketName.toLowerCase(),
      );
    },
    [gameData],
  );

  // Check if betting is suspended
  const isSuspended =
    gameData?.sub.every((m) => m.gstatus === "SUSPENDED") ?? true;

  // Start polling for game data
  useEffect(() => {
    if (!gameType) return;

    // Initial fetch
    fetchGameData();
    fetchResult();

    // Set up polling intervals
    const gameDataInterval = setInterval(fetchGameData, pollInterval);
    const resultInterval = setInterval(fetchResult, resultPollInterval);

    return () => {
      clearInterval(gameDataInterval);
      clearInterval(resultInterval);
    };
  }, [gameType, pollInterval, resultPollInterval, fetchGameData, fetchResult]);

  return {
    // Game state
    gameData,
    result,
    isConnected,
    error,

    // Markets
    markets: gameData?.sub || [],
    activeMarkets,
    suspendedMarkets,
    getMarket,

    // Round info
    roundId: gameData?.mid,
    cards: gameData?.card,

    // Betting
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,

    // Refresh
    refresh: fetchGameData,
  };
}
