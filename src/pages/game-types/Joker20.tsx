import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlayingCard } from "@/components/casino/PlayingCard";
import { BettingChip } from "@/components/casino/BettingChip";
import { toast } from "@/hooks/use-toast";
import { bettingService } from "@/services/bettingService";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BETTING_OPTIONS = [
  {
    id: "player",
    name: "Player",
    color: "from-purple-700 to-purple-900",
    odds: 2.0,
  },
  {
    id: "banker",
    name: "Banker",
    color: "from-green-700 to-green-900",
    odds: 1.95,
  },
  { id: "tie", name: "Tie", color: "from-red-700 to-red-900", odds: 9.0 },
  {
    id: "jokerWild",
    name: "Joker Wild",
    color: "from-yellow-700 to-yellow-900",
    odds: 12.0,
  },
];

const HISTORY = Array.from({ length: 8 }, () => {
  const outcomes = ["Player", "Banker", "Tie", "Joker"];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
});

export default function Joker20() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(22);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [showJoker, setShowJoker] = useState(false);
  const [bets, setBets] = useState({
    player: 0,
    banker: 0,
    tie: 0,
    jokerWild: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsPlaying(true);
          setTimeout(() => {
            const shouldShowJoker = Math.random() > 0.8;
            setShowJoker(shouldShowJoker);
            setTimeout(() => {
              setIsPlaying(false);
              setShowJoker(false);
            }, 3000);
          }, 2000);
          return 22;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const placeBet = (betType: keyof typeof bets) => {
    setBets((prev) => ({ ...prev, [betType]: prev[betType] + selectedChip }));
  };

  const clearBets = () =>
    setBets({ player: 0, banker: 0, tie: 0, jokerWild: 0 });

  const handlePlaceBets = async () => {
    const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalStake === 0) {
      toast({ title: "Please place a bet first", variant: "destructive" });
      return;
    }

    try {
      const betPromises = [];
      BETTING_OPTIONS.forEach((option) => {
        const stake = bets[option.id as keyof typeof bets];
        if (stake > 0) {
          betPromises.push(
            bettingService.placeBet({
              gameType: "CASINO",
              gameId: "joker20",
              gameName: "Joker 20",
              marketId: option.id,
              marketName: option.name,
              selection: option.name,
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

  const totalStake = Object.values(bets).reduce((a, b) => a + b, 0);
  const potentialWin =
    bets.player * 2 + bets.banker * 1.95 + bets.tie * 9 + bets.jokerWild * 12;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black relative overflow-hidden">
        {/* Joker Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-9xl"
              style={{
                left: `${(i * 20) % 100}%`,
                top: `${(i * 15) % 100}%`,
                transform: `rotate(${i * 30}deg)`,
                fontSize: "120px",
                color: i % 2 === 0 ? "#8B5CF6" : "#10B981",
              }}
            >
              🃏
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="bg-slate-900/90 border-b border-purple-800 backdrop-blur-sm sticky top-0 z-10">
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
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-green-500 to-red-500 mb-1">
                  🃏 Joker 20 🃏
                </h1>
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-400 font-bold">
                    {countdown}s
                  </span>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-green-600 animate-pulse">
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-6">
          {/* Main Game Area */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/50 border-purple-700/50 p-8 mb-6 relative overflow-hidden">
            {showJoker && (
              <div className="absolute inset-0 bg-yellow-500/20 animate-pulse flex items-center justify-center z-20">
                <div className="text-center">
                  <Sparkles className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-spin" />
                  <p className="text-yellow-500 text-4xl font-bold">
                    JOKER WILD!
                  </p>
                </div>
              </div>
            )}

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-purple-400 font-bold text-2xl mb-4">
                  Game Table
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Player</p>
                    <PlayingCard
                      card={isPlaying ? "KHH" : ""}
                      flipped={isPlaying}
                      className="w-24 h-32"
                    />
                  </div>
                  <div className="text-6xl text-purple-500 animate-pulse">
                    🃏
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Banker</p>
                    <PlayingCard
                      card={isPlaying ? "QSS" : ""}
                      flipped={isPlaying}
                      className="w-24 h-32"
                    />
                  </div>
                </div>
              </div>

              {/* Betting Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {BETTING_OPTIONS.map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all border-2 overflow-hidden",
                      bets[option.id as keyof typeof bets] > 0
                        ? `bg-gradient-to-br ${option.color} border-yellow-400 scale-105 shadow-lg shadow-yellow-500/50`
                        : `bg-gradient-to-br ${option.color} border-gray-600 hover:scale-105`,
                    )}
                    onClick={() => placeBet(option.id as keyof typeof bets)}
                  >
                    <div className="p-5">
                      <div className="text-center mb-3">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {option.name}
                        </h3>
                        <Badge className="bg-white/30 text-white font-bold">
                          {option.odds}x
                        </Badge>
                      </div>
                      {bets[option.id as keyof typeof bets] > 0 && (
                        <div className="bg-white/30 rounded-lg p-2 animate-pulse">
                          <p className="text-white font-bold text-center">
                            ₹{bets[option.id as keyof typeof bets]}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-purple-800/30 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-purple-400 text-sm font-bold">
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
                    className="border-purple-600 text-purple-500 hover:bg-purple-600/20 font-bold"
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
                    className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 font-bold"
                  >
                    Place Bet
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-2xl">
                        ₹{totalStake}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-300 text-xs">Potential Win</p>
                      <p className="text-green-400 font-bold text-2xl">
                        ₹{potentialWin.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* History */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-purple-800/30 p-4">
                <h3 className="text-purple-400 font-bold mb-4 text-center">
                  Recent Results
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {HISTORY.map((result, idx) => (
                    <Badge
                      key={idx}
                      className={cn(
                        "text-sm font-bold",
                        result === "Player"
                          ? "bg-purple-700"
                          : result === "Banker"
                            ? "bg-green-700"
                            : result === "Tie"
                              ? "bg-red-700"
                              : "bg-yellow-600 animate-pulse",
                      )}
                    >
                      {result}
                    </Badge>
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
