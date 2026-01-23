/**
 * Card Game Layout - For games like Dragon Tiger, Teen Patti, Andar Bahar, Baccarat
 * Features: Card displays, side-by-side betting, result history circles
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trophy, Clock, Circle } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface CardGameLayoutProps {
  gameInfo: { name: string; category: string; description: string };
  liveData: CasinoLiveData | null;
  results: any;
  onPlaceBet: (
    sid: number,
    nat: string,
    odds: number,
    type: "back" | "lay",
    stake: number,
  ) => Promise<void>;
}

export function CardGameLayout({
  gameInfo,
  liveData,
  results,
  onPlaceBet,
}: CardGameLayoutProps) {
  const [selectedBet, setSelectedBet] = useState<{
    sid: number;
    nat: string;
    odds: number;
    type: "back" | "lay";
  } | null>(null);
  const [stake, setStake] = useState(100);
  const [placing, setPlacing] = useState(false);

  const handlePlaceBet = async () => {
    if (!selectedBet) return;
    setPlacing(true);
    try {
      await onPlaceBet(
        selectedBet.sid,
        selectedBet.nat,
        selectedBet.odds,
        selectedBet.type,
        stake,
      );
      setSelectedBet(null);
      setStake(100);
    } finally {
      setPlacing(false);
    }
  };

  const lastResults = results?.lastresult || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Game Area - 3 columns */}
      <div className="lg:col-span-3 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{gameInfo.name}</h1>
              <Button variant="outline" size="sm" className="text-xs">
                Rules
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Round ID</p>
                <p className="text-sm font-mono text-white">
                  {liveData?.mid || "Loading..."}
                </p>
              </div>
              {liveData?.gstatus === "1" && (
                <Badge className="bg-green-600 animate-pulse">
                  <Circle className="w-2 h-2 mr-1 fill-current" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Total Display */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-0">
          <div className="p-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-white/90 mb-1">TOTAL</p>
              <p className="text-6xl font-bold text-white drop-shadow-lg">
                {liveData?.C1 ? (liveData.C1 as any[]).length : 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Card Display Area */}
        <div className="grid grid-cols-2 gap-4">
          {liveData?.t1 &&
            liveData.t1.map((runner, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center uppercase">
                    {runner.nat}
                  </h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {/* Placeholder cards */}
                    {[1, 2].map((card) => (
                      <div
                        key={card}
                        className="w-16 h-24 bg-white rounded-lg border-2 border-slate-300 shadow-lg flex items-center justify-center"
                      >
                        <div className="text-4xl">🂠</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* Betting Area */}
        <Card className="bg-slate-900 border-slate-700">
          <div className="grid grid-cols-2 divide-x divide-slate-700">
            {liveData?.t1 &&
              liveData.t1.map((runner, idx) => {
                const backOdds = runner.b1?.[0];
                const layOdds = runner.l1?.[0];
                const backPrice =
                  backOdds?.rate || backOdds?.odds || backOdds?.price || 0;
                const layPrice =
                  layOdds?.rate || layOdds?.odds || layOdds?.price || 0;

                return (
                  <div key={idx} className="p-6">
                    <h4 className="text-lg font-bold text-white mb-4 text-center">
                      {runner.nat}
                    </h4>
                    <Button
                      size="lg"
                      className="w-full h-24 text-3xl font-bold bg-blue-500 hover:bg-blue-600"
                      disabled={runner.gstatus !== "1"}
                      onClick={() =>
                        setSelectedBet({
                          sid: runner.sid,
                          nat: runner.nat,
                          odds: backPrice,
                          type: "back",
                        })
                      }
                    >
                      {backPrice.toFixed(2)}
                    </Button>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* 3 Card Total Section */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">3 Card Total</h4>
              <div className="flex gap-4">
                <Button className="bg-pink-400 hover:bg-pink-500 text-black font-bold px-8">
                  <div className="text-center">
                    <div className="text-2xl">21</div>
                    <div className="text-xs">100</div>
                  </div>
                </Button>
                <Button className="bg-blue-400 hover:bg-blue-500 text-black font-bold px-8">
                  <div className="text-center">
                    <div className="text-2xl">21</div>
                    <div className="text-xs">80</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Last Result */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white">Last Result</h4>
              <Button variant="link" className="text-blue-400">
                View All
              </Button>
            </div>
            <div className="flex gap-2 justify-center">
              {lastResults.slice(0, 10).map((result: any, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                    result === "L"
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white",
                  )}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* My Bet Sidebar - 1 column */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-6">My Bet</h3>

            {selectedBet ? (
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Matched Bet</p>
                  <p className="text-lg font-bold text-white">
                    {selectedBet.nat}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-400">Odds</span>
                    <span className="font-mono font-bold text-white">
                      {selectedBet.odds.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    Stake
                  </label>
                  <Input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700 border-slate-600 text-white"
                    min={100}
                    step={100}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        onClick={() => setStake(amount)}
                        className="border-slate-600"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-600/20 p-4 rounded-lg border border-green-600">
                  <p className="text-sm text-green-400 mb-1">Potential Win</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₹{(stake * (selectedBet.odds - 1)).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handlePlaceBet}
                    disabled={placing || stake < 100}
                  >
                    {placing ? "Placing..." : "Place Bet"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-600"
                    onClick={() => setSelectedBet(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">Select a bet to get started</p>
              </div>
            )}

            {/* Timer */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Time Left</span>
                </div>
                <span className="text-2xl font-mono font-bold text-white">
                  {liveData?.autotime || 0}s
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
