import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGameData, fetchCasinoResult } from "@/services/casino";

export function useCasinoGameData(gameType: string) {
  const {
    data: gameData,
    isLoading: isLoadingData,
    error: dataError,
  } = useQuery({
    queryKey: ["casino-game-data", gameType],
    queryFn: () => fetchCasinoGameData(gameType),
    refetchInterval: 2000, // Refresh every 2 seconds for live data
    enabled: !!gameType,
  });

  const { data: resultData, isLoading: isLoadingResult } = useQuery({
    queryKey: ["casino-result", gameType],
    queryFn: () => fetchCasinoResult(gameType),
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!gameType,
  });

  return {
    gameData: gameData?.data,
    resultData: resultData?.data,
    isLoading: isLoadingData || isLoadingResult,
    error: dataError,
  };
}
