import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Users, Trophy, Zap, Crown, Star, Target } from "lucide-react";

interface Dum10GameProps {
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
  position: number;
  status: "active" | "folded" | "all-in" | "waiting";
  chips: number;
  color: string;
}

const VIRTUAL_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Player 1",
    avatar: "👑",
    position: 0,
    status: "active",
    chips: 15000,
    color: "text-yellow-400",
  },
  {
    id: 2,
    name: "Player 2",
    avatar: "🎯",
    position: 36,
    status: "active",
    chips: 12500,
    color: "text-red-400",
  },
  {
    id: 3,
    name: "Player 3",
    avatar: "⭐",
    position: 72,
    status: "folded",
    chips: 8000,
    color: "text-blue-400",
  },
  {
    id: 4,
    name: "Player 4",
    avatar: "💎",
    position: 108,
    status: "active",
    chips: 18000,
    color: "text-purple-400",
  },
  {
    id: 5,
    name: "Player 5",
    avatar: "🔥",
    position: 144,
    status: "all-in",
    chips: 25000,
    color: "text-orange-400",
  },
  {
    id: 6,
    name: "Player 6",
    avatar: "⚡",
    position: 180,
    status: "active",
    chips: 11000,
    color: "text-green-400",
  },
  {
    id: 7,
    name: "Player 7",
    avatar: "🎪",
    position: 216,
    status: "waiting",
    chips: 7500,
    color: "text-pink-400",
  },
  {
    id: 8,
    name: "Player 8",
    avatar: "🎭",
    position: 252,
    status: "active",
    chips: 14000,
    color: "text-cyan-400",
  },
  {
    id: 9,
    name: "Player 9",
    avatar: "🎲",
    position: 288,
    status: "active",
    chips: 9500,
    color: "text-indigo-400",
  },
  {
    id: 10,
    name: "Player 10",
    avatar: "🎈",
    position: 324,
    status: "folded",
    chips: 6000,
    color: "text-rose-400",
  },
];

export default function Dum10Game({ game }: Dum10GameProps) {
  const gameId = game?.gmid || "dum10";
  const gameName = game?.gname || "Dum 10";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎯 Table Locked!", variant: "destructive" });
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
      toast({ title: "🎯 Table Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const getPlayerStyle = (position: number, status: string) => {
    const radians = (position * Math.PI) / 180;
    const radius = 140;
    const x = radius * Math.cos(radians);
    const y = radius * Math.sin(radians);

    return {
      transform: `translate(${x}px, ${y}px)`,
      opacity: status === "folded" ? 0.5 : 1,
    };
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex flex-col font-sans">
        {/* Table Header */}
        <div className="bg-slate-900/90 border-b border-amber-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-400" />
              <div>
                <h1 className="text-amber-400 font-black text-xl uppercase tracking-wider">
                  {gameName}
                </h1>
                <p className="text-slate-300 text-sm">
                  🎯 10-Player Virtual Game Table 🎯
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 rounded-full text-black font-bold">
              <Trophy className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xl font-black">{gameData?.lt || 0}s</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Circular Game Table */}
          <div className="bg-gradient-to-br from-green-900/20 via-green-800/30 to-green-900/20 border-4 border-amber-400/30 rounded-full p-8 mb-6 aspect-square max-w-lg mx-auto relative">
            <div className="absolute inset-8 bg-green-800/30 rounded-full border-2 border-amber-400/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-amber-400 text-4xl font-black mb-2">
                  DUM10
                </div>
                <div className="text-white text-lg font-bold">
                  Round #{gameData?.mid}
                </div>
                <div className="text-slate-400 text-sm mt-2">
                  Virtual Table Active
                </div>
              </div>
            </div>

            {/* Player Positions */}
            {VIRTUAL_PLAYERS.map((player) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player.id)}
                className={`absolute w-16 h-16 cursor-pointer transition-all duration-300 ${
                  selectedPlayer === player.id
                    ? "scale-125 z-10"
                    : "hover:scale-110"
                }`}
                style={getPlayerStyle(player.position, player.status)}
              >
                <div
                  className={`w-full h-full rounded-full border-2 flex items-center justify-center text-2xl ${
                    player.status === "active"
                      ? "bg-green-600 border-green-400"
                      : player.status === "all-in"
                        ? "bg-red-600 border-red-400"
                        : player.status === "folded"
                          ? "bg-gray-600 border-gray-400"
                          : "bg-blue-600 border-blue-400"
                  } ${selectedPlayer === player.id ? "ring-4 ring-amber-400" : ""}`}
                >
                  {player.avatar}
                </div>
                <div
                  className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold ${player.color}`}
                >
                  P{player.id}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Player Stats & Markets */}
            <div className="lg:col-span-8 space-y-4">
              {selectedPlayer && (
                <div className="bg-slate-800/50 border border-amber-400/30 rounded-xl p-4 mb-4">
                  {(() => {
                    const player = VIRTUAL_PLAYERS.find(
                      (p) => p.id === selectedPlayer,
                    );
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{player?.avatar}</div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {player?.name}
                            </div>
                            <div
                              className={`text-sm font-bold ${
                                player?.status === "active"
                                  ? "text-green-400"
                                  : player?.status === "all-in"
                                    ? "text-red-400"
                                    : player?.status === "folded"
                                      ? "text-gray-400"
                                      : "text-blue-400"
                              }`}
                            >
                              {player?.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-bold text-xl">
                            ₹{player?.chips?.toLocaleString()}
                          </div>
                          <div className="text-slate-400 text-sm">
                            Virtual Chips
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <h2 className="text-amber-400 font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Virtual Table Markets
              </h2>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-gradient-to-r from-slate-800/50 via-amber-900/20 to-slate-800/50 border border-amber-400/20 rounded-xl p-4 backdrop-blur-sm hover:border-amber-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                            🎯
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {market.nat}
                            </div>
                            <div className="text-amber-300 text-sm">
                              Virtual Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-amber-400 font-mono text-3xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                              activeBet
                                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-xl"
                                : "bg-gradient-to-r from-slate-700 to-amber-700 text-amber-300 hover:from-amber-600 hover:to-orange-600"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "TABLE BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Game History */}
              <div className="bg-slate-900/60 border border-amber-400/20 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="text-amber-400 font-bold text-sm">
                    Recent Winners
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-slate-800/50 to-amber-800/30 border border-amber-400/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-amber-400 text-xs font-bold mb-1">
                        Game {r.mid || i + 1}
                      </div>
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-white font-bold text-sm">
                        P{r.val || r.res || Math.floor(Math.random() * 10) + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Virtual Table Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-amber-400/30 rounded-xl p-4 sticky top-4 backdrop-blur-sm">
                <h3 className="text-amber-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Table Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                          : "bg-slate-800 text-slate-300 border border-amber-400/20"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-gradient-to-r from-slate-800/50 to-amber-800/30 border border-amber-400/20 rounded-lg p-3"
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
                        <span className="text-amber-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No table bets selected
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 border border-amber-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Table Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Virtual Prize</span>
                    <span className="text-amber-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold h-12 text-lg"
                  >
                    Join Virtual Table
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Leave Table
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
