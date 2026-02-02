import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import type { CasinoGame } from "@/types/casino";
import {
  Clock,
  TrendingUp,
  Users,
  Info,
  Lightbulb,
  BookOpen,
} from "lucide-react";

interface Teen20CGameProps {
  game?: CasinoGame;
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
    chips: 38000,
    position: "top",
    lastAction: "Chaal",
    status: "active",
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "🎭",
    chips: 45000,
    position: "top-right",
    lastAction: "Waiting",
    status: "active",
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "🎪",
    chips: 52000,
    position: "bottom-right",
    lastAction: "Chaal",
    status: "active",
  },
  {
    id: 4,
    name: "Player 4",
    avatar: "🎨",
    chips: 41000,
    position: "bottom",
    lastAction: "Show",
    status: "active",
  },
  {
    id: 5,
    name: "Player 5",
    avatar: "🎯",
    chips: 33000,
    position: "bottom-left",
    lastAction: "Pack",
    status: "folded",
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

const HAND_RANKINGS = [
  {
    rank: 1,
    name: "Trail (Three of a Kind)",
    example: "A♠ A♥ A♦",
    description: "Three cards of the same rank. Highest possible hand.",
    multiplier: "5x",
  },
  {
    rank: 2,
    name: "Pure Sequence (Straight Flush)",
    example: "A♠ K♠ Q♠",
    description: "Three consecutive cards of the same suit.",
    multiplier: "4x",
  },
  {
    rank: 3,
    name: "Sequence (Straight)",
    example: "A♠ K♥ Q♦",
    description: "Three consecutive cards of different suits.",
    multiplier: "3x",
  },
  {
    rank: 4,
    name: "Color (Flush)",
    example: "A♠ 10♠ 8♠",
    description: "Three cards of the same suit but not in sequence.",
    multiplier: "2.5x",
  },
  {
    rank: 5,
    name: "Pair",
    example: "A♠ A♥ K♦",
    description: "Two cards of the same rank plus one different card.",
    multiplier: "2x",
  },
  {
    rank: 6,
    name: "High Card",
    example: "A♠ K♥ J♦",
    description: "No matching cards. Highest card determines strength.",
    multiplier: "1.5x",
  },
];

const TUTORIAL_TOOLTIPS = [
  {
    action: "Pack",
    description:
      "Fold your hand and forfeit current bets. Use when your hand is weak.",
    tip: "💡 Pack early to minimize losses",
  },
  {
    action: "Chaal",
    description: "See and bet. Match current bet to stay in the game.",
    tip: "💡 Use when confident in your hand",
  },
  {
    action: "Side Show",
    description: "Compare cards with another player privately. Costs extra.",
    tip: "💡 Strategic move to eliminate opponents",
  },
  {
    action: "Show",
    description:
      "Reveal cards to all players. Final showdown to determine winner.",
    tip: "💡 Only when very confident or pot is large",
  },
];

const Teen20CGame = ({ game }: Teen20CGameProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [showRankings, setShowRankings] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(23);

  const gameId = game?.gmid || "teen20c";
  const gameName = game?.gname || "Teen 20 C";

  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
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
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-yellow-950 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800/40 to-orange-800/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-amber-500/30 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">
              Teen Patti 20C
            </h1>
            <p className="text-gray-300 text-sm">
              Casual • Educational • Beginner Friendly
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#1234"}
            </p>
          </div>
        </div>

        {/* Tutorial Banner (First-time users) */}
        {showTutorial && (
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-blue-500/30">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <BookOpen className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-400 mb-2">
                    Welcome to Teen Patti 20C!
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    This is a beginner-friendly version with slower rounds and
                    helpful tips. Take your time to learn!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {TUTORIAL_TOOLTIPS.map((tooltip) => (
                      <div
                        key={tooltip.action}
                        className="bg-gray-800/50 rounded-lg p-3"
                      >
                        <p className="font-semibold text-white mb-1">
                          {tooltip.action}
                        </p>
                        <p className="text-xs text-gray-300 mb-1">
                          {tooltip.description}
                        </p>
                        <p className="text-xs text-blue-400">{tooltip.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Teen Patti Table */}
            <div
              className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-md rounded-xl p-8 border border-amber-500/20 relative"
              style={{ minHeight: "500px" }}
            >
              {/* Main Pot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-2xl shadow-yellow-500/50">
                  <p className="text-sm font-semibold text-gray-900">
                    Main Pot
                  </p>
                  <p className="text-4xl font-bold text-gray-900">₹42k</p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-amber-400 font-medium">
                    Boot: ₹500
                  </p>
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
                    className={`${positionClasses} p-4 rounded-xl transition-all duration-200 min-w-[150px] ${
                      isSelected
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50 scale-110"
                        : isFolded
                          ? "bg-gray-800/30 opacity-50"
                          : "bg-gray-800/70 hover:bg-gray-700/70 border border-amber-500/30"
                    } ${isFolded ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{player.avatar}</div>
                      <p className="text-base font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="text-sm text-amber-400 font-medium">
                        ₹{(player.chips / 1000).toFixed(0)}k
                      </p>
                      <p
                        className={`text-sm mt-1 font-medium ${
                          player.lastAction === "Pack"
                            ? "text-red-400"
                            : player.lastAction === "Show"
                              ? "text-green-400"
                              : "text-gray-300"
                        }`}
                      >
                        {player.lastAction}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls with Timer */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Your Turn - Take Your Time
                </h3>
                <div className="flex items-center gap-2 bg-gray-800/50 px-6 py-3 rounded-lg">
                  <Clock className="w-6 h-6 text-green-400" />
                  <span className="text-3xl font-bold text-white">
                    {timeRemaining}s
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-red-600 hover:bg-red-500 text-white font-bold py-8 text-lg">
                  Pack
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-8 text-lg">
                  Chaal
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-8 text-lg">
                  Side Show
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold py-8 text-lg">
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
                <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  Complete Hand Rankings Guide
                </h3>
                <button className="text-amber-400 hover:text-amber-300 text-xl">
                  {showRankings ? "▲" : "▼"}
                </button>
              </div>
              {showRankings && (
                <div className="space-y-3">
                  {HAND_RANKINGS.map((ranking) => (
                    <div
                      key={ranking.rank}
                      className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-white mb-1">
                            {ranking.rank}. {ranking.name}
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            {ranking.description}
                          </p>
                          <p className="text-sm font-mono text-amber-400">
                            Example: {ranking.example}
                          </p>
                        </div>
                        <span className="text-amber-400 font-bold text-2xl ml-4">
                          {ranking.multiplier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Beginner Tips */}
            {showTips && (
              <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" />
                    Strategy Tips
                  </h3>
                  <button
                    onClick={() => setShowTips(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>
                      <strong>Start Small:</strong> Begin with lower stakes to
                      understand the game flow
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>
                      <strong>Hand Strength:</strong> Pack early with weak hands
                      (below Pair) to save chips
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>
                      <strong>Pot Odds:</strong> If pot is large, even medium
                      hands (Pair, Color) are worth playing
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">•</span>
                    <span>
                      <strong>Observe Others:</strong> Watch how experienced
                      players bet to learn patterns
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Hand History */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Detailed Hand History
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
                    const loser =
                      PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
                    const pot = 30000 + Math.random() * 40000;
                    const winningHand =
                      HAND_RANKINGS[Math.floor(Math.random() * 3)];
                    const losingHand =
                      HAND_RANKINGS[Math.floor(Math.random() * 3) + 3];
                    return (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-white text-lg">
                              {winner.name} Won
                            </p>
                            <p className="text-sm text-green-400">
                              with {winningHand.name}
                            </p>
                          </div>
                          <p className="text-green-400 font-bold text-xl">
                            ₹{(pot / 1000).toFixed(1)}k
                          </p>
                        </div>
                        <div className="bg-gray-900/50 rounded p-3 text-sm">
                          <p className="text-gray-300 mb-1">
                            <strong>Why Won:</strong> {winningHand.name} (
                            {winningHand.multiplier}) beats {losingHand.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {loser.name} had {losingHand.name} but lost to
                            higher ranking hand
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-amber-400 mb-6">Bet Slip</h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-base text-gray-300 mb-3 font-medium">
                Select Chip Amount
              </p>
              <div className="grid grid-cols-3 gap-3">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-4 rounded-lg font-bold transition-all text-base ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50 scale-110"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Balance */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-5 mb-6 border border-amber-500/30">
              <p className="text-base text-gray-300 mb-1">Your Balance</p>
              <p className="text-4xl font-bold text-white mb-1">₹50,000</p>
              <p className="text-sm text-amber-400 mt-1">
                Available for betting
              </p>
            </div>

            {/* Active Bets */}
            <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
              {bets.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-base">
                  No bets placed yet
                </p>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-base font-medium text-white">
                        {bet.playerName}
                      </p>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 text-sm font-bold"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="flex justify-between text-base mb-1">
                      <span className="text-gray-300">
                        Odds: {bet.odds.toFixed(2)}
                      </span>
                      <span className="text-gray-300">Stake: ₹{bet.stake}</span>
                    </div>
                    <p className="text-amber-400 text-base font-semibold">
                      Potential Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-5 mb-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-300">Total Stake:</span>
                  <span className="text-white font-bold text-lg">
                    ₹{totalStake}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-300">Potential Win:</span>
                  <span className="text-amber-400 font-bold text-lg">
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
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-base py-6"
              >
                Clear All
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-base py-6"
              >
                Double Stakes
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-6 rounded-lg shadow-lg disabled:opacity-50 text-lg"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen20CGame;
