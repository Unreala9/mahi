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
import type { BetSlipItem, PlacedBet } from "@/types/sports-betting";
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

  return (
    <Card className="overflow-hidden bg-card">
      <div className="bg-primary text-primary-foreground p-3">
        <h3 className="font-bold">Bet Slip ({betSlip.length})</h3>
      </div>

      {betSlip.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground min-h-[200px] flex flex-col justify-center">
          <p className="text-sm">Your bet slip is empty</p>
          <p className="text-xs mt-2">Click on odds to add bets</p>
        </div>
      ) : (
        <>
          {/* Header Actions */}
              <div className="p-2 flex justify-end border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-6 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Bets List */}
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {betSlip.map((bet, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-muted/50 transition-colors"
                    >
                      {/* Bet Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                bet.bet_type === "BACK"
                                  ? "default"
                                  : "destructive"
                              }
                              className={cn(
                                "text-xs px-1.5 py-0.5",
                                bet.bet_type === "BACK" &&
                                  "bg-blue-600 hover:bg-blue-700",
                                bet.bet_type === "LAY" &&
                                  "bg-pink-600 hover:bg-pink-700",
                              )}
                            >
                              {bet.bet_type}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {bet.market_type}
                            </span>
                          </div>
                          <p className="text-sm font-semibold line-clamp-1">
                            {bet.selection}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {bet.market_name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(index)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Odds & Stake */}
                      <div className="flex items-center gap-3 mb-3 bg-muted/30 p-2 rounded-md border">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            Odds
                          </span>
                          <span className="text-sm font-bold">{bet.odds}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase">
                              Stake
                            </span>
                            <div className="relative flex-1">
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
                                className="h-8 text-sm font-medium pr-8"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stake Buttons */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {[100, 500, 1000, 5000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStake(index, amount)}
                            className={cn(
                              "text-[10px] h-6 px-1",
                              bet.stake === amount &&
                                "bg-primary text-primary-foreground border-primary",
                            )}
                          >
                            +{amount}
                          </Button>
                        ))}
                      </div>

                      {/* Profit Display */}
                      <div className="flex justify-between items-center text-xs px-2 py-1 bg-green-500/10 text-green-700 rounded border border-green-500/20">
                        <span className="font-medium">Potential Profit</span>
                        <span className="font-bold">
                          ₹{bet.potential_profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t bg-muted/40 p-4 space-y-3">
                {/* Balance Info */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-mono font-medium">
                      ₹{balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Liability</span>
                    <span className="font-mono font-medium text-destructive">
                      {totalStake.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-2 mt-2">
                    <span className="text-muted-foreground font-medium">
                      Potential Win
                    </span>
                    <span className="font-mono font-bold text-green-600">
                      ₹{totalPotentialProfit.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Place Bets Button */}
                <Button
                  className={cn(
                    "w-full font-bold shadow-lg transition-all",
                    totalStake > balance ? "opacity-90" : "hover:scale-[1.02]",
                  )}
                  size="lg"
                  onClick={onPlaceBets}
                  disabled={isPlacingBet || totalStake > balance}
                >
                  {isPlacingBet ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Bets...
                    </div>
                  ) : totalStake > balance ? (
                    `Insufficient Balance`
                  ) : (
                    `Place Bets (₹${totalStake})`
                  )}
                </Button>
              </div>
            </>
          )}
    </Card>
  );
}
