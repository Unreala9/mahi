import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const HISTORY = [
  { winner: "B", cards: 9 },
  { winner: "A", cards: 6 },
  { winner: "B", cards: 11 },
  { winner: "A", cards: 4 },
  { winner: "B", cards: 8 },
];

export default function AndarBahar4Game() {
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
    gameType: "ab4",
    gameName: "Andar Bahar 4",
  });

  const [countdown, setCountdown] = useState(30);
  const [jokerCard, setJokerCard] = useState("🃋");
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState({
    andar: 0,
    bahar: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBet = (side: "andar" | "bahar") => {
    setBets((prev) => ({
      ...prev,
      [side]: prev[side] + selectedChip,
    }));
    toast({ title: `₹${selectedChip} placed on ${side.toUpperCase()}` });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-pink-900/50 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/casino")}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-wide">
                    Andar Bahar 4
                  </h1>
                  <Badge variant="secondary" className="bg-red-500">
                    <Clock className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-yellow-400 tabular-nums">
                  {countdown}
                </div>
                <p className="text-xs text-gray-400">seconds</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Joker Card */}
              <div className="relative flex justify-center py-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="w-32 h-48 bg-gradient-to-br from-pink-300 via-purple-400 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center text-7xl font-black border-4 border-pink-200">
                    {jokerCard}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-600 rounded-2xl blur-xl opacity-70 -z-10 animate-pulse"></div>
                  <Badge className="absolute -top-8 left-1/2 -translate-x-1/2 bg-pink-600">
                    JOKER
                  </Badge>
                </div>
              </div>

              {/* Betting Areas */}
              <div className="grid grid-cols-2 gap-4">
                {/* ANDAR */}
                <button
                  onClick={() => handlePlaceBet("andar")}
                  className={cn(
                    "relative group h-48 rounded-2xl overflow-hidden transition-all",
                    bets.andar > 0
                      ? "ring-4 ring-yellow-400 scale-105"
                      : "hover:scale-[1.02]",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-950"></div>
                  <div className="relative h-full flex flex-col items-center justify-center gap-3">
                    <div className="text-white text-5xl font-black tracking-widest drop-shadow-2xl">
                      ANDAR
                    </div>
                    <div className="text-yellow-300 text-4xl font-black drop-shadow-2xl">
                      1.95x
                    </div>
                    {bets.andar > 0 && (
                      <Badge className="bg-yellow-500 text-black text-lg px-4 py-1">
                        ₹{bets.andar}
                      </Badge>
                    )}
                  </div>
                </button>

                {/* BAHAR */}
                <button
                  onClick={() => handlePlaceBet("bahar")}
                  className={cn(
                    "relative group h-48 rounded-2xl overflow-hidden transition-all",
                    bets.bahar > 0
                      ? "ring-4 ring-yellow-400 scale-105"
                      : "hover:scale-[1.02]",
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-800 to-cyan-950"></div>
                  <div className="relative h-full flex flex-col items-center justify-center gap-3">
                    <div className="text-white text-5xl font-black tracking-widest drop-shadow-2xl">
                      BAHAR
                    </div>
                    <div className="text-yellow-300 text-4xl font-black drop-shadow-2xl">
                      1.95x
                    </div>
                    {bets.bahar > 0 && (
                      <Badge className="bg-yellow-500 text-black text-lg px-4 py-1">
                        ₹{bets.bahar}
                      </Badge>
                    )}
                  </div>
                </button>
              </div>

              {/* Chip Selector */}
              <Card className="bg-gray-800/50 border-pink-600/20 p-4">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm font-bold">
                    Chips:
                  </span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-14 h-14 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300",
                      )}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setBets({ andar: 0, bahar: 0 })}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-pink-600 to-purple-700">
                    Place Bet (₹{bets.andar + bets.bahar})
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* History */}
              <Card className="bg-gray-800/50 border-pink-600/20 p-4">
                <h3 className="text-pink-400 font-bold mb-3">History</h3>
                <div className="space-y-2">
                  {HISTORY.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <Badge
                        className={
                          h.winner === "A" ? "bg-red-600" : "bg-cyan-600"
                        }
                      >
                        {h.winner === "A" ? "ANDAR" : "BAHAR"}
                      </Badge>
                      <span className="text-gray-400">{h.cards} cards</span>
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
