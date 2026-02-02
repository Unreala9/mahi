import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Trophy, Clock, Info } from "lucide-react";

interface ThreeCardJudgementGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function ThreeCardJudgementGame({
  game,
}: ThreeCardJudgementGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

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

  const cards = gameData?.card?.split(",") || [];
  const handACards = cards.slice(0, 3);
  const handBCards = cards.slice(3, 6);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 border-b border-purple-600/30 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    3 CARD JUDGEMENT
                  </h1>
                  <p className="text-purple-300 text-sm">
                    Round: {gameData?.mid || "---"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div className="text-3xl font-bold text-yellow-400">
                  {gameData?.lt || 0}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Main Table */}
          <div className="p-6 space-y-6">
            {/* Card Table */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-3xl border-2 border-purple-700/50"></div>
              <div className="relative p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Hand A */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                        <h3 className="text-xl font-bold text-white tracking-wider">
                          HAND A
                        </h3>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      {handACards.length > 0
                        ? handACards.map((c, i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-white rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold border-4 border-blue-400/50 transform hover:scale-105 transition-transform"
                            >
                              {c}
                            </div>
                          ))
                        : [0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600"
                            ></div>
                          ))}
                    </div>
                  </div>

                  {/* Hand B */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-block px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full">
                        <h3 className="text-xl font-bold text-white tracking-wider">
                          HAND B
                        </h3>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      {handBCards.length > 0
                        ? handBCards.map((c, i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-white rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold border-4 border-red-400/50 transform hover:scale-105 transition-transform"
                            >
                              {c}
                            </div>
                          ))
                        : [0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600"
                            ></div>
                          ))}
                    </div>
                  </div>
                </div>

                {/* Betting Zones */}
                <div className="grid grid-cols-3 gap-4">
                  {gameData?.sub
                    ?.filter((m: any) =>
                      ["Hand A", "Hand B", "Tie"].some((name) =>
                        m.nat.includes(name),
                      ),
                    )
                    .slice(0, 3)
                    .map((market: any) => {
                      const betOnThis = bets.find((b) => b.sid === market.sid);
                      const isHandA = market.nat.includes("A");
                      const isHandB = market.nat.includes("B");
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          disabled={isMarketSuspended(market)}
                          className={`h-32 rounded-xl border-3 transition-all transform hover:scale-105 ${
                            isHandA
                              ? "bg-gradient-to-br from-blue-600 to-cyan-700 border-blue-400"
                              : isHandB
                                ? "bg-gradient-to-br from-red-600 to-pink-700 border-red-400"
                                : "bg-gradient-to-br from-green-600 to-emerald-700 border-green-400"
                          } ${betOnThis ? "ring-4 ring-yellow-400 shadow-2xl" : ""} ${
                            isMarketSuspended(market)
                              ? "opacity-40 grayscale"
                              : ""
                          }`}
                        >
                          <div className="text-white text-xl font-bold mb-2">
                            {market.nat}
                          </div>
                          <div className="text-yellow-300 text-2xl font-black">
                            {market.b || market.bs}
                          </div>
                          {betOnThis && (
                            <div className="text-white text-sm mt-2 bg-black/40 px-3 py-1 rounded-full inline-block">
                              ₹{betOnThis.stake}
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Hand Rankings Reference */}
            <Card className="bg-slate-900/80 border-purple-700/30">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-purple-400" />
                  <h4 className="text-purple-300 font-bold">Hand Rankings</h4>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-yellow-400 font-bold">Trail</div>
                    <div className="text-slate-400">3 of a kind</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-yellow-400 font-bold">Pure Seq</div>
                    <div className="text-slate-400">Same suit</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-yellow-400 font-bold">Sequence</div>
                    <div className="text-slate-400">Any suit</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-yellow-400 font-bold">Pair</div>
                    <div className="text-slate-400">2 same</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* History */}
            <Card className="bg-slate-900/80 border-purple-700/30">
              <div className="p-4">
                <h4 className="text-purple-300 font-bold mb-3">Last Results</h4>
                <div className="flex gap-2 overflow-x-auto">
                  {resultData?.res?.slice(0, 15).map((r: any, i: number) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                        r.win === "1"
                          ? "bg-blue-600"
                          : r.win === "2"
                            ? "bg-red-600"
                            : "bg-green-600"
                      }`}
                    >
                      {r.win === "1" ? "A" : r.win === "2" ? "B" : "T"}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bet Slip */}
          <div className="bg-slate-950 border-l border-purple-700/30 p-5">
            <h3 className="text-purple-300 font-bold text-xl mb-4">Bet Slip</h3>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Chip Value</p>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-14 rounded-lg font-bold transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ₹{chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
              {bets.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-2">🃏</div>
                  <p className="text-sm">No bets yet</p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-lg p-3 border border-purple-600/30"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-bold">{bet.nat}</span>
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

            {bets.length > 0 && (
              <div className="bg-purple-900/40 border-2 border-purple-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">Total:</span>
                  <span className="text-yellow-300 font-bold text-xl">
                    ₹{bets.reduce((s, b) => s + b.stake, 0)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 font-bold"
              >
                Place Bets
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => setBets([])}
                  variant="outline"
                  className="border-red-600 text-red-400 text-xs"
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-400 text-xs"
                  onClick={() => {
                    if (bets.length > 0) {
                      const doubled = bets.map((b) => ({
                        ...b,
                        stake: b.stake * 2,
                      }));
                      setBets(doubled);
                    }
                  }}
                >
                  Double
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-600 text-purple-400 text-xs"
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
