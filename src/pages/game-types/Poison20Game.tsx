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
  Trophy,
  TrendingUp,
  Skull,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";

interface Poison20GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const PLAYERS = [
  { id: 1, name: "P1", status: "active", cards: 3, chips: 12400 },
  { id: 2, name: "P2", status: "active", cards: 3, chips: 8200 },
  { id: 3, name: "P3", status: "folded", cards: 0, chips: 4100 },
  { id: 4, name: "YOU", status: "playing", cards: 3, chips: 15500 },
  { id: 5, name: "P5", status: "active", cards: 3, chips: 9800 },
  { id: 6, name: "P6", status: "active", cards: 3, chips: 7600 },
];

export default function Poison20Game({ game }: Poison20GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(500);
  const [multiplier, setMultiplier] = useState(1.0);

  const gameId = game?.gmid || "poison20";
  const gameName = game?.gname || "Teenpatti Poison 20-20";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [500, 1000, 5000, 10000, 25000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "💀 BETTING CLOSED!", variant: "destructive" });
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

    // Visual warning for high-risk bets
    if (bets.some((b) => b.stake * b.odds > 50000)) {
      toast({
        title: "⚠️ HIGH RISK BET!",
        description: "Poison multiplier active!",
        variant: "default",
      });
    }

    try {
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds * multiplier,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "💀 POISON20 BETS PLACED!" });
      setBets([]);
      setMultiplier(Math.min(multiplier + 0.1, 3.0));
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black flex flex-col font-sans">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-purple-900/60 via-black to-green-900/60 border-b-2 border-purple-500/50 p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <Skull className="w-8 h-8 text-purple-500 animate-pulse" />
              <div>
                <h1 className="text-purple-500 font-black text-xl uppercase flex items-center gap-2">
                  {gameName}
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs animate-pulse">
                    RAPID
                  </span>
                </h1>
                <p className="text-purple-300 text-xs">
                  Round #{gameData?.mid} • High-Speed Poison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-black/80 border border-purple-600 px-4 py-2 rounded-lg">
                <div className="text-purple-400 text-xs mb-1">MULTIPLIER</div>
                <div className="text-green-400 font-mono text-xl font-bold">
                  {multiplier.toFixed(1)}x
                </div>
              </div>
              <div className="text-center bg-black/80 border-2 border-red-600 px-4 py-2 rounded-lg animate-pulse">
                <Clock className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <div className="text-red-500 font-mono text-2xl font-bold">
                  {gameData?.lt || 8}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Streamlined Hexagonal Table */}
          <div className="bg-gradient-to-br from-purple-950/20 via-black to-green-950/20 border-2 border-purple-700/50 rounded-3xl p-6 mb-4 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] animate-pulse"></div>
            </div>

            {/* Central Pot with Glow */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-black/90 border-2 border-purple-600 rounded-xl px-6 py-2 text-center backdrop-blur-sm shadow-2xl shadow-purple-600/50">
                <div className="text-purple-500 text-xs mb-1 font-bold flex items-center gap-1 justify-center">
                  <Skull className="w-3 h-3 animate-pulse" />
                  POISON POT
                </div>
                <div className="text-white font-mono text-3xl font-bold">
                  ₹{(Math.random() * 120000 + 40000).toFixed(0)}
                </div>
                <div className="text-purple-400 text-xs">
                  Boot: ₹2000 • Fast Mode
                </div>
              </div>
            </div>

            {/* Hexagonal Table */}
            <div className="relative h-72 bg-gradient-radial from-purple-950/60 via-black to-green-950/60 rounded-full border-4 border-purple-900/40 flex items-center justify-center mt-16">
              {/* Center Icon */}
              <div className="text-center">
                <Skull className="w-12 h-12 mx-auto text-purple-700" />
                <div className="text-purple-700 font-black text-lg">P20</div>
              </div>

              {/* Player Positions (Hexagonal Layout) */}
              {PLAYERS.map((player, i) => {
                const angle = i * 60 * (Math.PI / 180);
                const radius = 140;
                const x = radius * Math.cos(angle - Math.PI / 2);
                const y = radius * Math.sin(angle - Math.PI / 2);

                return (
                  <div
                    key={player.id}
                    className={`absolute ${
                      player.status === "playing" ? "ring-2 ring-green-500" : ""
                    }`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`bg-black/90 border-2 ${
                        player.status === "playing"
                          ? "border-green-500 shadow-lg shadow-green-500/50"
                          : player.status === "folded"
                            ? "border-red-700/50"
                            : "border-purple-700"
                      } rounded-lg p-2 min-w-[90px] backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            player.status === "playing"
                              ? "bg-green-500"
                              : player.status === "folded"
                                ? "bg-red-900/50"
                                : "bg-purple-700"
                          } flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {player.id}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-xs">
                            {player.name}
                          </div>
                          <div className="text-purple-400 text-xs">
                            ₹{(player.chips / 1000).toFixed(1)}k
                          </div>
                        </div>
                      </div>
                      {player.cards > 0 && (
                        <div className="flex gap-1 justify-center">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-5 h-7 rounded border flex items-center justify-center text-sm ${
                                player.status === "playing"
                                  ? "bg-white border-green-500"
                                  : "bg-purple-950 border-purple-700/30"
                              }`}
                            >
                              🂠
                            </div>
                          ))}
                        </div>
                      )}
                      {player.status === "folded" && (
                        <div className="text-red-500 text-xs text-center mt-1 font-bold">
                          OUT
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            {/* Compact Controls & Info */}
            <div className="lg:col-span-8 space-y-4">
              {/* Fast Action Controls */}
              <div className="bg-black/60 border border-purple-700/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-purple-500 font-bold text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    RAPID ACTIONS
                  </h3>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span className="text-yellow-500 text-xs font-bold">
                      {gameData?.lt || 8}s LEFT!
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button className="bg-red-900/60 border border-red-700 text-red-400 hover:bg-red-900/80 h-12 font-bold text-sm">
                    PACK
                  </Button>
                  <Button className="bg-green-900/60 border border-green-700 text-green-400 hover:bg-green-900/80 h-12 font-bold text-sm">
                    CHAAL
                  </Button>
                  <Button className="bg-blue-900/60 border border-blue-700 text-blue-400 hover:bg-blue-900/80 h-12 font-bold text-sm">
                    SIDE
                  </Button>
                  <Button className="bg-yellow-900/60 border border-yellow-700 text-yellow-400 hover:bg-yellow-900/80 h-12 font-bold text-sm">
                    SHOW
                  </Button>
                </div>
              </div>

              {/* Poison20 Multiplier Tracker */}
              <div className="bg-gradient-to-r from-purple-900/40 via-black to-green-900/40 border border-purple-500/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-green-400 font-black text-sm uppercase">
                    Poison20 Multiplier Tracker
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { pot: "₹40k+", mult: "1.2x", active: multiplier >= 1.2 },
                    { pot: "₹80k+", mult: "1.5x", active: multiplier >= 1.5 },
                    { pot: "₹120k+", mult: "2.0x", active: multiplier >= 2.0 },
                    { pot: "₹200k+", mult: "2.5x", active: multiplier >= 2.5 },
                    { pot: "₹300k+", mult: "3.0x", active: multiplier >= 3.0 },
                  ].map((tier, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-3 text-center transition-all ${
                        tier.active
                          ? "bg-green-600 border-2 border-green-400 shadow-lg shadow-green-400/50"
                          : "bg-purple-950/40 border border-purple-700/30"
                      }`}
                    >
                      <div
                        className={`text-xs font-bold mb-1 ${tier.active ? "text-white" : "text-purple-400"}`}
                      >
                        {tier.pot}
                      </div>
                      <div
                        className={`font-mono text-lg font-bold ${tier.active ? "text-white" : "text-purple-500"}`}
                      >
                        {tier.mult}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <div className="text-yellow-400 text-xs font-bold">
                    Current Pot Growth: +₹
                    {(Math.random() * 10000 + 2000).toFixed(0)}/round
                  </div>
                </div>
              </div>

              {/* Hand History */}
              <div className="bg-black/60 border border-purple-700/50 rounded-xl p-3">
                <h3 className="text-purple-500 font-bold text-sm mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Last 5 Poison20 Winners
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-purple-950/40 border border-purple-700/30 rounded-lg p-2 text-center"
                    >
                      <div className="text-purple-400 text-xs mb-1">
                        #{r.mid || i + 1}
                      </div>
                      <div className="text-white font-bold text-sm mb-1">
                        P{r.val || Math.floor(Math.random() * 6) + 1}
                      </div>
                      <div className="text-green-400 text-xs">
                        ₹{(Math.random() * 60000 + 20000).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-black/80 border-2 border-purple-700 rounded-xl p-3 sticky top-4 shadow-xl shadow-purple-700/30">
                <h3 className="text-purple-500 font-bold text-base mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Poison20 Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-9 rounded font-bold text-xs transition-all ${
                        selectedChip === chip
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-purple-900/50"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-purple-950/40 border border-purple-700/30 rounded-lg p-2"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-xs truncate">
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
                        <span className="text-slate-400">
                          @ {(bet.odds * multiplier).toFixed(2)}x
                        </span>
                        <span className="text-purple-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-xs">
                      No bets • Rapid mode
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-purple-950/40 border border-purple-700/30 rounded-lg p-2 mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      Potential (w/ {multiplier}x)
                    </span>
                    <span className="text-green-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds * multiplier, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 text-white font-black h-12 shadow-lg"
                >
                  💀 PLACE RAPID ({bets.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
