import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface PlaceBetParams {
  apiEventId: string;
  gameType?: "SPORTS" | "CASINO";
  gameName: string;
  marketId: string;
  marketName: string;
  selection: string;
  selectionId?: string;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
}

interface PlaceBetResult {
  success: boolean;
  betId?: string;
  balance?: number;
  error?: string;
}

export function useBetPlacement() {
  const [user, setUser] = useState<User | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const placeBet = async ({
    apiEventId,
    gameType = "SPORTS",
    gameName,
    marketId,
    marketName,
    selection,
    selectionId,
    odds,
    stake,
    betType,
  }: PlaceBetParams): Promise<PlaceBetResult> => {
    if (!user) {
      toast.error("Please login to place bets");
      return { success: false, error: "Not authenticated" };
    }

    if (!odds || odds <= 0) {
      toast.error("Invalid odds");
      return { success: false, error: "Invalid odds" };
    }

    if (!stake || stake <= 0) {
      toast.error("Invalid stake amount");
      return { success: false, error: "Invalid stake" };
    }

    setIsPlacing(true);

    try {
      const { data, error } = await supabase.functions.invoke("bet-placement", {
        body: {
          gameType,
          gameId: apiEventId,
          gameName,
          eventId: apiEventId,
          eventName: gameName,
          marketId,
          marketName,
          selection,
          selectionId: selectionId || selection,
          odds,
          stake,
          betType,
        },
      });

      if (error) {
        console.error("Bet placement error:", error);
        toast.error(error.message || "Failed to place bet");
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        const errorMsg = data?.error || "Bet placement failed";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      toast.success(`Bet placed! ₹${stake} @ ${odds.toFixed(2)}`);
      return {
        success: true,
        betId: data.betId,
        balance: data.balance,
      };
    } catch (err: any) {
      console.error("Bet placement exception:", err);
      const errorMsg = err.message || "Failed to place bet";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsPlacing(false);
    }
  };

  return { placeBet, isPlacing };
}
