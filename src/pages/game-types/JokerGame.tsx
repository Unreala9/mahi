import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Ghost, Star, PartyPopper } from "lucide-react";

interface JokerGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function JokerGame({ game }: JokerGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 2000, 5000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🤡 Suspended!", variant: "destructive" });
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
        title: "🎭 JOKER'S FAVOR!",
        description: "Your bets are locked in.",
        className: "bg-purple-900 border-purple-500 text-white",
      });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#1a0b2e] flex flex-col relative overflow-hidden font-sans">
        {/* Subtle Joker Background Art */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div className="absolute -top-20 -left-20 rotate-12">
            <Ghost size={400} />
          </div>
          <div className="absolute -bottom-20 -right-20 -rotate-12">
            <Ghost size={500} />
          </div>
          <div className="absolute top-1/4 right-1/4 opacity-20">
            <Star size={100} />
          </div>
        </div>

        {/* Themed Header */}
        <div className="px-6 py-4 bg-black/40 border-b border-purple-900/50 backdrop-blur-xl flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rotate-3 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:rotate-6 transition-transform">
                <Ghost className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-black text-xl italic tracking-tighter uppercase mb-0.5 leading-none">
                {game.gname}
              </h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.2em]">
                Joker's Edition • #{gameData?.mid}
              </p>
            </div>
          </div>

          <div className="text-center bg-black/40 px-6 py-1 rounded-full border border-purple-900/30">
            <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Bets Close In
            </span>
            <div className="text-white font-mono text-2xl font-black drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              {gameData?.lt || 0}
              <span className="text-xs ml-0.5 opacity-50 italic">s</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6 gap-8 relative z-10 overflow-y-auto no-scrollbar">
          {/* Card Table Area */}
          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

            <div className="flex justify-center gap-4 py-8">
              {cards.length > 0 ? (
                cards.map((card, i) => (
                  <div key={i} className="group relative">
                    <div className="absolute -inset-4 bg-purple-600/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div
                      className={`w-24 h-36 bg-white rounded-[1.5rem] shadow-2xl flex flex-col items-center justify-center transform transition-all hover:scale-105 hover:-translate-y-2 border-t-4 ${i % 2 === 0 ? "border-purple-500 rotate-1" : "border-pink-500 -rotate-1"}`}
                    >
                      <div
                        className={`text-4xl font-black ${card.includes("♥") || card.includes("♦") ? "text-red-500" : "text-slate-900"}`}
                      >
                        {card}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-24 h-36 bg-purple-900/10 rounded-[1.5rem] border-2 border-dashed border-purple-900/30 flex items-center justify-center"
                    >
                      <Star className="w-6 h-6 text-purple-900/30 animate-spin-slow" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Win Particle Placeholder (Animated Flourish) */}
            {gameData?.lt === 0 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce">
                <PartyPopper className="w-12 h-12 text-yellow-400 opacity-50" />
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Betting Grid - 8 Cols */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      className={`relative h-24 rounded-[1.25rem] border-2 group transition-all transform active:scale-95 ${
                        activeBet
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 border-white shadow-[0_10px_20px_rgba(168,85,247,0.3)]"
                          : "bg-black/40 border-purple-900/30 hover:border-purple-500/50 hover:bg-purple-900/10"
                      }`}
                    >
                      <div className="absolute -top-2 left-4 px-2 bg-[#1a0b2e]">
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest ${activeBet ? "text-purple-200" : "text-purple-500"}`}
                        >
                          Selection
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center h-full gap-1">
                        <span
                          className={`text-sm font-black uppercase tracking-tight ${activeBet ? "text-white" : "text-slate-300"}`}
                        >
                          {market.nat}
                        </span>
                        <span
                          className={`text-2xl font-mono font-black ${activeBet ? "text-white" : "text-green-400"}`}
                        >
                          {market.b || market.bs}
                        </span>
                      </div>
                      {activeBet && (
                        <div className="absolute bottom-1 right-3 text-[10px] font-black text-white italic">
                          Chips: ₹{activeBet.stake}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Draw History */}
              <div className="pt-4">
                <h3 className="text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center">
                  Joker's Logbook
                </h3>
                <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-2">
                  {resultData?.res?.slice(0, 10).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-900/20 border border-purple-900/30 flex items-center justify-center text-white font-black text-xs hover:border-purple-500 transition-colors"
                    >
                      {r.val || r.res}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Controls / Bet Summary - 4 Cols */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-black/40 border border-purple-900/30 rounded-[2rem] p-6 shadow-2xl backdrop-blur-md">
                <h2 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-500" /> Bet Summary
                </h2>

                <div className="space-y-3 mb-8">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="flex justify-between items-center text-[10px] bg-purple-900/10 p-2 rounded-lg border border-purple-900/20"
                    >
                      <span className="text-purple-300 font-bold uppercase">
                        {bet.nat}
                      </span>
                      <span className="text-white font-mono font-black">
                        ₹{bet.stake}
                      </span>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-center text-purple-900/50 text-[10px] font-bold uppercase py-4 italic">
                      No bets placed yet, fool!
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-purple-500 text-[9px] font-black uppercase block mb-1">
                      Stake Total
                    </span>
                    <span className="text-white font-mono text-xl font-black">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-500 text-[9px] font-black uppercase block mb-1">
                      Possible Loot
                    </span>
                    <span className="text-green-400 font-mono text-xl font-black">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Chip Selector */}
                <div className="flex gap-1.5 justify-center mb-6 overflow-x-auto no-scrollbar pb-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full font-black text-[9px] border-2 transition-all transform hover:rotate-12 ${
                        selectedChip === chip
                          ? "bg-purple-600 border-white text-white shadow-lg scale-110"
                          : "bg-black/40 border-purple-900/50 text-purple-500"
                      }`}
                    >
                      {chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.4)] transition-all transform active:scale-95 disabled:opacity-30"
                  >
                    LOCK BETS
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="ghost"
                      className="h-10 text-[9px] text-purple-500 hover:text-red-400 font-black uppercase"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() =>
                        setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                      }
                      variant="ghost"
                      className="h-10 text-[9px] text-purple-500 hover:text-blue-400 font-black uppercase"
                    >
                      Double
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 text-[9px] text-purple-500 hover:text-yellow-400 font-black uppercase"
                    >
                      Repeat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
