/**
 * Unified Betting System
 * Single interface for both Sports and Casino betting with wallet integration
 */

import { useSportsBetting, type SportsBet } from "./sportsBettingService";
import { useCasinoBetting, type CasinoBet } from "./casinoBettingService";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { toast } from "@/hooks/use-toast";

export type BetType = "SPORTS" | "CASINO";

export interface UnifiedBet {
  type: BetType;
  data: SportsBet | CasinoBet;
}

export interface BettingSystemState {
  balance: number;
  isLoading: boolean;
  canPlaceBet: (stake: number) => boolean;
}

/**
 * Unified betting hook that handles both sports and casino bets
 */
export function useUnifiedBetting(userId?: string) {
  const { data: balance = 0, isLoading } = useWalletBalance();
  const sportsBetting = useSportsBetting();
  const casinoBetting = useCasinoBetting();

  /**
   * Check if user has sufficient balance to place a bet
   */
  const canPlaceBet = (stake: number): boolean => {
    if (isLoading) return false;
    if (stake < 100) {
      toast({
        title: "Invalid Stake",
        description: "Minimum stake is ₹100",
        variant: "destructive",
      });
      return false;
    }
    if (stake > 25000) {
      toast({
        title: "Invalid Stake",
        description: "Maximum stake is ₹25,000",
        variant: "destructive",
      });
      return false;
    }
    if (stake > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You have ₹${balance.toFixed(2)}, need ₹${stake}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  /**
   * Place a bet (sports or casino)
   */
  const placeBet = async (bet: UnifiedBet) => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return null;
    }

    const stake =
      bet.type === "SPORTS"
        ? (bet.data as SportsBet).stake
        : (bet.data as CasinoBet).stake;

    if (!canPlaceBet(stake)) {
      return null;
    }

    if (bet.type === "SPORTS") {
      return await sportsBetting.placeBet(bet.data as SportsBet, userId);
    } else {
      return await casinoBetting.placeBet(bet.data as CasinoBet, userId);
    }
  };

  /**
   * Get bet history (sports or casino)
   */
  const getBetHistory = async (type?: BetType) => {
    if (!type || type === "SPORTS") {
      const sportsBets = await sportsBetting.getBetHistory();
      if (type === "SPORTS") return sportsBets;

      const casinoBets = await casinoBetting.getBetHistory();
      return [...sportsBets, ...casinoBets];
    } else {
      return await casinoBetting.getBetHistory();
    }
  };

  const state: BettingSystemState = {
    balance,
    isLoading,
    canPlaceBet,
  };

  return {
    state,
    placeBet,
    getBetHistory,
    sportsBetting,
    casinoBetting,
  };
}

/**
 * Quick helper to place a sports bet
 */
export async function quickPlaceSportsBet(
  bet: SportsBet,
  userId: string,
): Promise<any> {
  const { placeBet } = useSportsBetting();
  return await placeBet(bet, userId);
}

/**
 * Quick helper to place a casino bet
 */
export async function quickPlaceCasinoBet(
  bet: CasinoBet,
  userId: string,
): Promise<any> {
  const { placeBet } = useCasinoBetting();
  return await placeBet(bet, userId);
}
