import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Star, Sparkles, Gift, TrendingUp } from "lucide-react";

interface Game {
  gmid: string;
  gname?: string;
}

interface Teen41GameProps {
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
}

interface SideBet {
  id: string;
  name: string;
  description: string;
  odds: string;
  payout: string;
  icon: string;
  color: string;
  active: boolean;
}

interface Bet {
  type: string;
  amount: number;
  isSideBet?: boolean;
}

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "David L",
    avatar: "🎩",
    chips: 125000,
    status: "active",
    currentBet: 0,
    position: "top",
  },
  {
    id: 2,
    name: "Emma S",
    avatar: "💫",
    chips: 98000,
    status: "active",
    currentBet: 0,
    position: "right-top",
  },
  {
    id: 3,
    name: "James K",
    avatar: "🌟",
    chips: 110000,
    status: "active",
    currentBet: 0,
    position: "right-bottom",
  },
  {
    id: 4,
    name: "You",
    avatar: "⭐",
    chips: 145000,
    status: "active",
    currentBet: 0,
    position: "bottom",
  },
  {
    id: 5,
    name: "Olivia M",
    avatar: "✨",
    chips: 87000,
    status: "active",
    currentBet: 0,
    position: "left-bottom",
  },
  {
    id: 6,
    name: "Noah T",
    avatar: "💎",
    chips: 132000,
    status: "active",
    currentBet: 0,
    position: "left-top",
  },
];

const SIDE_BETS: SideBet[] = [
  {
    id: "pairplus",
    name: "Pair Plus",
    description: "Win with any pair or better",
    odds: "1:1 - 40:1",
    payout:
      "Pair: 1:1, Flush: 4:1, Straight: 6:1, Three of a Kind: 30:1, Straight Flush: 40:1",
    icon: "👥",
    color: "from-blue-600 to-blue-800",
    active: true,
  },
  {
    id: "highcard",
    name: "High Card",
    description: "Bet on getting high card (Q or better)",
    odds: "1:1",
    payout: "Queen or better: 1:1",
    icon: "🃏",
    color: "from-purple-600 to-purple-800",
    active: true,
  },
  {
    id: "flush",
    name: "Flush Bonus",
    description: "All three cards same suit",
    odds: "4:1",
    payout: "Flush: 4:1",
    icon: "🎨",
    color: "from-pink-600 to-pink-800",
    active: true,
  },
  {
    id: "straight",
    name: "Straight Bonus",
    description: "Three cards in sequence",
    odds: "6:1",
    payout: "Straight: 6:1",
    icon: "📊",
    color: "from-green-600 to-green-800",
    active: true,
  },
  {
    id: "trio",
    name: "Trio Jackpot",
    description: "Three of a kind",
    odds: "30:1",
    payout: "Three of a Kind: 30:1",
    icon: "🔥",
    color: "from-orange-600 to-red-800",
    active: true,
  },
  {
    id: "mini",
    name: "Mini Royal",
    description: "Three suited cards (A-K-Q)",
    odds: "100:1",
    payout: "Suited A-K-Q: 100:1",
    icon: "👑",
    color: "from-yellow-600 to-amber-800",
    active: true,
  },
];

const CHIP_VALUES = [1000, 2500, 5000, 10000, 25000];

const HAND_RANKINGS = [
  {
    rank: 1,
    name: "Mini Royal (Suited A-K-Q)",
    multiplier: "100x",
    icon: "👑",
  },
  { rank: 2, name: "Straight Flush", multiplier: "40x", icon: "🔥" },
  { rank: 3, name: "Three of a Kind", multiplier: "30x", icon: "💎" },
  { rank: 4, name: "Straight", multiplier: "6x", icon: "📊" },
  { rank: 5, name: "Flush", multiplier: "4x", icon: "🎨" },
  { rank: 6, name: "Pair", multiplier: "1x", icon: "👥" },
  { rank: 7, name: "High Card", multiplier: "1x", icon: "🃏" },
];

