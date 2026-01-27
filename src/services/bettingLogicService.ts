/**
 * Comprehensive Betting Logic Service
 * Manages bet slip, bet placement, validation, and calculations
 */

import { useState, useCallback, useEffect } from "react";
import type {
  BetSlipItem,
  BetPlacement,
  PlacedBet,
  BettingState,
  MarketType,
  BetType,
  RunnerOdds,
  PlaceBetResponse,
} from "@/types/sports-betting";
import { enhancedPlacedBetsService } from "./enhancedPlacedBetsService";
import { toast } from "@/hooks/use-toast";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { placeBetSlipWithWallet } from "./sportsBettingService";

// Betting limits and rules
export const BETTING_RULES = {
  MIN_STAKE: 100,
  MAX_STAKE: 25000,
  MAX_PROFIT: 100000,
  MIN_ODDS: 1.01,
  MAX_ODDS: 1000,
};

// Market-specific rules
export const MARKET_RULES: Record<
  MarketType,
  { min: number; max: number; maxProfit: number }
> = {
  MATCH_ODDS: { min: 100, max: 25000, maxProfit: 100000 },
  BOOKMAKER: { min: 100, max: 25000, maxProfit: 100000 },
  FANCY: { min: 100, max: 25000, maxProfit: 100000 },
  SESSION: { min: 100, max: 25000, maxProfit: 100000 },
  TOSS: { min: 100, max: 10000, maxProfit: 10000 },
  OTHER: { min: 100, max: 25000, maxProfit: 100000 },
};

/**
 * Calculate potential profit for a bet
 */
export function calculateProfit(
  stake: number,
  odds: number,
  betType: BetType,
  marketType: MarketType,
): number {
  if (marketType === "FANCY" || marketType === "SESSION") {
    // For fancy markets, odds represent runs
    if (betType === "BACK") {
      return (stake * odds) / 100;
    } else {
      return stake;
    }
  } else {
    // For match odds and bookmaker
    if (betType === "BACK") {
      return stake * (odds - 1);
    } else {
      return stake * (odds - 1);
    }
  }
}

/**
 * Calculate liability for a lay bet
 */
export function calculateLiability(
  stake: number,
  odds: number,
  marketType: MarketType,
): number {
  if (marketType === "FANCY" || marketType === "SESSION") {
    return (stake * odds) / 100;
  } else {
    return stake * (odds - 1);
  }
}

/**
 * Validate bet parameters
 */
export function validateBet(
  stake: number,
  odds: number,
  marketType: MarketType,
): { valid: boolean; error?: string } {
  const rules = MARKET_RULES[marketType];

  if (stake < rules.min) {
    return { valid: false, error: `Minimum stake is ₹${rules.min}` };
  }

  if (stake > rules.max) {
    return { valid: false, error: `Maximum stake is ₹${rules.max}` };
  }

  if (odds < BETTING_RULES.MIN_ODDS) {
    return { valid: false, error: `Minimum odds is ${BETTING_RULES.MIN_ODDS}` };
  }

  if (odds > BETTING_RULES.MAX_ODDS) {
    return { valid: false, error: `Maximum odds is ${BETTING_RULES.MAX_ODDS}` };
  }

  const profit = calculateProfit(stake, odds, "BACK", marketType);
  if (profit > rules.maxProfit) {
    return {
      valid: false,
      error: `Maximum profit is ₹${rules.maxProfit}`,
    };
  }

  return { valid: true };
}

/**
 * Hook for managing betting logic
 */
