import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Clock,
} from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Teen32GameProps {
  game?: Game;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  status: "active" | "folded" | "all-in";
  currentBet: number;
  position: string;
  vipStats: {
    buyIn: number;
    wins: number;
    losses: number;
    profitLoss: number;
  };
}

interface Bet {
  type: string;
  amount: number;
}

interface HandHistoryEntry {
  round: number;
  winner: string;
  pot: number;
  actions: string[];
}

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Victor K",
    avatar: "👔",
    chips: 2850000,
    status: "active",
    currentBet: 0,
    position: "top",
    vipStats: { buyIn: 2000000, wins: 12, losses: 8, profitLoss: 850000 },
  },
  {
    id: 2,
    name: "Sophia R",
    avatar: "💎",
    chips: 3200000,
    status: "active",
    currentBet: 0,
    position: "right-top",
    vipStats: { buyIn: 2500000, wins: 15, losses: 10, profitLoss: 700000 },
  },
  {
    id: 3,
    name: "Marcus W",
    avatar: "🎩",
    chips: 1950000,
    status: "active",
    currentBet: 0,
    position: "right-bottom",
    vipStats: { buyIn: 2200000, wins: 8, losses: 12, profitLoss: -250000 },
  },
  {
    id: 4,
    name: "You",
    avatar: "⭐",
    chips: 4100000,
    status: "active",
    currentBet: 0,
    position: "bottom",
    vipStats: { buyIn: 3000000, wins: 18, losses: 9, profitLoss: 1100000 },
  },
  {
    id: 5,
    name: "Isabella M",
    avatar: "👑",
    chips: 2700000,
    status: "active",
    currentBet: 0,
    position: "left-bottom",
    vipStats: { buyIn: 2400000, wins: 11, losses: 11, profitLoss: 300000 },
  },
  {
    id: 6,
    name: "Alexander P",
    avatar: "💼",
    chips: 3450000,
    status: "active",
    currentBet: 0,
    position: "left-top",
    vipStats: { buyIn: 2800000, wins: 14, losses: 9, profitLoss: 650000 },
  },
];

const HAND_RANKINGS = [
  { rank: 1, name: "Trail/Trio", example: "A-A-A", icon: "🔥" },
  { rank: 2, name: "Pure Sequence", example: "A-K-Q", icon: "💎" },
  { rank: 3, name: "Sequence", example: "K-Q-J", icon: "📊" },
  { rank: 4, name: "Color/Flush", example: "A-K-10", icon: "🎨" },
  { rank: 5, name: "Pair", example: "K-K-7", icon: "👥" },
  { rank: 6, name: "High Card", example: "A-K-J", icon: "🃏" },
];

const CHIP_VALUES = [50000, 100000, 250000, 500000, 1000000, 2500000];

