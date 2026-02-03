import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, Users, HelpCircle } from "lucide-react";

interface Teen1GameProps {
  game?: any;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  position: string;
  status: string;
}

interface Bet {
  playerId: number;
  playerName: string;
  odds: number;
  stake: number;
}

const CHIPS = [100, 500, 1000, 5000, 10000, 25000];

const PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1",
    avatar: "👤",
    chips: 25000,
    position: "top",
    status: "active",
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "🎭",
    chips: 32000,
    position: "right",
    status: "active",
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "🎪",
    chips: 28000,
    position: "bottom",
    status: "folded",
  },
  {
    id: 4,
    name: "You",
    avatar: "⭐",
    chips: 30000,
    position: "left",
    status: "active",
  },
];

const CONTROLS_HELP = [
  {
    action: "Pack",
    description:
      "Fold your hand and exit the current round. You forfeit your bet.",
    icon: "❌",
  },
  {
    action: "Chaal",
    description:
      "See the cards and bet. Match the current bet to stay in the game.",
    icon: "👁️",
  },
  {
    action: "Side Show",
    description:
      "Compare your cards with another player privately. Costs extra.",
    icon: "🔄",
  },
  {
    action: "Show",
    description: "Reveal all cards to determine the winner. Final showdown.",
    icon: "✅",
  },
];

