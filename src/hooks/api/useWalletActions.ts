import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";

export interface DeductWalletParams {
  amount: number;
  reference: string;
  description?: string;
}

export interface CreditWalletParams {
  amount: number;
  reference: string;
  description?: string;
}

/**
 * Hook to deduct amount from wallet (for placing bets)
 */
export const useDeductWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeductWalletParams) => {
      return await callEdgeFunction("wallet?action=deduct", params, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};

/**
 * Hook to credit amount to wallet (for winnings)
 */
export const useCreditWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreditWalletParams) => {
      return await callEdgeFunction("wallet?action=credit", params, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};
