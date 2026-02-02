import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, Users, Activity } from "lucide-react";

interface Teen9GameProps {
  game?: any;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  angle: number;
  status: "active" | "folded" | "all-in";
}

interface Bet {
  playerId: number;
  playerName: string;
  odds: number;
  stake: number;
}

const CHIPS = [500, 1000, 5000, 10000, 25000, 50000];

const PLAYERS: Player[] = [
  { id: 1, name: "P1", avatar: "👤", chips: 28000, angle: 0, status: "active" },
  {
    id: 2,
    name: "P2",
    avatar: "🎭",
    chips: 35000,
    angle: 40,
    status: "active",
  },
  { id: 3, name: "P3", avatar: "🎪", chips: 0, angle: 80, status: "all-in" },
  {
    id: 4,
    name: "P4",
    avatar: "🎨",
    chips: 42000,
    angle: 120,
    status: "active",
  },
  {
    id: 5,
    name: "P5",
    avatar: "🎯",
    chips: 31000,
    angle: 160,
    status: "folded",
  },
  {
    id: 6,
    name: "P6",
    avatar: "🎲",
    chips: 38000,
    angle: 200,
    status: "active",
  },
  {
    id: 7,
    name: "P7",
    avatar: "🎸",
    chips: 45000,
    angle: 240,
    status: "active",
  },
  {
    id: 8,
    name: "P8",
    avatar: "🎹",
    chips: 29000,
    angle: 280,
    status: "active",
  },
  {
    id: 9,
    name: "You",
    avatar: "⭐",
    chips: 40000,
    angle: 320,
    status: "active",
  },
];

const HAND_RANKINGS = [
  { rank: 1, name: "Trail", multiplier: "5x" },
  { rank: 2, name: "Pure Seq", multiplier: "4x" },
  { rank: 3, name: "Sequence", multiplier: "3x" },
  { rank: 4, name: "Color", multiplier: "2.5x" },
  { rank: 5, name: "Pair", multiplier: "2x" },
  { rank: 6, name: "High Card", multiplier: "1.5x" },
];

const ACTION_HISTORY = [
  { player: "P4", action: "Raise ₹5k", time: "2s ago" },
  { player: "P7", action: "Call ₹5k", time: "5s ago" },
  { player: "P2", action: "Raise ₹2.5k", time: "8s ago" },
  { player: "P6", action: "Call ₹2.5k", time: "12s ago" },
  { player: "P1", action: "Fold", time: "15s ago" },
];

const Teen9Game = ({ game }: Teen9GameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(5000);
  const [timeRemaining, setTimeRemaining] = useState(15);

  const gameId = game?.gmid || "teen9";
  const gameName = game?.gname || "Teen 9";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
    const existingBet = bets.find((b) => b.playerId === player.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.playerId !== player.id));
    } else {
      const odds = 2.0 + Math.random() * 2.5;
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

  const radius = 180;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/40 to-green-800/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-gray-700/30 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Teen Patti 9</h1>
            <p className="text-gray-300 text-sm">
              9-Player Table • Maximum Capacity
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#9001"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* 9-Player Table */}
            <div
              className="bg-gradient-to-br from-green-900/20 to-gray-900/20 backdrop-blur-md rounded-xl p-6 border border-green-600/20 relative"
              style={{ minHeight: "580px" }}
            >
              {/* Center Pot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl shadow-green-500/40">
                  <p className="text-xs font-semibold text-white">Pot</p>
                  <p className="text-3xl font-bold text-white">₹68k</p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-green-400">Boot: ₹1500</p>
                </div>
              </div>

              {/* Players arranged in circle */}
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
                      className={`absolute p-3 rounded-lg transition-all duration-200 min-w-[100px] ${
                        isSelected
                          ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50 scale-110"
                          : player.status === "folded"
                            ? "bg-gray-800/30 opacity-40"
                            : player.status === "all-in"
                              ? "bg-orange-600/70 border border-orange-400"
                              : "bg-gray-800/70 hover:bg-gray-700/70 border border-green-600/30"
                      } ${player.status === "folded" ? "cursor-not-allowed" : ""}`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-1">{player.avatar}</div>
                        <p className="text-xs font-bold text-white">
                          {player.name}
                        </p>
                        <div
                          className={`text-xs mt-1 px-2 py-0.5 rounded ${
                            player.status === "all-in"
                              ? "bg-orange-600 text-white"
                              : player.status === "folded"
                                ? "bg-red-600/50 text-red-400"
                                : "bg-green-600/50 text-green-400"
                          }`}
                        >
                          {player.status === "all-in"
                            ? "ALL-IN"
                            : `₹${(player.chips / 1000).toFixed(0)}k`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seat Status Legend */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 border border-gray-700/30">
              <h3 className="text-lg font-bold text-green-400 mb-3">
                Seat Status
              </h3>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600/70 rounded"></div>
                  <span className="text-gray-300">
                    Active (
                    {PLAYERS.filter((p) => p.status === "active").length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600/50 rounded"></div>
                  <span className="text-gray-300">
                    Folded (
                    {PLAYERS.filter((p) => p.status === "folded").length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  <span className="text-gray-300">
                    All-In (
                    {PLAYERS.filter((p) => p.status === "all-in").length})
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Your Turn
                </h3>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">
                    {timeRemaining}s
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Button className="bg-red-600 hover:bg-red-500 text-white font-bold py-6">
                  Pack
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6">
                  Chaal
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-6">
                  Side Show
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold py-6">
                  Show
                </Button>
              </div>
            </div>

            {/* Action History */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Last 5 Actions
              </h3>
              <div className="space-y-2">
                {ACTION_HISTORY.map((action, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">
                        {action.player}
                      </span>
                      <span className="text-sm text-gray-300">
                        {action.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{action.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand Rankings */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-green-400 mb-4">
                Quick Hand Reference
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {HAND_RANKINGS.map((ranking) => (
                  <div
                    key={ranking.rank}
                    className="bg-gray-800/50 rounded-lg p-2 text-center"
                  >
                    <p className="text-sm font-semibold text-white">
                      {ranking.name}
                    </p>
                    <p className="text-sm text-green-400">
                      {ranking.multiplier}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-green-400 mb-6">Bet Slip</h3>

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
                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-110"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-white">
                        {bet.playerName}
                      </p>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Odds: {bet.odds.toFixed(2)}
                      </span>
                      <span className="text-gray-400">Stake: ₹{bet.stake}</span>
                    </div>
                    <p className="text-green-400 text-sm font-semibold mt-1">
                      Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Stake:</span>
                  <span className="text-white font-bold">₹{totalStake}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Potential Win:</span>
                  <span className="text-green-400 font-bold">
                    ₹{potentialWin.toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600"
              >
                Clear
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen9Game;
