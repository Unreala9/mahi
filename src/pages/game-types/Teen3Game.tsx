import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  Activity,
} from "lucide-react";

interface Teen3GameProps {
  game?: any;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  position: string;
  status: string;
  stats: {
    winRate: number;
    avgPot: number;
    playFrequency: number;
    foldRate: number;
    callRate: number;
    raiseRate: number;
  };
}

interface Bet {
  playerId: number;
  playerName: string;
  odds: number;
  stake: number;
}

const CHIPS = [500, 1000, 5000, 10000, 25000, 50000];

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1",
    avatar: "👤",
    chips: 42000,
    position: "top",
    status: "active",
    stats: {
      winRate: 45,
      avgPot: 18000,
      playFrequency: 68,
      foldRate: 35,
      callRate: 45,
      raiseRate: 20,
    },
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "🎭",
    chips: 38000,
    position: "top-right",
    status: "active",
    stats: {
      winRate: 52,
      avgPot: 22000,
      playFrequency: 72,
      foldRate: 28,
      callRate: 50,
      raiseRate: 22,
    },
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "🎪",
    chips: 35000,
    position: "bottom-right",
    status: "folded",
    stats: {
      winRate: 38,
      avgPot: 15000,
      playFrequency: 55,
      foldRate: 48,
      callRate: 40,
      raiseRate: 12,
    },
  },
  {
    id: 4,
    name: "Player 4",
    avatar: "🎨",
    chips: 46000,
    position: "bottom",
    status: "active",
    stats: {
      winRate: 58,
      avgPot: 25000,
      playFrequency: 80,
      foldRate: 22,
      callRate: 42,
      raiseRate: 36,
    },
  },
  {
    id: 5,
    name: "Player 5",
    avatar: "🎯",
    chips: 31000,
    position: "bottom-left",
    status: "active",
    stats: {
      winRate: 41,
      avgPot: 16000,
      playFrequency: 62,
      foldRate: 40,
      callRate: 48,
      raiseRate: 12,
    },
  },
  {
    id: 6,
    name: "You",
    avatar: "⭐",
    chips: 50000,
    position: "left",
    status: "active",
    stats: {
      winRate: 50,
      avgPot: 20000,
      playFrequency: 70,
      foldRate: 30,
      callRate: 50,
      raiseRate: 20,
    },
  },
];

