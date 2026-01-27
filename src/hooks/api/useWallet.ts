import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge";
import { supabase } from "@/integrations/supabase/client";

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

export const useWalletBalance = (
  options?: Omit<UseQueryOptions<number>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      try {
        console.log(
          "[useWalletBalance] Fetching balance from wallet-operation edge function...",
        );
        const result = await callEdgeFunction(
          "wallet-operation?action=get-balance",
          {},
          { method: "GET" },
        );

        if (result?.success && typeof result.balance === "number") {
          console.log(
            "[useWalletBalance] Balance from edge function:",
            result.balance,
          );
          return result.balance;
        }

        // If edge function fails, try direct query as fallback
        console.log(
          "[useWalletBalance] Edge function failed, trying direct query...",
        );
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", user.id)
            .maybeSingle();

          if (wallet?.balance) {
            console.log(
              "[useWalletBalance] Found balance in wallets table:",
              wallet.balance,
            );
            return Number(wallet.balance);
          }
        }

        return 0;
      } catch (error) {
        console.error("[useWalletBalance] Failed to fetch balance:", error);

        // Try direct query as final fallback
        try {
          console.log("[useWalletBalance] Trying direct query as fallback...");
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: wallet } = await supabase
              .from("wallets")
              .select("balance")
              .eq("user_id", user.id)
              .maybeSingle();

            if (wallet?.balance) {
              console.log(
                "[useWalletBalance] Found balance in wallets table (fallback):",
                wallet.balance,
              );
              return Number(wallet.balance);
            }
          }
        } catch (fallbackError) {
          console.error(
            "[useWalletBalance] Fallback also failed:",
            fallbackError,
          );
        }

        return 0;
      }
    },
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000,
    ...(options ?? {}),
  });
};

export const useWalletTransactions = () => {
  return useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      try {
        const res = await callEdgeFunction(
          "wallet-operation?action=transactions",
          {},
          { method: "GET" },
        );
        return res?.transactions || [];
      } catch (error) {
        console.warn(
          "[useWalletTransactions] Failed to fetch transactions:",
          error,
        );
        return [];
      }
    },
    retry: 1,
    retryDelay: 2000,
    staleTime: 30000,
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      callEdgeFunction(
        "wallet-operation?action=add",
        {
          amount,
          type: "deposit",
          reference: `deposit_${Date.now()}`,
          description: "Wallet deposit",
        },
        { method: "POST" },
      ),
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
        "wallet-operation?action=deduct",
        {
          amount,
          reference: `withdraw_${Date.now()}`,
          description: "Wallet withdrawal",
        },
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};

/**
 * Hook to deduct amount from wallet (for placing bets)
 */
export const useDeductWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeductWalletParams) => {
      return await callEdgeFunction("wallet-operation?action=deduct", params, {
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
      return await callEdgeFunction(
        "wallet-operation?action=add",
        {
          ...params,
          type: "win",
        },
        {
          method: "POST",
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
};
