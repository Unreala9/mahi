import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Clock,
  Users,
  Eye,
  Zap,
  TrendingUp,
  Crown,
  HelpCircle,
} from "lucide-react";

interface Teen6GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

interface Player {
  id: number;
  name: string;
  avatar: string;
  chips: number;
  status: "waiting" | "playing" | "packed" | "all-in";
  betAmount: number;
  position: number;
}

const VIRTUAL_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1",
    avatar: "🎩",
    chips: 15000,
    status: "playing",
    betAmount: 500,
    position: 0,
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "👑",
    chips: 12000,
    status: "playing",
    betAmount: 750,
    position: 60,
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "🎯",
    chips: 8500,
    status: "packed",
    betAmount: 0,
    position: 120,
  },
  {
    id: 4,
    name: "Player 4",
    avatar: "⭐",
    chips: 18000,
    status: "playing",
    betAmount: 1000,
    position: 180,
  },
  {
    id: 5,
    name: "Player 5",
    avatar: "💎",
    chips: 9200,
    status: "all-in",
    betAmount: 9200,
    position: 240,
  },
  {
    id: 6,
    name: "Player 6",
    avatar: "🔥",
    chips: 14500,
    status: "playing",
    betAmount: 600,
    position: 300,
  },
];

const HAND_RANKINGS = [
  "Trail (Three of a Kind)",
  "Pure Sequence",
  "Sequence (Straight)",
  "Color (Flush)",
  "Pair",
  "High Card",
];

