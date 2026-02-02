import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, Crown, TrendingUp, Calculator, BarChart3 } from "lucide-react";

interface Game {
  gmid: string;
}

interface DT202GameProps {
  game: Game;
}

interface Bet {
  level: number;
  zone: string;
  amount: number;
  odds: string;
}

interface ShoeComposition {
  rank: string;
  remaining: number;
  probability: string;
}

const LEVEL_1_BETS = [
  {
    id: "dragon",
    label: "Dragon",
    odds: "1:1",
    color: "from-red-600 to-red-800",
  },
  {
    id: "tiger",
    label: "Tiger",
    odds: "1:1",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "tie",
    label: "Tie",
    odds: "11:1",
    color: "from-purple-600 to-purple-800",
  },
];

const LEVEL_2_BETS = [
  {
    id: "dragon-suited",
    label: "Dragon Suited",
    odds: "2:1",
    color: "from-red-700 to-orange-700",
  },
  {
    id: "tiger-suited",
    label: "Tiger Suited",
    odds: "2:1",
    color: "from-blue-700 to-cyan-700",
  },
  {
    id: "dragon-face",
    label: "Dragon Face Card",
    odds: "1.5:1",
    color: "from-pink-600 to-red-600",
  },
  {
    id: "tiger-face",
    label: "Tiger Face Card",
    odds: "1.5:1",
    color: "from-teal-600 to-blue-600",
  },
];

const LEVEL_3_BETS = [
  {
    id: "dragon>10-tiger<5",
    label: "Dragon >10 & Tiger <5",
    odds: "8:1",
    color: "from-yellow-600 to-orange-700",
  },
  {
    id: "both-suited",
    label: "Both Cards Suited",
    odds: "6:1",
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "both-face",
    label: "Both Face Cards",
    odds: "5:1",
    color: "from-indigo-600 to-purple-700",
  },
  {
    id: "exact-match",
    label: "Exact Value Match",
    odds: "15:1",
    color: "from-amber-600 to-yellow-700",
  },
];

const CHIP_VALUES = [100, 500, 1000, 5000, 10000, 50000];

const INITIAL_SHOE: ShoeComposition[] = [
  { rank: "A", remaining: 32, probability: "6.15%" },
  { rank: "2", remaining: 32, probability: "6.15%" },
  { rank: "3", remaining: 32, probability: "6.15%" },
  { rank: "4", remaining: 32, probability: "6.15%" },
  { rank: "5", remaining: 32, probability: "6.15%" },
  { rank: "6", remaining: 32, probability: "6.15%" },
  { rank: "7", remaining: 32, probability: "6.15%" },
  { rank: "8", remaining: 32, probability: "6.15%" },
  { rank: "9", remaining: 32, probability: "6.15%" },
  { rank: "10", remaining: 32, probability: "6.15%" },
  { rank: "J", remaining: 32, probability: "6.15%" },
  { rank: "Q", remaining: 32, probability: "6.15%" },
  { rank: "K", remaining: 32, probability: "6.15%" },
];

