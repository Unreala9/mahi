import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  diamondApi,
  type MatchEvent,
  type SportId,
  type MatchDetails,
  type OddsData,
} from "@/services/diamondApi";

// Fetch all sport IDs
export function useSportIds() {
  return useQuery({
    queryKey: ["sportIds"],
    queryFn: () => diamondApi.getAllSportIds(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

// Fetch all matches (tree endpoint)
export function useAllMatches() {
  return useQuery({
    queryKey: ["allMatches"],
    queryFn: () => diamondApi.getAllMatches(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for live updates
  });
}

// Fetch matches by sport ID
export function useMatchesBySport(sportId: number | null) {
  return useQuery({
    queryKey: ["matches", sportId],
    queryFn: () =>
      sportId ? diamondApi.getMatchesBySport(sportId) : Promise.resolve([]),
    enabled: sportId !== null,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// Fetch match details
export function useMatchDetails(gmid: number | null, sid: number | null) {
  return useQuery({
    queryKey: ["matchDetails", gmid, sid],
    queryFn: () =>
      gmid && sid
        ? diamondApi.getMatchDetails(gmid, sid)
        : Promise.resolve(null),
    enabled: gmid !== null && sid !== null,
    staleTime: 30 * 1000, // Match details don't change as often
    refetchInterval: 30 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Fetch match odds
export function useMatchOdds(
  gmid: number | null,
  sid: number | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["matchOdds", gmid, sid, enabled],
    queryFn: () =>
      enabled && gmid && sid
        ? diamondApi.getMatchOdds(gmid, sid)
        : Promise.resolve(null),
    enabled: enabled && gmid !== null && sid !== null,
    staleTime: 12 * 1000, // 12 seconds - use cached data within this window
    refetchInterval: 15 * 1000, // Optimized refresh interval
    refetchOnMount: false, // Don't refetch if data is still fresh
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
}

// Bulk: Fetch match details for a sport (uses /esid and /getDetailsData)
export function useAllMatchDetails(sportId: number | null, max: number = 20) {
  return useQuery({
    queryKey: ["allMatchDetails", sportId, max],
    queryFn: () =>
      sportId
        ? diamondApi.getAllMatchDetailsBySport(sportId, max)
        : Promise.resolve([]),
    enabled: sportId !== null,
    staleTime: 30 * 1000,
  });
}

export const useAllMatchOdds = (sportId?: number, max: number = 20) => {
  return useQuery({
    queryKey: ["diamond", "bulk-odds", sportId, max],
    queryFn: () =>
      sportId
        ? diamondApi.getAllMatchOddsBySport(sportId, max)
        : Promise.resolve({}),
    enabled: !!sportId,
    staleTime: 15 * 1000,
  });
};

export function useSportAggregate(sportId: number | null, max: number = 20) {
  return useQuery({
    queryKey: ["sportAggregate", sportId, max],
    queryFn: () =>
      sportId !== null
        ? diamondApi.getSportAggregate(sportId, max)
        : Promise.resolve(null),
    enabled: sportId !== null,
    staleTime: 30 * 1000,
  });
}

// Fetch casino tables
export function useCasinoTables() {
  return useQuery({
    queryKey: ["casinoTables"],
    queryFn: () => diamondApi.getCasinoTables(),
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch casino data
export function useCasinoData(type: number | null) {
  return useQuery({
    queryKey: ["casinoData", type],
    queryFn: () =>
      type ? diamondApi.getCasinoData(type) : Promise.resolve(null),
    enabled: type !== null,
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000, // Fast refresh for casino games
  });
}

// Fetch casino last result
export function useCasinoLastResult(type: number | null) {
  return useQuery({
    queryKey: ["casinoLastResult", type],
    queryFn: () =>
      type ? diamondApi.getCasinoLastResult(type) : Promise.resolve(null),
    enabled: type !== null,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
}

// Place bet mutation
export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betData: {
      event_id: number;
      event_name: string;
      market_id: number;
      market_name: string;
      market_type: string;
    }) => diamondApi.placeBet(betData),
    onSuccess: () => {
      // Invalidate relevant queries after placing a bet
      queryClient.invalidateQueries({ queryKey: ["placedBets"] });
    },
  });
}

// Get result mutation
export function useGetResult() {
  return useMutation({
    mutationFn: (resultData: {
      event_id: number;
      event_name: string;
      market_id: number;
      market_name: string;
    }) => diamondApi.getResult(resultData),
  });
}

// Fetch placed bets results
export function usePlacedBetsResults(eventId: number | null) {
  return useQuery({
    queryKey: ["placedBets", eventId],
    queryFn: () =>
      eventId ? diamondApi.getPlacedBetsResults(eventId) : Promise.resolve([]),
    enabled: eventId !== null,
    staleTime: 30 * 1000,
  });
}
