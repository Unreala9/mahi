// src/services/bettingLogicService.ts
import { useState, useCallback, useEffect } from "react";
import type {
  BetSlipItem,
  PlacedBet,
  MarketType,
  BetType,
} from "@/types/sports-betting";
import { toast } from "@/hooks/use-toast";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { placeBetSlipWithWallet } from "./sportsBettingService";
import { bettingService } from "./bettingService";

// Betting limits and rules
export const BETTING_RULES = {
  MIN_STAKE: 100,
  MAX_STAKE: 25000,
  MAX_PROFIT: 100000,
  MIN_ODDS: 1.01,
  MAX_ODDS: 1000,
};

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

export function calculateProfit(
  stake: number,
  odds: number,
  betType: BetType,
  marketType: MarketType,
): number {
  if (marketType === "FANCY" || marketType === "SESSION") {
    if (betType === "BACK") return (stake * odds) / 100;
    return stake;
  }

  // match odds / bookmaker
  if (betType === "BACK") return stake * (odds - 1);
  return stake * (odds - 1);
}

export function calculateLiability(
  stake: number,
  odds: number,
  marketType: MarketType,
): number {
  if (marketType === "FANCY" || marketType === "SESSION") {
    return (stake * odds) / 100;
  }
  return stake * (odds - 1);
}

export function validateBet(
  stake: number,
  odds: number,
  marketType: MarketType,
): { valid: boolean; error?: string } {
  const rules = MARKET_RULES[marketType];

  if (stake < rules.min)
    return { valid: false, error: `Minimum stake is ₹${rules.min}` };
  if (stake > rules.max)
    return { valid: false, error: `Maximum stake is ₹${rules.max}` };
  if (odds < BETTING_RULES.MIN_ODDS)
    return { valid: false, error: `Minimum odds is ${BETTING_RULES.MIN_ODDS}` };
  if (odds > BETTING_RULES.MAX_ODDS)
    return { valid: false, error: `Maximum odds is ${BETTING_RULES.MAX_ODDS}` };

  const profit = calculateProfit(stake, odds, "BACK", marketType);
  if (profit > rules.maxProfit) {
    return { valid: false, error: `Maximum profit is ₹${rules.maxProfit}` };
  }

  return { valid: true };
}

export function useBettingLogic(userId?: string, eventId?: number) {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [exposure, setExposure] = useState(0);

  const { data: balance = 0 } = useWalletBalance();

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
      const existing = betSlip.find(
        (b) =>
          b.event_id === eventId &&
          b.market_id === marketId &&
          b.selection === selection &&
          b.bet_type === betType,
      );

      if (existing) {
        toast({
          title: "Already in Bet Slip",
          description: "This bet is already in your bet slip",
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

  const removeFromBetSlip = useCallback((index: number) => {
    setBetSlip((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateStake = useCallback((index: number, stake: number) => {
    setBetSlip((prev) => {
      const copy = [...prev];
      const bet = copy[index];

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
      return copy;
    });
  }, []);

  const clearBetSlip = useCallback(() => setBetSlip([]), []);

  const fetchMyBets = useCallback(async () => {
    if (!userId) {
      console.log("[BettingLogic] No userId, skipping fetch");
      return;
    }
    try {
      console.log(
        "[BettingLogic] Fetching my bets for userId:",
        userId,
        "eventId:",
        eventId,
      );
      const allBets = await bettingService.getMyBets(50, 0);
      console.log("[BettingLogic] All fetched bets:", allBets);

      // Filter for this specific event if eventId provided
      const filteredBets = eventId
        ? allBets.filter((bet) => {
            // Check various possible field names for event_id
            const betEventId =
              bet.event_id || bet.eventId || bet.match_id || bet.matchId;
            // Compare as both number and string since backend might store as string
            return (
              betEventId == eventId || String(betEventId) === String(eventId)
            );
          })
        : allBets;

      console.log(
        "[BettingLogic] Filtered bets for event",
        eventId,
        ":",
        filteredBets,
      );
      setPlacedBets(filteredBets);
    } catch (error) {
      console.error("Failed to fetch bets", error);
    }
  }, [userId, eventId]);

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

    const totalStake = betSlip.reduce((sum, b) => sum + b.stake, 0);

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
      const result = await placeBetSlipWithWallet(betSlip, userId);

      // ✅ log everything so we can see exact reason
      console.log("[BettingLogic] placeBetSlipWithWallet result:", result);

      const failedErrors = (result.results || [])
        .filter((r) => !r.success)
        .map((r) => r.error)
        .filter(Boolean) as string[];

      if (result.success > 0) {
        toast({
          title: "✅ Bets Placed",
          description: `${result.success} bet(s) placed successfully`,
        });

        // Clear slip on success
        clearBetSlip();
      }

      if (result.failed > 0) {
        // ✅ show real error message (first error)
        toast({
          title:
            result.success > 0 ? "⚠️ Some Bets Failed" : "❌ All Bets Failed",
          description:
            failedErrors[0] || `${result.failed} bet(s) failed to place`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("[BettingLogic] placeBets exception:", err);

      let msg = "Failed to place bets. Please try again.";
      try {
        const parsed = JSON.parse(String(err?.message || err));
        msg = parsed?.body?.error || parsed?.message || msg;
      } catch {}

      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsPlacingBet(false);
      // Refresh bets after a short delay to ensure backend has processed
      setTimeout(() => {
        fetchMyBets();
      }, 500);
    }
  }, [betSlip, balance, userId, clearBetSlip, fetchMyBets]);

  useEffect(() => {
    fetchMyBets();
  }, [fetchMyBets]);

  const totalStake = betSlip.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPotentialProfit = betSlip.reduce(
    (sum, bet) => sum + bet.potential_profit,
    0,
  );

  useEffect(() => {
    const totalExposure = betSlip.reduce((sum, bet) => {
      if (bet.bet_type === "LAY")
        return sum + calculateLiability(bet.stake, bet.odds, bet.market_type);
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
    fetchMyBets,
    setPlacedBets,
  };
}
