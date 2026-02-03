import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, Flame, Crown, Zap } from "lucide-react";

interface Teen8GameProps {
  game?: any;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  angle: number;
  status: "active" | "folded" | "all-in";
  isChipLeader: boolean;
}

interface Bet {
  playerId: number;
  playerName: string;
  odds: number;
  stake: number;
}

const CHIPS = [1000, 5000, 10000, 25000, 50000, 100000];

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Shark1",
    avatar: "🦈",
    chips: 125000,
    angle: 0,
    status: "active",
    isChipLeader: true,
  },
  {
    id: 2,
    name: "Wolf2",
    avatar: "🐺",
    chips: 85000,
    angle: 45,
    status: "active",
    isChipLeader: false,
  },
  {
    id: 3,
    name: "Tiger3",
    avatar: "🐯",
    chips: 98000,
    angle: 90,
    status: "active",
    isChipLeader: false,
  },
  {
    id: 4,
    name: "Eagle4",
    avatar: "🦅",
    chips: 72000,
    angle: 135,
    status: "folded",
    isChipLeader: false,
  },
  {
    id: 5,
    name: "Lion5",
    avatar: "🦁",
    chips: 115000,
    angle: 180,
    status: "active",
    isChipLeader: false,
  },
  {
    id: 6,
    name: "Dragon6",
    avatar: "🐉",
    chips: 0,
    angle: 225,
    status: "all-in",
    isChipLeader: false,
  },
  {
    id: 7,
    name: "Fox7",
    avatar: "🦊",
    chips: 91000,
    angle: 270,
    status: "active",
    isChipLeader: false,
  },
  {
    id: 8,
    name: "You",
    avatar: "⚡",
    chips: 105000,
    angle: 315,
    status: "active",
    isChipLeader: false,
  },
];

