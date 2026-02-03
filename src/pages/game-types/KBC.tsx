import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const OPTIONS = [
  { id: "option1", label: "Option 1", odds: 3.5, pool: 125000 },
  { id: "option2", label: "Option 2", odds: 2.8, pool: 180000 },
  { id: "option3", label: "Option 3", odds: 4.2, pool: 95000 },
  { id: "option4", label: "Option 4", odds: 5.0, pool: 75000 },
];

const HISTORY = Array.from({ length: 8 }, () => ({
  round: Math.floor(Math.random() * 1000) + 1,
  winner: `Option ${Math.floor(Math.random() * 4) + 1}`,
}));

export default function KBC() {
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
    gameType: "kbc",
    gameName: "KBC",
  });

  const [countdown, setCountdown] = useState(30);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [winningOption, setWinningOption] = useState<string | null>(null);
  const [bets, setBets] = useState<Record<string, number>>({
    option1: 0,
    option2: 0,
    option3: 0,
    option4: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          const winner = OPTIONS[Math.floor(Math.random() * OPTIONS.length)].id;
          setTimeout(() => setWinningOption(winner), 1000);
          setTimeout(() => {
            setIsRevealing(false);
            setWinningOption(null);
          }, 5000);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBets = async () => {
    const totalStakeAmount = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStakeAmount === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      OPTIONS.forEach((option) => {
        const stake = bets[option.id];
        if (stake > 0) {
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "kbc",
              gameName: "KBC Game",
              marketId: option.id,
              marketName: option.label,
              selection: option.label,
              odds: option.odds,
              stake,
              betType: "BACK",
            }),
          );
        }
      });

      await Promise.all(betPromises);
      clearBets();
    } catch (error) {
      console.error("Failed to place bets:", error);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-purple-950 to-black relative overflow-hidden">
        {/* Stage Spotlights */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
            role="presentation"
          ></div>
          <div
            className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
            role="presentation"
          ></div>
        </div>

        {/* Header */}
        <div className="bg-slate-900/90 border-b border-blue-800 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-2">
                  <Trophy className="inline w-8 h-8 mr-2" />
                  KBC Game Show
                </h1>
                {/* Digital Clock */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-6 py-2 inline-flex items-center gap-3 shadow-lg shadow-blue-500/50">
                  <Clock className="w-5 h-5 text-white animate-pulse" />
                  <span className="text-white font-mono text-2xl font-bold tracking-wider">
                    {String(countdown).padStart(2, "0")}
                  </span>
                  <span className="text-blue-200 text-sm">seconds</span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-red-600 to-pink-600 animate-pulse shadow-lg shadow-red-500/50">
                <Sparkles className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-6">
          {/* Question/Result Area */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 p-8 mb-6 relative overflow-hidden shadow-2xl shadow-blue-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]"></div>
            <div className="relative z-10 text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black mb-4 text-lg px-6 py-2">
                Round #{Math.floor(Math.random() * 1000) + 1}
              </Badge>
              <h2 className="text-white text-3xl font-bold mb-4">
                Which option will win?
              </h2>
              <p className="text-blue-300 text-lg">Place your bets now!</p>
              {winningOption && (
                <div className="mt-6 animate-bounce">
                  <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                  <p className="text-yellow-500 text-4xl font-bold">
                    Winner:{" "}
                    {OPTIONS.find((opt) => opt.id === winningOption)?.label}!
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Option Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {OPTIONS.map((option) => {
              const isWinner = winningOption === option.id;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer transition-all border-3 p-6 relative overflow-hidden",
                    isWinner
                      ? "bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-400 scale-110 shadow-2xl shadow-yellow-500/50 animate-pulse"
                      : bets[option.id] > 0
                        ? "bg-gradient-to-br from-blue-700 to-purple-800 border-blue-400 scale-105 shadow-lg shadow-blue-500/50"
                        : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:scale-105 hover:border-blue-500",
                  )}
                  onClick={() => !isRevealing && placeBet(option.id)}
                >
                  {/* Spotlight Effect */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity",
                      bets[option.id] > 0 && "opacity-100",
                    )}
                  ></div>

                  <div className="relative z-10">
                    <div className="text-center mb-4">
                      <h3 className="text-white font-bold text-2xl mb-2">
                        {option.label}
                      </h3>
                      <Badge className="bg-white/30 text-white text-lg px-4 py-1 font-bold">
                        {option.odds}x
                      </Badge>
                    </div>

                    <div className="bg-black/30 rounded-lg p-3 mb-3 backdrop-blur-sm">
                      <p className="text-gray-300 text-xs mb-1">Total Pool</p>
                      <p className="text-white font-bold text-sm">
                        ₹{option.pool.toLocaleString()}
                      </p>
                    </div>

                    {bets[option.id] > 0 && (
                      <div className="bg-yellow-500 rounded-lg p-3 animate-pulse shadow-lg shadow-yellow-500/50">
                        <p className="text-black font-bold text-center text-lg">
                          Your Stake: ₹{bets[option.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-blue-800/30 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-blue-400 text-sm font-bold">
                    Select Chip:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      amount={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <Button
                    variant="outline"
                    onClick={clearBets}
                    className="border-red-600 text-red-500 hover:bg-red-600/20 font-bold"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-500 hover:bg-blue-600/20 font-bold"
                  >
                    Repeat
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-500 hover:bg-green-600/20 font-bold"
                  >
                    2x
                  </Button>
                  <Button
                    onClick={handlePlaceBets}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg shadow-blue-500/50"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border-2 border-blue-500/30 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-xs mb-1">Total Stake</p>
                      <p className="text-white font-bold text-3xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-300 text-xs mb-1">
                        Potential Win
                      </p>
                      <p className="text-yellow-400 font-bold text-3xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-blue-800/30 p-4">
                <h3 className="text-blue-400 font-bold mb-4 text-center flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Recent Winners
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/50 rounded-lg p-3 border border-blue-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-600 text-xs">
                          Round #{item.round}
                        </Badge>
                        <Badge className="bg-yellow-600 text-black font-bold">
                          {item.winner}
                        </Badge>
                      </div>
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
