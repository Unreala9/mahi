/**
 * Comprehensive betting hooks for casino and sports
 */

import { useEffect, useState, useCallback } from "react";
import {
  enhancedCasinoService,
  type CasinoGameData,
  type PlacedBet as CasinoBet,
} from "@/services/enhancedCasinoService";
import {
  enhancedSportsService,
  type LiveScore,
  type MatchOdds,
  type BetRequest,
} from "@/services/enhancedSportsService";

/**
 * Hook for casino game data with real-time updates
 */
export function useCasinoGame(type: string) {
  const [data, setData] = useState<CasinoGameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = enhancedCasinoService.subscribe(type, (gameData) => {
      setData(gameData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [type]);

  const placeBet = useCallback(
    async (betData: {
      selection: string;
      odds: number;
      stake: number;
      bet_type: "BACK" | "LAY";
    }) => {
      try {
        if (!data) throw new Error("Game data not loaded");

        const result = await enhancedCasinoService.placeBet({
          event_id: parseInt(data.mid),
          event_name: data.gname,
          market_id: parseInt(data.mid),
          market_name: data.gname,
          market_type: "CASINO",
          ...betData,
        });

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [data],
  );

  const getStreamUrl = useCallback(() => {
    if (!type) return "";
    return enhancedCasinoService.getCasinoStreamUrl(type);
  }, [type]);

  return {
    data,
    loading,
    error,
    placeBet,
    getStreamUrl,
  };
}

/**
 * Hook for sports match with live score and odds
 */
export function useSportsMatch(gmid: number, sid: number) {
  const [score, setScore] = useState<LiveScore | null>(null);
  const [odds, setOdds] = useState<MatchOdds | null>(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingOdds, setLoadingOdds] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gmid || !sid) return;

    setLoadingScore(true);
    setLoadingOdds(true);
    setError(null);

    // Subscribe to live score updates
    const unsubscribeScore = enhancedSportsService.subscribeToScore(
      gmid,
      (scoreData) => {
        setScore(scoreData);
        setLoadingScore(false);
      },
    );

    // Subscribe to odds updates
    const unsubscribeOdds = enhancedSportsService.subscribeToOdds(
      gmid,
      sid,
      (oddsData) => {
        setOdds(oddsData);
        setLoadingOdds(false);
      },
    );

    return () => {
      unsubscribeScore();
      unsubscribeOdds();
    };
  }, [gmid, sid]);

  const placeBet = useCallback(
    async (betRequest: Omit<BetRequest, "event_id" | "event_name">) => {
      try {
        if (!score) throw new Error("Match data not loaded");

        const result = await enhancedSportsService.placeBet({
          event_id: gmid,
          event_name: `${score.score.home.name} vs ${score.score.away.name}`,
          ...betRequest,
        });

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [gmid, score],
  );

  const getStreamUrl = useCallback(() => {
    return enhancedSportsService.getLiveStreamUrl(gmid.toString());
  }, [gmid]);

  return {
    score,
    odds,
    loading: loadingScore || loadingOdds,
    loadingScore,
    loadingOdds,
    error,
    placeBet,
    getStreamUrl,
  };
}

/**
 * Hook for fetching all sports
 */
export function useAllSports() {
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const data = await enhancedSportsService.getAllSports();
        setSports(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  return { sports, loading, error };
}

/**
 * Hook for fetching matches by sport
 */
export function useSportMatches(sportId: number) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sportId) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await enhancedSportsService.getMatchesBySport(sportId);
        setMatches(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Refresh matches every 30 seconds
    const interval = setInterval(fetchMatches, 30000);

    return () => clearInterval(interval);
  }, [sportId]);

  return { matches, loading, error };
}

/**
 * Hook for fetching match tree
 */
export function useMatchTree() {
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const data = await enhancedSportsService.getMatchTree();
        setTree(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();

    // Refresh tree every 60 seconds
    const interval = setInterval(fetchTree, 60000);

    return () => clearInterval(interval);
  }, []);

  return { tree, loading, error };
}

/**
 * Hook for getting placed bets
 */
export function usePlacedBets(
  eventId: number | null,
  isCasino: boolean = false,
) {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    if (!eventId) {
      setBets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = isCasino
        ? await enhancedCasinoService.getPlacedBets(eventId)
        : await enhancedSportsService.getPlacedBets(eventId);
      setBets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId, isCasino]);

  useEffect(() => {
    fetchBets();

    // Refresh bets every 5 seconds
    const interval = setInterval(fetchBets, 5000);

    return () => clearInterval(interval);
  }, [fetchBets]);

  return { bets, loading, error, refetch: fetchBets };
}

/**
 * Hook for getting market result
 */
export function useMarketResult(
  eventId: number | null,
  marketId: number | null,
  eventName: string,
  marketName: string,
  isCasino: boolean = false,
) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!eventId || !marketId) return;

    try {
      setLoading(true);
      const data = isCasino
        ? await enhancedCasinoService.getResult({
            event_id: eventId,
            event_name: eventName,
            market_id: marketId,
            market_name: marketName,
          })
        : await enhancedSportsService.getResult({
            event_id: eventId,
            event_name: eventName,
            market_id: marketId,
            market_name: marketName,
          });
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId, marketId, eventName, marketName, isCasino]);

  return { result, loading, error, fetchResult };
}