const Teen1Game = ({ game }: Teen1GameProps) => {
  const gameId = game?.gmid || "teen1";
  const gameName = game?.gname || "Teen 1";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(5000);
  const [showHelp, setShowHelp] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(18);
  const { gameData, resultData } = useCasinoWebSocket(gameId);
  const { toast } = useToast();

  const handlePlayerClick = (player: Player) => {
    if (player.status === "folded") return;
    const existingBet = bets.find((b) => b.playerId === player.id);
    if (existingBet) {
      setBets(bets.filter((b) => b.playerId !== player.id));
    } else {
      const odds = 2.5 + Math.random() * 1.5;
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
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-gray-900 to-green-900 text-white p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800/40 to-green-700/40 backdrop-blur-md rounded-xl p-4 mb-4 border border-green-600/30 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Teen Patti 1</h1>
            <p className="text-gray-300 text-sm">
              Beginner Friendly • Standard Play
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Round</p>
            <p className="text-2xl font-bold text-white">
              {gameData?.mid || "#1001"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Teen Patti Table */}
            <div className="bg-gradient-to-br from-green-900/30 to-gray-900/30 backdrop-blur-md rounded-xl p-10 border border-green-600/30 relative min-h-[500px]">
              {/* Main Pot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-2xl shadow-yellow-500/40">
                  <p className="text-base font-bold text-gray-900">Main Pot</p>
                  <p className="text-4xl font-bold text-gray-900">₹35k</p>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-base text-green-400 font-semibold">
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
                      "absolute top-8 left-1/2 transform -translate-x-1/2";
                    break;
                  case "right":
                    positionClasses =
                      "absolute top-1/2 right-8 transform -translate-y-1/2";
                    break;
                  case "bottom":
                    positionClasses =
                      "absolute bottom-8 left-1/2 transform -translate-x-1/2";
                    break;
                  case "left":
                    positionClasses =
                      "absolute top-1/2 left-8 transform -translate-y-1/2";
                    break;
                }

                return (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    disabled={isFolded}
                    className={`${positionClasses} p-5 rounded-xl transition-all duration-200 min-w-[160px] ${
                      isSelected
                        ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50 scale-110"
                        : isFolded
                          ? "bg-gray-800/40 opacity-50"
                          : "bg-gray-800/80 hover:bg-gray-700/80 border border-green-600/30"
                    } ${isFolded ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{player.avatar}</div>
                      <p className="text-lg font-bold text-white">
                        {player.name}
                      </p>
                      <p className="text-base text-green-400 font-semibold">
                        ₹{(player.chips / 1000).toFixed(0)}k
                      </p>
                      <p
                        className={`text-sm mt-2 px-3 py-1 rounded-full ${
                          player.status === "folded"
                            ? "bg-red-600/30 text-red-400"
                            : "bg-green-600/30 text-green-400"
                        }`}
                      >
                        {player.status === "folded" ? "Folded" : "Active"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls with Help */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-green-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Your Turn
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-all"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Help</span>
                  </button>
                  <div className="flex items-center gap-2 bg-gray-800/60 px-5 py-3 rounded-lg">
                    <Clock className="w-6 h-6 text-green-400" />
                    <span className="text-3xl font-bold text-white">
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Panel */}
              {showHelp && (
                <div className="mb-6 bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-lg font-bold text-blue-400 mb-3">
                    Control Guide
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CONTROLS_HELP.map((control) => (
                      <div
                        key={control.action}
                        className="bg-gray-800/50 rounded-lg p-3"
                      >
                        <p className="font-bold text-white mb-1 flex items-center gap-2">
                          <span>{control.icon}</span>
                          <span>{control.action}</span>
                        </p>
                        <p className="text-sm text-gray-300">
                          {control.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-red-600 hover:bg-red-500 text-white font-bold py-7 text-lg">
                  Pack
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-7 text-lg">
                  Chaal
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-7 text-lg">
                  Side Show
                </Button>
                <Button className="bg-green-600 hover:bg-green-500 text-white font-bold py-7 text-lg">
                  Show
                </Button>
              </div>
            </div>

            {/* Hand Rankings */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-green-600/30">
              <h3 className="text-xl font-bold text-green-400 mb-4">
                Hand Rankings Guide
              </h3>
              <div className="space-y-3">
                {HAND_RANKINGS.map((ranking) => (
                  <div
                    key={ranking.rank}
                    className="bg-gray-800/60 rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="text-3xl">{ranking.icon}</div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white">
                        {ranking.rank}. {ranking.name}
                      </p>
                      <p className="text-sm text-gray-300 mb-1">
                        {ranking.description}
                      </p>
                      <p className="text-sm font-mono text-green-400">
                        Example: {ranking.example}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand History */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-green-600/30">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Last 3 Hands
              </h3>
              <div className="space-y-3">
                {handHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No hand history yet
                  </p>
                ) : (
                  handHistory.map((result: any, idx: number) => {
                    const winner =
                      PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
                    const pot = 25000 + Math.random() * 30000;
                    return (
                      <div
                        key={idx}
                        className="bg-gray-800/60 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            {winner.name} Won
                          </p>
                          <p className="text-sm text-gray-400">Pure Sequence</p>
                        </div>
                        <p className="text-green-400 font-bold text-xl">
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
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-green-600/30 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-green-400 mb-6">Bet Slip</h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-base text-gray-300 mb-3 font-medium">
                Select Chip
              </p>
              <div className="grid grid-cols-3 gap-3">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`p-4 rounded-lg font-bold transition-all text-base ${
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
            <div className="mb-6 space-y-3 max-h-72 overflow-y-auto">
              {bets.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-base">
                  No bets placed yet
                </p>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/60 rounded-lg p-4 border border-green-600/30"
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
                    <p className="text-green-400 text-base font-semibold">
                      Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Bet Summary */}
            {bets.length > 0 && (
              <div className="bg-gray-800/60 rounded-lg p-5 mb-4 space-y-3 border border-green-600/30">
                <div className="flex justify-between text-base">
                  <span className="text-gray-300">Total Stake:</span>
                  <span className="text-white font-bold text-lg">
                    ₹{totalStake}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-300">Potential Win:</span>
                  <span className="text-green-400 font-bold text-lg">
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
                className="bg-gray-800 hover:bg-gray-700 border-green-600/30 text-base py-6"
              >
                Clear
              </Button>
              <Button
                onClick={() =>
                  setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                }
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 border-green-600/30 text-base py-6"
              >
                Double
              </Button>
            </div>

            <Button
              onClick={handlePlaceBets}
              disabled={bets.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-6 rounded-lg shadow-lg disabled:opacity-50 text-lg"
            >
              Place {bets.length} Bet{bets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Teen1Game;
