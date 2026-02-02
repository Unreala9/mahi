import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Trophy, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const RUNNERS = [
  { id: 1, name: "Thunder Bolt", color: "bg-red-600", odds: 3.5 },
  { id: 2, name: "Speed Demon", color: "bg-blue-600", odds: 4.2 },
  { id: 3, name: "Golden Star", color: "bg-yellow-600", odds: 2.8 },
  { id: 4, name: "Night Rider", color: "bg-purple-600", odds: 5.0 },
  { id: 5, name: "Fire Storm", color: "bg-orange-600", odds: 3.2 },
  { id: 6, name: "Silver Arrow", color: "bg-gray-500", odds: 6.5 },
];

const MARKETS = [
  { id: "winner", name: "Winner", selections: RUNNERS },
  { id: "top3", name: "Top 3 Finish", selections: RUNNERS },
];

const PAST_RACES = [
  { race: "#128", winner: "Golden Star", time: "2:45" },
  { race: "#127", winner: "Thunder Bolt", time: "2:42" },
  { race: "#126", winner: "Fire Storm", time: "2:48" },
];

export default function Race20() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(45);
  const [isRacing, setIsRacing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [bets, setBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRacing(true);
          simulateRace();
          setTimeout(() => {
            setIsRacing(false);
            setProgress({});
          }, 8000);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulateRace = () => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = { ...prev };
        RUNNERS.forEach((runner) => {
          newProgress[runner.id] = (prev[runner.id] || 0) + Math.random() * 15;
        });
        return newProgress;
      });
    }, 200);

    setTimeout(() => clearInterval(interval), 8000);
  };

  const placeBet = (marketId: string, runnerId: number) => {
    const betKey = `${marketId}-${runnerId}`;
    setBets((prev) => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + selectedChip,
    }));
  };

  const clearBets = () => setBets({});

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];

      Object.entries(bets).forEach(([betKey, stake]) => {
        if (stake > 0) {
          const [marketId, runnerIdStr] = betKey.split("-");
          const runnerId = parseInt(runnerIdStr);
          const runner = RUNNERS.find((r) => r.id === runnerId);
          const market = MARKETS.find((m) => m.id === marketId);

          if (runner && market) {
            betPromises.push(
              bettingService.placeBet({
                gameType: "CASINO",
                gameId: "race20",
                gameName: "Race 20",
                marketId: betKey,
                marketName: `${market.name} - ${runner.name}`,
                selection: runner.name,
                odds: runner.odds,
                stake,
                betType: "BACK",
              }),
            );
          }
        }
      });

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin = Object.entries(bets).reduce((sum, [betKey, stake]) => {
    const runnerId = parseInt(betKey.split("-")[1]);
    const runner = RUNNERS.find((r) => r.id === runnerId);
    return sum + (runner ? stake * runner.odds : 0);
  }, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-green-800 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-green-500 mb-1">
                  <Trophy className="inline w-5 h-5 mr-2" />
                  Race 20 - Live
                </h1>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 font-bold">
                    {isRacing ? "Racing..." : `${countdown}s to start`}
                  </span>
                </div>
              </div>
              <Badge className="bg-red-600 animate-pulse">Live</Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Race Visualization */}
          <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Flag className="w-6 h-6 text-green-500" />
              <h2 className="text-white font-bold text-xl">Race Track</h2>
            </div>
            <div className="space-y-3">
              {RUNNERS.map((runner) => (
                <div key={runner.id} className="relative">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold",
                        runner.color,
                      )}
                    >
                      {runner.id}
                    </div>
                    <span className="text-white font-bold text-sm flex-1">
                      {runner.name}
                    </span>
                    <Badge className="bg-slate-700">{runner.odds}x</Badge>
                  </div>
                  <div className="bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-600 relative">
                    <div
                      className={cn(
                        "h-full transition-all duration-200",
                        runner.color,
                      )}
                      style={{
                        width: `${Math.min(progress[runner.id] || 0, 100)}%`,
                      }}
                    />
                    {isRacing && (
                      <div className="absolute right-2 top-0 bottom-0 flex items-center">
                        <span className="text-white text-xs font-bold">
                          {Math.floor(progress[runner.id] || 0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Betting Markets */}
            <div className="lg:col-span-2">
              {MARKETS.map((market) => (
                <Card
                  key={market.id}
                  className="bg-slate-800/50 border-slate-700 p-4 mb-4"
                >
                  <h3 className="text-green-400 font-bold text-lg mb-3">
                    {market.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {market.selections.map((runner) => {
                      const betKey = `${market.id}-${runner.id}`;
                      const betAmount = bets[betKey] || 0;
                      return (
                        <Card
                          key={runner.id}
                          className={cn(
                            "cursor-pointer transition-all p-3 border-2",
                            betAmount > 0
                              ? "border-yellow-400 bg-slate-700"
                              : "border-slate-600 bg-slate-900 hover:border-slate-500",
                          )}
                          onClick={() => placeBet(market.id, runner.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                                runner.color,
                              )}
                            >
                              {runner.id}
                            </div>
                            <span className="text-white text-sm font-bold flex-1">
                              {runner.name.split(" ")[0]}
                            </span>
                          </div>
                          <Badge className="bg-green-600 mb-1">
                            {runner.odds}x
                          </Badge>
                          {betAmount > 0 && (
                            <Badge className="bg-yellow-500 text-black w-full">
                              ₹{betAmount}
                            </Badge>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            {/* Bet Slip & History */}
            <div className="lg:col-span-1 space-y-4">
              {/* Controls */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <h3 className="text-green-400 font-bold mb-3">Bet Slip</h3>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      amount={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 text-sm"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 text-sm"
                  >
                    Repeat
                  </Button>
                </div>

                <Button
                  onClick={handlePlaceBets}
                  className="w-full bg-green-600 hover:bg-green-700 font-bold mb-4"
                >
                  Place Bets
                </Button>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Total Stake:</span>
                    <span className="text-white font-bold">₹{totalStake}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">
                      Potential Win:
                    </span>
                    <span className="text-green-400 font-bold">
                      ₹{potentialWin.toFixed(0)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Past Races */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <h3 className="text-green-400 font-bold mb-3">Recent Races</h3>
                <div className="space-y-2">
                  {PAST_RACES.map((race, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/50 rounded p-3 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge className="bg-green-600 text-xs">
                          {race.race}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {race.time}
                        </span>
                      </div>
                      <p className="text-white text-sm font-bold">
                        <Trophy className="w-3 h-3 inline mr-1 text-yellow-500" />
                        {race.winner}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
