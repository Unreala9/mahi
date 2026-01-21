import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export const usePlaceBet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (betData: any) =>
      callEdgeFunction("bets?action=place", betData, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bets"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
};

export const useMyBets = () => {
  return useQuery({
    queryKey: ["my-bets"],
    queryFn: () => callEdgeFunction("bets?action=my", {}, { method: "GET" }),
  });
};
