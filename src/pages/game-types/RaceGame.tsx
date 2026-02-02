import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Timer, Trophy, ChevronRight, Activity } from "lucide-react";

interface RaceGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const RUNNERS = [
  { id: 1, name: "Flash", color: "bg-red-500", icon: "🐎" },
  { id: 2, name: "Storm", color: "bg-blue-500", icon: "🐎" },
  { id: 3, name: "Blaze", color: "bg-orange-500", icon: "🐎" },
  { id: 4, name: "Thunder", color: "bg-purple-500", icon: "🐎" },
  { id: 5, name: "Comet", color: "bg-emerald-500", icon: "🐎" },
  { id: 6, name: "Bolt", color: "bg-yellow-500", icon: "🐎" },
];

export default function RaceGame({ game }: RaceGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [progress, setProgress] = useState(RUNNERS.map(() => 0));
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  // Simple race animation logic
  useEffect(() => {
    if (gameData?.lt === 0) {
      const interval = setInterval(() => {
        setProgress((prev) =>
          prev.map((p) => Math.min(p + Math.random() * 5, 100)),
        );
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(RUNNERS.map(() => 0));
    }
  }, [gameData?.lt]);

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚠️ Suspended", variant: "destructive" });
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
      toast({ title: "✅ Bet Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0c0d12] flex flex-col font-sans overflow-hidden">
        {/* Race Visualization Section */}
        <div className="h-64 bg-slate-900/50 border-b border-white/5 relative p-4 flex flex-col justify-center">
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md z-10">
            <Timer className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] text-white font-black uppercase tracking-widest">
              {gameData?.lt > 0
                ? `Starting in ${gameData.lt}s`
                : "Race in Progress"}
            </span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto w-full">
            {RUNNERS.map((runner, i) => (
              <div
                key={runner.id}
                className="relative h-4 bg-black/40 rounded-full border border-white/5 group"
              >
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center gap-2 w-18">
                  <div className={`w-2 h-2 rounded-full ${runner.color}`}></div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase truncate">
                    {runner.name}
                  </span>
                </div>
                {/* Track Progress */}
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${runner.color} opacity-20 shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                  style={{ width: `${progress[i]}%` }}
                ></div>
                {/* Runner Icon */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 transition-all duration-500 z-10"
                  style={{ left: `${progress[i]}%` }}
                >
                  <div className="text-xl -scale-x-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {runner.icon}
                  </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-600 font-black">
                  FINISH
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-12 gap-1 overflow-hidden">
          {/* Market List - 8 Columns */}
          <div className="lg:col-span-8 p-4 overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Live Markets
              </h2>
              <div className="text-[10px] text-slate-500 font-bold uppercase">
                Decimal Odds
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gameData?.sub?.map((market: any) => {
                const activeBet = bets.find((b) => b.sid === market.sid);
                return (
                  <button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeBet
                        ? "bg-emerald-600/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                        : "bg-slate-900/40 border-white/5 hover:bg-slate-800/80 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                        {market.nat.split(" ")[0]}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-black text-xs uppercase tracking-tight">
                          {market.nat}
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase">
                          Win/Place
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-emerald-400 font-mono text-xl font-black">
                        {market.b || market.bs || "0.00"}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Race History */}
            <div className="mt-8">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Recent
                Winners
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {resultData?.res?.slice(0, 12).map((r: any, i: number) => (
                  <div
                    key={i}
                    className="bg-slate-900/60 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1.5 group hover:border-white/20 transition-all"
                  >
                    <div className="text-xl -scale-x-100">🐎</div>
                    <div className="text-[10px] text-white font-black uppercase tracking-tighter truncate w-full text-center">
                      Winner {r.val || r.res}
                    </div>
                    <div className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-[8px] font-black rounded-full uppercase">
                      Round {r.mid || i + 100}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip Area - 4 Columns */}
          <div className="lg:col-span-4 bg-[#12131a] border-l border-white/5 p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-white font-black text-xs uppercase tracking-widest">
                Selected Runners
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {bets.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {bets.map((bet) => (
                <div
                  key={bet.sid}
                  className="bg-black/40 border border-white/5 rounded-xl p-3 relative group"
                >
                  <button
                    onClick={() =>
                      setBets((prev) => prev.filter((b) => b.sid !== bet.sid))
                    }
                    className="absolute top-2 right-2 text-slate-600 hover:text-red-400 p-1"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-white font-black text-[10px] uppercase truncate pr-4">
                      {bet.nat}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-slate-500">
                      Odds:{" "}
                      <span className="text-white font-mono">{bet.odds}</span>
                    </div>
                    <div className="text-emerald-400 font-mono font-black">
                      ₹{bet.stake}
                    </div>
                  </div>
                </div>
              ))}
              {bets.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
                  <Activity className="w-10 h-10 mb-4 text-slate-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Choose your champion
                  </p>
                </div>
              )}
            </div>

            {/* Control Bar */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="grid grid-cols-5 gap-1">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-10 rounded-lg text-[9px] font-black border transition-all ${
                      selectedChip === chip
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-slate-900 border-white/5 text-slate-500 hover:text-white"
                    }`}
                  >
                    ₹{chip / 1000}k
                  </button>
                ))}
              </div>

              <div className="bg-black/60 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-black uppercase">
                    Total Stake
                  </span>
                  <span className="text-white font-mono font-black">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-black uppercase">
                    Exposure
                  </span>
                  <span className="text-red-400 font-mono font-black">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-emerald-400 font-black uppercase text-xs">
                    Total Return
                  </span>
                  <span className="text-emerald-400 font-mono font-black text-lg">
                    ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBets([])}
                  className="h-12 border-white/5 hover:bg-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10"
                >
                  Place Bets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
