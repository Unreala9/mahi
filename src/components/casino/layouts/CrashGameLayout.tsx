/**
 * Crash Game Layout - For JBEX, Cricket X, Football X, Aviator, Tower X, etc.
 * Features: Live multiplier graph, auto cashout, bet history, live stats
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, DollarSign, Zap, Users, Target } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface CrashGameLayoutProps {
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

export function CrashGameLayout({
  gameInfo,
  liveData,
  results,
  onPlaceBet,
}: CrashGameLayoutProps) {
  const [stake, setStake] = useState(100);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [betPlaced, setBetPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);

  // Simulate multiplier increase
  useEffect(() => {
    if (liveData?.gstatus === "1" && betPlaced) {
      const interval = setInterval(() => {
        setCurrentMultiplier((prev) => {
          const newValue = prev + 0.01;
          if (newValue >= autoCashout) {
            handleCashout();
            return prev;
          }
          return newValue;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [liveData?.gstatus, betPlaced, autoCashout]);

  const handlePlaceBet = async () => {
    if (!liveData?.t1?.[0]) return;
    setPlacing(true);
    try {
      const runner = liveData.t1[0];
      await onPlaceBet(runner.sid, runner.nat, autoCashout, "back", stake);
      setBetPlaced(true);
    } finally {
      setPlacing(false);
    }
  };

  const handleCashout = () => {
    setBetPlaced(false);
    setCurrentMultiplier(1.0);
  };

  const lastResults = results?.lastresult || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Main Game Area - 2 columns */}
      <div className="xl:col-span-2 space-y-4">
        {/* Game Header */}
        <Card className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {gameInfo.name}
                </h1>
                <p className="text-purple-200">{gameInfo.description}</p>
              </div>
              <Badge className="bg-yellow-500 text-black text-lg px-4 py-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                Round #{liveData?.mid || "..."}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Live Multiplier Display */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
          <div className="relative h-96">
            {/* Graph Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

            {/* Multiplier Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "text-center transition-all duration-200",
                  betPlaced && "animate-pulse",
                )}
              >
                {liveData?.gstatus === "1" ? (
                  <>
                    <div className="text-8xl font-bold mb-4">
                      <span
                        className={cn(
                          "bg-gradient-to-r bg-clip-text text-transparent",
                          currentMultiplier >= 2
                            ? "from-green-400 to-emerald-400"
                            : currentMultiplier >= 5
                              ? "from-yellow-400 to-orange-400"
                              : "from-blue-400 to-cyan-400",
                        )}
                      >
                        {currentMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    {betPlaced && (
                      <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-6"
                        onClick={handleCashout}
                      >
                        💰 Cash Out ₹{(stake * currentMultiplier).toFixed(2)}
                      </Button>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">🚀</div>
                    <p className="text-2xl text-slate-400">
                      Waiting for next round...
                    </p>
                    <p className="text-slate-500 mt-2">Get ready!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-10 grid-rows-10 h-full">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border border-slate-700"></div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
            <div className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-white" />
              <p className="text-sm text-blue-100">Players</p>
              <p className="text-2xl font-bold text-white">
                {liveData?.t1?.length || 0}
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
            <div className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-white" />
              <p className="text-sm text-green-100">Last Crash</p>
              <p className="text-2xl font-bold text-white">
                {results?.lastresult?.[0] || "--"}x
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
            <div className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-white" />
              <p className="text-sm text-purple-100">Avg Crash</p>
              <p className="text-2xl font-bold text-white">
                {lastResults.length > 0
                  ? (
                      lastResults.reduce(
                        (a: number, b: string) => a + parseFloat(b),
                        0,
                      ) / lastResults.length
                    ).toFixed(2)
                  : "--"}
                x
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0">
            <div className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-white" />
              <p className="text-sm text-orange-100">Highest</p>
              <p className="text-2xl font-bold text-white">
                {Math.max(
                  ...lastResults.map((r: string) => parseFloat(r) || 0),
                ).toFixed(2)}
                x
              </p>
            </div>
          </Card>
        </div>

        {/* History */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4">
            <h3 className="font-bold text-white mb-4">Recent Crashes</h3>
            <div className="flex gap-2 flex-wrap">
              {lastResults.slice(0, 20).map((result: string, idx: number) => {
                const multiplier = parseFloat(result) || 0;
                return (
                  <Badge
                    key={idx}
                    className={cn(
                      "text-lg font-mono font-bold px-4 py-2",
                      multiplier >= 10
                        ? "bg-purple-600"
                        : multiplier >= 5
                          ? "bg-yellow-600"
                          : multiplier >= 2
                            ? "bg-green-600"
                            : "bg-red-600",
                    )}
                  >
                    {multiplier.toFixed(2)}x
                  </Badge>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Betting Sidebar - 1 column */}
      <div className="xl:col-span-1">
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Place Bet</h3>

            {/* Stake Input */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Bet Amount (₹)
              </label>
              <Input
                type="number"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                className="bg-slate-700 border-slate-600 text-white text-lg h-12"
                min={100}
                step={100}
                disabled={betPlaced}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setStake(amount)}
                    className="border-slate-600"
                    disabled={betPlaced}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Auto Cashout */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Auto Cashout (x)
              </label>
              <Input
                type="number"
                value={autoCashout}
                onChange={(e) =>
                  setAutoCashout(parseFloat(e.target.value) || 1)
                }
                className="bg-slate-700 border-slate-600 text-white text-lg h-12"
                min={1.01}
                step={0.1}
                disabled={betPlaced}
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1.5, 2.0, 5.0].map((multiplier) => (
                  <Button
                    key={multiplier}
                    size="sm"
                    variant="outline"
                    onClick={() => setAutoCashout(multiplier)}
                    className="border-slate-600"
                    disabled={betPlaced}
                  >
                    {multiplier}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Potential Win */}
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-600">
              <div className="p-4">
                <p className="text-sm text-green-400 mb-1">Potential Win</p>
                <p className="text-3xl font-bold text-green-400">
                  ₹{(stake * autoCashout).toFixed(2)}
                </p>
                <p className="text-xs text-green-300 mt-1">
                  Profit: ₹{(stake * (autoCashout - 1)).toFixed(2)}
                </p>
              </div>
            </Card>

            {/* Place Bet Button */}
            {!betPlaced ? (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl h-16"
                onClick={handlePlaceBet}
                disabled={placing || stake < 100 || liveData?.gstatus !== "0"}
              >
                {placing ? "Placing..." : "🚀 Place Bet"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Badge className="w-full justify-center py-3 bg-yellow-600 text-lg">
                  Bet Active - Watch the multiplier!
                </Badge>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={handleCashout}
                >
                  Manual Cashout
                </Button>
              </div>
            )}

            {/* Game Status */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <Badge
                  className={cn(
                    liveData?.gstatus === "1"
                      ? "bg-green-600"
                      : "bg-yellow-600",
                  )}
                >
                  {liveData?.gstatus === "1" ? "🎮 In Progress" : "⏳ Waiting"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