const Teen3Game = ({ game }: Teen3GameProps) => {
  const gameId = game?.gmid || "teen3";
  const gameName = game?.gname || "Teen 3";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(5000);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(16);
  const [handStrength, setHandStrength] = useState(65);
  const { gameData, resultData, error } = useCasinoWebSocket(gameId);
  const { toast } = useToast();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();

  // Set timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameData) {
        setLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [gameData]);

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
    setSelectedPlayer(player);
    const existingBet = bets.find((b) => b.playerId === player.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.playerId !== player.id));
    } else {
      const odds = 2.2 + Math.random() * 2;
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

  const handHistory = resultData?.res?.slice(-3) || [];

  // Show loading state
  if (!gameData && !loadingTimeout && !error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-teal-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-white text-xl">Loading {gameName}...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (loadingTimeout || error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-teal-950 flex flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-2xl font-bold text-blue-400">Game Unavailable</h2>
          <p className="text-white text-center">
            {error ||
              "Unable to load game data. The game might be temporarily offline."}
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/casino")}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back to Casino
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-teal-950 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800/40 to-teal-800/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-blue-500/30 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Teen Patti 3</h1>
            <p className="text-gray-300 text-sm">
              Enhanced • Analytics & Stats
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#3001"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Teen Patti Table */}
            <div className="bg-gradient-to-br from-blue-900/20 to-teal-900/20 backdrop-blur-md rounded-xl p-8 border border-blue-500/20 relative min-h-[520px]">
              {/* Main Pot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-2xl shadow-blue-500/50">
                  <p className="text-sm font-semibold text-white">Main Pot</p>
                  <p className="text-4xl font-bold text-white">₹52k</p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-blue-400">Boot: ₹1000</p>
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
                        ? "bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/50 scale-110"
                        : isFolded
                          ? "bg-gray-800/30 opacity-50"
                          : "bg-gray-800/70 hover:bg-gray-700/70 border border-blue-500/30"
                    } ${isFolded ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{player.avatar}</div>
                      <p className="text-sm font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="text-xs text-blue-400">
                        ₹{(player.chips / 1000).toFixed(0)}k
                      </p>
                      <div className="mt-1 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            player.stats.winRate > 50
                              ? "bg-green-600/40 text-green-400"
                              : "bg-gray-600/40 text-gray-400"
                          }`}
                        >
                          {player.stats.winRate}% WR
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Player Controls
                </h3>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
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

            {/* Real-time Odds Calculator */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6" />
                Hand Strength Calculator
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      Your Hand Strength
                    </span>
                    <span className="text-lg font-bold text-white">
                      {handStrength}%
                    </span>
                  </div>
                  <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${handStrength}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">vs 1 Opponent</p>
                    <p className="text-green-400 font-bold">
                      {handStrength + 5}%
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">vs 2 Opponents</p>
                    <p className="text-yellow-400 font-bold">
                      {handStrength - 8}%
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">vs 3+ Opponents</p>
                    <p className="text-orange-400 font-bold">
                      {handStrength - 15}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hand Rankings */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                Hand Rankings
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {HAND_RANKINGS.map((ranking) => (
                  <div
                    key={ranking.rank}
                    className="bg-gray-800/50 rounded-lg p-3 text-center"
                  >
                    <p className="text-sm font-semibold text-white">
                      {ranking.name}
                    </p>
                    <p className="text-lg font-bold text-blue-400">
                      {ranking.multiplier}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand History with Analysis */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Hand History & Analysis
              </h3>
              <div className="space-y-3">
                {handHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hand history yet
                  </p>
                ) : (
                  handHistory.map((result: any, idx: number) => {
                    const winner =
                      PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
                    const pot = 35000 + Math.random() * 40000;
                    const avgPot = 28000 + Math.random() * 25000;
                    return (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-white">
                              {winner.name} Won
                            </p>
                            <p className="text-sm text-green-400">
                              Pure Sequence
                            </p>
                          </div>
                          <p className="text-green-400 font-bold text-lg">
                            ₹{(pot / 1000).toFixed(1)}k
                          </p>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>Win Rate: {winner.stats.winRate}%</span>
                          <span>Avg Pot: ₹{(avgPot / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Player Statistics Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-blue-900/20 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Player Statistics
              </h3>
              {selectedPlayer ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{selectedPlayer.avatar}</div>
                    <p className="text-lg font-bold text-white">
                      {selectedPlayer.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      ₹{(selectedPlayer.chips / 1000).toFixed(0)}k chips
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Win Rate</span>
                        <span className="text-sm font-bold text-white">
                          {selectedPlayer.stats.winRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${selectedPlayer.stats.winRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">
                        Average Pot Size
                      </p>
                      <p className="text-lg font-bold text-white">
                        ₹{(selectedPlayer.stats.avgPot / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">
                          Play Frequency
                        </span>
                        <span className="text-sm font-bold text-white">
                          {selectedPlayer.stats.playFrequency}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${selectedPlayer.stats.playFrequency}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">
                        Aggression Index
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-red-400 font-bold">
                            {selectedPlayer.stats.foldRate}%
                          </p>
                          <p className="text-gray-400">Fold</p>
                        </div>
                        <div>
                          <p className="text-blue-400 font-bold">
                            {selectedPlayer.stats.callRate}%
                          </p>
                          <p className="text-gray-400">Call</p>
                        </div>
                        <div>
                          <p className="text-green-400 font-bold">
                            {selectedPlayer.stats.raiseRate}%
                          </p>
                          <p className="text-gray-400">Raise</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a player to view statistics
                </p>
              )}
            </div>

            {/* Bet Slip */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-blue-400 mb-6">
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
                          ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/50 scale-110"
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
                        <span className="text-gray-400">
                          Stake: ₹{bet.stake}
                        </span>
                      </div>
                      <p className="text-blue-400 text-sm font-semibold mt-1">
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
                    <span className="text-blue-400 font-bold">
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
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold py-4 rounded-lg shadow-lg disabled:opacity-50"
              >
                Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen3Game;