export default function Teen32Game({ game }: Teen32GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(500000);
  const [timeRemaining, setTimeRemaining] = useState(23);
  const [mainPot, setMainPot] = useState(1850000);
  const [bootAmount] = useState(100000);
  const [totalRake] = useState(2750000);
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([
    {
      round: 45,
      winner: "Isabella M",
      pot: 1850000,
      actions: [
        "Victor K: Chaal ₹200K",
        "Sophia R: Raise ₹400K",
        "Isabella M: Show",
        "Others: Pack",
      ],
    },
    {
      round: 44,
      winner: "Alexander P",
      pot: 2200000,
      actions: [
        "Marcus W: Chaal ₹150K",
        "Alexander P: Raise ₹600K",
        "All Pack",
      ],
    },
    {
      round: 43,
      winner: "You",
      pot: 1950000,
      actions: [
        "You: Chaal ₹250K",
        "Victor K: Side Show Lost",
        "You: Show Win",
      ],
    },
  ]);

  const gameId = game?.gmid || "teen32";
  const gameName = game?.gname || "Teen 32";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 23));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBet = (type: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Time's Up",
        description: "Please wait for the next round",
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
      title: "Bet Placed",
      description: `${type}: ₹${(selectedChip / 1000).toFixed(0)}K`,
    });
  };

  const getPlayerPosition = (position: string) => {
    const positions: { [key: string]: string } = {
      top: "top-4 left-1/2 transform -translate-x-1/2",
      "right-top": "top-1/4 right-4",
      "right-bottom": "bottom-1/4 right-4",
      bottom: "bottom-4 left-1/2 transform -translate-x-1/2",
      "left-bottom": "bottom-1/4 left-4",
      "left-top": "top-1/4 left-4",
    };
    return positions[position] || "";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-black p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Dealer Panel - Top */}
          <div className="bg-gradient-to-r from-yellow-900/30 via-purple-900/30 to-yellow-900/30 backdrop-blur-md border-2 border-yellow-600/40 rounded-2xl p-4 mb-4 shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">
                    HIGH ROLLER TABLE
                  </span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">
                    Total Rake:{" "}
                    <span className="text-yellow-400 font-bold">
                      ₹{(totalRake / 1000).toFixed(0)}K
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="text-purple-200">
                  <span className="text-purple-400">Min Boot:</span>{" "}
                  <span className="font-bold text-white">₹50K</span>
                </div>
                <div className="text-purple-200">
                  <span className="text-purple-400">Max Boot:</span>{" "}
                  <span className="font-bold text-white">₹500K</span>
                </div>
                <div className="text-purple-200">
                  <span className="text-purple-400">Min Chaal:</span>{" "}
                  <span className="font-bold text-white">₹100K</span>
                </div>
                <div className="text-purple-200">
                  <span className="text-purple-400">Max Chaal:</span>{" "}
                  <span className="font-bold text-white">₹5M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* VIP Player Tracking Panel - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  VIP Session Stats
                </h3>
                <div className="space-y-3">
                  {PLAYERS.map((player) => (
                    <div
                      key={player.id}
                      className="bg-black/40 border border-purple-500/20 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{player.avatar}</span>
                        <span className="text-white font-semibold text-sm">
                          {player.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-purple-400">Buy-in:</div>
                          <div className="text-white font-bold">
                            ₹{(player.vipStats.buyIn / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div>
                          <div className="text-purple-400">W/L:</div>
                          <div className="text-white font-bold">
                            {player.vipStats.wins}/{player.vipStats.losses}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-purple-400">P/L:</div>
                          <div
                            className={`font-bold text-sm flex items-center gap-1 ${player.vipStats.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {player.vipStats.profitLoss >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            ₹
                            {(
                              Math.abs(player.vipStats.profitLoss) / 1000
                            ).toFixed(0)}
                            K
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hand Rankings */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-3">
                  Hand Rankings
                </h3>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-black/40 rounded-lg p-2 border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{hand.icon}</span>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {hand.name}
                            </div>
                            <div className="text-purple-400 text-xs">
                              {hand.example}
                            </div>
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold text-xs">
                          #{hand.rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Timer and Match Info */}
              <div className="bg-gradient-to-r from-purple-900/40 to-black/40 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-2xl ${
                        timeRemaining <= 5
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
                      }`}
                    >
                      {timeRemaining}
                      <Clock className="absolute -bottom-1 -right-1 w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <div className="text-purple-300 text-sm uppercase tracking-wide">
                        Decision Time
                      </div>
                      <div className="text-white font-bold text-xl">
                        Think Carefully
                      </div>
                      <div className="text-purple-400 text-xs">
                        High-Stakes Round
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-purple-300 text-sm uppercase tracking-wide">
                      Match ID
                    </div>
                    <div className="text-white font-mono text-lg">
                      {gameData?.mid || "Loading..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Table */}
              <div className="relative bg-gradient-to-br from-purple-900/60 via-gray-900/80 to-black/60 backdrop-blur-md border-4 border-yellow-600/40 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                {/* Players positioned around table */}
                {PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute ${getPlayerPosition(player.position)} min-w-[180px]`}
                  >
                    <div
                      className={`rounded-2xl p-4 border-2 shadow-2xl ${
                        player.status === "active"
                          ? "bg-gradient-to-br from-purple-800/80 to-gray-900/80 border-yellow-500/50"
                          : player.status === "folded"
                            ? "bg-gray-800/40 border-gray-600/30 opacity-50"
                            : "bg-gradient-to-br from-orange-600/80 to-red-600/80 border-orange-400"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-2">{player.avatar}</div>
                        <div className="text-white font-bold text-sm mb-1">
                          {player.name}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-lg mb-1">
                          <DollarSign className="w-4 h-4" />
                          {(player.chips / 1000).toFixed(0)}K
                        </div>
                        {player.currentBet > 0 && (
                          <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg px-2 py-1 text-yellow-300 text-xs font-bold">
                            Bet: ₹{(player.currentBet / 1000).toFixed(0)}K
                          </div>
                        )}
                        {player.status === "all-in" && (
                          <div className="text-orange-300 font-bold text-xs mt-1 animate-pulse">
                            ALL-IN!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Center Pot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl shadow-yellow-500/50 animate-pulse">
                    <div className="text-center">
                      <div className="text-yellow-300 text-sm font-semibold uppercase tracking-wide mb-2">
                        Main Pot
                      </div>
                      <div className="text-yellow-400 font-bold text-4xl mb-2 drop-shadow-lg">
                        ₹{(mainPot / 1000).toFixed(0)}K
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg px-4 py-1">
                        <div className="text-yellow-300 text-xs">
                          Boot Amount
                        </div>
                        <div className="text-white font-bold text-lg">
                          ₹{(bootAmount / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Button
                  onClick={() => handleBet("pack")}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl border-2 border-red-400/50"
                >
                  Pack
                </Button>
                <Button
                  onClick={() => handleBet("chaal")}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl border-2 border-blue-400/50"
                >
                  Chaal
                </Button>
                <Button
                  onClick={() => handleBet("sideshow")}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl border-2 border-purple-400/50"
                >
                  Side Show
                </Button>
                <Button
                  onClick={() => handleBet("show")}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-xl shadow-2xl border-2 border-yellow-400/50"
                >
                  Show
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chip Selector */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  Select Stake
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-sm shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-yellow-300 scale-105 shadow-yellow-500/50"
                          : "bg-gradient-to-br from-purple-800 to-purple-900 text-purple-100 border-purple-600/50 hover:border-purple-400"
                      }`}
                    >
                      <div className="text-xs opacity-80">₹</div>
                      <div>{(value / 1000).toFixed(0)}K</div>
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

              {/* Comprehensive Hand History */}
              <div className="bg-gray-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4">
                  Hand History
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {handHistory.map((entry) => (
                    <div
                      key={entry.round}
                      className="bg-black/40 border border-purple-500/20 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 text-xs font-semibold">
                          Round #{entry.round}
                        </span>
                        <span className="text-yellow-400 font-bold text-sm">
                          ₹{(entry.pot / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="text-green-400 font-bold text-sm mb-2">
                        Winner: {entry.winner}
                      </div>
                      <div className="space-y-1">
                        {entry.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-purple-300 bg-purple-900/20 rounded px-2 py-1"
                          >
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
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
