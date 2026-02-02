import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Timer, Radio, HelpCircle, History } from "lucide-react";

interface KbcGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function KbcGame({ game }: KbcGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({
        title: "Locked!",
        description: "Options are currently locked by the host.",
        variant: "destructive",
      });
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
      toast({
        title: "Locking In!",
        description: "Final answer submitted to the host.",
      });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#020617] flex flex-col font-sans relative overflow-hidden">
        {/* Studio Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(37,99,235,0.05)_0%,transparent_60%)]"></div>
        </div>

        {/* Top Digital Clock Header */}
        <div className="pt-6 pb-2 relative z-10 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center relative">
              <Timer className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-3xl font-black text-white font-mono leading-none tracking-tighter">
                {gameData?.lt || 0}
              </span>
              <span className="text-[8px] text-blue-400 font-black uppercase mt-1">
                Seconds
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-sm">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
              Live Round No. {gameData?.mid}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 gap-6 relative z-10">
          {/* Main Question/Result Area */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-900/40 to-blue-600/20 rounded-[2rem] blur-xl opacity-50 -z-10"></div>
            <div className="bg-slate-900/60 border-2 border-blue-900/50 rounded-[2rem] p-8 backdrop-blur-xl text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <HelpCircle className="w-8 h-8 text-blue-500/30 absolute top-4 left-4" />
              <h2 className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                Current Question Outcome
              </h2>
              <div className="text-white text-5xl md:text-6xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {gameData?.card || "?"}
              </div>
              <p className="text-slate-500 text-xs font-bold mt-4 uppercase tracking-widest leading-relaxed">
                Place your chips on the most potential winning choice below.
              </p>
            </div>
          </div>

          {/* Option Tiles - 2x2 or 2x3 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameData?.sub?.map((option: any) => {
              const activeBet = bets.find((b) => b.sid === option.sid);
              return (
                <button
                  key={option.sid}
                  onClick={() => handleMarketClick(option)}
                  disabled={isMarketSuspended(option)}
                  className={`group relative h-24 rounded-[1.5rem] border-2 transition-all flex items-center px-8 gap-6 active:scale-95 ${
                    activeBet
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 border-white shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                      : "bg-slate-900/40 border-blue-900/30 hover:border-blue-500/50 hover:bg-blue-900/10"
                  } ${isMarketSuspended(option) ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      activeBet
                        ? "bg-white border-white"
                        : "bg-blue-900/20 border-blue-500/30 group-hover:border-blue-400"
                    }`}
                  >
                    <span
                      className={`text-sm font-black ${activeBet ? "text-blue-600" : "text-blue-400"}`}
                    >
                      {option.nat.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 text-left">
                    <div
                      className={`text-sm font-black uppercase tracking-tight ${activeBet ? "text-white" : "text-slate-300"}`}
                    >
                      {option.nat}
                    </div>
                    <div
                      className={`text-[10px] font-bold ${activeBet ? "text-blue-100" : "text-slate-500"}`}
                    >
                      Pool: ₹{(Math.random() * 50000).toFixed(0)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-2xl font-mono font-black ${activeBet ? "text-white" : "text-yellow-400"}`}
                    >
                      {option.b || option.bs}
                    </div>
                    {activeBet && (
                      <div className="text-[10px] font-black text-white italic uppercase animate-pulse">
                        ₹{activeBet.stake}
                      </div>
                    )}
                  </div>

                  {/* Highlight effect */}
                  {!activeBet && !isMarketSuspended(option) && (
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Large Hand Finger-friendly Chips - Visible but not overwhelming */}
          <div className="flex items-center gap-2 justify-center py-4 overflow-x-auto no-scrollbar">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedChip(chip)}
                className={`flex-shrink-0 w-16 h-16 rounded-[1.25rem] font-black text-xs transition-all transform hover:-translate-y-1 active:scale-90 border-4 flex flex-col items-center justify-center ${
                  selectedChip === chip
                    ? "bg-white border-blue-500 text-blue-600 shadow-xl"
                    : "bg-slate-900/60 border-blue-900/20 text-slate-500 grayscale opacity-60"
                }`}
              >
                <span className="text-[8px] opacity-50 block leading-none">
                  INR
                </span>
                <span className="text-lg leading-none">
                  {chip > 999 ? `${chip / 1000}k` : chip}
                </span>
              </button>
            ))}
          </div>

          {/* History / Previous Rounds */}
          <div className="bg-slate-900/40 border border-blue-900/30 rounded-2xl p-6 mb-20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 text-slate-500">
              <History className="w-4 h-4" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">
                Round Archives
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {resultData?.res?.slice(0, 10).map((r: any, i: number) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[100px] group"
                >
                  <span className="text-[8px] font-black text-slate-600 uppercase">
                    RD {r.mid || i + 100}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-blue-900/20 border border-blue-900/30 flex items-center justify-center text-white font-black text-xs group-hover:bg-blue-600/20 group-hover:border-blue-500 transition-all">
                    {r.val || r.res}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Footer Bet Slip Strip */}
        <div className="fixed bottom-0 left-0 w-full bg-[#0a0f1e]/95 backdrop-blur-2xl border-t border-blue-900/50 p-4 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="flex flex-wrap gap-2">
                {bets.map((bet) => (
                  <div
                    key={bet.sid}
                    className="bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2"
                  >
                    <span className="text-blue-400 text-[10px] font-black uppercase">
                      {bet.nat}
                    </span>
                    <span className="text-white font-mono text-xs font-black">
                      ₹{bet.stake}
                    </span>
                    <button
                      onClick={() =>
                        setBets((prev) => prev.filter((b) => b.sid !== bet.sid))
                      }
                      className="text-slate-500 hover:text-red-500 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {bets.length === 0 && (
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic animate-pulse py-2">
                    Select your options above...
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-right">
                <span className="text-slate-500 text-[9px] font-black uppercase block leading-none">
                  Total Investment
                </span>
                <span className="text-white font-mono text-xl font-black">
                  ₹{bets.reduce((s, b) => s + b.stake, 0)}
                </span>
              </div>
              <div className="w-px h-8 bg-blue-900/50 mx-2"></div>
              <div className="text-right mr-4">
                <span className="text-blue-500 text-[9px] font-black uppercase block leading-none">
                  Potential Prize
                </span>
                <span className="text-blue-400 font-mono text-xl font-black">
                  ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setBets([])}
                  variant="outline"
                  className="h-12 w-12 rounded-xl border-blue-900/30 text-slate-500 hover:text-red-400 hover:bg-red-400/5 uppercase font-black"
                >
                  ✕
                </Button>
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-20 transition-all font-sans"
                >
                  Lock Final Answer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
