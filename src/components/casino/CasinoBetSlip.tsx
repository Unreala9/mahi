import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChipAmount } from "@/components/ui/CasinoChip";

export interface CasinoBetItem {
  id: string;
  marketId: string;
  marketName: string;
  selectionName: string;
  odds: number;
  stake: number;
  type: "BACK" | "LAY";
}

interface CasinoBetSlipProps {
  bets: CasinoBetItem[];
  balance: number;
  onRemove: (id: string) => void;
  onUpdateStake: (id: string, stake: number) => void;
  onPlaceBets: () => void;
  onClear: () => void;
  isPlacing: boolean;
}

export function CasinoBetSlip({
  bets,
  balance,
  onRemove,
  onUpdateStake,
  onPlaceBets,
  onClear,
  isPlacing,
}: CasinoBetSlipProps) {
  // Calculate totals
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPotentialWin = bets.reduce(
    (sum, bet) => sum + (bet.stake * bet.odds - bet.stake),
    0,
  );
  const liability = totalStake;

  return (
    <div className="bg-[#0a1929] border border-gray-800 rounded-md shadow-2xl flex flex-col h-full max-h-[calc(100vh-100px)] overflow-hidden">
      {/* Yellow Header */}
      <div className="bg-[#ffeb3b] p-3 flex justify-between items-center">
        <h3 className="font-bold text-base text-black">
          Bet Slip ({bets.length})
        </h3>
        {bets.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Clear All</span>
          </button>
        )}
      </div>

      {bets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
          <p className="text-sm text-center">Click on odds to add selections</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Bets ScrollArea */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-800/50">
              {bets.map((bet) => (
                <div
                  key={bet.id}
                  className="p-4 bg-[#0f1f2e] hover:bg-[#152532] transition-colors relative group"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => onRemove(bet.id)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-white transition-opacity opacity-70 hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Bet Type Badge & Market Type */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        bet.type === "BACK"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-pink-600 hover:bg-pink-700",
                      )}
                    >
                      {bet.type}
                    </Badge>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                      MATCH_ODDS
                    </span>
                  </div>

                  {/* Selection Name */}
                  <h4 className="text-white font-bold text-sm mb-0.5 pr-6">
                    {bet.selectionName}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">Match Odds</p>

                  {/* Odds and Stake Row */}
                  <div className="bg-[#0a1520] rounded-md p-3 mb-3 flex items-end gap-3">
                    {/* ODDS */}
                    <div className="flex-shrink-0">
                      <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1 tracking-wide">
                        Odds
                      </label>
                      <div className="text-white font-bold text-lg">
                        {bet.odds.toFixed(2)}
                      </div>
                    </div>

                    {/* STAKE */}
                    <div className="flex-1">
                      <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1 tracking-wide">
                        Stake
                      </label>
                      <Input
                        type="number"
                        value={bet.stake}
                        onChange={(e) =>
                          onUpdateStake(bet.id, parseFloat(e.target.value) || 0)
                        }
                        className="bg-transparent border-0 border-b-2 border-gray-700 rounded-none text-white font-bold text-lg h-7 px-0 focus-visible:ring-0 focus-visible:border-yellow-400"
                      />
                    </div>
                  </div>

                  {/* Quick Stake Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[100, 500, 1000, 5000].map((amount) => {
                      const isActive = bet.stake === amount;
                      return (
                        <button
                          key={amount}
                          onClick={() => onUpdateStake(bet.id, amount)}
                          className={cn(
                            "py-1.5 text-xs font-bold rounded transition-all",
                            isActive
                              ? "bg-yellow-400 text-black border border-yellow-400"
                              : "bg-[#1a2938] text-gray-300 border border-gray-700 hover:border-gray-600",
                          )}
                        >
                          +{amount}
                        </button>
                      );
                    })}
                  </div>

                  {/* Potential Profit */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-500 font-medium">
                      Potential Profit
                    </span>
                    <span className="text-green-400 font-bold">
                      ₹{(bet.stake * bet.odds - bet.stake).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer Summary */}
          <div className="bg-[#0f1f2e] border-t border-gray-800/50 p-4 space-y-2.5">
            {/* Balance */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Balance</span>
              <span className="text-white font-mono font-semibold">
                <ChipAmount amount={balance} size="sm" />
              </span>
            </div>
            {/* Liability */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Liability</span>
              <span className="text-red-500 font-mono font-bold">
                {liability.toFixed(2)}
              </span>
            </div>
            {/* Potential Win */}
            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-700/50">
              <span className="text-gray-300 font-medium">Potential Win</span>
              <span className="text-green-400 font-mono font-bold">
                ₹{totalPotentialWin.toFixed(2)}
              </span>
            </div>
            {/* Place Bets Button */}
            <Button
              onClick={onPlaceBets}
              disabled={isPlacing || totalStake > balance || totalStake <= 0}
              className={cn(
                "w-full bg-[#ffeb3b] hover:bg-[#fdd835] text-black font-bold text-base py-6 mt-3 rounded shadow-lg",
                (isPlacing || totalStake > balance || totalStake <= 0) &&
                  "opacity-50 cursor-not-allowed",
              )}
            >
              {isPlacing
                ? "Placing..."
                : `Place Bets (₹${totalStake.toFixed(0)})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
