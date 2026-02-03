import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, Users, Info } from "lucide-react";

interface Teen20BGameProps {
  game?: any;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  position: string;
  lastAction: string;
  status: string;
}

interface Bet {
  playerId: number;
  playerName: string;
  odds: number;
  stake: number;
}

const CHIPS = [100, 500, 1000, 5000, 10000, 50000];

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1",
    avatar: "👤",
    chips: 45000,
    position: "top",
    lastAction: "Chaal",
    status: "active",
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "🎭",
    chips: 32000,
    position: "top-right",
    lastAction: "Pack",
    status: "folded",
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "🎪",
    chips: 58000,
    position: "bottom-right",
    lastAction: "Show",
    status: "active",
  },
  {
    id: 4,
    name: "Player 4",
    avatar: "🎨",
    chips: 41000,
    position: "bottom",
    lastAction: "Chaal",
    status: "active",
  },
  {
    id: 5,
    name: "Player 5",
    avatar: "🎯",
    chips: 29000,
    position: "bottom-left",
    lastAction: "Side Show",
    status: "active",
  },
  {
    id: 6,
    name: "You",
    avatar: "⭐",
    chips: 50000,
    position: "left",
    lastAction: "Waiting",
    status: "active",
  },
];

const Teen20BGame = ({ game }: Teen20BGameProps) => {
  const gameId = game?.gmid || "teen20b";
  const gameName = game?.gname || "Teen 20 B";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [showRankings, setShowRankings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(17);
  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
    const existingBet = bets.find((b) => b.playerId === player.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.playerId !== player.id));
    } else {
      const odds = 2.5 + Math.random() * 2;
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
        await casinoBettingService.placeCasinoBet(
          gameId,
          gameName,
          gameData?.mid || "round-1",
          `player-${bet.playerId}`,
          bet.playerName,
          bet.playerName,
          bet.odds,
          bet.stake,
          "back",
        );
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

  const handHistory = resultData?.res?.slice(-3) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-gray-900 to-slate-900 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800/40 to-slate-800/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-teal-500/30 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">Teen Patti 20B</h1>
            <p className="text-gray-400 text-sm">Balanced • Mid-Speed</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#1234"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Teen Patti Table */}
            <div
              className="bg-gradient-to-br from-teal-900/20 to-slate-900/20 backdrop-blur-md rounded-xl p-8 border border-teal-500/20 relative"
              style={{ minHeight: "500px" }}
            >
              {/* Main Pot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-2xl shadow-yellow-500/50">
                  <p className="text-sm font-semibold text-gray-900">
                    Main Pot
                  </p>
                  <p className="text-3xl font-bold text-gray-900">₹48k</p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-teal-400">Boot: ₹500</p>
                </div>
              </div>

              {/* Players */}
              {PLAYERS.map((player) => {
                const isSelected = bets.some((b) => b.playerId === player.id);
                const isFolded = player.status === "folded";

                let positionClasses = "";
                switch (player.position) {
                  case "top":
                    positionClasses =
                      "absolute top-4 left-1/2 transform -translate-x-1/2";
                    break;
                  case "top-right":
                    positionClasses = "absolute top-16 right-8";
                    break;
                  case "bottom-right":
                    positionClasses = "absolute bottom-16 right-8";
                    break;
                  case "bottom":
                    positionClasses =
                      "absolute bottom-4 left-1/2 transform -translate-x-1/2";
                    break;
                  case "bottom-left":
                    positionClasses = "absolute bottom-16 left-8";
                    break;
                  case "left":
                    positionClasses = "absolute top-16 left-8";
                    break;
                }

                return (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    disabled={isFolded}
                    className={`${positionClasses} p-4 rounded-xl transition-all duration-200 min-w-[140px] ${
                      isSelected
                        ? "bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg shadow-teal-500/50 scale-110"
                        : isFolded
                          ? "bg-gray-800/30 opacity-50"
                          : "bg-gray-800/70 hover:bg-gray-700/70 border border-teal-500/30"
                    } ${isFolded ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{player.avatar}</div>
                      <p className="text-sm font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="text-xs text-teal-400">
                        ₹{(player.chips / 1000).toFixed(0)}k
                      </p>
                      <p
                        className={`text-xs mt-1 font-medium ${
                          player.lastAction === "Pack"
                            ? "text-red-400"
                            : player.lastAction === "Show"
                              ? "text-green-400"
                              : "text-gray-400"
                        }`}
                      >
                        {player.lastAction}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Player Controls
                </h3>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-400 animate-pulse" />
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

            {/* Hand Rankings */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowRankings(!showRankings)}
              >
                <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  Hand Rankings
                </h3>
                <button className="text-teal-400 hover:text-teal-300">
                  {showRankings ? "▲" : "▼"}
                </button>
              </div>
              {showRankings && (
                <div className="space-y-2">
                  {HAND_RANKINGS.map((ranking) => (
                    <div
                      key={ranking.rank}
                      className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {ranking.rank}. {ranking.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ranking.example}
                        </p>
                      </div>
                      <span className="text-teal-400 font-bold text-lg">
                        {ranking.multiplier}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hand History */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Last 3 Hands
              </h3>
              <div className="space-y-2">
                {handHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hand history yet
                  </p>
                ) : (
                  handHistory.map((result: any, idx: number) => {
                    const winner =
                      PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
                    const pot = 30000 + Math.random() * 40000;
                    return (
                      <div
                        key={idx}
                        className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {winner.name} Won
                          </p>
                          <p className="text-xs text-gray-400">
                            Trail of Kings
                          </p>
                        </div>
                        <p className="text-green-400 font-bold">
                          ₹{(pot / 1000).toFixed(1)}k
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-teal-400 mb-6">Bet Slip</h3>

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
                        ? "bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-500/50 scale-110"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Balance */}
            <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 rounded-lg p-4 mb-6 border border-teal-500/30">
              <p className="text-sm text-gray-400 mb-1">Your Balance</p>
              <p className="text-3xl font-bold text-white">₹50,000</p>
              <p className="text-xs text-teal-400 mt-1">
                Available for betting
              </p>
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
                    <p className="text-teal-400 text-sm font-semibold mt-1">
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
                  <span className="text-teal-400 font-bold">
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
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen20BGame;
