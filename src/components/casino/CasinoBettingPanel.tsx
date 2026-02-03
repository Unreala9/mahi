/**
 * Reusable Casino Betting Panel
 * Works with any casino game using the universal hook
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, X, Check, Clock } from "lucide-react";
import type { CasinoMarket } from "@/hooks/useUniversalCasinoGame";

interface CasinoBettingPanelProps {
  markets: CasinoMarket[];
  onPlaceBet: (
    marketId: string,
    marketName: string,
    selection: string,
    odds: number,
    stake: number,
    betType: "BACK" | "LAY",
  ) => Promise<boolean>;
  placedBets: Map<string, any>;
  totalStake: number;
  potentialWin: number;
  onClearBets: () => void;
  isSuspended?: boolean;
  roundId?: string;
}

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

export function CasinoBettingPanel({
  markets,
  onPlaceBet,
  placedBets,
  totalStake,
  potentialWin,
  onClearBets,
  isSuspended = false,
  roundId,
}: CasinoBettingPanelProps) {
  const [selectedChip, setSelectedChip] = useState(100);
  const [localBets, setLocalBets] = useState<Map<string, number>>(new Map());
  const [lastBetStake, setLastBetStake] = useState<number>(0);

  const handleMarketClick = (market: CasinoMarket) => {
    if (market.gstatus === "SUSPENDED" || isSuspended) return;

    setLocalBets((prev) => {
      const next = new Map(prev);
      const currentStake = next.get(market.nat) || 0;
      next.set(market.nat, currentStake + selectedChip);
      setLastBetStake(selectedChip);
      return next;
    });
  };

  const handleRepeatLast = () => {
    if (lastBetStake === 0) return;
    setSelectedChip(lastBetStake);
  };

  const handleHalf = () => {
    setSelectedChip(Math.max(1, Math.floor(selectedChip / 2)));
  };

  const handleDouble = () => {
    setSelectedChip(Math.min(5000, selectedChip * 2));
  };

  const handleMax = () => {
    setSelectedChip(5000);
  };

  const handleMin = () => {
    setSelectedChip(10);
  };

  const handlePlaceAllBets = async () => {
    if (localBets.size === 0) return;

    const betPromises = Array.from(localBets.entries()).map(
      ([marketName, stake]) => {
        const market = markets.find((m) => m.nat === marketName);
        if (!market) return Promise.resolve(false);

        const odds = market.b / 100 || 1.9; // Convert odds format
        return onPlaceBet(
          market.sid.toString(),
          marketName,
          marketName,
          odds,
          stake,
          "BACK",
        );
      },
    );

    const results = await Promise.all(betPromises);

    if (results.every((r) => r)) {
      setLocalBets(new Map());
    }
  };

  const handleClearAll = () => {
    setLocalBets(new Map());
    onClearBets();
  };

  const localTotalStake = Array.from(localBets.values()).reduce(
    (sum, stake) => sum + stake,
    0,
  );

  const localPotentialWin = Array.from(localBets.entries()).reduce(
    (sum, [marketName, stake]) => {
      const market = markets.find((m) => m.nat === marketName);
      if (!market) return sum;
      const odds = market.b / 100 || 1.9;
      return sum + stake * odds;
    },
    0,
  );

  return (
    <div className="space-y-4">
      {/* Round ID & Status */}
      {roundId && (
        <Card className="p-3 bg-gray-800/50 border-blue-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Round ID</p>
              <p className="text-sm font-mono text-white">{roundId}</p>
            </div>
            {isSuspended && (
              <Badge variant="destructive" className="animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Suspended
              </Badge>
            )}
            {!isSuspended && (
              <Badge className="bg-green-600">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Markets/Betting Options */}
      <Card className="p-4 bg-gray-800/50 border-blue-600/30">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Live Odds
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {markets.map((market) => {
            const localStake = localBets.get(market.nat) || 0;
            const placedStake =
              placedBets.get(market.sid.toString())?.stake || 0;
            const totalMarketStake = localStake + placedStake;
            const odds = market.b / 100 || 1.9;
            const isSuspended = market.gstatus === "SUSPENDED";

            return (
              <Button
                key={market.sid}
                variant="outline"
                className={cn(
                  "h-auto p-3 flex flex-col items-center gap-2 transition-all",
                  isSuspended && "opacity-50 cursor-not-allowed",
                  !isSuspended && "hover:bg-blue-600/20 hover:border-blue-500",
                  totalMarketStake > 0 && "bg-blue-600/30 border-blue-500",
                )}
                onClick={() => handleMarketClick(market)}
                disabled={isSuspended}
              >
                <span className="text-white font-semibold">{market.nat}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isSuspended ? "secondary" : "default"}
                    className={cn(
                      "text-sm font-bold",
                      !isSuspended && "bg-blue-600",
                    )}
                  >
                    {odds.toFixed(2)}
                  </Badge>
                  {totalMarketStake > 0 && (
                    <Badge className="bg-green-600">₹{totalMarketStake}</Badge>
                  )}
                </div>
                {isSuspended && (
                  <span className="text-xs text-red-400">Suspended</span>
                )}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Chip Selection */}
      <Card className="p-4 bg-gray-800/50 border-blue-600/30">
        <h3 className="text-white font-semibold mb-3">Select Chip</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {CHIP_VALUES.map((chip) => (
            <Button
              key={chip}
              variant={selectedChip === chip ? "default" : "outline"}
              className={cn(
                "h-12 text-lg font-bold",
                selectedChip === chip
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "hover:bg-gray-700",
              )}
              onClick={() => setSelectedChip(chip)}
            >
              ₹{chip}
            </Button>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-semibold">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="h-10 text-sm hover:bg-purple-600/20 border-purple-600/30"
              onClick={handleRepeatLast}
              disabled={lastBetStake === 0}
            >
              🔁 Repeat
            </Button>
            <Button
              variant="outline"
              className="h-10 text-sm hover:bg-orange-600/20 border-orange-600/30"
              onClick={handleHalf}
            >
              ➗ Half
            </Button>
            <Button
              variant="outline"
              className="h-10 text-sm hover:bg-green-600/20 border-green-600/30"
              onClick={handleDouble}
            >
              ✖️ Double
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 text-sm hover:bg-red-600/20 border-red-600/30"
              onClick={handleMin}
            >
              ➖ Min (₹10)
            </Button>
            <Button
              variant="outline"
              className="h-10 text-sm hover:bg-yellow-600/20 border-yellow-600/30"
              onClick={handleMax}
            >
              ➕ Max (₹5000)
            </Button>
          </div>
        </div>
      </Card>

      {/* Bet Summary & Actions */}
      {localTotalStake > 0 && (
        <Card className="p-4 bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-600/50">
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Total Stake:</span>
              <span className="font-bold">₹{localTotalStake.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Potential Win:</span>
              <span className="font-bold">₹{localPotentialWin.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClearAll}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handlePlaceAllBets}
                disabled={isSuspended}
              >
                <Check className="w-4 h-4 mr-2" />
                Place Bets
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Placed Bets Summary */}
      {placedBets.size > 0 && (
        <Card className="p-4 bg-gray-800/50 border-green-600/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Active Bets
          </h3>
          <div className="space-y-2">
            {Array.from(placedBets.entries()).map(([marketId, bet]) => (
              <div
                key={marketId}
                className="flex justify-between items-center p-2 bg-green-900/20 rounded border border-green-600/30"
              >
                <span className="text-white text-sm">{bet.marketName}</span>
                <div className="flex gap-2">
                  <Badge className="bg-blue-600">@ {bet.odds.toFixed(2)}</Badge>
                  <Badge className="bg-green-600">₹{bet.stake}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
