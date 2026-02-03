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
  Zap,
  Users,
  Trophy,
  TrendingUp,
  Skull,
  AlertTriangle,
} from "lucide-react";

interface PoisonGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function PoisonGame({ game }: PoisonGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [showPoisonPot, setShowPoisonPot] = useState(false);

  const gameId = game?.gmid || "poison";
  const gameName = game?.gname || "Teenpatti Poison One Day";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "💀 Betting Closed!", variant: "destructive" });
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
      toast({ title: "💀 POISON BETS PLACED!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black flex flex-col font-sans">
        {/* Dark Header */}
        <div className="bg-gradient-to-r from-red-900/60 via-black to-red-900/60 border-b-2 border-red-700/50 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Skull className="w-10 h-10 text-red-500 animate-pulse" />
              <div>
                <h1 className="text-red-500 font-black text-2xl uppercase flex items-center gap-2">
                  {gameName}
                  <span className="bg-red-600 text-black px-2 py-1 rounded text-xs font-black">
                    POISON
                  </span>
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <p className="text-red-300">
                    Round #{gameData?.mid} • High Risk Teen Patti
                  </p>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Extra Risk = Higher Returns
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center bg-black/80 border-2 border-red-700 px-6 py-3 rounded-lg shadow-lg shadow-red-700/30">
              <Clock className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <div className="text-red-500 font-mono text-2xl font-bold">
                {gameData?.lt || 15}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Poison Teen Patti Table */}
          <div className="bg-gradient-to-br from-red-950/30 via-black to-red-950/30 border-2 border-red-900/50 rounded-3xl p-8 mb-6 relative shadow-2xl shadow-red-900/30">
            {/* Poison Pattern Overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iMTAiIHk9IjI1IiBmb250LXNpemU9IjI0Ij7imoDvuI88L3RleHQ+PC9zdmc+')] opacity-20"></div>
            </div>

            {/* Main Pot & Poison Pot */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
              <div className="bg-black/90 border-2 border-red-700 rounded-xl px-6 py-3 text-center backdrop-blur-sm shadow-lg shadow-red-700/50">
                <div className="text-red-500 text-sm mb-1 font-bold">
                  MAIN POT
                </div>
                <div className="text-white font-mono text-3xl font-bold">
                  ₹{(Math.random() * 80000 + 20000).toFixed(0)}
                </div>
                <div className="text-red-400 text-xs mt-1">Boot: ₹1000</div>
              </div>
              <button
                onClick={() => setShowPoisonPot(!showPoisonPot)}
                className="bg-gradient-to-r from-red-900 to-red-700 border-2 border-yellow-500 rounded-xl px-6 py-3 text-center backdrop-blur-sm shadow-xl shadow-yellow-500/50 hover:scale-105 transition-transform"
              >
                <div className="text-yellow-400 text-sm mb-1 font-black flex items-center gap-2">
                  <Skull className="w-4 h-4 animate-pulse" />
                  POISON POT
                </div>
                <div className="text-white font-mono text-2xl font-bold">
                  5.5x
                </div>
                <div className="text-yellow-300 text-xs mt-1">
                  High Risk Bonus
                </div>
              </button>
            </div>

            {/* Table Surface with Poison Theme */}
            <div className="relative h-96 bg-gradient-radial from-red-950/60 via-black to-red-950/80 rounded-full border-8 border-red-900/30 flex items-center justify-center">
              {/* Center Logo */}
              <div className="text-center">
                <Skull className="w-16 h-16 mx-auto mb-2 text-red-600" />
                <div className="text-red-600 font-black text-2xl">POISON</div>
                <div className="text-red-400 text-sm">TEEN PATTI</div>
              </div>

              {/* Player Seats */}
              {PLAYERS.map((player) => {
                const positions = {
                  top: "top-4 left-1/2 -translate-x-1/2",
                  right: "top-1/2 -translate-y-1/2 right-4",
                  "bottom-right": "bottom-16 right-12",
                  bottom: "bottom-4 left-1/2 -translate-x-1/2",
                  "bottom-left": "bottom-16 left-12",
                  left: "top-1/2 -translate-y-1/2 left-4",
                };

                return (
                  <div
                    key={player.id}
                    className={`absolute ${positions[player.position as keyof typeof positions]} ${
                      player.status === "playing"
                        ? "ring-2 ring-yellow-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`bg-black/90 border-2 ${
                        player.status === "playing"
                          ? "border-yellow-500 shadow-lg shadow-yellow-500/50"
                          : player.status === "folded"
                            ? "border-red-700/50"
                            : "border-red-700"
                      } rounded-xl p-3 min-w-[120px] backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            player.status === "playing"
                              ? "bg-yellow-500"
                              : player.status === "folded"
                                ? "bg-red-900/50"
                                : "bg-red-700"
                          } flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {player.id}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">
                            {player.name}
                          </div>
                          <div className="text-red-400 text-xs">
                            ₹{player.chips}
                          </div>
                        </div>
                      </div>
                      {player.cards > 0 && (
                        <div className="flex gap-1 justify-center">
                          {Array.from({ length: player.cards }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-9 rounded border-2 flex items-center justify-center text-xl ${
                                player.status === "playing"
                                  ? "bg-white border-yellow-500"
                                  : "bg-red-950 border-red-700/30"
                              }`}
                            >
                              {player.status === "playing" ? "🂠" : "🂠"}
                            </div>
                          ))}
                        </div>
                      )}
                      {player.status === "folded" && (
                        <div className="text-red-500 text-xs text-center mt-1 font-bold">
                          FOLDED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Game Controls & Info */}
            <div className="lg:col-span-8 space-y-4">
              {/* Player Controls */}
              <div className="bg-black/60 border-2 border-red-900/50 rounded-xl p-4">
                <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Your Actions
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <Button className="bg-red-900/40 border-2 border-red-700 text-red-400 hover:bg-red-900/60 h-16 font-bold">
                    PACK
                  </Button>
                  <Button className="bg-green-900/40 border-2 border-green-700 text-green-400 hover:bg-green-900/60 h-16 font-bold">
                    CHAAL
                  </Button>
                  <Button className="bg-blue-900/40 border-2 border-blue-700 text-blue-400 hover:bg-blue-900/60 h-16 font-bold">
                    SIDE SHOW
                  </Button>
                  <Button className="bg-yellow-900/40 border-2 border-yellow-700 text-yellow-400 hover:bg-yellow-900/60 h-16 font-bold">
                    SHOW
                  </Button>
                </div>
              </div>

              {/* Poison Pot Side Bets */}
              {showPoisonPot && (
                <div className="bg-gradient-to-r from-red-900/40 via-black to-red-900/40 border-2 border-yellow-500/50 rounded-xl p-4 shadow-lg shadow-yellow-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Skull className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <h3 className="text-yellow-400 font-black text-sm uppercase">
                      ⚠️ Poison Pot Side Bets (High Risk)
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      {
                        name: "Pure Sequence + Poison",
                        odds: 15.0,
                        risk: "EXTREME",
                      },
                      { name: "Trail + Poison", odds: 12.0, risk: "VERY HIGH" },
                      { name: "Pair + Poison", odds: 5.5, risk: "HIGH" },
                    ].map((bet, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          handleMarketClick({
                            sid: 100 + i,
                            nat: bet.name,
                            b: bet.odds,
                          })
                        }
                        className="bg-black/60 border-2 border-yellow-500/40 rounded-lg p-4 hover:border-yellow-500 transition-all"
                      >
                        <div className="text-yellow-400 font-bold text-sm mb-2">
                          {bet.name}
                        </div>
                        <div className="text-white font-mono text-2xl font-bold mb-1">
                          {bet.odds}x
                        </div>
                        <div className="text-red-400 text-xs font-bold">
                          {bet.risk} RISK
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hand Rankings */}
              <div className="bg-black/60 border-2 border-red-900/50 rounded-xl p-4">
                <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Hand Rankings (Poison Rules)
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      rank: 1,
                      name: "Trail (Three of a Kind)",
                      example: "A♠ A♥ A♦",
                      poison: "5x Multiplier",
                    },
                    {
                      rank: 2,
                      name: "Pure Sequence",
                      example: "K♠ Q♠ J♠",
                      poison: "4x Multiplier",
                    },
                    {
                      rank: 3,
                      name: "Sequence",
                      example: "10♣ 9♠ 8♦",
                      poison: "3x Multiplier",
                    },
                    {
                      rank: 4,
                      name: "Color",
                      example: "K♥ 8♥ 3♥",
                      poison: "2.5x Multiplier",
                    },
                    {
                      rank: 5,
                      name: "Pair",
                      example: "Q♦ Q♣ 7♠",
                      poison: "2x Multiplier",
                    },
                    {
                      rank: 6,
                      name: "High Card",
                      example: "A♠ J♣ 9♦",
                      poison: "1.5x Multiplier",
                    },
                  ].map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white font-bold">
                          {hand.rank}
                        </div>
                        <div>
                          <div className="text-white font-bold">
                            {hand.name}
                          </div>
                          <div className="text-red-400 text-xs">
                            {hand.example}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 text-xs font-bold">
                          {hand.poison}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Winners */}
              <div className="bg-black/60 border-2 border-red-900/50 rounded-xl p-4">
                <h3 className="text-red-500 font-bold mb-4">
                  Recent Poison Rounds
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 text-center"
                    >
                      <div className="text-red-400 text-xs mb-1">
                        Round {r.mid || i + 1}
                      </div>
                      <div className="text-white font-bold mb-1">
                        P{r.val || Math.floor(Math.random() * 6) + 1}
                      </div>
                      <div className="text-green-400 text-xs">
                        ₹{(Math.random() * 40000 + 10000).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-black/80 border-2 border-red-700 rounded-xl p-4 sticky top-4 shadow-xl shadow-red-700/30">
                <h3 className="text-red-500 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Poison Bet Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-red-600 text-white"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-red-900/50"
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
                      className="bg-red-950/30 border border-red-900/30 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-red-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No poison bets
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold h-12"
                >
                  💀 Place Poison Bets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