export default function DT202Game({ game }: DT202GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(1000);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [shoeComposition, setShoeComposition] =
    useState<ShoeComposition[]>(INITIAL_SHOE);
  const [dragonCard, setDragonCard] = useState<string | null>(null);
  const [tigerCard, setTigerCard] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<string[]>([
    "D",
    "T",
    "D",
    "D",
    "T",
    "Tie",
    "T",
    "D",
    "T",
    "D",
    "D",
    "T",
    "T",
    "D",
    "D",
    "T",
    "T",
    "T",
    "D",
    "D",
  ]);

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (level: number, zoneId: string, odds: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Wait for next round",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = { level, zone: zoneId, amount: selectedChip, odds };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      game.gmid,
      gameData?.mid || "",
      "",
      zoneId,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Premium Bet Placed!",
      description: `Level ${level}: ₹${selectedChip} (${odds})`,
    });
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  const calculateExposure = () => {
    // Simplified exposure calculation
    const maxPayout = bets.reduce((max, bet) => {
      const multiplier = parseFloat(bet.odds.split(":")[0]);
      const potential = bet.amount * multiplier;
      return Math.max(max, potential);
    }, 0);
    return maxPayout;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-gray-900 p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-yellow-900/40 via-amber-900/40 to-yellow-900/40 backdrop-blur-md border-2 border-yellow-600/50 rounded-2xl p-4 mb-4 shadow-2xl shadow-yellow-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-10 h-10 text-yellow-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Dragon Tiger 202 - Premium Edition
                  </h1>
                  <p className="text-yellow-300 text-sm">
                    Advanced markets & smart odds calculator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-yellow-300 text-sm uppercase">
                    Round ID
                  </div>
                  <div className="text-white font-mono text-xl font-bold">
                    {gameData?.mid || "#DT202-3847"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Smart Odds Calculator & Shoe - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 backdrop-blur-md border-2 border-yellow-600/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-yellow-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Smart Odds
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {shoeComposition.slice(0, 6).map((card) => (
                    <div
                      key={card.rank}
                      className="bg-black/40 rounded-lg p-3 border border-yellow-600/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-xl">
                          {card.rank}
                        </span>
                        <span className="text-yellow-400 font-bold text-sm">
                          {card.remaining}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                          style={{ width: `${(card.remaining / 32) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-yellow-300 mt-1">
                        {card.probability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap */}
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 backdrop-blur-md border-2 border-yellow-600/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-yellow-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Trend Analysis
                </h3>
                <div className="grid grid-cols-5 gap-1">
                  {roadmap.map((result, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                        result === "D"
                          ? "bg-red-600 text-white"
                          : result === "T"
                            ? "bg-blue-600 text-white"
                            : "bg-purple-600 text-white"
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-3">
              {/* Card Areas */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-red-900/40 to-red-700/40 backdrop-blur-md border-4 border-red-500/50 rounded-3xl p-6 shadow-2xl">
                  <div className="text-center">
                    <div className="text-red-300 font-bold text-xl mb-3">
                      🐉 DRAGON
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-red-800 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-red-400">
                      <div className="text-white text-6xl">
                        {dragonCard || "?"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 backdrop-blur-md border-4 border-blue-500/50 rounded-3xl p-6 shadow-2xl">
                  <div className="text-center">
                    <div className="text-blue-300 font-bold text-xl mb-3">
                      🐯 TIGER
                    </div>
                    <div className="w-full h-48 bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-blue-400">
                      <div className="text-white text-6xl">
                        {tigerCard || "?"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Level Tabs */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
                      activeLevel === level
                        ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300"
                        : "bg-gray-800/60 text-gray-400 border-gray-700 hover:border-yellow-600/50"
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>

              {/* Betting Markets by Level */}
              {activeLevel === 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {LEVEL_1_BETS.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBet(1, bet.id, bet.odds)}
                      disabled={timeRemaining <= 2}
                      className={`bg-gradient-to-br ${bet.color} hover:opacity-90 rounded-2xl p-6 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all disabled:opacity-50`}
                    >
                      <div className="text-white font-bold text-xl mb-2">
                        {bet.label}
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-white font-bold">
                        {bet.odds}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeLevel === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {LEVEL_2_BETS.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBet(2, bet.id, bet.odds)}
                      disabled={timeRemaining <= 2}
                      className={`bg-gradient-to-br ${bet.color} hover:opacity-90 rounded-2xl p-6 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all disabled:opacity-50`}
                    >
                      <div className="text-white font-bold text-lg mb-2">
                        {bet.label}
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-white font-bold">
                        {bet.odds}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeLevel === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  {LEVEL_3_BETS.map((bet) => (
                    <button
                      key={bet.id}
                      onClick={() => handleBet(3, bet.id, bet.odds)}
                      disabled={timeRemaining <= 2}
                      className={`bg-gradient-to-br ${bet.color} hover:opacity-90 rounded-2xl p-6 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all disabled:opacity-50`}
                    >
                      <div className="text-white font-bold text-base mb-2">
                        {bet.label}
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1 text-white font-bold">
                        {bet.odds}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expanded Bet Slip - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Premium Bet Slip */}
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 backdrop-blur-md border-2 border-yellow-600/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-yellow-300 font-bold text-xl mb-4 flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Premium Slip
                </h3>

                {bets.length === 0 ? (
                  <div className="text-center py-8 text-yellow-300">
                    <div className="text-5xl mb-2">👑</div>
                    <div className="text-sm">No premium bets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border border-yellow-600/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-yellow-400 text-xs font-bold">
                            Level {bet.level}
                          </span>
                          <span className="text-yellow-300 text-xs">
                            {bet.odds}
                          </span>
                        </div>
                        <div className="text-white font-semibold text-sm mb-1">
                          {bet.zone}
                        </div>
                        <div className="text-yellow-400 font-bold">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-3 border-t border-yellow-600/30 pt-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm">Total Stake</span>
                        <span className="font-bold text-yellow-400">
                          ₹{getTotalStake()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <span className="text-sm flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Max Exposure
                        </span>
                        <span className="font-bold text-green-400">
                          ₹{calculateExposure()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setBets([])}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 text-sm rounded-lg"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={() => {
                          toast({ title: "Bets repeated!" });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-lg"
                      >
                        Repeat
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Premium Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 backdrop-blur-md border-2 border-yellow-600/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-yellow-300 font-bold text-lg mb-4">
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-3 font-bold text-sm shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300 scale-105"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      ₹{value >= 1000 ? `${value / 1000}K` : value}
                      {selectedChip === value && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
