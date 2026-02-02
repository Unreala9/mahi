import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Star, Clock } from "lucide-react";

interface Lucky7EuropeanGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function Lucky7EuropeanGame({ game }: Lucky7EuropeanGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

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

  const highLowMarkets =
    gameData?.sub?.filter((m: any) =>
      [
        "below 7",
        "above 7",
        "exactly 7",
        "7 low",
        "7 high",
        "7 down",
        "7 up",
      ].some((s) => m.nat.toLowerCase().includes(s)),
    ) || [];

  const sideMarkets =
    gameData?.sub?.filter((m: any) => !highLowMarkets.includes(m)) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#050b1a] flex flex-col relative overflow-hidden">
        {/* European Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
          <div className="absolute top-10 left-10">
            <Star size={200} />
          </div>
          <div className="absolute bottom-20 right-20 rotate-45">
            <Star size={300} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/20"></div>
        </div>

        {/* Top Countdown Bar */}
        <div className="h-1 bg-slate-900 w-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            style={{ width: `${Math.min((gameData?.lt || 0) * 10, 100)}%` }}
          ></div>
        </div>

        <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black italic shadow-lg">
              7
            </div>
            <div>
              <h1 className="text-white font-black tracking-tight text-sm uppercase">
                {game.gname}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                European Series • #{gameData?.mid}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-yellow-500 font-mono text-xl font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{gameData?.lt || 0}s</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 max-w-5xl mx-auto w-full gap-6">
          {/* Card Flip Area */}
          <div className="relative flex justify-center py-12">
            <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent -translate-y-1/2"></div>
            <div className="relative z-10">
              <div className="absolute -inset-10 bg-yellow-400/20 rounded-full blur-[100px] animate-pulse"></div>
              <div
                className={`w-32 h-44 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center text-6xl font-black border-4 border-yellow-400/50 transition-all transform hover:scale-105 ${!gameData?.card ? "animate-pulse brightness-50" : ""}`}
              >
                {gameData?.card || "?"}
              </div>
              <div className="mt-4 text-center">
                <div className="inline-block px-4 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg">
                  Current Card
                </div>
              </div>
            </div>
          </div>

          {/* Main Betting Tiles */}
          <div className="grid grid-cols-3 gap-4">
            {highLowMarkets.slice(0, 3).map((m: any, i: number) => {
              const activeBet = bets.find((b) => b.sid === m.sid);
              return (
                <button
                  key={m.sid}
                  onClick={() => handleMarketClick(m)}
                  className={`group relative h-40 rounded-3xl border-2 transition-all overflow-hidden ${
                    activeBet
                      ? "bg-gradient-to-br from-yellow-400/20 via-amber-600/10 to-transparent border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                      : "bg-slate-900/40 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Select Market
                      </div>
                      <div className="text-white text-2xl font-black uppercase tracking-tighter leading-none">
                        {m.nat}
                      </div>
                    </div>
                    <div>
                      <div className="text-yellow-500 text-3xl font-mono font-black">
                        {m.b || m.bs || "--"}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                        Pool: ₹{(Math.random() * 10000).toFixed(0)}
                      </div>
                    </div>
                  </div>
                  {activeBet && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg">
                      ₹{activeBet.stake}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Side Bets Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {sideMarkets.map((m: any) => {
              const activeBet = bets.find((b) => b.sid === m.sid);
              return (
                <button
                  key={m.sid}
                  onClick={() => handleMarketClick(m)}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    activeBet
                      ? "bg-yellow-400 border-yellow-400 text-black"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-[9px] font-black uppercase opacity-60 text-nowrap truncate px-1">
                    {m.nat}
                  </span>
                  <span
                    className={`text-sm font-mono font-black ${activeBet ? "text-black" : "text-yellow-500"}`}
                  >
                    {m.b || m.bs}
                  </span>
                </button>
              );
            })}
          </div>

          {/* History Panel */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mt-4 backdrop-blur-md">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-400" /> Recent Draw Results
            </h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {resultData?.res?.slice(0, 15).map((r: any, i: number) => (
                <div
                  key={i}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className="w-10 h-14 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white font-black text-xl group-hover:bg-yellow-400/10 group-hover:border-yellow-400 transition-all">
                    {r.res || r.val}
                  </div>
                  <div
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${r.win === "1" ? "text-blue-400" : "text-red-400"}`}
                  >
                    {r.win === "1" ? "Low" : "High"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Footer */}
        <div className="bg-[#0a1229] border-t border-yellow-400/20 p-4 mt-auto">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar w-full md:w-auto">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSelectedChip(chip)}
                  className={`flex-1 min-w-[60px] h-12 rounded-2xl font-black text-xs transition-all border-2 ${
                    selectedChip === chip
                      ? "bg-yellow-400 border-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                      : "bg-slate-900/60 border-white/5 text-slate-500 hover:text-white"
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:flex-none md:min-w-[140px] px-4 py-2 bg-slate-900/60 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-slate-500 uppercase font-black leading-none">
                  Total Stake
                </div>
                <div className="text-white font-mono text-lg font-black">
                  ₹{bets.reduce((s, b) => s + b.stake, 0)}
                </div>
              </div>
              <div className="flex-1 md:flex-none md:min-w-[140px] px-4 py-2 bg-slate-900/60 border border-white/5 rounded-2xl">
                <div className="text-[10px] text-slate-500 uppercase font-black leading-none text-nowrap">
                  Potential Win
                </div>
                <div className="text-yellow-400 font-mono text-lg font-black">
                  ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex gap-1">
                <Button
                  onClick={() => setBets([])}
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-2xl border-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                >
                  ✕
                </Button>
                <Button
                  onClick={() =>
                    setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                  }
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-2xl border-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400"
                >
                  2x
                </Button>
              </div>
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="flex-1 md:min-w-[160px] h-12 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-sm rounded-2xl shadow-lg disabled:opacity-30 disabled:scale-95 transition-all"
              >
                Confirm Bets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
