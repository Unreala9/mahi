import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BALL_MARKETS = [
  { id: "runs0", name: "0 Runs", odds: "3.5x" },
  { id: "runs1", name: "1 Run", odds: "4.2x" },
  { id: "runs2", name: "2 Runs", odds: "5.5x" },
  { id: "runs3", name: "3 Runs", odds: "7.0x" },
  { id: "runs4", name: "4 Runs (Boundary)", odds: "8.5x" },
  { id: "runs6", name: "6 Runs (Six)", odds: "12.0x" },
  { id: "wicket", name: "Wicket", odds: "6.5x" },
  { id: "noWicket", name: "No Wicket", odds: "1.15x" },
  { id: "boundary", name: "Boundary (4 or 6)", odds: "5.0x" },
  { id: "noBoundary", name: "No Boundary", odds: "1.2x" },
];

const BALL_HISTORY = [
  { ball: "3.5", runs: 4, wicket: false, striker: "Kohli", bowler: "Bumrah" },
  { ball: "3.4", runs: 1, wicket: false, striker: "Rohit", bowler: "Bumrah" },
  { ball: "3.3", runs: 0, wicket: false, striker: "Rohit", bowler: "Bumrah" },
  { ball: "3.2", runs: 0, wicket: true, striker: "Dhawan", bowler: "Bumrah" },
  { ball: "3.1", runs: 6, wicket: false, striker: "Dhawan", bowler: "Bumrah" },
  { ball: "2.6", runs: 2, wicket: false, striker: "Dhawan", bowler: "Shami" },
];

