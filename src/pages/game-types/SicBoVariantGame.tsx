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
  Zap,
  ChevronDown,
} from "lucide-react";

interface SicBoVariantGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function SicBoVariantGame({ game }: SicBoVariantGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 5000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎲 Locked!", variant: "destructive" });
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
      toast({ title: "🎲 Bets Locked!" });
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

  // Categorize markets - prioritize popular bets
  const smallBigMarkets =
    gameData?.sub?.filter((m: any) =>
      ["small", "big"].includes(m.nat.toLowerCase()),
    ) || [];
  const totalMarkets =
    gameData?.sub?.filter((m: any) =>
      /^(total\s)?(\d+)$/.test(m.nat.toLowerCase()),
    ) || [];
  const advancedMarkets =
    gameData?.sub?.filter(
      (m: any) => !smallBigMarkets.includes(m) && !totalMarkets.includes(m),
    ) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0b0f] flex flex-col font-sans">
        {/* Ultra-Compact Header */}
        <div className="bg-black/80 border-b border-cyan-500/20 px-3 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="text-cyan-400 font-black text-sm uppercase tracking-wider">
              {game.gname}
            </span>
            <span className="text-slate-600 text-xs">#{gameData?.mid}</span>
          </div>
          <div className="text-cyan-400 font-mono text-2xl font-black">
            {gameData?.lt || 0}s
          </div>
        </div>

        <div className="flex-1 flex flex-col p-2 gap-3 overflow-hidden">
          {/* Dice Display - Large & Animated */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-cyan-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-center mb-3">
                <div className="text-cyan-400 text-xs font-bold uppercase mb-1">
                  Live Result
                </div>
                <div className="text-white text-4xl font-black font-mono">
                  {diceTotal}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {dice.map((die, i) => {
                  const DiceIcon = DICE_ICONS[die - 1] || Dice1;
                  return (
                    <div
                      key={i}
                      className={`relative ${gameData?.lt === 0 ? "animate-pulse" : ""}`}
                    >
                      <div className="absolute -inset-2 bg-cyan-500/30 rounded-lg blur-md"></div>
                      <div className="relative w-16 h-16 bg-white rounded-lg shadow-xl flex items-center justify-center border-2 border-cyan-400/50">
                        <DiceIcon className="w-10 h-10 text-slate-800" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Betting Area - Mobile Optimized */}
          <div className="flex-1 space-y-3">
            {/* Small/Big - Most Popular */}
            <div className="grid grid-cols-2 gap-3">
              {smallBigMarkets.map((market: any) => {
                const activeBet = bets.find((b) => b.sid === market.sid);
                const isSmall = market.nat.toLowerCase() === "small";
                return (
                  <button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    className={`relative h-20 rounded-xl border-2 transition-all active:scale-95 ${
                      activeBet
                        ? `${isSmall ? "bg-blue-600/30 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-red-600/30 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"}`
                        : `${isSmall ? "bg-blue-900/20 border-blue-900/40 hover:bg-blue-800/30" : "bg-red-900/20 border-red-900/40 hover:bg-red-800/30"}`
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span
                        className={`text-xl font-black uppercase ${isSmall ? "text-blue-400" : "text-red-400"}`}
                      >
                        {market.nat}
                      </span>
                      <span className="text-cyan-400 text-2xl font-mono font-black">
                        {market.b || market.bs}
                      </span>
                    </div>
                    {activeBet && (
                      <div className="absolute top-1 right-1 bg-cyan-400 text-black text-xs font-black px-2 py-1 rounded-full">
                        ₹{activeBet.stake}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Totals - Streamlined 4-17 */}
            <div>
              <h3 className="text-cyan-400 text-xs font-bold uppercase mb-2">
                Popular Totals
              </h3>
              <div className="grid grid-cols-7 gap-1">
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
                      className={`relative h-14 rounded-lg border transition-all ${
                        activeBet
                          ? "bg-cyan-600/30 border-cyan-400 shadow-lg"
                          : market
                            ? "bg-slate-800/60 border-slate-600 hover:bg-slate-700/60 hover:border-cyan-400/50"
                            : "bg-slate-900/30 border-slate-800/30 opacity-30"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-white font-bold">{total}</span>
                        {market && (
                          <span className="text-cyan-400 text-xs font-mono">
                            {market.b || market.bs}
                          </span>
                        )}
                      </div>
                      {activeBet && (
                        <div className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[9px] font-black px-1 py-0.5 rounded-full">
                          ₹{activeBet.stake}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Bets - Collapsible */}
            {advancedMarkets.length > 0 && (
              <div className="border-t border-slate-800 pt-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-3"
                >
                  <span className="text-xs font-bold uppercase">
                    Advanced Bets
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-3 gap-2">
                    {advancedMarkets.slice(0, 9).map((market: any) => {
                      const activeBet = bets.find((b) => b.sid === market.sid);
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          className={`relative h-16 rounded-lg border text-xs transition-all ${
                            activeBet
                              ? "bg-purple-600/30 border-purple-400 shadow-lg"
                              : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-1">
                            <span className="text-white font-bold text-center leading-tight truncate w-full text-[10px]">
                              {market.nat}
                            </span>
                            <span className="text-cyan-400 text-xs font-mono">
                              {market.b || market.bs}
                            </span>
                          </div>
                          {activeBet && (
                            <div className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[8px] font-black px-1 py-0.5 rounded-full">
                              ₹{activeBet.stake}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Real-time History Strip */}
            <div className="bg-slate-900/40 border border-cyan-500/20 rounded-xl p-2">
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {resultData?.res?.slice(0, 15).map((r: any, i: number) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded border border-slate-700 flex items-center justify-center"
                  >
                    <span className="text-cyan-400 text-xs font-bold">
                      {r.val || r.res || "?"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Controls - One Line */}
          <div className="bg-slate-900/80 border-t border-cyan-500/20 p-3">
            {/* Chip Bar */}
            <div className="flex gap-2 mb-3 justify-center">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSelectedChip(chip)}
                  className={`flex-1 h-10 rounded-lg font-bold text-xs transition-all ${
                    selectedChip === chip
                      ? "bg-cyan-500 text-black scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            {/* One-Line Summary & Controls */}
            <div className="flex items-center gap-3 text-xs">
              <div className="text-slate-400">
                Stake:{" "}
                <span className="text-white font-bold">
                  ₹{bets.reduce((s, b) => s + b.stake, 0)}
                </span>
              </div>
              <div className="text-slate-400">
                Win:{" "}
                <span className="text-cyan-400 font-bold">
                  ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                </span>
              </div>
              <div className="flex-1"></div>
              <button
                onClick={() => setBets([])}
                className="text-red-400 hover:text-red-300 px-2"
              >
                Clear
              </button>
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-6 h-8 text-xs rounded-lg"
              >
                BET NOW
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
