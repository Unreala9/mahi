import { useState, useCallback } from "react";

export interface Bet {
    id: string;
    matchId: number;
    matchName: string;
    selection: string;
    betType: "back" | "lay";
    odds: number;
    stake: number;
    potentialReturn?: number;
    status: "pending" | "matched" | "unmatched";
    timestamp: number;
}

export interface BetSelection {
    matchId: number;
    matchName: string;
    selection: string;
    betType: "back" | "lay";
    odds: number;
    stake: number;
}

export function useBetSlip() {
    const [currentBet, setCurrentBet] = useState<BetSelection | null>(null);
    const [myBets, setMyBets] = useState<Bet[]>([]);
    const [matchedBets, setMatchedBets] = useState<Bet[]>([]);

    const selectBet = useCallback((bet: BetSelection) => {
        setCurrentBet(bet);
    }, []);

    const updateOdds = useCallback((odds: number) => {
        setCurrentBet((prev) => (prev ? { ...prev, odds } : null));
    }, []);

    const updateStake = useCallback((stake: number) => {
        setCurrentBet((prev) => (prev ? { ...prev, stake } : null));
    }, []);

    const incrementStake = useCallback((amount: number) => {
        setCurrentBet((prev) => {
            if (!prev) return null;
            return { ...prev, stake: prev.stake + amount };
        });
    }, []);

    const clearBet = useCallback(() => {
        setCurrentBet((prev) => {
            if (!prev) return null;
            return { ...prev, stake: 0 };
        });
    }, []);

    const resetBet = useCallback(() => {
        setCurrentBet(null);
    }, []);

    const submitBet = useCallback(() => {
        if (!currentBet || currentBet.stake <= 0) {
            return false;
        }

        const newBet: Bet = {
            id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            matchId: currentBet.matchId,
            matchName: currentBet.matchName,
            selection: currentBet.selection,
            betType: currentBet.betType,
            odds: currentBet.odds,
            stake: currentBet.stake,
            potentialReturn:
                currentBet.betType === "back"
                    ? currentBet.stake * currentBet.odds
                    : currentBet.stake,
            status: "pending",
            timestamp: Date.now(),
        };

        // Add to my bets
        setMyBets((prev) => [newBet, ...prev]);

        // Simulate matching (in real app, this would be handled by backend)
        setTimeout(() => {
            setMyBets((prev) =>
                prev.map((bet) =>
                    bet.id === newBet.id ? { ...bet, status: "matched" } : bet
                )
            );
            setMatchedBets((prev) => [
                { ...newBet, status: "matched" },
                ...prev,
            ]);
        }, 1000);

        // Clear current bet after submission
        setCurrentBet(null);
        return true;
    }, [currentBet]);

    const removeBet = useCallback((betId: string) => {
        setMyBets((prev) => prev.filter((bet) => bet.id !== betId));
    }, []);

    const getPotentialReturn = useCallback(() => {
        if (!currentBet || currentBet.stake <= 0) return 0;
        if (currentBet.betType === "back") {
            return currentBet.stake * currentBet.odds;
        }
        return currentBet.stake;
    }, [currentBet]);

    return {
        currentBet,
        myBets,
        matchedBets,
        selectBet,
        updateOdds,
        updateStake,
        incrementStake,
        clearBet,
        resetBet,
        submitBet,
        removeBet,
        getPotentialReturn,
    };
}
