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

      try {
        // Fetch transactions
        const { data: transactions, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (txError) throw txError;

        // Fetch all profiles for mapping
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name");

        if (profileError) throw profileError;

        // Map profiles to transactions
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        const enrichedData =
          transactions?.map((tx) => ({
            ...tx,
            profiles: profileMap.get(tx.user_id),
          })) || [];

        console.log(
          "✅ [useAdminTransactions] Fetched transactions:",
          enrichedData?.length,
        );
        return enrichedData;
      } catch (error: any) {
        console.error("❌ [useAdminTransactions] Error:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
};

export const useAdminBets = () => {
  return useQuery({
    queryKey: ["admin-bets"],
    queryFn: async () => {
      console.log("🔍 [useAdminBets] Fetching all bets...");

      try {
        // Fetch bets
        const { data: bets, error: betsError } = await supabase
          .from("bets")
          .select("*")
          .order("created_at", { ascending: false });

        if (betsError) throw betsError;

        // Fetch all profiles for mapping
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name");

        if (profileError) throw profileError;

        // Map profiles to bets
        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        const enrichedData =
          bets?.map((bet) => ({
            ...bet,
            profiles: profileMap.get(bet.user_id),
          })) || [];

        console.log("✅ [useAdminBets] Fetched bets:", enrichedData?.length);
        return enrichedData;
      } catch (error: any) {
        console.error("❌ [useAdminBets] Error:", error);
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
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
