import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Play, Users, Target, Clock } from "lucide-react";

interface FantasyCricketGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function FantasyCricketGame({ game }: FantasyCricketGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 2500];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🏏 Market Closed!", variant: "destructive" });
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
      toast({ title: "🏏 Fantasy Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0d1b2a] flex flex-col font-sans">
        {/* Match Context Header */}
        <div className="bg-gradient-to-r from-green-900/50 via-emerald-900/50 to-green-900/50 border-b border-green-500/30 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-green-400 font-black text-lg uppercase tracking-wide">
                    {game.gname}
                  </h1>
                  <p className="text-slate-400 text-xs">Live Fantasy Markets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-900/40 px-3 py-1 rounded-full border border-green-500/30">
                <Clock className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-green-400 font-mono font-bold">
                  {gameData?.lt || 0}s
                </span>
              </div>
            </div>

            {/* Team Context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 font-bold mb-1">Team A</div>
                <div className="text-white">Mumbai Indians</div>
                <div className="text-slate-400 text-xs">165/4 (18.2 overs)</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-green-400 font-bold">VS</div>
                  <div className="text-slate-400 text-xs">IPL 2026</div>
                </div>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 font-bold mb-1">Team B</div>
                <div className="text-white">Royal Challengers</div>
                <div className="text-slate-400 text-xs">
                  Target: 166 (1.4 overs left)
                </div>
              </div>
            </div>

            {/* Current Players */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-400 text-xs">On Strike</span>
                </div>
                <div className="text-white font-bold">Virat Kohli</div>
                <div className="text-yellow-400 text-sm">
                  45* (28b, 6x4, 1x6)
                </div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Bowling</span>
                </div>
                <div className="text-white font-bold">Jasprit Bumrah</div>
                <div className="text-purple-400 text-sm">
                  3-0-18-2 (Econ: 6.00)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-12 gap-4 p-4 max-w-6xl mx-auto w-full">
          {/* Fantasy Markets */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-4">
              Live Fantasy Markets
            </h2>

            <div className="grid gap-3">
              {gameData?.sub?.map((market: any) => {
                const activeBet = bets.find((b) => b.sid === market.sid);
                return (
                  <div
                    key={market.sid}
                    className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 hover:bg-slate-800/60 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-sm">
                          {market.nat}
                        </h3>
                        <p className="text-slate-400 text-xs">
                          Pool: ₹{(Math.random() * 100000).toFixed(0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-mono text-xl font-bold">
                          {market.b || market.bs}
                        </div>
                        <div className="text-slate-500 text-xs">
                          Decimal Odds
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarketClick(market)}
                      className={`w-full h-12 rounded-lg border-2 font-bold transition-all ${
                        activeBet
                          ? "bg-green-600/30 border-green-500 text-white shadow-lg"
                          : "border-slate-600 text-slate-400 hover:border-green-500/50 hover:bg-green-900/10"
                      }`}
                    >
                      {activeBet
                        ? `Selected: ₹${activeBet.stake}`
                        : "Place Bet"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Recent Outcomes */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mt-6">
              <h3 className="text-green-400 font-bold text-sm mb-3 uppercase tracking-wider">
                Recent Ball Outcomes
              </h3>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {resultData?.res?.slice(0, 10).map((r: any, i: number) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-sm">
                      {r.val || r.res || "?"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/80 border border-green-500/30 rounded-xl p-4 sticky top-4">
              <h3 className="text-green-400 font-bold text-lg mb-4">
                Fantasy Bets
              </h3>

              {/* Chip Selector */}
              <div className="mb-4">
                <p className="text-slate-400 text-xs mb-2">Chip Value</p>
                <div className="grid grid-cols-5 gap-1">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded-lg font-bold text-xs transition-all ${
                        selectedChip === chip
                          ? "bg-green-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Bets */}
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                {bets.map((bet) => (
                  <div
                    key={bet.sid}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white font-medium truncate pr-2">
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
                      <span className="text-slate-400">@ {bet.odds}</span>
                      <span className="text-green-400 font-bold">
                        ₹{bet.stake}
                      </span>
                    </div>
                  </div>
                ))}
                {bets.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">
                    No fantasy bets selected
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Total Exposure</span>
                  <span className="text-white font-bold">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Potential Return</span>
                  <span className="text-green-400 font-bold">
                    ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12"
                >
                  Place Fantasy Bets
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="border-red-600 text-red-400"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-400"
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
    </MainLayout>
  );
}
