// src/services/bettingService.ts
import { callEdgeFunction } from "@/lib/edge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BetPlacement {
  gameType: "SPORTS" | "CASINO";
  gameId: string;
  gameName: string;
  marketId: string;
  marketName: string;
  selection: string;
  selectionId?: string;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
  eventId?: string;
  eventName?: string;
}

export interface BetResult {
  betId: string;
  status: "won" | "lost" | "void";
  payout?: number;
}

class BettingService {
  async placeBet(bet: BetPlacement): Promise<{
    success: boolean;
    betId?: string;
    balance?: number;
    error?: string;
  }> {
    try {
      console.log("[BettingService] Placing bet:", bet);

      // ✅ ensure session exists in same client
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "⏳ Not Logged In",
          description: "Please log in to place bets",
          variant: "destructive",
        });
        return { success: false, error: "No active session" };
      }

      const result = await callEdgeFunction<any>(
        "bet-placement?action=place",
        bet,
      );

      if (!result?.success) {
        toast({
          title: "❌ Bet Failed",
          description: result?.error || "Failed to place bet",
          variant: "destructive",
        });
        return {
          success: false,
          error: result?.error || "Failed to place bet",
        };
      }

      toast({
        title: "✅ Bet Placed Successfully!",
        description: `₹${bet.stake} on ${bet.selection} @ ${bet.odds}`,
      });

      return {
        success: true,
        betId: result.betId,
        balance: result.balance,
      };
    } catch (error: any) {
      const msg = String(error?.message || error);

      // ✅ show edge JSON error nicely
      let errorMessage = "Failed to place bet";
      try {
        const parsed = JSON.parse(msg);
        errorMessage = parsed?.body?.error || parsed?.message || errorMessage;
      } catch {
        if (msg.includes("Invalid JWT") || msg.includes('"status":401')) {
          errorMessage =
            "Session issue (Invalid JWT). Please logout/login once.";
        } else if (msg) {
          errorMessage = msg;
        }
      }

      toast({
        title: "❌ Bet Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    }
  }

  async settleBet(
    betId: string,
    status: "won" | "lost" | "void",
    payout?: number,
  ): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const result = await callEdgeFunction<any>(
        "bet-settlement?action=settle",
        {
          betId,
          status,
          payout,
        },
      );

      if (!result?.success) {
        return { success: false, error: result?.error || "Settlement failed" };
      }

      return { success: true, balance: result.balance };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to settle bet",
      };
    }
  }

  async getMyBets(
    limit: number = 50,
    offset: number = 0,
    status?: string,
  ): Promise<any[]> {
    try {
      let url = `bet-placement?action=my-bets&limit=${limit}&offset=${offset}`;
      if (status) url += `&status=${status}`;

      const result = await callEdgeFunction<any>(url, {}, { method: "GET" });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch bets");
      }
      return result.bets || [];
    } catch (error: any) {
      console.error("[BettingService] getMyBets error:", error);
      throw error;
    }
  }

  async getBetById(betId: string): Promise<any | null> {
    try {
      const result = await callEdgeFunction<any>(
        `bet-placement?action=get-bet&betId=${betId}`,
        {},
        { method: "GET" },
      );

      if (!result?.success) return null;
      return result.bet;
    } catch {
      return null;
    }
  }
}

export const bettingService = new BettingService();
