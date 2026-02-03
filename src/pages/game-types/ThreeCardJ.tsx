import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const HAND_RANKINGS = [
  "Trail (AAA)",
  "Pure Sequence (A23)",
  "Sequence (AK2)",
  "Color (All Same)",
  "Pair (AA5)",
  "High Card",
];

const HISTORY = [
  { winner: "A", handA: "Trail", handB: "Pair" },
  { winner: "B", handA: "Color", handB: "Pure Seq" },
  { winner: "A", handA: "Sequence", handB: "High Card" },
  { winner: "Tie", handA: "Pair", handB: "Pair" },
  { winner: "B", handA: "High Card", handB: "Color" },
  { winner: "A", handA: "Pure Seq", handB: "Sequence" },
];

export default function ThreeCardJ() {
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
    gameType: "3cardj",
    gameName: "Three Card J",
  });

  const [countdown, setCountdown] = useState(20);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    handA: 0,
    handB: 0,
    tie: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsRevealing(true);
          setTimeout(() => setIsRevealing(false), 5000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: keyof typeof bets) => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const clearBets = () => {
    setBets({ handA: 0, handB: 0, tie: 0 });
  };

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin = bets.handA * 1.98 + bets.handB * 1.98 + bets.tie * 11;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-purple-600/30 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="text-2xl font-bold text-purple-400 mb-1">
                  3 Card Judgement
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Badge className="bg-purple-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Table */}
            <div className="lg:col-span-3">
              {/* Two Hand Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Hand A */}
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-400 mb-2">
                      HAND A
                    </h2>
                    <Badge className="bg-blue-600 text-white">1.98x</Badge>
                  </div>

                  {/* Three Cards */}
                  <div className="flex justify-center gap-2 mb-6">
                    <PlayingCard
                      suit={isRevealing ? "hearts" : undefined}
                      value={isRevealing ? "A" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                    <PlayingCard
                      suit={isRevealing ? "hearts" : undefined}
                      value={isRevealing ? "K" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                    <PlayingCard
                      suit={isRevealing ? "hearts" : undefined}
                      value={isRevealing ? "Q" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                  </div>

                  {isRevealing && (
                    <div className="text-center mb-4">
                      <Badge className="bg-yellow-600 text-lg px-4 py-1">
                        Pure Sequence
                      </Badge>
                    </div>
                  )}

                  {/* Betting Zone */}
                  <button
                    onClick={() => placeBet("handA")}
                    disabled={countdown <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400"
                  >
                    BET HAND A
                    {bets.handA > 0 && (
                      <span className="block text-sm mt-1">₹{bets.handA}</span>
                    )}
                  </button>
                </Card>

                {/* Hand B */}
                <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-red-400 mb-2">
                      HAND B
                    </h2>
                    <Badge className="bg-red-600 text-white">1.98x</Badge>
                  </div>

                  {/* Three Cards */}
                  <div className="flex justify-center gap-2 mb-6">
                    <PlayingCard
                      suit={isRevealing ? "spades" : undefined}
                      value={isRevealing ? "10" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                    <PlayingCard
                      suit={isRevealing ? "clubs" : undefined}
                      value={isRevealing ? "10" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                    <PlayingCard
                      suit={isRevealing ? "diamonds" : undefined}
                      value={isRevealing ? "5" : undefined}
                      faceDown={!isRevealing}
                      size="lg"
                      flipped={isRevealing}
                    />
                  </div>

                  {isRevealing && (
                    <div className="text-center mb-4">
                      <Badge className="bg-yellow-600 text-lg px-4 py-1">
                        Pair
                      </Badge>
                    </div>
                  )}

                  {/* Betting Zone */}
                  <button
                    onClick={() => placeBet("handB")}
                    disabled={countdown <= 0}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-400"
                  >
                    BET HAND B
                    {bets.handB > 0 && (
                      <span className="block text-sm mt-1">₹{bets.handB}</span>
                    )}
                  </button>
                </Card>
              </div>

              {/* Tie Bet */}
              <Card className="bg-gradient-to-r from-yellow-900/30 via-yellow-800/30 to-yellow-900/30 border-yellow-600/50 p-4 mb-6">
                <button
                  onClick={() => placeBet("tie")}
                  disabled={countdown <= 0}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xl py-4 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
                >
                  TIE (11:1)
                  {bets.tie > 0 && <span className="ml-3">₹{bets.tie}</span>}
                </button>
              </Card>

              {/* Controls */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Select Chip:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <BettingChip
                      key={value}
                      value={value}
                      selected={selectedChip === value}
                      onClick={() => setSelectedChip(value)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
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
                    Double
                  </Button>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Potential Win</p>
                      <p className="text-green-500 font-bold text-2xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Hand Rankings */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-3 text-center">
                  Hand Rankings
                </h3>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((rank, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded text-center text-sm",
                        idx === 0
                          ? "bg-yellow-600/30 text-yellow-400 font-bold"
                          : "bg-gray-900/50 text-gray-300",
                      )}
                    >
                      {idx + 1}. {rank}
                    </div>
                  ))}
                </div>
              </Card>

              {/* History */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-3 text-center">
                  History
                </h3>
                <div className="space-y-2">
                  {HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded border-2",
                        result.winner === "A"
                          ? "bg-blue-900/30 border-blue-600"
                          : result.winner === "B"
                            ? "bg-red-900/30 border-red-600"
                            : "bg-yellow-900/30 border-yellow-600",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          className={cn(
                            result.winner === "A"
                              ? "bg-blue-600"
                              : result.winner === "B"
                                ? "bg-red-600"
                                : "bg-yellow-600",
                          )}
                        >
                          {result.winner === "Tie"
                            ? "TIE"
                            : `Hand ${result.winner}`}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        <p>A: {result.handA}</p>
                        <p>B: {result.handB}</p>
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
