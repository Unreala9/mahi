import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Zap, Users, Trophy, TrendingUp, Eye } from "lucide-react";

interface Patti2GameProps {
  game: CasinoGame;
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
    cards: 2,
    chips: 5400,
  },
  {
    id: 2,
    name: "Player 2",
    position: "right",
    status: "folded",
    cards: 0,
    chips: 3200,
  },
  {
    id: 3,
    name: "Player 3",
    position: "bottom-right",
    status: "active",
    cards: 2,
    chips: 7800,
  },
  {
    id: 4,
    name: "You",
    position: "bottom",
    status: "playing",
    cards: 2,
    chips: 8500,
  },
  {
    id: 5,
    name: "Player 5",
    position: "bottom-left",
    status: "active",
    cards: 2,
    chips: 4100,
  },
  {
    id: 6,
    name: "Player 6",
    position: "left",
    status: "active",
    cards: 2,
    chips: 6200,
  },
];

export default function Patti2Game({ game }: Patti2GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [action, setAction] = useState<string | null>(null);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🃏 Betting Closed!", variant: "destructive" });
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
          gameId: game.gmid,
          gameName: game.gname,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "🃏 Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950/20 to-slate-950 flex flex-col font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900/90 via-cyan-900/90 to-teal-900/90 border-b border-teal-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🃏</div>
              <div>
                <h1 className="text-teal-400 font-black text-xl uppercase">
                  {game.gname}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <p className="text-slate-300">
                    Round #{gameData?.mid} • 2-Card Variant
                  </p>
                  <span className="bg-teal-500/20 text-teal-400 px-2 py-1 rounded text-xs font-bold">
                    Simplified Rules
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
              <div className="text-white font-mono text-2xl font-bold">
                {gameData?.lt || 12}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Teen Patti Table */}
          <div className="bg-gradient-to-br from-teal-900/30 via-teal-800/40 to-teal-900/30 border-2 border-teal-700/50 rounded-3xl p-8 mb-6 relative">
            {/* Pot & Info */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-slate-900/90 border border-teal-500/50 rounded-xl px-6 py-3 text-center backdrop-blur-sm">
                <div className="text-teal-400 text-sm mb-1 font-bold">POT</div>
                <div className="text-white font-mono text-3xl font-bold">
                  ₹{(Math.random() * 50000 + 10000).toFixed(0)}
                </div>
                <div className="text-slate-400 text-xs mt-1">Boot: ₹500</div>
              </div>
            </div>

            {/* Table Surface */}
            <div className="relative h-96 bg-gradient-radial from-teal-700/40 via-teal-800/60 to-teal-900/80 rounded-full border-8 border-teal-700/30 flex items-center justify-center">
              {/* Center Logo */}
              <div className="text-center">
                <div className="text-6xl mb-2">🎴</div>
                <div className="text-teal-400 font-black text-2xl">2-CARD</div>
                <div className="text-teal-300 text-sm">TEEN PATTI</div>
              </div>

              {/* Player Seats */}
              {PLAYERS.map((player, i) => {
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
                        ? "ring-4 ring-yellow-400"
                        : ""
                    }`}
                  >
                    <div
                      className={`bg-slate-900/90 border-2 ${
                        player.status === "playing"
                          ? "border-yellow-400"
                          : player.status === "folded"
                            ? "border-red-500/50"
                            : "border-teal-500/50"
                      } rounded-xl p-3 min-w-[120px] backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            player.status === "playing"
                              ? "bg-yellow-400"
                              : player.status === "folded"
                                ? "bg-red-500/50"
                                : "bg-teal-500"
                          } flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {player.id}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">
                            {player.name}
                          </div>
                          <div className="text-teal-400 text-xs">
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
                                  ? "bg-white border-yellow-400"
                                  : "bg-slate-800 border-teal-500/30"
                              }`}
                            >
                              {player.status === "playing" ? "🂠" : "🂠"}
                            </div>
                          ))}
                        </div>
                      )}
                      {player.status === "folded" && (
                        <div className="text-red-400 text-xs text-center mt-1 font-bold">
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
            {/* Game Info & Hand Rankings */}
            <div className="lg:col-span-8 space-y-4">
              {/* Player Controls */}
              <div className="bg-slate-900/50 border border-teal-500/30 rounded-xl p-4">
                <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Your Actions
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => setAction("pack")}
                    className="bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 h-16 font-bold"
                  >
                    PACK
                  </Button>
                  <Button
                    onClick={() => setAction("chaal")}
                    className="bg-green-500/20 border-2 border-green-500 text-green-400 hover:bg-green-500/30 h-16 font-bold"
                  >
                    CHAAL
                  </Button>
                  <Button
                    onClick={() => setAction("sideshow")}
                    className="bg-blue-500/20 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/30 h-16 font-bold"
                  >
                    SIDE SHOW
                  </Button>
                  <Button
                    onClick={() => setAction("show")}
                    className="bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30 h-16 font-bold"
                  >
                    SHOW
                  </Button>
                </div>
              </div>

              {/* Hand Rankings - 2 Card Version */}
              <div className="bg-slate-900/50 border border-teal-500/30 rounded-xl p-4">
                <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  2-Card Hand Rankings
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      rank: 1,
                      name: "Pure Pair",
                      desc: "Two cards of same rank & suit",
                      example: "A♥ A♥",
                    },
                    {
                      rank: 2,
                      name: "Pair",
                      desc: "Two cards of same rank",
                      example: "K♠ K♦",
                    },
                    {
                      rank: 3,
                      name: "Suited High",
                      desc: "Two cards of same suit",
                      example: "Q♣ 10♣",
                    },
                    {
                      rank: 4,
                      name: "High Card",
                      desc: "Highest card wins",
                      example: "A♦ 7♠",
                    },
                  ].map((hand) => (
                    <div
                      key={hand.rank}
                      className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {hand.rank}
                        </div>
                        <div>
                          <div className="text-white font-bold">
                            {hand.name}
                          </div>
                          <div className="text-slate-400 text-xs">
                            {hand.desc}
                          </div>
                        </div>
                      </div>
                      <div className="text-teal-400 font-mono font-bold">
                        {hand.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Winners */}
              <div className="bg-slate-900/50 border border-teal-500/30 rounded-xl p-4">
                <h3 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Recent Rounds
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-teal-400 text-xs mb-1">
                        Round {r.mid || i + 1}
                      </div>
                      <div className="text-white font-bold mb-1">
                        P{r.val || Math.floor(Math.random() * 6) + 1}
                      </div>
                      <div className="text-green-400 text-xs">
                        ₹{(Math.random() * 20000 + 5000).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-teal-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-teal-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Side Betting
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-teal-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Side Bets */}
                <div className="space-y-2 mb-4">
                  {PLAYERS.filter((p) => p.id !== 4).map((player) => (
                    <button
                      key={player.id}
                      onClick={() =>
                        handleMarketClick({
                          sid: player.id,
                          nat: player.name,
                          b: 2.5,
                        })
                      }
                      className="w-full bg-slate-800/50 border border-teal-500/20 rounded-lg p-3 hover:border-teal-500/40 transition-all flex justify-between items-center"
                    >
                      <span className="text-white font-medium">
                        {player.name} Wins
                      </span>
                      <span className="text-teal-400 font-mono text-lg font-bold">
                        2.50x
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-3"
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
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-teal-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No side bets
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-teal-500/20 rounded-lg p-3 mb-4">
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
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold h-12"
                >
                  Place Side Bets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
