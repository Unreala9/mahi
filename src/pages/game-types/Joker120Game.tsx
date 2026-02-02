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
  Sparkles,
  Info,
} from "lucide-react";

interface Joker120GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const PLAYERS = [
  {
    id: 1,
    name: "Player 1",
    position: "top",
    status: "active",
    cards: 3,
    chips: 9400,
  },
  {
    id: 2,
    name: "Player 2",
    position: "right",
    status: "active",
    cards: 3,
    chips: 7200,
  },
  {
    id: 3,
    name: "Player 3",
    position: "bottom-right",
    status: "active",
    cards: 3,
    chips: 11800,
  },
  {
    id: 4,
    name: "You",
    position: "bottom",
    status: "playing",
    cards: 3,
    chips: 14500,
  },
  {
    id: 5,
    name: "Player 5",
    position: "bottom-left",
    status: "folded",
    cards: 0,
    chips: 3100,
  },
  {
    id: 6,
    name: "Player 6",
    position: "left",
    status: "active",
    cards: 3,
    chips: 8600,
  },
];

const JOKER_CARDS = ["🃏", "A♠", "K♥", "Q♦"];

export default function Joker120Game({ game }: Joker120GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [activeJoker, setActiveJoker] = useState("🃏");

  const gameId = game?.gmid || "joker1";
  const gameName = game?.gname || "Joker 1";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🃏 Joker Round Closed!", variant: "destructive" });
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
      toast({ title: "🃏 Joker Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-950/20 via-black to-purple-950/20 flex flex-col font-sans">
        {/* Festive Header */}
        <div className="bg-gradient-to-r from-orange-900/70 via-purple-900/70 to-yellow-900/70 border-b-2 border-yellow-500/50 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="text-5xl animate-bounce">🃏</div>
              <div>
                <h1 className="text-yellow-400 font-black text-2xl uppercase flex items-center gap-2">
                  {gameName}
                  <span className="bg-gradient-to-r from-orange-500 to-purple-500 text-white px-2 py-1 rounded text-xs">
                    UNLIMITED
                  </span>
                </h1>
                <p className="text-orange-200 text-sm">
                  Round #{gameData?.mid} • Wild Joker Active • Unlimited
                  Possibilities
                </p>
              </div>
            </div>
            <div className="text-center bg-black/80 border-2 border-yellow-500 px-6 py-3 rounded-lg shadow-lg shadow-yellow-500/30">
              <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-yellow-400 font-mono text-2xl font-bold">
                {gameData?.lt || 15}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Teen Patti Table with Joker Zone */}
          <div className="bg-gradient-to-br from-orange-950/30 via-purple-950/40 to-yellow-950/30 border-2 border-yellow-700/50 rounded-3xl p-8 mb-6 relative">
            {/* Joker Zone Panel */}
            <div className="absolute top-4 left-4 bg-black/90 border-2 border-yellow-500 rounded-xl p-4 backdrop-blur-sm shadow-2xl shadow-yellow-500/30 z-10 max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="text-yellow-400 font-black text-sm uppercase">
                  Active Joker Zone
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {JOKER_CARDS.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveJoker(card)}
                    className={`h-16 rounded-lg text-3xl flex items-center justify-center transition-all ${
                      activeJoker === card
                        ? "bg-yellow-500 shadow-lg shadow-yellow-500/50 scale-110"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {card}
                  </button>
                ))}
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2">
                <div className="text-yellow-400 text-xs font-bold mb-1">
                  Current Joker Effect:
                </div>
                <div className="text-white text-xs">
                  <span className="font-bold">{activeJoker}</span> can
                  substitute for ANY card, elevating hand strength to next rank!
                </div>
              </div>
            </div>

            {/* Main Pot */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-black/90 border-2 border-orange-500 rounded-xl px-6 py-3 text-center backdrop-blur-sm shadow-lg shadow-orange-500/50">
                <div className="text-orange-400 text-sm mb-1 font-bold flex items-center gap-1 justify-center">
                  <Trophy className="w-4 h-4" />
                  UNLIMITED POT
                </div>
                <div className="text-white font-mono text-3xl font-bold">
                  ₹{(Math.random() * 100000 + 30000).toFixed(0)}
                </div>
                <div className="text-orange-400 text-xs mt-1">
                  Boot: ₹800 • Joker Active
                </div>
              </div>
            </div>

            {/* Table Surface */}
            <div className="relative h-96 bg-gradient-radial from-orange-900/40 via-purple-900/50 to-yellow-900/40 rounded-full border-8 border-yellow-700/30 flex items-center justify-center">
              {/* Center Logo */}
              <div className="text-center">
                <div className="text-6xl mb-2 animate-pulse">🃏</div>
                <div className="text-yellow-400 font-black text-2xl">
                  UNLIMITED
                </div>
                <div className="text-orange-300 text-sm">JOKER PATTI</div>
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
                        ? "ring-2 ring-yellow-400"
                        : ""
                    }`}
                  >
                    <div
                      className={`bg-black/90 border-2 ${
                        player.status === "playing"
                          ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                          : player.status === "folded"
                            ? "border-orange-700/50"
                            : "border-orange-700"
                      } rounded-xl p-3 min-w-[120px] backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            player.status === "playing"
                              ? "bg-yellow-500"
                              : player.status === "folded"
                                ? "bg-orange-900/50"
                                : "bg-orange-700"
                          } flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {player.id}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">
                            {player.name}
                          </div>
                          <div className="text-orange-400 text-xs">
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
                                  : "bg-orange-950 border-orange-700/30"
                              }`}
                            >
                              {Math.random() > 0.7 ? "🃏" : "🂠"}
                            </div>
                          ))}
                        </div>
                      )}
                      {player.status === "folded" && (
                        <div className="text-orange-500 text-xs text-center mt-1 font-bold">
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
              <div className="bg-black/60 border-2 border-orange-700/50 rounded-xl p-4">
                <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Your Actions
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <Button className="bg-orange-900/40 border-2 border-orange-700 text-orange-400 hover:bg-orange-900/60 h-16 font-bold">
                    PACK
                  </Button>
                  <Button className="bg-green-900/40 border-2 border-green-700 text-green-400 hover:bg-green-900/60 h-16 font-bold">
                    CHAAL
                  </Button>
                  <Button className="bg-purple-900/40 border-2 border-purple-700 text-purple-400 hover:bg-purple-900/60 h-16 font-bold">
                    SIDE SHOW
                  </Button>
                  <Button className="bg-yellow-900/40 border-2 border-yellow-700 text-yellow-400 hover:bg-yellow-900/60 h-16 font-bold">
                    SHOW
                  </Button>
                </div>
              </div>

              {/* Dynamic Hand Rankings with Joker Effects */}
              <div className="bg-black/60 border-2 border-orange-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold">
                    Hand Rankings (With Joker: {activeJoker})
                  </h3>
                  <Info className="w-4 h-4 text-orange-400" />
                </div>
                <div className="space-y-2">
                  {[
                    {
                      rank: 1,
                      name: "Trail + Joker",
                      example: "A♠ A♥ 🃏",
                      effect: "= Four of a Kind!",
                      bonus: "+200%",
                    },
                    {
                      rank: 2,
                      name: "Pure Sequence + Joker",
                      example: "K♠ Q♠ 🃏",
                      effect: "= Royal Flush!",
                      bonus: "+150%",
                    },
                    {
                      rank: 3,
                      name: "Sequence + Joker",
                      example: "10♣ 9♠ 🃏",
                      effect: "= Elevated Sequence",
                      bonus: "+100%",
                    },
                    {
                      rank: 4,
                      name: "Color + Joker",
                      example: "K♥ 8♥ 🃏",
                      effect: "= Pure Color",
                      bonus: "+75%",
                    },
                    {
                      rank: 5,
                      name: "Pair + Joker",
                      example: "Q♦ 🃏 7♠",
                      effect: "= Trip/Trail",
                      bonus: "+50%",
                    },
                    {
                      rank: 6,
                      name: "High Card + Joker",
                      example: "A♠ 🃏 9♦",
                      effect: "= Pair",
                      bonus: "+25%",
                    },
                  ].map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-gradient-to-r from-orange-950/40 via-purple-950/40 to-yellow-950/40 border border-yellow-700/30 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                          {hand.rank}
                        </div>
                        <div>
                          <div className="text-white font-bold">
                            {hand.name}
                          </div>
                          <div className="text-orange-400 text-xs">
                            {hand.example}
                          </div>
                          <div className="text-purple-400 text-xs italic">
                            {hand.effect}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 text-sm font-bold">
                          {hand.bonus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Winners */}
              <div className="bg-black/60 border-2 border-orange-700/50 rounded-xl p-4">
                <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Recent Joker Winners
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-orange-950/40 to-purple-950/40 border border-yellow-700/30 rounded-lg p-3 text-center"
                    >
                      <div className="text-orange-400 text-xs mb-1">
                        Round {r.mid || i + 1}
                      </div>
                      <div className="text-white font-bold mb-1">
                        P{r.val || Math.floor(Math.random() * 6) + 1}
                      </div>
                      <div className="text-green-400 text-xs">
                        ₹{(Math.random() * 50000 + 15000).toFixed(0)}
                      </div>
                      <div className="text-2xl mt-1">🃏</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-black/80 border-2 border-orange-700 rounded-xl p-4 sticky top-4 shadow-xl shadow-orange-700/30">
                <h3 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Joker Bet Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-black"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-orange-700/50"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Side Bets on Players */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-orange-400 text-xs font-bold uppercase">
                    Side Bets (Winner Prediction)
                  </h4>
                  {PLAYERS.filter((p) => p.id !== 4).map((player) => (
                    <button
                      key={player.id}
                      onClick={() =>
                        handleMarketClick({
                          sid: player.id,
                          nat: `${player.name} Wins`,
                          b: 3.0,
                        })
                      }
                      className="w-full bg-orange-950/30 border border-orange-700/30 rounded-lg p-3 hover:border-orange-700 transition-all flex justify-between items-center"
                    >
                      <span className="text-white font-medium text-sm">
                        {player.name} Wins
                      </span>
                      <span className="text-orange-400 font-mono text-lg font-bold">
                        3.00x
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-orange-400 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-orange-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No joker bets
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-bold h-12"
                >
                  🃏 Place Joker Bets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
