import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bettingService } from "@/services/bettingService";

export const usePlaceBet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (betData: any) => bettingService.placeBet(betData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};

export const useMyBets = () => {
  return useQuery({
    queryKey: ["my-bets"],
    queryFn: () => bettingService.getMyBets(),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (previously cacheTime in v4)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
