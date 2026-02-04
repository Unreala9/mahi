import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

interface Bet {
  id: string;
  created_at: string;
  user_id: string;
  provider_bet_id: string;
  sport: string;
  event: string;
  event_name: string;
  market: string;
  market_name: string;
  selection: string;
  selection_name: string;
  odds: number;
  stake: number;
  status: "pending" | "won" | "lost" | "void" | "cashed_out";
  bet_type: string;
  potential_payout: number;
  payout: number;
  settled_at: string | null;
  exposure: number;
}

export function useBetHistory(apiEventId?: string, status?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setBets([]);
      setLoading(false);
      return;
    }

    fetchBets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("user-bets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Bet update:", payload);
          fetchBets(); // Refetch on any change
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, apiEventId, status]);

  const fetchBets = async () => {
    if (!user) return;

    setLoading(true);

    try {
      let query = supabase
        .from("bets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (apiEventId) {
        query = query.eq("event", apiEventId);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching bets:", error);
      } else if (data) {
        setBets(data);
      }
    } catch (err) {
      console.error("Exception fetching bets:", err);
    } finally {
      setLoading(false);
    }
  };

  return { bets, loading, refetch: fetchBets };
}
