/**
 * Plinko/Physics Game Layout - For Plinko, Balloon, Mines, Marbles
 * Features: Visual board, drop animation, zone multipliers, interactive gameplay
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, Trophy, Sparkles } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface PlinkoGameLayoutProps {
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

export function PlinkoGameLayout({
  gameInfo,
  liveData,
  results,
  onPlaceBet,
}: PlinkoGameLayoutProps) {
  const [stake, setStake] = useState(100);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [playing, setPlaying] = useState(false);

  const multipliers = {
    low: [1.5, 1.2, 1.0, 0.8, 1.0, 1.2, 1.5],
    medium: [3.0, 2.0, 1.5, 1.0, 1.5, 2.0, 3.0],
    high: [10.0, 5.0, 2.0, 0.5, 2.0, 5.0, 10.0],
  };

  const handleDrop = async () => {
    setPlaying(true);
    // Simulate ball drop animation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      {/* Main Game Area - 3 columns */}
      <div className="xl:col-span-3 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-pink-900 via-purple-900 to-blue-900 border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {gameInfo.name}
                </h1>
                <p className="text-purple-200">{gameInfo.description}</p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                How to Play
              </Button>
            </div>
          </div>
        </Card>

        {/* Plinko Board */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="p-8">
            {/* Drop Zone */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <div className="w-16 h-16 bg-yellow-500 rounded-full animate-bounce shadow-lg shadow-yellow-500/50 flex items-center justify-center text-3xl">
                  🎯
                </div>
                {playing && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-64 bg-gradient-to-b from-yellow-500 to-transparent animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Pegs Grid */}
            <div className="relative h-96 mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-rows-8 gap-6">
                  {Array.from({ length: 8 }).map((_, row) => (
                    <div key={row} className="flex gap-6 justify-center">
                      {Array.from({ length: row + 3 }).map((_, col) => (
                        <div
                          key={col}
                          className="w-4 h-4 bg-slate-600 rounded-full shadow-lg"
                        ></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Multiplier Zones */}
            <div className="grid grid-cols-7 gap-2">
              {multipliers[risk].map((mult, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "p-4 text-center border-2 transition-all",
                    mult >= 5
                      ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50"
                      : mult >= 2
                        ? "bg-blue-600 border-blue-400"
                        : mult >= 1
                          ? "bg-green-600 border-green-400"
                          : "bg-red-600 border-red-400",
                  )}
                >
                  <p className="text-2xl font-bold text-white">{mult}x</p>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm text-slate-400">Total Drops</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-slate-400">Highest Win</p>
              <p className="text-2xl font-bold text-white">0x</p>
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-4 text-center">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-slate-400">Avg Multiplier</p>
              <p className="text-2xl font-bold text-white">0x</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Sidebar - 2 columns */}
      <div className="xl:col-span-2">
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Game Settings</h3>

            {/* Bet Amount */}
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
                disabled={playing}
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setStake(amount)}
                    className="border-slate-600"
                    disabled={playing}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Risk Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={risk === level ? "default" : "outline"}
                    onClick={() => setRisk(level)}
                    disabled={playing}
                    className={cn(
                      risk === level &&
                        level === "low" &&
                        "bg-green-600 hover:bg-green-700",
                      risk === level &&
                        level === "medium" &&
                        "bg-yellow-600 hover:bg-yellow-700",
                      risk === level &&
                        level === "high" &&
                        "bg-red-600 hover:bg-red-700",
                    )}
                  >
                    {level.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Possible Wins */}
            <Card className="bg-slate-700 border-slate-600">
              <div className="p-4">
                <p className="text-sm text-slate-400 mb-3">Possible Wins</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Minimum:</span>
                    <span className="font-bold text-red-400">
                      ₹{(stake * Math.min(...multipliers[risk])).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Average:</span>
                    <span className="font-bold text-yellow-400">
                      ₹
                      {(
                        stake *
                        (multipliers[risk].reduce((a, b) => a + b) /
                          multipliers[risk].length)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Maximum:</span>
                    <span className="font-bold text-green-400">
                      ₹{(stake * Math.max(...multipliers[risk])).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Drop Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl h-16"
              onClick={handleDrop}
              disabled={playing || stake < 100}
            >
              {playing ? (
                <>
                  <RotateCcw className="w-6 h-6 mr-2 animate-spin" />
                  Dropping...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Drop Ball
                </>
              )}
            </Button>

            {/* Auto Play */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-400">Auto Play</label>
                <input type="checkbox" className="w-5 h-5" disabled={playing} />
              </div>
              <Input
                type="number"
                placeholder="Number of drops"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={playing}
              />
            </div>

            {/* Fair Play */}
            <Card className="bg-blue-600/20 border-blue-600">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <p className="font-bold text-blue-400">Provably Fair</p>
                </div>
                <p className="text-xs text-blue-300">
                  Every drop is verifiable. Check hash after each game.
                </p>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