export default function Teen6Game({ game }: Teen6GameProps) {
  const gameId = game?.gmid || "teen6";
  const gameName = game?.gname || "Teen 6";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 2000, 5000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎴 Table Locked!", variant: "destructive" });
      return;
    }

    const existingBet = bets.find((b) => b.sid === market.sid);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === market.sid ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
    } else {
      setBets([
        ...bets,
        {
          sid: market.sid,
          nat: market.nat,
          stake: selectedChip,
          odds: market.b || market.bs || 0,
        },
      ]);
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) return;
    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "🎴 Teen Patti Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const getPlayerStyle = (position: number, status: string) => {
    const radians = (position * Math.PI) / 180;
    const radius = 120;
    const x = radius * Math.cos(radians - Math.PI / 2); // Start from top
    const y = radius * Math.sin(radians - Math.PI / 2);

    return {
      transform: `translate(${x}px, ${y}px)`,
      opacity: status === "packed" ? 0.5 : 1,
    };
  };

  const totalPot = VIRTUAL_PLAYERS.reduce(
    (sum, player) => sum + player.betAmount,
    0,
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-teal-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-teal-400" />
              <div>
                <h1 className="text-teal-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-slate-300 text-sm">
                  🎴 6-Player Premium Teen Patti • Rapid Rounds
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRules(!showRules)}
                className="p-2 rounded-lg bg-teal-600/20 border border-teal-400/30 text-teal-400 hover:bg-teal-600/40"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <div className="text-center bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-white font-mono text-2xl font-bold">
                  {Math.min(gameData?.lt || 12, 12)}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Rules Panel */}
          {showRules && (
            <div className="bg-black/80 border border-teal-400/30 rounded-xl p-4 mb-4">
              <h3 className="text-teal-400 font-bold mb-3">
                6-Player Teen Patti Rules
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <h4 className="text-white font-bold mb-2">
                    Hand Rankings (High to Low):
                  </h4>
                  <ul className="space-y-1">
                    {HAND_RANKINGS.map((rank, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-teal-400 font-bold">
                          {i + 1}.
                        </span>
                        {rank}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">
                    6-Player Special Rules:
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    <li>• Fast 12-second decision timer</li>
                    <li>• Maximum 6 players per table</li>
                    <li>• Side-show available between adjacent players</li>
                    <li>• Minimum boot: ₹50, Maximum: ₹10,000</li>
                    <li>• Betting markets available for spectators</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Hexagonal Table */}
            <div className="lg:col-span-8">
              <div className="relative bg-gradient-to-br from-green-900/30 via-green-800/40 to-green-900/30 border-4 border-teal-400/30 rounded-full aspect-square max-w-lg mx-auto p-8">
                {/* Table Center */}
                <div className="absolute inset-16 bg-green-800/40 rounded-full border-2 border-teal-400/20 flex flex-col items-center justify-center">
                  <div className="text-center mb-2">
                    <div className="text-teal-400 text-lg font-bold">
                      Teen Patti 6
                    </div>
                    <div className="text-white text-sm">
                      Round #{gameData?.mid}
                    </div>
                  </div>
                  <div className="bg-black/60 rounded-lg p-2 border border-teal-400/30">
                    <div className="text-teal-400 text-xs font-bold">POT</div>
                    <div className="text-white font-bold text-lg">
                      ₹{totalPot.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Boot: ₹100</div>
                </div>

                {/* Player Positions */}
                {VIRTUAL_PLAYERS.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={`absolute w-20 h-20 cursor-pointer transition-all duration-300 ${
                      selectedPlayer === player.id
                        ? "scale-110 z-10"
                        : "hover:scale-105"
                    }`}
                    style={getPlayerStyle(player.position, player.status)}
                  >
                    {/* Player Avatar */}
                    <div
                      className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center text-white text-xs ${
                        player.status === "playing"
                          ? "bg-teal-600 border-teal-400"
                          : player.status === "all-in"
                            ? "bg-red-600 border-red-400"
                            : player.status === "packed"
                              ? "bg-gray-600 border-gray-400"
                              : "bg-blue-600 border-blue-400"
                      } ${selectedPlayer === player.id ? "ring-2 ring-teal-400" : ""}`}
                    >
                      <div className="text-2xl mb-1">{player.avatar}</div>
                      <div className="font-bold text-xs">P{player.id}</div>
                    </div>

                    {/* Player Info */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center min-w-20">
                      <div className="bg-black/80 rounded px-2 py-1 border border-teal-400/20">
                        <div className="text-white text-xs font-bold">
                          ₹{player.chips.toLocaleString()}
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            player.status === "playing"
                              ? "text-teal-400"
                              : player.status === "all-in"
                                ? "text-red-400"
                                : player.status === "packed"
                                  ? "text-gray-400"
                                  : "text-blue-400"
                          }`}
                        >
                          {player.status.toUpperCase()}
                        </div>
                      </div>
                      {player.betAmount > 0 && (
                        <div className="text-yellow-400 text-xs font-bold mt-1">
                          Bet: ₹{player.betAmount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Controls (for players) */}
              <div className="mt-6 bg-slate-900/60 border border-teal-400/30 rounded-xl p-4">
                <h3 className="text-teal-400 font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Spectator Betting Markets
                </h3>
                <div className="grid gap-3">
                  {gameData?.sub?.map((market: any) => {
                    const activeBet = bets.find((b) => b.sid === market.sid);
                    return (
                      <div
                        key={market.sid}
                        className="bg-slate-800/50 border border-teal-400/20 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              🎴
                            </div>
                            <div>
                              <div className="text-white font-bold">
                                {market.nat}
                              </div>
                              <div className="text-teal-300 text-sm">
                                Spectator Market
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-teal-400 font-mono text-xl font-bold">
                              {market.b || market.bs}
                            </div>
                            <button
                              onClick={() => handleMarketClick(market)}
                              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                activeBet
                                  ? "bg-teal-500 text-white shadow-lg"
                                  : "bg-slate-700 text-teal-300 hover:bg-teal-600/50"
                              }`}
                            >
                              {activeBet ? `₹${activeBet.stake}` : "BET"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Winners */}
              <div className="mt-4 bg-slate-900/50 border border-teal-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-teal-400" />
                  <h3 className="text-teal-400 font-bold text-sm">
                    Recent Table Winners
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-800 border border-teal-400/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-teal-400 text-xs font-bold mb-1">
                        Table {r.mid || i + 1}
                      </div>
                      <div className="text-2xl mb-1">👑</div>
                      <div className="text-white font-bold text-sm">
                        P{r.val || r.res || Math.floor(Math.random() * 6) + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Betting Panel */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-teal-400/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-teal-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Spectator Slip
                </h3>

                {/* Selected Player Info */}
                {selectedPlayer && (
                  <div className="bg-slate-800/50 border border-teal-400/20 rounded-lg p-3 mb-4">
                    {(() => {
                      const player = VIRTUAL_PLAYERS.find(
                        (p) => p.id === selectedPlayer,
                      );
                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{player?.avatar}</div>
                            <div>
                              <div className="text-white font-bold">
                                {player?.name}
                              </div>
                              <div
                                className={`text-sm font-bold ${
                                  player?.status === "playing"
                                    ? "text-teal-400"
                                    : player?.status === "all-in"
                                      ? "text-red-400"
                                      : player?.status === "packed"
                                        ? "text-gray-400"
                                        : "text-blue-400"
                                }`}
                              >
                                {player?.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-teal-400 font-bold">
                              ₹{player?.chips.toLocaleString()}
                            </div>
                            <div className="text-slate-400 text-sm">
                              Current Bet: ₹{player?.betAmount}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-teal-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-teal-400/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}</span>
                        <span className="text-teal-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No spectator bets
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-teal-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Win</span>
                    <span className="text-teal-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold h-12"
                  >
                    Place Spectator Bets
                  </Button>
                  <Button
                    onClick={() => {
                      setBets([]);
                      setSelectedPlayer(null);
                    }}
                    variant="outline"
                    className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
