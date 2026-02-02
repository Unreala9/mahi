import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Zap, Trophy, TrendingUp, Flag } from "lucide-react";

interface Trap20GameProps {
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

export default function Trap20Game({ game }: Trap20GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [raceProgress, setRaceProgress] = useState(0);
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
      toast({ title: "🐕 Race Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        {/* Race Header */}
        <div className="bg-slate-900/90 border-b border-green-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-green-400 font-black text-xl uppercase">
                  {game.gname}
                </h1>
                <p className="text-slate-400 text-sm">
                  Race #{gameData?.mid} • 400m Track • Virtual Greyhounds
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
              <div className="text-white font-mono text-2xl font-bold">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Race Track Visualization */}
          <div className="bg-gradient-to-r from-green-900/20 via-green-800/30 to-green-900/20 border-2 border-green-700/50 rounded-2xl p-6 mb-6">
            <div className="relative h-64 bg-green-800/20 rounded-xl overflow-hidden">
              {/* Track Lines */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>

              {/* Greyhounds */}
              {GREYHOUNDS.map((dog, i) => (
                <div
                  key={dog.id}
                  className="absolute w-full h-8 flex items-center"
                  style={{ top: `${i * 40 + 10}px` }}
                >
                  <div className="w-full h-1 bg-white/10 rounded"></div>
                  <div
                    className={`absolute w-10 h-8 ${dog.color} rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-1000`}
                    style={{ left: `${Math.random() * 85}%` }}
                  >
                    {dog.id}🐕
                  </div>
                  <div className="absolute left-2 text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">
                    {dog.name}
                  </div>
                  <div className="absolute right-2 text-green-400 text-xs font-bold bg-black/60 px-2 py-1 rounded">
                    FINISH
                  </div>
                </div>
              ))}
            </div>

            {/* Countdown Bar */}
            <div className="mt-4">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${((gameData?.lt || 0) / 60) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>Race Start</span>
                <span>{gameData?.lt || 0}s until start</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Betting Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-green-400 font-bold text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Race Markets
              </h2>

              {/* Win Markets */}
              <div className="space-y-3">
                <h3 className="text-white font-bold text-sm">
                  WIN (Pick the Winner)
                </h3>
                <div className="grid gap-2">
                  {GREYHOUNDS.map((dog) => (
                    <button
                      key={dog.id}
                      onClick={() =>
                        handleMarketClick({
                          sid: dog.id,
                          nat: dog.name,
                          b: 2.5 + Math.random() * 3,
                        })
                      }
                      className="bg-slate-800/50 border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${dog.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
                        >
                          {dog.id}
                        </div>
                        <div className="text-left">
                          <div className="text-white font-bold">{dog.name}</div>
                          <div className="text-slate-400 text-sm">
                            Win Market
                          </div>
                        </div>
                      </div>
                      <div className="text-green-400 font-mono text-2xl font-bold">
                        {(2.5 + Math.random() * 3).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exotic Markets */}
              <div className="grid md:grid-cols-3 gap-3">
                <button className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-4 hover:border-yellow-500/40">
                  <div className="text-yellow-400 font-bold mb-2">PLACE</div>
                  <div className="text-slate-400 text-sm">Top 3</div>
                  <div className="text-yellow-400 font-mono text-lg font-bold mt-2">
                    1.8x
                  </div>
                </button>
                <button className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4 hover:border-orange-500/40">
                  <div className="text-orange-400 font-bold mb-2">EXACTA</div>
                  <div className="text-slate-400 text-sm">1st & 2nd</div>
                  <div className="text-orange-400 font-mono text-lg font-bold mt-2">
                    12.5x
                  </div>
                </button>
                <button className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40">
                  <div className="text-red-400 font-bold mb-2">TRIFECTA</div>
                  <div className="text-slate-400 text-sm">1st, 2nd, 3rd</div>
                  <div className="text-red-400 font-mono text-lg font-bold mt-2">
                    45.0x
                  </div>
                </button>
              </div>

              {/* Results History */}
              <div className="bg-slate-900/50 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <h3 className="text-green-400 font-bold text-sm">
                    Last 5 Winners
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-800/50 border border-green-500/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-green-400 text-xs font-bold mb-2">
                        Race {r.mid || i + 1}
                      </div>
                      <div className="w-8 h-8 mx-auto bg-red-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                        {r.val || r.res || Math.floor(Math.random() * 6) + 1}
                      </div>
                      <div className="text-white text-xs font-bold">Winner</div>
                      <div className="text-green-400 text-xs">
                        ₹{(Math.random() * 5000 + 1000).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-green-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Racing Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-green-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-green-500/20 rounded-lg p-3"
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
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-green-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No race bets selected
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Win</span>
                    <span className="text-green-400 font-bold">
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
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold h-12"
                  >
                    Place Race Bets ({bets.length})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() =>
                        setBets(
                          bets.map((bet) => ({ ...bet, stake: bet.stake * 2 })),
                        )
                      }
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                      disabled={bets.length === 0}
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500/10 text-xs"
                      disabled={bets.length === 0}
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