export default function Teen41Game({ game }: Teen41GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(5000);
  const [timeRemaining, setTimeRemaining] = useState(16);
  const [mainPot, setMainPot] = useState(85000);
  const [activeSideBets, setActiveSideBets] = useState<{
    [key: string]: number;
  }>({});

  const gameId = game?.gmid || "teen41";
  const gameName = game?.gname || "Teen 41";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 16));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMainBet = (type: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Wait for next round",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = { type, amount: selectedChip, isSideBet: false };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      gameId,
      gameData?.mid || "",
      "",
      type,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Main Bet Placed",
      description: `${type}: ₹${selectedChip}`,
    });
  };

  const handleSideBet = (sideBetId: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Wait for next round",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = {
      type: sideBetId,
      amount: selectedChip,
      isSideBet: true,
    };
    setBets([...bets, newBet]);

    setActiveSideBets({
      ...activeSideBets,
      [sideBetId]: (activeSideBets[sideBetId] || 0) + selectedChip,
    });

    const sideBet = SIDE_BETS.find((sb) => sb.id === sideBetId);

    toast({
      title: "Side Bet Placed!",
      description: `${sideBet?.name}: ₹${selectedChip}`,
    });
  };

  const getTotalSideBets = () => {
    return Object.values(activeSideBets).reduce(
      (sum, amount) => sum + amount,
      0,
    );
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-purple-950 p-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Teen Patti 41 - Premium Side Bets
                  </h1>
                  <p className="text-purple-300 text-sm">
                    Exotic rules & multiple betting options
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-purple-300 text-sm">Match ID</div>
                <div className="text-white font-mono text-lg">
                  {gameData?.mid || "Loading..."}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Side Bets Panel - Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-900/70 backdrop-blur-md border-2 border-yellow-500/40 rounded-2xl p-5 shadow-2xl shadow-yellow-500/20">
                <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  Side Bets
                </h3>
                <div className="space-y-3">
                  {SIDE_BETS.map((sideBet) => (
                    <button
                      key={sideBet.id}
                      onClick={() => handleSideBet(sideBet.id)}
                      disabled={!sideBet.active || timeRemaining <= 2}
                      className={`w-full bg-gradient-to-br ${sideBet.color} hover:opacity-90 rounded-xl p-4 border-2 border-white/30 shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative`}
                    >
                      <div className="text-left">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{sideBet.icon}</span>
                            <span className="text-white font-bold text-sm">
                              {sideBet.name}
                            </span>
                          </div>
                          <div className="bg-yellow-400/30 text-yellow-300 text-xs font-bold px-2 py-1 rounded">
                            {sideBet.odds}
                          </div>
                        </div>
                        <div className="text-white/80 text-xs mb-2">
                          {sideBet.description}
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-xs text-white/70 font-mono">
                          {sideBet.payout}
                        </div>
                      </div>

                      {activeSideBets[sideBet.id] && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          ₹{activeSideBets[sideBet.id]}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side Bet Tracker */}
              <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Active Side Bets
                </h3>
                {Object.keys(activeSideBets).length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Gift className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <div className="text-sm">No side bets placed</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(activeSideBets).map(([betId, amount]) => {
                      const sideBet = SIDE_BETS.find((sb) => sb.id === betId);
                      if (!sideBet) return null;

                      return (
                        <div
                          key={betId}
                          className="bg-black/40 rounded-lg p-3 border border-purple-500/20"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{sideBet.icon}</span>
                              <div>
                                <div className="text-white font-semibold text-sm">
                                  {sideBet.name}
                                </div>
                                <div className="text-purple-400 text-xs">
                                  {sideBet.odds}
                                </div>
                              </div>
                            </div>
                            <div className="text-yellow-400 font-bold">
                              ₹{amount}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-purple-500/30 pt-3 mt-3">
                      <div className="flex items-center justify-between text-white font-bold">
                        <span>Total Side Bets</span>
                        <span className="text-yellow-400">
                          ₹{getTotalSideBets()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {/* Timer */}
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 mb-4 shadow-2xl">
                <div className="flex items-center justify-center gap-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl ${
                      timeRemaining <= 5
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
                    }`}
                  >
                    {timeRemaining}
                  </div>
                  <div>
                    <div className="text-purple-300 text-sm uppercase">
                      Betting Time
                    </div>
                    <div className="text-white font-bold text-2xl">
                      Place Your Bets
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Table */}
              <div className="relative bg-gradient-to-br from-purple-900/60 via-gray-900/80 to-pink-900/60 backdrop-blur-md border-4 border-purple-500/40 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                {/* Players */}
                {PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    className={`absolute ${getPlayerPosition(player.position)} min-w-[160px]`}
                  >
                    <div
                      className={`rounded-2xl p-4 border-2 shadow-2xl ${
                        player.status === "active"
                          ? "bg-gradient-to-br from-purple-800/80 to-gray-900/80 border-purple-400/50"
                          : player.status === "folded"
                            ? "bg-gray-800/40 border-gray-600/30 opacity-50"
                            : "bg-gradient-to-br from-orange-600/80 to-red-600/80 border-orange-400"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{player.avatar}</div>
                        <div className="text-white font-bold text-sm mb-1">
                          {player.name}
                        </div>
                        <div className="text-yellow-400 font-bold text-lg">
                          ₹{(player.chips / 1000).toFixed(0)}K
                        </div>
                        {player.currentBet > 0 && (
                          <div className="bg-purple-500/20 border border-purple-400 rounded-lg px-2 py-1 text-purple-300 text-xs font-bold mt-1">
                            ₹{player.currentBet}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Center Pot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-xl border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl shadow-purple-500/50">
                    <div className="text-center">
                      <div className="text-purple-300 text-sm font-semibold uppercase mb-1">
                        Main Pot
                      </div>
                      <div className="text-yellow-400 font-bold text-4xl mb-2">
                        ₹{(mainPot / 1000).toFixed(0)}K
                      </div>
                      {getTotalSideBets() > 0 && (
                        <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg px-3 py-1">
                          <div className="text-yellow-300 text-xs">
                            + Side Bets
                          </div>
                          <div className="text-white font-bold">
                            ₹{(getTotalSideBets() / 1000).toFixed(1)}K
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Controls */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <Button
                  onClick={() => handleMainBet("pack")}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Pack
                </Button>
                <Button
                  onClick={() => handleMainBet("chaal")}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Chaal
                </Button>
                <Button
                  onClick={() => handleMainBet("sideshow")}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Side Show
                </Button>
                <Button
                  onClick={() => handleMainBet("show")}
                  className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-xl shadow-2xl"
                >
                  Show
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Chip Selector */}
              <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4">
                  Select Chip
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-yellow-300 scale-105"
                          : "bg-gradient-to-br from-purple-800 to-purple-900 text-purple-100 border-purple-600/50"
                      }`}
                    >
                      ₹{value.toLocaleString()}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hand Rankings with Side Bet Multipliers */}
              <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Hand Rankings
                </h3>
                <div className="space-y-2">
                  {HAND_RANKINGS.map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-black/40 rounded-lg p-3 border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{hand.icon}</span>
                          <div>
                            <div className="text-white font-semibold text-xs">
                              {hand.name}
                            </div>
                            <div className="text-purple-400 text-xs">
                              #{hand.rank}
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-500/20 text-yellow-400 font-bold text-sm px-2 py-1 rounded">
                          {hand.multiplier}
                        </div>
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
