import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Maximize2, Layers } from "lucide-react";

interface BaccaratVariantGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function BaccaratVariantGame({
  game,
}: BaccaratVariantGameProps) {
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

  const playerMarket = gameData?.sub?.find((m: any) => m.nat === "Player");
  const bankerMarket = gameData?.sub?.find((m: any) => m.nat === "Banker");
  const tieMarket = gameData?.sub?.find((m: any) => m.nat === "Tie");
  const sideMarkets =
    gameData?.sub?.filter(
      (m: any) => !["Player", "Banker", "Tie"].includes(m.nat),
    ) || [];

  const playerBet = bets.find((b) => b.sid === playerMarket?.sid);
  const bankerBet = bets.find((b) => b.sid === bankerMarket?.sid);
  const tieBet = bets.find((b) => b.sid === tieMarket?.sid);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none">
        {/* Compact Header */}
        <div className="bg-black/40 border-b border-white/5 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-slate-200 font-medium text-xs uppercase tracking-wider">
              {game.gname}
            </span>
            <span className="text-slate-500 text-[10px]">#{gameData?.mid}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-amber-400 font-mono text-xl font-bold">
              {gameData?.lt || 0}s
            </div>
            <button className="text-slate-500 hover:text-white transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-hidden">
          {/* Main Betting Area - Center focused */}
          <div className="flex-1 grid grid-cols-12 gap-1.5 min-h-0">
            {/* Left Side Bets Area */}
            <div className="col-span-2 grid grid-rows-4 gap-1">
              {sideMarkets.slice(0, 4).map((m: any) => (
                <button
                  key={m.sid}
                  onClick={() => handleMarketClick(m)}
                  className={`rounded border text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
                    bets.find((b) => b.sid === m.sid)
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <span className="opacity-70">{m.nat}</span>
                  <span className="text-amber-500">{m.b || m.bs}</span>
                </button>
              ))}
            </div>

            {/* Core Betting Zone */}
            <div className="col-span-8 flex flex-col gap-1.5">
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                {/* Player Zone */}
                <button
                  onClick={() =>
                    playerMarket && handleMarketClick(playerMarket)
                  }
                  className={`relative rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    playerBet
                      ? "bg-blue-600/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      : "bg-gradient-to-br from-blue-900/20 to-transparent border-blue-900/30 hover:bg-blue-900/10"
                  }`}
                >
                  <span className="text-blue-500 font-black text-2xl tracking-tighter">
                    PLAYER
                  </span>
                  <span className="text-white font-mono text-3xl font-black">
                    {playerMarket?.b || playerMarket?.bs || "--"}
                  </span>
                  {playerBet && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      ₹{playerBet.stake}
                    </div>
                  )}
                </button>

                {/* Banker Zone */}
                <button
                  onClick={() =>
                    bankerMarket && handleMarketClick(bankerMarket)
                  }
                  className={`relative rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    bankerBet
                      ? "bg-red-600/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      : "bg-gradient-to-br from-red-900/20 to-transparent border-red-900/30 hover:bg-red-900/10"
                  }`}
                >
                  <span className="text-red-500 font-black text-2xl tracking-tighter">
                    BANKER
                  </span>
                  <span className="text-white font-mono text-3xl font-black">
                    {bankerMarket?.b || bankerMarket?.bs || "--"}
                  </span>
                  {bankerBet && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      ₹{bankerBet.stake}
                    </div>
                  )}
                </button>
              </div>

              {/* Tie Row */}
              <button
                onClick={() => tieMarket && handleMarketClick(tieMarket)}
                className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  tieBet
                    ? "bg-emerald-600/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-gradient-to-r from-transparent via-emerald-900/20 to-transparent border-emerald-900/30 hover:bg-emerald-900/10"
                }`}
              >
                <span className="text-emerald-500 font-black text-sm tracking-widest">
                  TIE
                </span>
                <span className="text-white font-mono text-2xl font-black">
                  {tieMarket?.b || tieMarket?.bs || "--"}
                </span>
                {tieBet && (
                  <div className="absolute right-4 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">
                    ₹{tieBet.stake}
                  </div>
                )}
              </button>
            </div>

            {/* Right Side Bets Area */}
            <div className="col-span-2 grid grid-rows-4 gap-1">
              {sideMarkets.slice(4, 8).map((m: any) => (
                <button
                  key={m.sid}
                  onClick={() => handleMarketClick(m)}
                  className={`rounded border text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
                    bets.find((b) => b.sid === m.sid)
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <span className="opacity-70">{m.nat}</span>
                  <span className="text-amber-500">{m.b || m.bs}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal Roadmap Strip */}
          <div className="bg-black/60 border border-white/5 rounded-lg p-1.5">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {resultData?.res?.slice(0, 40).map((r: any, i: number) => (
                <div
                  key={i}
                  className={`flex-shrink-0 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center ${
                    r.win === "1"
                      ? "bg-blue-600 text-white"
                      : r.win === "2"
                        ? "bg-red-600 text-white"
                        : "bg-emerald-600 text-white"
                  }`}
                >
                  {r.win === "1" ? "P" : r.win === "2" ? "B" : "T"}
                </div>
              ))}
            </div>
          </div>

          {/* Control Section */}
          <div className="bg-slate-900/90 border border-white/5 rounded-t-xl mt-auto p-2">
            {/* Chip Bar */}
            <div className="flex justify-between items-center gap-2 mb-2">
              <div className="flex gap-1 flex-1 overflow-x-auto no-scrollbar">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`flex-1 min-w-[50px] h-8 rounded-md font-bold text-[10px] transition-all ${
                      selectedChip === chip
                        ? "bg-amber-500 text-black scale-105"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="px-3 text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold leading-none">
                  Total Stake
                </div>
                <div className="text-blue-400 font-mono font-bold">
                  ₹{bets.reduce((s, b) => s + b.stake, 0)}
                </div>
              </div>
            </div>

            {/* Control Strip */}
            <div className="flex gap-1.5 items-center">
              <div className="hidden sm:flex gap-1 px-2 border-r border-white/5">
                <Button
                  onClick={() => setBets([])}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] text-slate-400 uppercase font-black hover:text-red-400"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] text-slate-400 uppercase font-black hover:text-blue-400"
                >
                  Repeat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] text-slate-400 uppercase font-black hover:text-emerald-400"
                  onClick={() =>
                    setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })))
                  }
                >
                  Double
                </Button>
              </div>

              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-30"
              >
                Confirm Bets
              </Button>

              <div className="flex-1 text-right px-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold leading-none text-nowrap">
                  Potential Return
                </div>
                <div className="text-emerald-400 font-mono font-bold">
                  ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
