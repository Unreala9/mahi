import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface CricketMeterGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function CricketMeterGame({ game }: CricketMeterGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "📊 Meter Locked!", variant: "destructive" });
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
      toast({ title: "📊 Meter Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const currentValue = parseInt(gameData?.card) || 0;
  const targetValue = 100;
  const meterPercentage = Math.min((currentValue / targetValue) * 100, 100);

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <div className="bg-slate-900/50 border-b border-emerald-500/30 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <h1 className="text-emerald-400 font-bold text-lg">
                {game.gname}
              </h1>
            </div>
            <div className="text-emerald-400 font-mono text-xl">
              {gameData?.lt || 0}s
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Large Meter Display */}
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h2 className="text-emerald-400 text-sm font-bold uppercase mb-2">
                    Live Cricket Meter
                  </h2>
                  <div className="text-white text-4xl font-black">
                    {currentValue} / {targetValue}
                  </div>
                </div>

                <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-1000 ease-out"
                    style={{ width: `${meterPercentage}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {meterPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Start: 0</span>
                  <span>Current: {currentValue}</span>
                  <span>Target: {targetValue}</span>
                </div>
              </div>

              {/* Betting Markets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  const isOver = market.nat.toLowerCase().includes("over");
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      className={`h-24 rounded-xl border-2 transition-all ${
                        activeBet
                          ? "bg-emerald-600/20 border-emerald-500 shadow-lg"
                          : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-center h-full gap-3">
                        {isOver ? (
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-400" />
                        )}
                        <div>
                          <div
                            className={`text-lg font-bold ${isOver ? "text-green-400" : "text-red-400"}`}
                          >
                            {market.nat}
                          </div>
                          <div className="text-emerald-400 text-xl font-mono font-bold">
                            {market.b || market.bs}
                          </div>
                        </div>
                      </div>
                      {activeBet && (
                        <div className="absolute top-2 right-2 bg-emerald-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                          ₹{activeBet.stake}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Match Stats */}
              <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                <h3 className="text-emerald-400 text-sm font-bold mb-3">
                  Live Match Context
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Score:</span>{" "}
                    <span className="text-white">165/4</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Overs:</span>{" "}
                    <span className="text-white">18.2/20</span>
                  </div>
                  <div>
                    <span className="text-slate-400">RRR:</span>{" "}
                    <span className="text-white">12.5</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Target:</span>{" "}
                    <span className="text-white">180</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-10"
                >
                  Place Meter Bets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