export function useBettingLogic(userId?: string) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [exposure, setExposure] = useState(0);

  // Use real wallet balance
  const { data: balance = 0, isLoading: isLoadingBalance } = useWalletBalance();

  /**
   * Add bet to slip
   */
  const addToBetSlip = useCallback(
    (
      eventId: number,
      eventName: string,
      marketId: string | number,
      marketName: string,
      marketType: MarketType,
      selection: string,
      odds: number,
      betType: BetType,
      selectionId?: number,
    ) => {
      // Check if bet already exists
      const existingBet = betSlip.find(
        (b) =>
          b.event_id === eventId &&
          b.market_id === marketId &&
          b.selection === selection &&
          b.bet_type === betType,
      );

      if (existingBet) {
        toast({
          title: "Already in Bet Slip",
          description: "This bet is already in your bet slip",
          variant: "default",
        });
        return;
      }

      const defaultStake = MARKET_RULES[marketType].min;
      const potentialProfit = calculateProfit(
        defaultStake,
        odds,
        betType,
        marketType,
      );

      const newBet: BetSlipItem = {
        event_id: eventId,
        event_name: eventName,
        market_id: marketId,
        market_name: marketName,
        market_type: marketType,
        selection,
        selection_id: selectionId,
        odds,
        bet_type: betType,
        stake: defaultStake,
        potential_profit: potentialProfit,
      };

      setBetSlip((prev) => [...prev, newBet]);

      toast({
        title: "Added to Bet Slip",
        description: `${selection} @ ${odds}`,
      });
    },
    [betSlip],
  );

  /**
   * Remove bet from slip
   */
  const removeFromBetSlip = useCallback((index: number) => {
    setBetSlip((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update stake for a bet in slip
   */
  const updateStake = useCallback((index: number, stake: number) => {
    setBetSlip((prev) => {
      const newSlip = [...prev];
      const bet = newSlip[index];
      const validation = validateBet(stake, bet.odds, bet.market_type);

      if (!validation.valid) {
        toast({
          title: "Invalid Stake",
          description: validation.error,
          variant: "destructive",
        });
        return prev;
      }

      bet.stake = stake;
      bet.potential_profit = calculateProfit(
        stake,
        bet.odds,
        bet.bet_type,
        bet.market_type,
      );
      return newSlip;
    });
  }, []);

  /**
   * Clear bet slip
   */
  const clearBetSlip = useCallback(() => {
    setBetSlip([]);
  }, []);

  /**
   * Place all bets in slip
   */
  const placeBets = useCallback(async () => {
    if (betSlip.length === 0) {
      toast({
        title: "Empty Bet Slip",
        description: "Add bets to your slip before placing",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return;
    }

    // Calculate total stake
    const totalStake = betSlip.reduce((sum, bet) => sum + bet.stake, 0);

    if (totalStake > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${totalStake} but have ₹${balance}`,
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);

    try {
      // Use new sports betting service with wallet integration
      const result = await placeBetSlipWithWallet(betSlip, userId);

      if (result.success > 0) {
        toast({
          title: "Bets Placed",
          description: `${result.success} bet(s) placed successfully`,
        });

        // Update placed bets with successful ones
        result.results.forEach((res) => {
          if (res.success && res.bet) {
            setPlacedBets((prev) => [...prev, res.bet!]);
          }
        });

        // Clear bet slip
        clearBetSlip();
      }

      if (result.failed > 0) {
        toast({
          title: result.success > 0 ? "Some Bets Failed" : "All Bets Failed",
          description: `${result.failed} bet(s) failed to place`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to place bets:", error);
      toast({
        title: "Error",
        description: "Failed to place bets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  }, [betSlip, balance, userId, clearBetSlip]);

  /**
   * Calculate total stake in bet slip
   */
  const totalStake = betSlip.reduce((sum, bet) => sum + bet.stake, 0);

  /**
   * Calculate total potential profit
   */
  const totalPotentialProfit = betSlip.reduce(
    (sum, bet) => sum + bet.potential_profit,
    0,
  );

  /**
   * Calculate exposure (total liability for lay bets)
   */
  useEffect(() => {
    const totalExposure = betSlip.reduce((sum, bet) => {
      if (bet.bet_type === "LAY") {
        return sum + calculateLiability(bet.stake, bet.odds, bet.market_type);
      }
      return sum + bet.stake;
    }, 0);
    setExposure(totalExposure);
  }, [betSlip]);

  return {
    betSlip,
    placedBets,
    balance,
    exposure,
    isPlacingBet,
    totalStake,
    totalPotentialProfit,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    placeBets,
    setPlacedBets,
  };
}

/**
 * Quick bet helper - for single-click betting
 */
export function useQuickBet(userId?: string) {
  const [isPlacing, setIsPlacing] = useState(false);

  const placeBet = useCallback(
    async (
      eventId: number,
      eventName: string,
      marketId: string | number,
      marketName: string,
      marketType: MarketType,
      selection: string,
      odds: number,
      betType: BetType,
      stake: number,
      selectionId?: number,
    ) => {
      const validation = validateBet(stake, odds, marketType);
      if (!validation.valid) {
        toast({
          title: "Invalid Bet",
          description: validation.error,
          variant: "destructive",
        });
        return false;
      }

      setIsPlacing(true);

      try {
        const betPlacement: BetPlacement = {
          event_id: eventId,
          event_name: eventName,
          market_id: marketId,
          market_name: marketName,
          market_type: marketType,
          selection,
          selection_id: selectionId,
          stake,
          odds,
          bet_type: betType,
          user_id: userId,
        };

        const result = await enhancedPlacedBetsService.placeBet(betPlacement);

        if (result.success) {
          toast({
            title: "Bet Placed",
            description: `${selection} @ ${odds} - ₹${stake}`,
          });
          return true;
        } else {
          toast({
            title: "Bet Failed",
            description: result.message || "Failed to place bet",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Failed to place quick bet:", error);
        toast({
          title: "Error",
          description: "Failed to place bet. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsPlacing(false);
      }
    },
    [userId],
  );

  return { placeBet, isPlacing };
}
