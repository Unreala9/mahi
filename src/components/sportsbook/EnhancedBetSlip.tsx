/**
 * Enhanced Bet Slip Component for Diamond API
 * Comprehensive bet slip with full betting features
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, Check } from "lucide-react";
import type { BetSlipItem } from "@/types/sports-betting";
import { cn } from "@/lib/utils";
import { MARKET_RULES } from "@/services/bettingLogicService";

interface EnhancedBetSlipProps {
  betSlip: BetSlipItem[];
  balance: number;
  exposure: number;
  isPlacingBet: boolean;
  totalStake: number;
  totalPotentialProfit: number;
  onRemove: (index: number) => void;
  onUpdateStake: (index: number, stake: number) => void;
  onPlaceBets: () => void;
  onClear: () => void;
}

export function EnhancedBetSlip({
  betSlip,
  balance,
  exposure,
  isPlacingBet,
  totalStake,
  totalPotentialProfit,
  onRemove,
  onUpdateStake,
  onPlaceBets,
  onClear,
}: EnhancedBetSlipProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (betSlip.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Your bet slip is empty</p>
          <p className="text-xs mt-2">Click on odds to add bets</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
        <h3 className="font-semibold">Bet Slip ({betSlip.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Bets List */}
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {betSlip.map((bet, index) => (
            <div key={index} className="p-3">
              {/* Bet Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        bet.bet_type === "BACK" ? "default" : "destructive"
                      }
                      className={cn(
                        "text-xs",
                        bet.bet_type === "BACK" && "bg-blue-500",
                        bet.bet_type === "LAY" && "bg-pink-500",
                      )}
                    >
                      {bet.bet_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {bet.market_type}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{bet.selection}</p>
                  <p className="text-xs text-muted-foreground">
                    {bet.market_name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Odds */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Odds:</span>
                <span className="text-sm font-bold">{bet.odds}</span>
              </div>

              {/* Stake Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={bet.stake}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      onUpdateStake(index, value);
                    }}
                    onFocus={() => setEditingIndex(index)}
                    onBlur={() => setEditingIndex(null)}
                    min={MARKET_RULES[bet.market_type].min}
                    max={MARKET_RULES[bet.market_type].max}
                    className="text-sm"
                  />
                  {editingIndex === index && (
                    <Button
                      size="sm"
                      onClick={() => setEditingIndex(null)}
                      className="h-8"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Quick Stake Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStake(index, amount)}
                      className="text-xs h-7"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Profit Display */}
              <div className="mt-2 p-2 bg-muted rounded">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Potential Profit:
                  </span>
                  <span className="font-semibold text-green-600">
                    ₹{bet.potential_profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3 space-y-3">
        {/* Balance Info */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-semibold">₹{balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Stake:</span>
            <span className="font-semibold">₹{totalStake.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exposure:</span>
            <span className="font-semibold text-orange-600">
              ₹{exposure.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-muted-foreground">Potential Win:</span>
            <span className="font-bold text-green-600">
              ₹{totalPotentialProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Place Bets Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={onPlaceBets}
          disabled={isPlacingBet || totalStake > balance}
        >
          {isPlacingBet ? "Placing Bets..." : "Place Bets"}
        </Button>

        {totalStake > balance && (
          <p className="text-xs text-destructive text-center">
            Insufficient balance
          </p>
        )}
      </div>
    </Card>
  );
}
