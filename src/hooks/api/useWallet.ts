import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export const useWalletBalance = (options?: Omit<UseQueryOptions<number>, "queryKey" | "queryFn">) => {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () =>
      callEdgeFunction("wallet?action=balance", {}, { method: "GET" }).then(
        (res: any) => res.balance || 0
      ),
    ...(options ?? {}),
  });
};

export const useWalletTransactions = () => {
  return useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: () =>
      callEdgeFunction(
        "wallet?action=transactions",
        {},
        { method: "GET" }
      ).then((res) => (Array.isArray(res) ? res : [])),
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      callEdgeFunction("wallet?action=deposit", { amount }, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};

export const useWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      callEdgeFunction(
        "wallet?action=withdraw",
        { amount },
        { method: "POST" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};
