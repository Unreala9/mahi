import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Zap, Trophy, Timer, TrendingUp } from "lucide-react";

interface TrapRacingGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const GREYHOUNDS = [
  { id: 1, name: "Lightning", color: "bg-red-500", position: 0 },
  { id: 2, name: "Thunder", color: "bg-blue-500", position: 0 },
  { id: 3, name: "Storm", color: "bg-green-500", position: 0 },
  { id: 4, name: "Flash", color: "bg-yellow-500", position: 0 },
  { id: 5, name: "Bolt", color: "bg-purple-500", position: 0 },
  { id: 6, name: "Rocket", color: "bg-orange-500", position: 0 },
];

export default function TrapRacingGame({ game }: TrapRacingGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🐕 Race Closed!", variant: "destructive" });
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
      toast({ title: "🐕 Bets on Track!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0c1220] flex flex-col font-sans">
        {/* Race Header */}
        <div className="bg-slate-900/80 border-b border-orange-500/30 p-4">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-orange-400 font-black text-xl uppercase">
                  {game.gname}
                </h1>
                <p className="text-slate-400 text-sm">
                  Race #{gameData?.mid} • 6 Runners
                </p>
              </div>
            </div>
            <div className="text-center bg-orange-900/30 px-4 py-2 rounded-lg border border-orange-500/30">
              <Timer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <div className="text-orange-400 font-mono text-2xl font-bold">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Race Track Visualization */}
          <div className="bg-gradient-to-r from-green-900/20 via-green-800/30 to-green-900/20 border-2 border-green-700/50 rounded-2xl p-6 mb-6">
            <div className="relative h-64 bg-green-800/20 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>

              {/* Track Lanes */}
              {GREYHOUNDS.map((dog, i) => (
                <div
                  key={dog.id}
                  className="absolute w-full h-8 flex items-center"
                  style={{ top: `${i * 40 + 20}px` }}
                >
                  <div className="w-full h-1 bg-white/10 rounded"></div>
                  <div
                    className={`absolute w-8 h-6 ${dog.color} rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-1000`}
                    style={{ left: `${Math.random() * 80}%` }}
                  >
                    🐕
                  </div>
                  <div className="absolute left-2 text-white text-xs font-bold">
                    {dog.id}
                  </div>
                  <div className="absolute right-2 text-orange-400 text-xs font-bold">
                    FINISH
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Betting Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-orange-400 font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Live Odds Board
              </h2>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {market.nat.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-bold">
                              {market.nat}
                            </div>
                            <div className="text-slate-400 text-xs">
                              Win Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-orange-400 font-mono text-2xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${
                              activeBet
                                ? "bg-orange-600 text-white shadow-lg"
                                : "bg-slate-700 text-slate-300 hover:bg-orange-700/50"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Race History */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold text-sm">
                    Recent Winners
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center"
                    >
                      <div className="text-yellow-400 text-xs font-bold mb-1">
                        Race {r.mid || i + 1}
                      </div>
                      <div className="text-white font-bold">
                        #{r.val || r.res || "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-orange-400 font-bold text-lg mb-4">
                  Racing Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-orange-500 text-black"
                          : "bg-slate-800 text-slate-400"
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
                      className="bg-slate-800/50 rounded-lg p-3"
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
                        <span className="text-orange-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No runners selected
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total Exposure</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Return</span>
                    <span className="text-orange-400 font-bold">
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
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-12"
                  >
                    Back Runners
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-600 text-red-400"
                  >
                    Clear Slip
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