export default function BallByBall() {
  const navigate = useNavigate();
  // ✅ LIVE API INTEGRATION
  const {
    gameData,
    result,
    isConnected,
    markets,
    roundId,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
  } = useUniversalCasinoGame({
    gameType: "ballbyball",
    gameName: "Ball By Ball",
  });

  const [countdown, setCountdown] = useState(12);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          return 12; // Reset after ball is bowled
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (marketId: string) => {
    setBets((prev) => ({
      ...prev,
      [marketId]: (prev[marketId] || 0) + selectedChip,
    }));
  };

  const removeBet = (marketId: string) => {
    setBets((prev) => {
      const newBets = { ...prev };
      delete newBets[marketId];
      return newBets;
    });
  };

  const clearBets = () => {
    setBets({});
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-green-600/30 backdrop-blur-sm sticky top-0 z-10">
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
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-white mb-1">
                  Ball-by-Ball Cricket
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-blue-600">IND</Badge>
                  <span className="text-white font-bold">185/4</span>
                  <span className="text-gray-400 text-sm">(18.5 ov)</span>
                  <span className="text-gray-500">vs</span>
                  <Badge className="bg-green-600">PAK</Badge>
                </div>
              </div>
              <Badge className="bg-red-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Match Context Bar */}
        <div className="bg-gradient-to-r from-blue-900/30 via-green-900/30 to-blue-900/30 border-b border-green-600/20">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Current Over</p>
                <p className="text-white font-bold">18.5</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Striker</p>
                <p className="text-white font-bold">Kohli (42*)</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Non-Striker</p>
                <p className="text-gray-400">Rohit (28*)</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Bowler</p>
                <p className="text-white font-bold">Bumrah</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Next Ball</p>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold">
                    {countdown}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Markets */}
            <div className="lg:col-span-3">
              {/* Field Graphic */}
              <Card className="bg-gradient-to-br from-green-800/30 to-green-900/20 border-green-600/30 p-6 mb-6">
                <div className="relative aspect-video bg-gradient-to-br from-green-700/20 to-green-900/20 rounded-lg border-2 border-green-600/30">
                  {/* Cricket Field Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full border-4 border-green-500/50 flex items-center justify-center mb-2">
                        <div className="w-20 h-20 rounded-full bg-yellow-600/30 border-2 border-yellow-500/50 flex items-center justify-center">
                          <span className="text-white text-4xl">🏏</span>
                        </div>
                      </div>
                      <p className="text-green-400 font-bold text-sm">Pitch</p>
                    </div>
                  </div>
                  {/* Fielders */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-red-600">Bumrah</Badge>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Kohli</Badge>
                  </div>
                </div>
              </Card>

              {/* Ball Markets */}
              <h3 className="text-green-400 font-bold text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ball 18.6 Markets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {BALL_MARKETS.map((market) => (
                  <Card
                    key={market.id}
                    className={cn(
                      "bg-gray-800/50 border-green-600/30 p-4 transition-all hover:scale-105 cursor-pointer",
                      bets[market.id] > 0 &&
                        "ring-2 ring-green-500 bg-green-900/30",
                    )}
                    onClick={() => placeBet(market.id)}
                  >
                    <div className="text-center">
                      <p className="text-white font-bold text-sm mb-1">
                        {market.name}
                      </p>
                      <Badge className="bg-green-600 text-xs mb-2">
                        {market.odds}
                      </Badge>
                      {bets[market.id] > 0 && (
                        <div className="mt-2 bg-green-600/20 rounded p-1">
                          <p className="text-green-400 text-xs font-bold">
                            ₹{bets[market.id]}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-green-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Quick Bet:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                      size="sm"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                  >
                    Clear All
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-bold"
                    disabled={totalStake === 0 || countdown <= 0}
                  >
                    PLACE BETS (₹{totalStake})
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <Card className="bg-gray-800/50 border-green-600/20 p-4">
                <h3 className="text-green-400 font-bold mb-3">Bet Slip</h3>
                {Object.keys(bets).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">
                    Click on markets to add bets
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(bets).map(([marketId, amount]) => {
                      const market = BALL_MARKETS.find(
                        (m) => m.id === marketId,
                      );
                      return (
                        <div
                          key={marketId}
                          className="bg-gray-900/50 p-2 rounded border border-green-600/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-xs font-bold">
                              {market?.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBet(marketId)}
                              className="h-5 w-5 p-0 text-red-500"
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Stake:</span>
                            <span className="text-green-400 font-bold">
                              ₹{amount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Return:</span>
                            <span className="text-white font-bold">
                              ₹
                              {(
                                amount * parseFloat(market?.odds || "1")
                              ).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Total Stake:</span>
                    <span className="text-white font-bold text-lg">
                      ₹{totalStake}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Ball History */}
              <Card className="bg-gray-800/50 border-green-600/20 p-4">
                <h3 className="text-green-400 font-bold mb-3">Last 6 Balls</h3>
                <div className="space-y-2">
                  {BALL_HISTORY.map((ball, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded border-2 transition-all",
                        ball.wicket
                          ? "bg-red-900/30 border-red-600"
                          : ball.runs === 6
                            ? "bg-purple-900/30 border-purple-600"
                            : ball.runs === 4
                              ? "bg-blue-900/30 border-blue-600"
                              : "bg-gray-900/50 border-gray-700",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">
                          {ball.ball}
                        </span>
                        <Badge
                          className={cn(
                            "text-xs",
                            ball.wicket
                              ? "bg-red-600"
                              : ball.runs === 6
                                ? "bg-purple-600"
                                : ball.runs === 4
                                  ? "bg-blue-600"
                                  : "bg-gray-700",
                          )}
                        >
                          {ball.wicket ? "W" : ball.runs}
                        </Badge>
                      </div>
                      <p className="text-white text-xs">
                        {ball.striker} • {ball.bowler}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-3 border-t border-gray-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Boundaries:</span>
                    <span className="text-white font-bold">
                      {
                        BALL_HISTORY.filter((b) => b.runs === 4 || b.runs === 6)
                          .length
                      }
                      /6
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dots:</span>
                    <span className="text-white font-bold">
                      {
                        BALL_HISTORY.filter((b) => b.runs === 0 && !b.wicket)
                          .length
                      }
                      /6
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wickets:</span>
                    <span className="text-white font-bold">
                      {BALL_HISTORY.filter((b) => b.wicket).length}/6
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
