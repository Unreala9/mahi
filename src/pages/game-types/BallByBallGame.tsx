import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Activity, Clock, TrendingUp } from "lucide-react";

interface BallByBallGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function BallByBallGame({ game }: BallByBallGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 200, 500, 1000, 2000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚠️ Market Suspended", variant: "destructive" });
      return;
    }

    const existingBet = bets.find((b) => b.sid === market.sid);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === market.sid ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
      toast({ title: `✅ Added ₹${selectedChip}` });
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
      toast({ title: `✅ Bet on ${market.nat}` });
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
      toast({ title: "🎉 Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  // Parse ball history from results
  const ballHistory =
    resultData?.res?.slice(0, 10).map((r: any) => {
      const result = r.win?.toString() || "0";
      if (result === "4" || result === "6")
        return { val: result, type: "boundary" };
      if (result === "W" || result.toLowerCase() === "w")
        return { val: "W", type: "wicket" };
      return { val: result, type: "runs" };
    }) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-teal-950">
        {/* Match Header */}
        <div className="bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-green-900/40 border-b-2 border-green-600/30 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                    {game.gname.toUpperCase()}
                  </h1>
                  <p className="text-green-300 text-sm">
                    Ball #: {gameData?.mid || "---"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 tabular-nums">
                    {gameData?.lt || 0}s
                  </div>
                  <div className="text-xs text-green-300">Next Ball</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Main Betting Area */}
          <div className="p-6 space-y-6">
            {/* Match Context Card */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-700/30 backdrop-blur">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-green-300 text-sm font-semibold mb-2">
                      STRIKER
                    </div>
                    <div className="text-white text-2xl font-bold">
                      Batsman 1
                    </div>
                    <div className="text-green-400 text-sm mt-1">
                      35(28) • 4x4s, 2x6s
                    </div>
                  </div>
                  <div>
                    <div className="text-green-300 text-sm font-semibold mb-2">
                      BOWLER
                    </div>
                    <div className="text-white text-2xl font-bold">
                      Bowler 1
                    </div>
                    <div className="text-red-400 text-sm mt-1">
                      3-0-18-1 • Eco: 6.00
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-green-300 text-xs">OVER</div>
                      <div className="text-white text-lg font-bold">12.3</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 text-xs">SCORE</div>
                      <div className="text-white text-2xl font-bold">98/2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 text-xs">REQ RATE</div>
                      <div className="text-white text-lg font-bold">7.8</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ball-by-Ball Markets */}
            <div>
              <h3 className="text-green-300 font-bold text-xl mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></div>
                This Ball Markets
              </h3>
              <div className="space-y-3">
                {gameData?.sub?.map((market: any) => {
                  const betOnThis = bets.find((b) => b.sid === market.sid);
                  return (
                    <Card
                      key={market.sid}
                      className={`overflow-hidden transition-all ${
                        betOnThis
                          ? "bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-2 border-green-400 shadow-lg shadow-green-500/30"
                          : "bg-slate-900/80 border-slate-700 hover:border-green-600"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-bold text-lg">
                              {market.nat}
                            </h4>
                            <p className="text-slate-400 text-xs">
                              Ball #{gameData?.mid || "---"}
                            </p>
                          </div>
                          {betOnThis && (
                            <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                              ₹{betOnThis.stake}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarketClick(market)}
                            disabled={isMarketSuspended(market)}
                            className={`flex-1 h-16 rounded-lg font-bold transition-all ${
                              isMarketSuspended(market)
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : betOnThis
                                  ? "bg-gradient-to-br from-yellow-600 to-orange-600 text-white scale-105"
                                  : "bg-gradient-to-br from-green-700 to-emerald-800 text-white hover:scale-105"
                            }`}
                          >
                            <div className="text-sm">YES</div>
                            <div className="text-xl">
                              {market.b || market.bs}
                            </div>
                          </button>
                          <button
                            className="flex-1 h-16 rounded-lg font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all"
                            disabled
                          >
                            <div className="text-sm">NO</div>
                            <div className="text-xl">-</div>
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Ball History */}
            <Card className="bg-slate-900/90 border-green-700/30">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-300 font-bold">Last 10 Balls</h4>
                </div>
                <div className="flex gap-2">
                  {ballHistory.map((ball: any, i: number) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${
                        ball.type === "boundary"
                          ? "bg-gradient-to-br from-green-600 to-green-700 text-xl"
                          : ball.type === "wicket"
                            ? "bg-gradient-to-br from-red-600 to-red-700"
                            : "bg-gradient-to-br from-blue-600 to-blue-700"
                      }`}
                    >
                      {ball.val}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-b from-slate-950 to-black border-l-4 border-green-700/30 p-5">
            <h3 className="text-green-300 font-bold text-xl mb-4">Bet Slip</h3>

            {/* Chips */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Select Stake</p>
              <div className="grid grid-cols-3 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-12 rounded-lg font-bold text-sm transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white scale-105"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ₹{chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Bets */}
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">🏏</div>
                  <p className="text-sm">No bets placed</p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-lg p-3 border border-green-600/30"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-bold text-sm">
                        {bet.nat}
                      </span>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">@ {bet.odds}</span>
                      <span className="text-yellow-400 font-bold">
                        ₹{bet.stake}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {bets.length > 0 && (
              <div className="bg-green-900/40 border-2 border-green-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-green-200">Total Stake:</span>
                  <span className="text-yellow-300 font-bold text-xl">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200 text-sm">Exposure:</span>
                  <span className="text-red-300 font-bold">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 font-bold"
              >
                Place Bets
              </Button>
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="w-full border-red-600 text-red-400"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
