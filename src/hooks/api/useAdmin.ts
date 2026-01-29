import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      console.log("🔍 [useAdminUsers] Fetching all users...");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [useAdminUsers] Error:", error);
        throw error;
      }

      console.log("✅ [useAdminUsers] Fetched users:", data?.length);
      return data || [];
    },
  });
};

export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      console.log("🔍 [useAdminTransactions] Fetching all transactions...");

      const { data, error } = await supabase
        .from("wallet_transactions")
        .select(
          `
          *,
          profiles!wallet_transactions_user_id_fkey (
            email,
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [useAdminTransactions] Error:", error);
        throw error;
      }

      console.log(
        "✅ [useAdminTransactions] Fetched transactions:",
        data?.length,
      );
      return data || [];
    },
  });
};

export const useAdminBets = () => {
  return useQuery({
    queryKey: ["admin-bets"],
    queryFn: async () => {
      console.log("🔍 [useAdminBets] Fetching all bets...");

      const { data, error } = await supabase
        .from("bets")
        .select(
          `
          *,
          profiles!bets_user_id_fkey (
            email,
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ [useAdminBets] Error:", error);
        throw error;
      }

      console.log("✅ [useAdminBets] Fetched bets:", data?.length);
      return data || [];
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      console.log("🔍 [useAdminStats] Calculating stats...");

      // Fetch all data in parallel
      const [usersRes, transactionsRes, betsRes, walletsRes] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase
            .from("transactions")
            .select("*", { count: "exact", head: true }),
          supabase.from("bets").select("*", { count: "exact", head: true }),
          supabase.from("wallets").select("balance"),
        ]);

      const totalUsers = usersRes.count || 0;
      const totalTransactions = transactionsRes.count || 0;
      const totalBets = betsRes.count || 0;
      const totalBalance =
        walletsRes.data?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;

      const stats = {
        totalUsers,
        totalTransactions,
        totalBets,
        totalBalance,
      };

      console.log("✅ [useAdminStats] Stats:", stats);
      return stats;
    },
  });
};

export const useApiLogs = () => {
  return useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      // Return empty array if no audit logs table exists
      console.log("⚠️ [useApiLogs] No audit logs implementation yet");
      return [];
    },
  });
};
