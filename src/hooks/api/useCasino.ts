import { useMutation, useQuery } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export const useCasinoGames = () => {
  return useQuery({
    queryKey: ["casino-games"],
    queryFn: () =>
      callEdgeFunction("casino?action=games", {}, { method: "GET" }).then(
        (res) => (Array.isArray(res) ? res : [])
      ),
  });
};

export const useLaunchGame = () => {
  return useMutation({
    mutationFn: (gameId: string) =>
      callEdgeFunction(`casino?action=launch`, { gameId }, { method: "POST" }),
  });
};
