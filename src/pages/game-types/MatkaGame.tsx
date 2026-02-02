import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Hash, Trophy, Clock } from "lucide-react";

interface MatkaGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function MatkaGame({ game }: MatkaGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 2500, 5000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚠️ Panel Suspended", variant: "destructive" });
      return;
    }

    const existingBet = bets.find((b) => b.sid === market.sid);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === market.sid ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
      toast({ title: `✅ Added ₹${selectedChip} to ${market.nat}` });
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
      toast({ title: "🎉 Bets Placed Successfully!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error placing bets", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-pink-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-900/30 via-red-900/30 to-orange-900/30 border-b-2 border-orange-600/30 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                    {game.gname.toUpperCase()}
                  </h1>
                  <p className="text-orange-300 text-sm font-medium">
                    Draw #{gameData?.mid || "---"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div className="text-4xl font-bold text-yellow-400 tabular-nums">
                    {gameData?.lt || 0}
                  </div>
                </div>
                <div className="text-xs text-orange-300 uppercase tracking-wider">
                  Seconds Left
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Main Betting Grid */}
          <div className="p-6 space-y-6">
            {/* Result Display */}
            {resultData?.res && resultData.res.length > 0 && (
              <Card className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border-2 border-orange-600/50 backdrop-blur">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-orange-200 font-bold text-lg">
                      Last Draw Result
                    </h3>
                  </div>
                  <div className="flex gap-4 items-center justify-center">
                    <div className="text-center">
                      <div className="text-orange-300 text-sm mb-2">
                        Winning Number
                      </div>
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-2xl border-4 border-yellow-400/50">
                        <span className="text-white text-3xl font-black">
                          {resultData.res[0]?.win || "?"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Number Panels Grid */}
            <div>
              <h3 className="text-orange-300 font-bold text-xl mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-600 rounded-full"></div>
                Number Panels
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {gameData?.sub?.map((market: any) => {
                  const betOnThis = bets.find((b) => b.sid === market.sid);
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={isMarketSuspended(market)}
                      className={`relative h-28 rounded-xl border-3 transition-all duration-300 transform ${
                        betOnThis
                          ? "bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700 border-yellow-400 scale-105 shadow-2xl shadow-orange-500/50"
                          : "bg-gradient-to-br from-slate-800 via-slate-900 to-black border-orange-700/50 hover:border-orange-500"
                      } ${
                        isMarketSuspended(market)
                          ? "opacity-40 cursor-not-allowed grayscale"
                          : "hover:scale-105 hover:shadow-xl"
                      }`}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="relative h-full flex flex-col items-center justify-center gap-2 p-2">
                        <div className="text-white text-2xl font-black tracking-wider">
                          {market.nat}
                        </div>
                        <div className="text-yellow-300 text-xl font-bold">
                          {market.b || market.bs}
                        </div>
                        {betOnThis && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                            ₹{betOnThis.stake}
                          </div>
                        )}
                        {betOnThis && (
                          <div className="absolute top-1 left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Draw History */}
            <Card className="bg-slate-900/90 border-orange-700/30">
              <div className="p-4">
                <h4 className="text-orange-300 font-bold mb-3">Recent Draws</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {resultData?.res?.slice(0, 20).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center font-bold text-white text-lg shadow-lg border-2 border-orange-400/50"
                    >
                      {r.win}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-b from-slate-950 to-black border-l-4 border-orange-700/30 p-5">
            <h3 className="text-orange-300 font-bold text-xl mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-600 rounded-full"></div>
              Bet Slip
            </h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3 font-medium">
                Select Chip
              </p>
              <div className="grid grid-cols-3 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-14 rounded-lg font-bold text-sm transition-all transform ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-orange-500 to-red-600 text-white scale-105 shadow-lg ring-2 ring-orange-400"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:scale-105"
                    }`}
                  >
                    ₹{chip.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bets List */}
            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">🎲</div>
                  <p className="text-sm">No bets placed yet</p>
                  <p className="text-xs mt-1">Tap panels above to bet</p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 border border-orange-600/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold">{bet.nat}</span>
                      <button
                        onClick={() =>
                          setBets(bets.filter((_, i) => i !== idx))
                        }
                        className="text-red-400 hover:text-red-300 font-bold text-lg"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Odds: {bet.odds}</span>
                      <span className="text-yellow-400 font-bold">
                        ₹{bet.stake}
                      </span>
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {bets.length > 0 && (
              <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border-2 border-orange-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-orange-200 font-semibold">
                    Total Stake:
                  </span>
                  <span className="text-yellow-300 font-bold text-xl">
                    ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-200 text-sm">
                    Potential Return:
                  </span>
                  <span className="text-green-300 font-bold text-lg">
                    ₹{bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 font-bold text-lg shadow-lg"
              >
                Place Bets
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setBets([])}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-950"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (bets.length > 0) {
                      const lastBet = bets[bets.length - 1];
                      setBets([
                        ...bets,
                        { ...lastBet, sid: lastBet.sid + Math.random() },
                      ]);
                    }
                  }}
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-950"
                >
                  Repeat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