const Teen8Game = ({ game }: Teen8GameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(10000);
  const [timeRemaining, setTimeRemaining] = useState(13);
  const [potGrowth, setPotGrowth] = useState([45000, 62000, 85000, 110000]);

  const gameId = game?.gmid || "teen8";
  const gameName = game?.gname || "Teen 8";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
    const existingBet = bets.find((b) => b.playerId === player.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.playerId !== player.id));
    } else {
      const odds = 2.0 + Math.random() * 3;
      setBets([
        ...bets,
        {
          playerId: player.id,
          playerName: player.name,
          odds: parseFloat(odds.toFixed(2)),
          stake: selectedChip,
        },
      ]);
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) {
      toast({ title: "No bets placed", variant: "destructive" });
      return;
    }

    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid || "round-1",
          marketId: `player-${bet.playerId}`,
          marketName: bet.playerName,
          selection: bet.playerName,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "Bets placed successfully!" });
      setBets([]);
    } catch (error: any) {
      toast({
        title: "Bet placement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWin = bets.reduce((sum, bet) => sum + bet.stake * bet.odds, 0);

  const chipLeaders = [...PLAYERS]
    .filter((p) => p.status !== "all-in")
    .sort((a, b) => b.chips - a.chips)
    .slice(0, 3);

  const radius = 190;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-red-950 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800/50 to-red-800/50 backdrop-blur-md rounded-xl p-4 mb-4 border-2 border-purple-500/40 flex justify-between items-center shadow-lg shadow-purple-500/20">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-purple-400">
                Teen Patti 8
              </h1>
              <p className="text-gray-300 text-sm">
                High-Stakes • Fast Action • 8 Players
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#8888"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* 8-Player Octagonal Table */}
            <div
              className="bg-gradient-to-br from-purple-900/20 to-red-900/20 backdrop-blur-md rounded-xl p-6 border-2 border-purple-500/30 relative"
              style={{ minHeight: "600px" }}
            >
              {/* Center Pot with Aggressive Styling */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-purple-600 to-red-600 rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-400">
                    <p className="text-sm font-bold text-yellow-400">
                      MAIN POT
                    </p>
                    <p className="text-5xl font-bold text-white">₹110k</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-purple-400 font-bold">
                    Boot: ₹2000
                  </p>
                </div>
              </div>

              {/* Players arranged in octagon */}
              <div className="relative w-full h-full flex items-center justify-center">
                {PLAYERS.map((player) => {
                  const isSelected = bets.some((b) => b.playerId === player.id);
                  const angleRad = (player.angle - 90) * (Math.PI / 180);
                  const x = radius * Math.cos(angleRad);
                  const y = radius * Math.sin(angleRad);

                  return (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      disabled={player.status === "folded"}
                      className={`absolute p-4 rounded-xl transition-all duration-200 min-w-[110px] border-2 ${
                        isSelected
                          ? "bg-gradient-to-br from-purple-500 to-red-500 shadow-2xl shadow-purple-500/50 scale-110 border-yellow-400"
                          : player.status === "folded"
                            ? "bg-gray-800/30 opacity-40 border-gray-700"
                            : player.status === "all-in"
                              ? "bg-gradient-to-br from-orange-600 to-red-600 border-orange-400 shadow-lg shadow-orange-500/50"
                              : player.isChipLeader
                                ? "bg-gradient-to-br from-yellow-600 to-orange-600 border-yellow-400 shadow-lg shadow-yellow-500/50"
                                : "bg-gray-800/80 hover:bg-gray-700/80 border-purple-500/40"
                      } ${player.status === "folded" ? "cursor-not-allowed" : ""}`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <div className="text-3xl">{player.avatar}</div>
                          {player.isChipLeader && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-white">
                          {player.name}
                        </p>
                        <div
                          className={`text-sm font-bold mt-1 px-2 py-1 rounded ${
                            player.status === "all-in"
                              ? "bg-red-600 text-white"
                              : player.status === "folded"
                                ? "bg-gray-700 text-gray-400"
                                : "bg-purple-600/50 text-purple-300"
                          }`}
                        >
                          {player.status === "all-in"
                            ? "ALL-IN!"
                            : `₹${(player.chips / 1000).toFixed(0)}k`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pot Growth Tracker */}
            <div className="bg-gradient-to-r from-purple-900/40 to-red-900/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Pot Growth Tracker
              </h3>
              <div className="flex gap-3">
                {potGrowth.map((amount, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 text-center p-4 rounded-lg ${
                      idx === potGrowth.length - 1
                        ? "bg-gradient-to-br from-purple-600 to-red-600 border-2 border-yellow-400 shadow-lg"
                        : "bg-gray-800/50"
                    }`}
                  >
                    <p className="text-xs text-gray-400 mb-1">
                      Round {idx + 1}
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        idx === potGrowth.length - 1
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                    >
                      ₹{(amount / 1000).toFixed(0)}k
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls with Fast Timer */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Quick Action
                </h3>
                <div
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg ${
                    timeRemaining <= 5
                      ? "bg-red-600 animate-pulse"
                      : "bg-gray-800/50"
                  }`}
                >
                  <Clock className="w-6 h-6 text-red-400" />
                  <span className="text-3xl font-bold text-white">
                    {timeRemaining}s
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Button className="bg-red-600 hover:bg-red-500 text-white font-bold py-7 text-lg shadow-lg">
                  Pack
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-7 text-lg shadow-lg">
                  Chaal
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-7 text-lg shadow-lg">
                  Side Show
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold py-7 text-lg shadow-lg">
                  Show
                </Button>
              </div>
            </div>

            {/* Chip Leaders Board */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
              <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Chip Leaders
              </h3>
              <div className="space-y-3">
                {chipLeaders.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      idx === 0
                        ? "bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg"
                        : "bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl font-bold ${
                          idx === 0 ? "text-yellow-400" : "text-gray-400"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="font-bold text-white">
                        {player.name}
                      </span>
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        idx === 0 ? "text-white" : "text-purple-400"
                      }`}
                    >
                      ₹{(player.chips / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand Rankings */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-purple-400 mb-4">
                Quick Reference
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {HAND_RANKINGS.map((ranking, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg p-3 text-center"
                  >
                    <p className="text-sm font-semibold text-white">
                      {ranking.name}
                    </p>
                    <p className="text-sm text-purple-400">
                      {ranking.multiplier}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-900/20 rounded-xl p-6 border-2 border-purple-500/40 h-fit sticky top-4 shadow-xl">
            <h3 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6" />
              Bet Slip
            </h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Select Chip</p>
              <div className="grid grid-cols-3 gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-3 rounded-lg font-bold transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-purple-500 to-red-500 text-white shadow-lg shadow-purple-500/50 scale-110 border-2 border-yellow-400"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-purple-500/30"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Bets */}
            <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
              {bets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No bets placed yet
                </p>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/60 rounded-lg p-3 border border-purple-500/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-white">
                        {bet.playerName}
                      </p>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Odds: {bet.odds.toFixed(2)}
                      </span>
                      <span className="text-gray-400">
                        Stake: ₹{bet.stake.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-purple-400 text-sm font-semibold mt-1">
                      Win: ₹{(bet.stake * bet.odds).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900/40 to-red-900/40 rounded-lg p-4 mb-4 space-y-2 border border-purple-500/30">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Total Stake:</span>
                  <span className="text-white font-bold">
                    ₹{totalStake.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Potential Win:</span>
                  <span className="text-purple-400 font-bold">
                    ₹{potentialWin.toFixed(0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-purple-500/30"
              >
                Clear
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-purple-500/30"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold py-5 rounded-lg shadow-2xl shadow-purple-500/50 disabled:opacity-50 text-lg border-2 border-yellow-400"
            >
              <Flame className="w-5 h-5 mr-2" />
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen8Game;
