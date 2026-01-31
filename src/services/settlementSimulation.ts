/**
 * Settlement Simulation Service - FIXED VERSION
 * Uses the existing wallet edge functions instead of direct Supabase updates
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { callEdgeFunction } from "@/lib/edge";

export interface SettlementResult {
    success: boolean;
    settledCount: number;
    wonCount: number;
    lostCount: number;
    totalPayout: number;
    totalLoss: number;
    message: string;
}

/**
 * Settle a bet using the wallet edge function (same as bet placement uses)
 */
async function settleBetWithWallet(
    betId: string,
    status: "won" | "lost" | "void",
    payout: number,
    score?: number
): Promise<boolean> {
    try {
        console.log(`[Settlement] Calling edge function for bet ${betId}...`);

        const result = await callEdgeFunction(
            "bet-settlement?action=settle",
            {
                betId,
                status,
                // For Fancy bets, we might need to pass the score if we want the backend to determine win/loss
                // But this simulation function determines win/loss locally.
                // My backend logic recalculates win/loss if score is provided for Fancy.
                // If I pass 'status', does backend override it?
                // My backend: "let finalStatus = settlementData.status;" ... "if (bet.bet_on === 'fancy' && settlementData.score !== undefined) { ... finalStatus = ... }"
                // So if I pass score, backend re-evaluates. If I don't, it trusts 'status'.
                // I'll trust the simulation's status for now, but for Fancy I should probably pass score to be safe if I had it.
                // For now, I'll just pass status.
                score,
            },
            { method: "POST" }
        );

        if (!result?.success) {
            console.error("[Settlement] Edge function failed:", result);
            return false;
        }

        console.log(`[Settlement] Edge function success. Balance: ${result.balance}`);
        return true;
    } catch (error) {
        console.error("[Settlement] Error:", error);
        return false;
    }
}

/**
 * Simulates match settlement by randomly determining winners and losers
 */
export async function simulateMatchSettlement(
    matchId: string,
    winnerSelectionId?: number
): Promise<SettlementResult> {
    try {
        console.log("[Settlement] Starting settlement for match:", matchId);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                settledCount: 0,
                wonCount: 0,
                lostCount: 0,
                totalPayout: 0,
                totalLoss: 0,
                message: "User not logged in",
            };
        }

        // Get all pending bets for this match
        // Note: Using 'event' field since event_id/game_id are null in existing bets
        const { data: matchBets, error } = await supabase
            .from("bets")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "pending")
            .eq("event", matchId);

        if (error || !matchBets || matchBets.length === 0) {
            return {
                success: false,
                settledCount: 0,
                wonCount: 0,
                lostCount: 0,
                totalPayout: 0,
                totalLoss: 0,
                message: "No pending bets found",
            };
        }

        let wonCount = 0;
        let lostCount = 0;
        let totalPayout = 0;
        let totalLoss = 0;

        // Randomly select a winner from the 'selection' field (e.g., "0", "1")
        const selections = [...new Set(matchBets.map((bet: any) => bet.selection))];
        const winningSelection = winnerSelectionId ? winnerSelectionId.toString() : selections[Math.floor(Math.random() * selections.length)];

        console.log("[Settlement] Winner selection:", winningSelection);
        console.log("[Settlement] Settling", matchBets.length, "bets");

        // Settle each bet
        for (const bet of matchBets) {
            const betSelection = bet.selection; // Use 'selection' field
            const betType = bet.bet_type || bet.betType;
            const stake = parseFloat(bet.stake);
            const odds = parseFloat(bet.odds);

            const isWinner = betSelection === winningSelection;

            if (isWinner) {
                // Calculate profit
                let profit = 0;
                if (betType === "BACK" || betType === "back") {
                    profit = (odds - 1) * stake;
                } else if (betType === "LAY" || betType === "lay") {
                    profit = -(odds - 1) * stake; // LAY loses when selection wins
                }

                const payout = stake + profit;
                await settleBetWithWallet(bet.id, "won", payout);

                wonCount++;
                totalPayout += payout;
                console.log(`✅ Bet ${bet.id} WON - Payout: ₹${payout.toFixed(2)}`);
            } else {
                // Bet lost
                await settleBetWithWallet(bet.id, "lost", 0);

                lostCount++;
                const loss = (betType === "BACK" || betType === "back") ? stake : (odds - 1) * stake;
                totalLoss += loss;
                console.log(`❌ Bet ${bet.id} LOST - Loss: ₹${loss.toFixed(2)}`);
            }
        }

        return {
            success: true,
            settledCount: matchBets.length,
            wonCount,
            lostCount,
            totalPayout,
            totalLoss,
            message: `Settled ${matchBets.length} bets: ${wonCount} won, ${lostCount} lost`,
        };
    } catch (error: any) {
        console.error("[Settlement] Error:", error);
        return {
            success: false,
            settledCount: 0,
            wonCount: 0,
            lostCount: 0,
            totalPayout: 0,
            totalLoss: 0,
            message: error.message || "Settlement failed",
        };
    }
}

/**
 * Auto-settle with toast notification
 */
export async function autoSettleMatch(matchId: string): Promise<SettlementResult> {
    const result = await simulateMatchSettlement(matchId);

    if (result.success) {
        toast({
            title: "🎯 Match Settled!",
            description: `${result.message}\nPayout: ₹${result.totalPayout.toFixed(2)}`,
        });
    } else {
        toast({
            title: "❌ Settlement Failed",
            description: result.message,
            variant: "destructive",
        });
    }

    return result;
}

export const settlementSimulation = {
    simulateMatchSettlement,
    autoSettleMatch,
};
