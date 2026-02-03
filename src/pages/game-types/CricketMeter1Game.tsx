import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Target,
  Timer,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";

interface CricketMeter1GameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function CricketMeter1Game({ game }: CricketMeter1GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [currentBall, setCurrentBall] = useState(1);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚡ Ball Suspended!", variant: "destructive" });
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
      toast({ title: "⚡ Ball-by-Ball Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const ballCountdown = Math.floor((gameData?.lt || 60) % 90); // 45-90 second cycles

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-blue-950 flex flex-col font-sans">
        {/* Ball-by-Ball Header */}
        <div className="bg-slate-900/90 border-b border-green-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-green-400 font-black text-xl uppercase tracking-wider">
                  {game.gname}
                </h1>
                <p className="text-slate-300 text-sm">
                  ⚡ Ultra-Granular Ball-by-Ball Betting ⚡
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-green-500 to-blue-500 px-6 py-2 rounded-full text-black font-bold">
              <Timer className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xl font-black">{ballCountdown}s</div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Live Ball Visualization */}
          <div className="bg-gradient-to-r from-slate-800/60 via-green-900/40 to-slate-800/60 border-2 border-green-400/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 px-6 py-2 rounded-full text-black font-bold mb-4">
                <Activity className="w-4 h-4" />
                <span>
                  LIVE BALL #{currentBall} • Over 16.{currentBall}
                </span>
                <Activity className="w-4 h-4" />
              </div>
            </div>

            {/* Ball Prediction Gauge */}
            <div className="relative mb-6">
              <div className="text-center text-green-400 font-bold text-sm mb-2">
                BALL OUTCOME PROBABILITY
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-green-500/30">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 transition-all duration-1000"
                  style={{ width: `${Math.min(ballCountdown * 1.2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Dot Ball</span>
                <span>Single</span>
                <span>Boundary</span>
                <span>Six</span>
              </div>
            </div>

            {/* Live Action Panel */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-green-400/20 rounded-lg p-3 text-center">
                <div className="text-green-400 text-xs font-bold mb-1">
                  BOWLER
                </div>
                <div className="text-white font-bold text-sm">J. Bumrah</div>
                <div className="text-slate-400 text-xs">15.2 overs</div>
              </div>
              <div className="bg-slate-800/50 border border-blue-400/20 rounded-lg p-3 text-center">
                <div className="text-blue-400 text-xs font-bold mb-1">
                  BATSMAN
                </div>
                <div className="text-white font-bold text-sm">V. Kohli</div>
                <div className="text-slate-400 text-xs">45* runs</div>
              </div>
              <div className="bg-slate-800/50 border border-yellow-400/20 rounded-lg p-3 text-center">
                <div className="text-yellow-400 text-xs font-bold mb-1">
                  FIELD
                </div>
                <div className="text-white font-bold text-sm">Attacking</div>
                <div className="text-slate-400 text-xs">5 slips</div>
              </div>
              <div className="bg-slate-800/50 border border-red-400/20 rounded-lg p-3 text-center">
                <div className="text-red-400 text-xs font-bold mb-1">
                  PRESSURE
                </div>
                <div className="text-white font-bold text-lg">85%</div>
                <div className="text-slate-400 text-xs">HIGH</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Ultra-Granular Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-green-400 font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Single Ball Markets
              </h2>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-gradient-to-r from-slate-800/50 via-green-900/30 to-slate-800/50 border border-green-400/20 rounded-xl p-4 backdrop-blur-sm hover:border-green-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-blue-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">
                            ⚡
                          </div>
                          <div>
                            <div className="text-white font-bold">
                              {market.nat}
                            </div>
                            <div className="text-green-300 text-sm">
                              Single Ball Bet
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-green-400 font-mono text-2xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                              activeBet
                                ? "bg-gradient-to-r from-green-400 to-blue-500 text-black shadow-lg"
                                : "bg-gradient-to-r from-slate-700 to-green-700 text-green-300 hover:from-green-600 hover:to-blue-600"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "QUICK BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ball History */}
              <div className="bg-slate-900/60 border border-green-400/20 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h3 className="text-green-400 font-bold text-sm">
                    Last 10 Balls
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {[4, 1, 0, 6, 2, 0, 1, 4, 0, 3].map((runs, i) => (
                    <div
                      key={i}
                      className={`min-w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 ${
                        runs === 0
                          ? "bg-gray-600 border-gray-500"
                          : runs === 1 || runs === 2 || runs === 3
                            ? "bg-blue-600 border-blue-500"
                            : runs === 4
                              ? "bg-green-600 border-green-500"
                              : runs === 6
                                ? "bg-red-600 border-red-500"
                                : "bg-slate-600 border-slate-500"
                      }`}
                    >
                      {runs}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Scroll for more • Color coded by outcome
                </div>
              </div>
            </div>

            {/* Ball-by-Ball Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-green-400/30 rounded-xl p-4 sticky top-4 backdrop-blur-sm">
                <h3 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ball Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-green-400 to-blue-500 text-black"
                          : "bg-slate-800 text-slate-300 border border-green-400/20"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-gradient-to-r from-slate-800/50 to-green-800/30 border border-green-400/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}</span>
                        <span className="text-green-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No ball bets selected
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 border border-green-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Ball Exposure</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Quick Win</span>
                    <span className="text-green-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold h-12"
                  >
                    Bet This Ball
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Clear Ball Slip
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
