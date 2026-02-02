import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Zap, Trophy, Users, TrendingUp, Activity, Flame } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Teen33GameProps {
  game?: Game;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  status: "active" | "folded" | "eliminated";
  currentBet: number;
  angle: number;
  aggressionLevel: number; // 0-100
}

interface Bet {
  type: string;
  amount: number;
}

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Rahul K",
    avatar: "⚡",
    chips: 45000,
    status: "active",
    currentBet: 0,
    angle: 0,
    aggressionLevel: 85,
  },
  {
    id: 2,
    name: "Priya M",
    avatar: "🎯",
    chips: 38000,
    status: "active",
    currentBet: 0,
    angle: 60,
    aggressionLevel: 45,
  },
  {
    id: 3,
    name: "You",
    avatar: "💥",
    chips: 52000,
    status: "active",
    currentBet: 0,
    angle: 120,
    aggressionLevel: 65,
  },
  {
    id: 4,
    name: "Amit S",
    avatar: "🔥",
    chips: 28000,
    status: "active",
    currentBet: 0,
    angle: 180,
    aggressionLevel: 92,
  },
  {
    id: 5,
    name: "Neha P",
    avatar: "⭐",
    chips: 41000,
    status: "active",
    currentBet: 0,
    angle: 240,
    aggressionLevel: 38,
  },
  {
    id: 6,
    name: "Rohan T",
    avatar: "💎",
    chips: 56000,
    status: "active",
    currentBet: 0,
    angle: 300,
    aggressionLevel: 72,
  },
];

const CHIP_VALUES = [500, 1000, 2500, 5000, 10000];

