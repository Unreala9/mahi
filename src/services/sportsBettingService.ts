// src/services/sportsBettingService.ts
import { bettingService, type BetPlacement } from "./bettingService";
import { diamondApi } from "./diamondApi";
import type { BetSlipItem } from "@/types/sports-betting";

export interface SportsBet {
  eventId: number;
  eventName: string;
  marketId: string | number;
  marketName: string;
  marketType: string;
  selection: string;
  selectionId?: number;
  odds: number;
  stake: number;
  betType: "BACK" | "LAY";
}

export interface SportsBetResult {
  success: boolean;
  betId?: string;
  balance?: number;
  error?: string;
}

export async function placeSportsBetWithWallet(
  bet: SportsBet,
  userId: string,
): Promise<SportsBetResult> {
  try {
    if (bet.stake < 100)
      return { success: false, error: "Minimum stake is ₹100" };
    if (bet.stake > 25000)
      return { success: false, error: "Maximum stake is ₹25,000" };

    const betData: BetPlacement = {
      gameType: "SPORTS",
      gameId: "sports",
      gameName: bet.eventName,
      marketId: String(bet.marketId),
      marketName: bet.marketName,
      selection: bet.selection,
      selectionId: String(bet.selectionId ?? "0"),
      odds: bet.odds,
      stake: bet.stake,
      betType: bet.betType,
      eventId: String(bet.eventId),
      eventName: bet.eventName,
    };

    console.log("[SportsBetting] Placing bet:", betData);
    const res = await bettingService.placeBet(betData);

    if (!res.success) {
      console.error("[SportsBetting] Bet placement failed:", res.error);
      return { success: false, error: res.error || "Failed to place bet" };
    }

    console.log("[SportsBetting] ✅ Bet placed successfully:", res.betId);

    // CRITICAL: Register bet with provider API
    // This MUST happen for results to be available later
    try {
      console.log("[SportsBetting] Registering bet with provider...");
      const registration = await diamondApi.registerPlacedBet({
        event_id: Number(bet.eventId),
        event_name: bet.eventName,
        market_id: Number(bet.marketId),
        market_name: bet.marketName,
        market_type: bet.marketType,
      });

      if (registration.success) {
        console.log("[SportsBetting] ✅ Bet registered with provider");
      } else {
        console.warn(
          "[SportsBetting] ⚠️ Bet registration failed:",
          registration.error,
        );
        // Don't fail the bet, but log the warning
      }
    } catch (regError) {
      console.error("[SportsBetting] ❌ Bet registration error:", regError);
      // Don't fail the bet, but log the error
    }

    return { success: true, betId: res.betId, balance: res.balance };
  } catch (err: any) {
    console.error("[SportsBetting] Exception:", err);
    return { success: false, error: err?.message || "Failed to place bet" };
  }
}

export async function placeBetSlipWithWallet(
  betSlip: BetSlipItem[],
  userId: string,
): Promise<{
  success: number;
  failed: number;
  results: SportsBetResult[];
  finalBalance?: number;
}> {
  const results: SportsBetResult[] = [];
  let success = 0;
  let failed = 0;
  let finalBalance: number | undefined;

  for (const item of betSlip) {
    const bet: SportsBet = {
      eventId: item.event_id,
      eventName: item.event_name,
      marketId: item.market_id,
      marketName: item.market_name,
      marketType: item.market_type,
      selection: item.selection,
      selectionId: item.selection_id,
      odds: item.odds,
      stake: item.stake,
      betType: item.bet_type,
    };

    const r = await placeSportsBetWithWallet(bet, userId);
    results.push(r);

    if (r.success) {
      success++;
      finalBalance = r.balance;
    } else {
      failed++;
    }
  }

  return { success, failed, results, finalBalance };
}
