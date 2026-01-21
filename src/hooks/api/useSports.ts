import { useQuery } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export const useSports = () => {
  return useQuery({
    queryKey: ["sports"],
    queryFn: () =>
      callEdgeFunction("sports", {}, { method: "GET" }).then((res) =>
        Array.isArray(res) ? res : []
      ),
  });
};

export const useEvents = (sportId: string | null) => {
  return useQuery({
    queryKey: ["events", sportId],
    queryFn: () =>
      callEdgeFunction(
        `sports?action=events&sportId=${sportId}`,
        {},
        { method: "GET" }
      ),
    enabled: !!sportId,
  });
};

export const useMarkets = (eventId: string | null) => {
  return useQuery({
    queryKey: ["markets", eventId],
    queryFn: () =>
      callEdgeFunction(
        `sports?action=markets&eventId=${eventId}`,
        {},
        { method: "GET" }
      ),
    enabled: !!eventId,
  });
};