export default function Teen33Game({ game }: Teen33GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(2500);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [mainPot, setMainPot] = useState(18500);
  const [currentBlindLevel, setCurrentBlindLevel] = useState(3);
  const [blindTimeRemaining, setBlindTimeRemaining] = useState(185);
  const [remainingPlayers] = useState(47);
  const [totalPlayers] = useState(120);
  const [chipLeader] = useState("Rohan T");
  const [averageStack] = useState(43200);

  const gameId = game?.gmid || "teen33";
  const gameName = game?.gname || "Teen 33";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const blindTimer = setInterval(() => {
      setBlindTimeRemaining((prev) => {
        if (prev <= 1) {
          setCurrentBlindLevel((level) => level + 1);
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(blindTimer);
  }, []);

  const handleBet = (type: string) => {
    if (timeRemaining <= 1) {
      toast({
        title: "Time's Up!",
        description: "Too late to act",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = { type, amount: selectedChip };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet({
      gameId: gameId,
      gameName: gameName,
      roundId: gameData?.mid || "",
      marketId: "",
      marketName: type,
      selection: type,
      odds: 0,
      stake: selectedChip,
      betType: "BACK",
    });

    toast({
      title: "Quick Bet!",
      description: `${type}: ₹${selectedChip}`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAggressionColor = (level: number) => {
    if (level >= 80) return "bg-red-500";
    if (level >= 50) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-cyan-950 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Tournament Progress Tracker - Top */}
          <div className="bg-gradient-to-r from-cyan-900/40 via-gray-900/60 to-red-900/40 backdrop-blur-md border-2 border-cyan-500/40 rounded-2xl p-4 mb-4 shadow-2xl shadow-cyan-500/20">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 text-xs mb-1">
                  <Activity className="w-4 h-4" />
                  Blind Level
                </div>
                <div className="text-white font-bold text-2xl">
                  {currentBlindLevel}
                </div>
                <div className="text-cyan-300 text-xs">
                  Next in {formatTime(blindTimeRemaining)}
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
                  <Users className="w-4 h-4" />
                  Players
                </div>
                <div className="text-white font-bold text-2xl">
                  {remainingPlayers}/{totalPlayers}
                </div>
                <div className="text-green-300 text-xs">Still Active</div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                  <Trophy className="w-4 h-4" />
                  Chip Leader
                </div>
                <div className="text-white font-bold text-lg">{chipLeader}</div>
                <div className="text-yellow-300 text-xs">Leading Stack</div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Avg Stack
                </div>
                <div className="text-white font-bold text-2xl">
                  ₹{(averageStack / 1000).toFixed(1)}K
                </div>
                <div className="text-purple-300 text-xs">Tournament Avg</div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
                  <Zap className="w-4 h-4" />
                  Decision Time
                </div>
                <div
                  className={`font-bold text-3xl ${timeRemaining <= 3 ? "text-red-500 animate-pulse" : "text-white"}`}
                >
                  {timeRemaining}s
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Action Heat Map - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Action Heat Map
                </h3>
                <div className="space-y-3">
                  {PLAYERS.sort(
                    (a, b) => b.aggressionLevel - a.aggressionLevel,
                  ).map((player) => (
                    <div
                      key={player.id}
                      className="bg-black/40 border border-gray-700/50 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{player.avatar}</span>
                          <span className="text-white font-semibold text-sm">
                            {player.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            player.aggressionLevel >= 80
                              ? "bg-red-500/20 text-red-400"
                              : player.aggressionLevel >= 50
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {player.aggressionLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getAggressionColor(player.aggressionLevel)} transition-all`}
                          style={{ width: `${player.aggressionLevel}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {player.aggressionLevel >= 80
                          ? "Ultra Aggressive"
                          : player.aggressionLevel >= 50
                            ? "Aggressive"
                            : "Conservative"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-black/40 rounded-lg p-2">
                    <span className="text-gray-400">Hands Played:</span>
                    <span className="text-white font-bold">127</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 rounded-lg p-2">
                    <span className="text-gray-400">Eliminations:</span>
                    <span className="text-red-400 font-bold">73</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 rounded-lg p-2">
                    <span className="text-gray-400">Avg Pot:</span>
                    <span className="text-yellow-400 font-bold">₹14.2K</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 rounded-lg p-2">
                    <span className="text-gray-400">Biggest Pot:</span>
                    <span className="text-green-400 font-bold">₹89K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Game Table */}
              <div className="relative bg-gradient-to-br from-cyan-900/30 via-gray-900/50 to-red-900/30 backdrop-blur-md border-4 border-cyan-500/40 rounded-3xl p-8 shadow-2xl min-h-[550px]">
                {/* Players positioned in hexagonal layout */}
                {PLAYERS.map((player) => {
                  const radius = 200;
                  const angleRad = (player.angle - 90) * (Math.PI / 180);
                  const x = radius * Math.cos(angleRad);
                  const y = radius * Math.sin(angleRad);

                  return (
                    <div
                      key={player.id}
                      className="absolute min-w-[140px]"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        className={`rounded-xl p-3 border-2 shadow-xl transition-all ${
                          player.status === "active"
                            ? "bg-gradient-to-br from-cyan-800/70 to-gray-900/70 border-cyan-400/50"
                            : player.status === "folded"
                              ? "bg-gray-800/40 border-gray-600/30 opacity-50"
                              : "bg-red-800/40 border-red-600/30 opacity-30"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-1">{player.avatar}</div>
                          <div className="text-white font-bold text-xs mb-1">
                            {player.name}
                          </div>
                          <div className="text-yellow-400 font-bold text-sm">
                            ₹{(player.chips / 1000).toFixed(1)}K
                          </div>
                          {player.currentBet > 0 && (
                            <div className="bg-cyan-500/20 border border-cyan-400 rounded px-2 py-1 text-cyan-300 text-xs font-bold mt-1">
                              ₹{player.currentBet}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Center Pot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-cyan-600/40 to-red-600/40 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl shadow-yellow-500/50">
                    <div className="text-center">
                      <div className="text-cyan-300 text-xs font-semibold uppercase tracking-wide mb-1">
                        Tournament Pot
                      </div>
                      <div className="text-yellow-400 font-bold text-4xl mb-1 drop-shadow-lg animate-pulse">
                        ₹{(mainPot / 1000).toFixed(1)}K
                      </div>
                      <div className="flex items-center justify-center gap-1 text-white text-xs">
                        <Zap className="w-3 h-3 text-red-400" />
                        FAST ACTION
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls - Large tap targets */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Button
                  onClick={() => handleBet("pack")}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-8 text-xl font-bold rounded-xl shadow-2xl border-2 border-red-400/50 transform hover:scale-105 active:scale-95 transition-all"
                >
                  FOLD
                </Button>
                <Button
                  onClick={() => handleBet("chaal")}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-8 text-xl font-bold rounded-xl shadow-2xl border-2 border-blue-400/50 transform hover:scale-105 active:scale-95 transition-all"
                >
                  CALL
                </Button>
                <Button
                  onClick={() => handleBet("raise")}
                  className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white py-8 text-xl font-bold rounded-xl shadow-2xl border-2 border-green-400/50 transform hover:scale-105 active:scale-95 transition-all"
                >
                  RAISE
                </Button>
                <Button
                  onClick={() => handleBet("show")}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-8 text-xl font-bold rounded-xl shadow-2xl border-2 border-yellow-400/50 transform hover:scale-105 active:scale-95 transition-all"
                >
                  SHOW
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chip Selector */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Bet
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-300 scale-105 shadow-cyan-500/50"
                          : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 border-gray-600/50 hover:border-cyan-400"
                      }`}
                    >
                      ₹{value.toLocaleString()}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hand History - Compact */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-cyan-300 font-bold text-lg mb-3">
                  Recent Hands
                </h3>
                <div className="space-y-2">
                  {[
                    { hand: 127, winner: "Rohan T", pot: 24000 },
                    { hand: 126, winner: "You", pot: 18000 },
                    { hand: 125, winner: "Amit S", pot: 31000 },
                    { hand: 124, winner: "Priya M", pot: 15000 },
                    { hand: 123, winner: "Rahul K", pot: 28000 },
                  ].map((entry) => (
                    <div
                      key={entry.hand}
                      className="bg-black/40 border border-gray-700/50 rounded-lg p-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-gray-400 text-xs">
                          #{entry.hand}
                        </div>
                        <div className="text-white font-semibold text-sm">
                          {entry.winner}
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold text-sm">
                        ₹{(entry.pot / 1000).toFixed(1)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament Info */}
              <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
                <div className="text-center">
                  <div className="text-cyan-300 text-sm font-semibold mb-2">
                    🏆 TOURNAMENT MODE 🏆
                  </div>
                  <div className="text-white font-bold text-lg">
                    Fast & Furious
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    8-12 sec decisions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
