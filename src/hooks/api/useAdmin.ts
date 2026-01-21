import { useQuery } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () =>
      callEdgeFunction("admin?action=users", {}, { method: "GET" }),
  });
};

export const useAdminBets = () => {
  return useQuery({
    queryKey: ["admin-bets"],
    queryFn: () => callEdgeFunction("admin?action=bets", {}, { method: "GET" }),
  });
};

export const useApiLogs = () => {
  return useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => callEdgeFunction("admin?action=logs", {}, { method: "GET" }),
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () =>
      callEdgeFunction("admin?action=reports_daily", {}, { method: "GET" }),
  });
};
