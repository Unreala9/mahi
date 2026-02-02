import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Timer,
  History,
} from "lucide-react";

interface SicBoGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function SicBoGame({ game }: SicBoGameProps) {
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

  // Parse dice results
  const diceString = gameData?.card || "";
  const dice = diceString
    .split(",")
    .map((d) => parseInt(d) || 1)
    .slice(0, 3);
  const diceTotal = dice.reduce((sum, d) => sum + d, 0);

  // Categorize markets
  const smallBigMarkets =
    gameData?.sub?.filter((m: any) =>
      ["small", "big"].includes(m.nat.toLowerCase()),
    ) || [];
  const totalMarkets =
    gameData?.sub?.filter((m: any) =>
      /^(total\s)?(\d+)$/.test(m.nat.toLowerCase()),
    ) || [];
  const otherMarkets =
    gameData?.sub?.filter(
      (m: any) => !smallBigMarkets.includes(m) && !totalMarkets.includes(m),
    ) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 font-serif">
        {/* Header with Timer */}
        <div className="bg-black/60 border-b border-amber-500/30 px-4 py-3 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <Dice3 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-amber-400 font-black text-lg tracking-wide uppercase">
                {game.gname}
              </h1>
              <p className="text-slate-400 text-xs">Round #{gameData?.mid}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-900/30 px-4 py-2 rounded-full border border-amber-500/30">
            <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-400 font-mono text-xl font-bold">
              {gameData?.lt || 0}s
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-9 space-y-6">
              {/* Dice Display Area */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="text-center mb-6">
                    <h2 className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-2">
                      Dice Results
                    </h2>
                    <div className="text-white text-3xl font-black">
                      Total: {diceTotal}
                    </div>
                  </div>

                  <div className="flex justify-center gap-6">
                    {dice.map((die, i) => {
                      const DiceIcon = DICE_ICONS[die - 1] || Dice1;
                      return (
                        <div
                          key={i}
                          className={`relative group ${gameData?.lt === 0 ? "animate-bounce" : ""}`}
                        >
                          <div className="absolute -inset-3 bg-amber-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all"></div>
                          <div className="relative w-20 h-20 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-amber-400/50 transform hover:scale-110 transition-transform">
                            <DiceIcon className="w-12 h-12 text-slate-800" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Small/Big Bets */}
              <div className="grid grid-cols-2 gap-4">
                {smallBigMarkets.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  const isSmall = market.nat.toLowerCase() === "small";
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      className={`relative h-24 rounded-2xl border-2 transition-all ${
                        activeBet
                          ? `${isSmall ? "bg-blue-600/20 border-blue-500" : "bg-red-600/20 border-red-500"} shadow-lg`
                          : `${isSmall ? "bg-blue-900/10 border-blue-900/30 hover:bg-blue-900/20" : "bg-red-900/10 border-red-900/30 hover:bg-red-900/20"}`
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span
                          className={`text-2xl font-black uppercase tracking-wider ${isSmall ? "text-blue-400" : "text-red-400"}`}
                        >
                          {market.nat}
                        </span>
                        <span className="text-amber-400 text-xl font-mono font-bold mt-1">
                          {market.b || market.bs}
                        </span>
                        <span className="text-slate-500 text-xs">
                          Pool: ₹{(Math.random() * 50000).toFixed(0)}
                        </span>
                      </div>
                      {activeBet && (
                        <div className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                          ₹{activeBet.stake}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Totals Grid (4-17) */}
              <div>
                <h3 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-4">
                  Totals
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }, (_, i) => i + 4).map((total) => {
                    const market = totalMarkets.find((m: any) =>
                      m.nat.includes(total.toString()),
                    );
                    const activeBet = bets.find((b) => b.sid === market?.sid);

                    return (
                      <button
                        key={total}
                        onClick={() => market && handleMarketClick(market)}
                        disabled={!market}
                        className={`relative h-16 rounded-xl border transition-all ${
                          activeBet
                            ? "bg-amber-600/20 border-amber-500 shadow-lg"
                            : market
                              ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-amber-500/30"
                              : "bg-slate-900/30 border-slate-800/50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-white font-bold text-lg">
                            {total}
                          </span>
                          {market && (
                            <span className="text-amber-400 text-xs font-mono">
                              {market.b || market.bs}
                            </span>
                          )}
                        </div>
                        {activeBet && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            ₹{activeBet.stake}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Other Bets (Triples, Pairs, Singles) */}
              {otherMarkets.length > 0 && (
                <div>
                  <h3 className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-4">
                    Special Bets
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {otherMarkets.map((market: any) => {
                      const activeBet = bets.find((b) => b.sid === market.sid);
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          className={`relative h-20 rounded-xl border text-xs transition-all ${
                            activeBet
                              ? "bg-purple-600/20 border-purple-500 shadow-lg"
                              : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-amber-500/30"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-1">
                            <span className="text-white font-bold text-center leading-tight truncate w-full">
                              {market.nat}
                            </span>
                            <span className="text-amber-400 text-xs font-mono mt-1">
                              {market.b || market.bs}
                            </span>
                          </div>
                          {activeBet && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 text-black text-[9px] font-bold px-1 py-0.5 rounded-full">
                              ₹{activeBet.stake}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* History Panel */}
              <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-amber-400" />
                  <h3 className="text-amber-400 text-sm font-bold uppercase tracking-wider">
                    Last 10 Rolls
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {resultData?.res?.slice(0, 10).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]"
                    >
                      <div className="text-amber-400 text-xs font-bold">
                        #{r.mid || i + 1}
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2 min-w-[50px] text-center">
                        <div className="text-white text-sm font-bold">
                          Total: {r.val || r.res || "?"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 sticky top-4">
                <h3 className="text-amber-400 font-bold text-lg mb-4 uppercase tracking-wider">
                  Bet Slip
                </h3>

                {/* Chip Selector */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs mb-2 uppercase tracking-wide">
                    Select Chip
                  </p>
                  <div className="grid grid-cols-5 gap-1">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setSelectedChip(chip)}
                        className={`h-12 rounded-lg font-bold text-xs transition-all ${
                          selectedChip === chip
                            ? "bg-amber-500 text-black scale-105 shadow-lg"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        ₹{chip > 999 ? `${chip / 1000}k` : chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Bets */}
                <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white font-medium">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Odds: {bet.odds}</span>
                        <span className="text-amber-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4 italic">
                      No bets placed yet
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Win</span>
                    <span className="text-amber-400 font-bold">
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
                    className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold text-lg h-12"
                  >
                    Place Bets
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      className="border-amber-600 text-amber-400 hover:bg-amber-900/20 text-xs"
                    >
                      Repeat
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-900/20 text-xs"
                      onClick={() => {
                        if (bets.length > 0)
                          setBets(
                            bets.map((b) => ({ ...b, stake: b.stake * 2 })),
                          );
                      }}
                    >
                      Double
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
