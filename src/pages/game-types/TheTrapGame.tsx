import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Zap, Trophy, TrendingUp, Flame } from "lucide-react";

interface TheTrapGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const GREYHOUNDS = [
  { id: 1, name: "Neon Flash", color: "bg-red-500", neon: "shadow-red-500/50" },
  {
    id: 2,
    name: "Cyber Storm",
    color: "bg-cyan-500",
    neon: "shadow-cyan-500/50",
  },
  {
    id: 3,
    name: "Magenta Bolt",
    color: "bg-magenta-500",
    neon: "shadow-magenta-500/50",
  },
  {
    id: 4,
    name: "Electric Dash",
    color: "bg-yellow-500",
    neon: "shadow-yellow-500/50",
  },
  {
    id: 5,
    name: "Plasma Rush",
    color: "bg-purple-500",
    neon: "shadow-purple-500/50",
  },
  {
    id: 6,
    name: "Fusion Racer",
    color: "bg-green-500",
    neon: "shadow-green-500/50",
  },
];

export default function TheTrapGame({ game }: TheTrapGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚡ TRAP CLOSED!", variant: "destructive" });
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
      toast({ title: "⚡ TRAP BETS PLACED!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-black flex flex-col font-sans overflow-hidden">
        {/* Neon Header */}
        <div className="bg-gradient-to-r from-red-900/40 via-magenta-900/40 to-cyan-900/40 border-b-2 border-cyan-500 p-4 backdrop-blur-sm shadow-lg shadow-cyan-500/20">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Flame className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-magenta-500 to-cyan-500 font-black text-3xl uppercase">
                  {game.gname}
                </h1>
                <p className="text-cyan-400 text-sm font-bold">
                  Round #{gameData?.mid} • Navigate The Trap • High Stakes
                  Racing
                </p>
              </div>
            </div>
            <div className="text-center bg-black/80 border-2 border-cyan-500 px-8 py-4 rounded-xl shadow-2xl shadow-cyan-500/50 animate-pulse">
              <Clock className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-cyan-400 font-mono text-4xl font-black">
                {gameData?.lt || 0}s
              </div>
              <div className="text-magenta-400 text-xs font-bold mt-1">
                BETTING LIVE
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4">
          {/* The Trap Maze Visualization */}
          <div className="bg-gradient-to-br from-black via-red-950/20 to-black border-2 border-magenta-500 rounded-3xl p-8 mb-6 shadow-2xl shadow-magenta-500/30 relative">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)] animate-pulse"></div>
              <div className="absolute w-full h-full bg-[linear-gradient(45deg,transparent_48%,rgba(0,255,255,0.1)_49%,rgba(0,255,255,0.1)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
            </div>

            {/* Trap Maze */}
            <div className="relative h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border-4 border-cyan-500/30 overflow-hidden">
              {/* Start Gate */}
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 shadow-lg shadow-green-500/50">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-green-400 text-xs font-black rotate-90">
                  START
                </div>
              </div>

              {/* Finish Line */}
              <div className="absolute right-4 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-magenta-500 to-cyan-500 shadow-lg shadow-cyan-500/50">
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-cyan-400 text-xs font-black rotate-90">
                  FINISH
                </div>
              </div>

              {/* Greyhounds Racing Through Trap */}
              {GREYHOUNDS.map((dog, i) => (
                <div
                  key={dog.id}
                  className="absolute w-full flex items-center"
                  style={{ top: `${i * 60 + 20}px` }}
                >
                  {/* Track Lane */}
                  <div className="w-full h-1 bg-white/10 mx-8"></div>

                  {/* Animated Greyhound */}
                  <div
                    className={`absolute ${dog.color} w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl ${dog.neon} border-2 border-white/50 transition-all duration-1000`}
                    style={{
                      left: `${10 + Math.random() * 75}%`,
                      animation: `slideRightNeon ${2 + Math.random() * 2}s ease-in-out infinite`,
                    }}
                  >
                    #{dog.id}
                  </div>

                  {/* Dog Info */}
                  <div className="absolute left-10 bg-black/80 border border-cyan-500/50 px-3 py-1 rounded-lg">
                    <div className={`text-white text-xs font-bold`}>
                      {dog.name}
                    </div>
                  </div>
                </div>
              ))}

              {/* Trap Obstacles (decorative) */}
              {[20, 35, 50, 65, 80].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-8 h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
                  style={{ left: `${pos}%` }}
                >
                  <div className="h-full border-l-2 border-r-2 border-red-500/30"></div>
                </div>
              ))}
            </div>

            {/* Countdown Progress Bar */}
            <div className="mt-6 relative">
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border-2 border-cyan-500/50">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-magenta-500 to-cyan-500 transition-all duration-1000 shadow-lg"
                  style={{ width: `${((gameData?.lt || 0) / 60) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-400 font-bold">RACE START</span>
                <span className="text-cyan-400 font-bold">
                  {gameData?.lt || 0}s until race begins
                </span>
                <span className="text-red-400 font-bold">BETTING CLOSES</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Betting Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-cyan-400 font-black text-xl flex items-center gap-2">
                <Zap className="w-6 h-6 animate-pulse" />
                TRAP BETTING MARKETS
              </h2>

              {/* Quick Win Markets */}
              <div className="space-y-3">
                <h3 className="text-magenta-400 font-bold text-sm uppercase">
                  ⚡ Quick Win (Pick the Winner)
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {GREYHOUNDS.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() =>
                        handleMarketClick({
                          sid: dog.id,
                          nat: dog.name,
                          b: 2.0 + Math.random() * 4,
                        })
                      }
                      className={`bg-gradient-to-r from-black via-slate-900 to-black border-2 border-cyan-500/40 rounded-xl p-4 hover:border-cyan-500 hover:shadow-2xl hover:${dog.neon} transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${dog.color} rounded-full flex items-center justify-center text-white font-black text-lg shadow-2xl ${dog.neon} border-2 border-white/50`}
                          >
                            #{dog.id}
                          </div>
                          <div className="text-left">
                            <div className="text-white font-bold">
                              {dog.name}
                            </div>
                            <div className="text-cyan-400 text-xs">
                              Quick Win
                            </div>
                          </div>
                        </div>
                        <div className="text-cyan-400 font-mono text-3xl font-black">
                          {(2.0 + Math.random() * 4).toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed & Special Bets */}
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 10, nat: "Fastest Dog", b: 3.5 })
                  }
                  className="bg-gradient-to-br from-red-900/40 to-black border-2 border-red-500/50 rounded-xl p-6 hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/50 transition-all"
                >
                  <Zap className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-red-400 font-black text-lg mb-1">
                    FASTEST DOG
                  </div>
                  <div className="text-white font-mono text-2xl font-bold">
                    3.50x
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 11, nat: "Favorite Wins", b: 1.8 })
                  }
                  className="bg-gradient-to-br from-cyan-900/40 to-black border-2 border-cyan-500/50 rounded-xl p-6 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
                >
                  <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-cyan-400 font-black text-lg mb-1">
                    FAVORITE
                  </div>
                  <div className="text-white font-mono text-2xl font-bold">
                    1.80x
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 12, nat: "Upset Victory", b: 8.5 })
                  }
                  className="bg-gradient-to-br from-magenta-900/40 to-black border-2 border-magenta-500/50 rounded-xl p-6 hover:border-magenta-500 hover:shadow-2xl hover:shadow-magenta-500/50 transition-all"
                >
                  <Flame className="w-8 h-8 text-magenta-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-magenta-400 font-black text-lg mb-1">
                    UPSET
                  </div>
                  <div className="text-white font-mono text-2xl font-bold">
                    8.50x
                  </div>
                </button>
              </div>

              {/* Results History */}
              <div className="bg-gradient-to-br from-black via-slate-900 to-black border-2 border-cyan-500/30 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-black text-sm uppercase">
                    Last 8 Trap Winners
                  </h3>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {resultData?.res?.slice(0, 8).map((r: any, i: number) => {
                    const dogId = r.val || (i % 6) + 1;
                    const dog = GREYHOUNDS[dogId - 1] || GREYHOUNDS[0];
                    return (
                      <div
                        key={i}
                        className="bg-black/60 border border-cyan-500/30 rounded-lg p-2 text-center"
                      >
                        <div className="text-cyan-400 text-xs font-bold mb-2">
                          #{r.mid || i + 1}
                        </div>
                        <div
                          className={`w-10 h-10 mx-auto ${dog.color} rounded-full flex items-center justify-center text-white font-bold mb-1 shadow-lg ${dog.neon}`}
                        >
                          {dogId}
                        </div>
                        <div className="text-white text-xs font-bold truncate">
                          {dog.name.split(" ")[0]}
                        </div>
                        <div className="text-green-400 text-xs mt-1">
                          ₹{(Math.random() * 5000 + 1000).toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-black via-slate-900 to-black border-2 border-cyan-500 rounded-xl p-4 sticky top-4 shadow-2xl shadow-cyan-500/20">
                <h3 className="text-cyan-400 font-black text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  TRAP BET SLIP
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs transition-all ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-cyan-500 to-magenta-500 text-black shadow-lg shadow-cyan-500/50"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-cyan-500/30"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-black/60 border border-cyan-500/30 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-bold text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs font-bold hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          @ {bet.odds.toFixed(2)}x
                        </span>
                        <span className="text-cyan-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-6 text-sm">
                      No trap bets selected
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Return</span>
                    <span className="text-green-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-red-500 hover:from-cyan-400 hover:via-magenta-400 hover:to-red-400 text-black font-black h-14 text-lg shadow-2xl shadow-cyan-500/50"
                  >
                    ⚡ PLACE TRAP BETS ({bets.length})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/20 text-xs font-bold"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() =>
                        setBets(
                          bets.map((bet) => ({ ...bet, stake: bet.stake * 2 })),
                        )
                      }
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 text-xs font-bold"
                      disabled={bets.length === 0}
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold"
                      disabled={bets.length === 0}
                    >
                      Repeat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add custom animations */}
        <style>{`
          @keyframes slideRightNeon {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(20px); }
          }
        `}</style>
      </div>
    </MainLayout>
  );
}
