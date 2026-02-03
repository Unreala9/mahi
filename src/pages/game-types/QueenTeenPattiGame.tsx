import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Crown, Diamond, Gem, Star, Trophy } from "lucide-react";

interface QueenTeenPattiGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const CARD_DESIGNS = [
  { id: 1, icon: "🂡", color: "text-red-400" },
  { id: 2, icon: "🂢", color: "text-black" },
  { id: 3, icon: "🂣", color: "text-red-400" },
  { id: 4, icon: "🂤", color: "text-black" },
  { id: 5, icon: "🂥", color: "text-red-400" },
];

export default function QueenTeenPattiGame({ game }: QueenTeenPattiGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);

  const gameId = game?.gmid || "teenunique";
  const gameName = game?.gname || "Queen Teen Patti";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "👑 Royal Table Closed!", variant: "destructive" });
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
          gameId: gameId,
          gameName: gameName,
          roundId: gameData?.mid?.toString() || "",
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
      }
      toast({ title: "👑 Royal Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 flex flex-col font-sans">
        {/* Royal Header */}
        <div className="bg-purple-900/80 border-b border-yellow-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-yellow-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-purple-300 text-sm">
                  High Stakes Royal Table • Premium Edition
                </p>
              </div>
            </div>
            <div className="text-center bg-purple-800/50 px-6 py-2 rounded-lg border border-yellow-400/30">
              <Gem className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-yellow-400 font-mono text-2xl font-bold">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Royal Card Display */}
          <div className="bg-gradient-to-r from-purple-900/40 via-yellow-900/20 to-purple-900/40 border-2 border-yellow-400/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-purple-800/50 px-6 py-2 rounded-full border border-yellow-400/30">
                <Diamond className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">
                  Royal Hand #{gameData?.mid}
                </span>
                <Diamond className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              {[1, 2, 3].map((cardIndex) => (
                <div key={cardIndex} className="relative">
                  <div className="w-20 h-28 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-lg border-2 border-yellow-400/50 shadow-2xl flex items-center justify-center text-4xl transform hover:scale-110 transition-all duration-300">
                    {CARD_DESIGNS[cardIndex - 1]?.icon || "🂠"}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-purple-900 font-bold text-xs">
                    {cardIndex}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-yellow-400 font-bold text-lg">
                <Star className="w-5 h-5" />
                Queen's Royal Combination
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Premium Betting Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Royal Betting Markets
              </h2>

              <div className="grid gap-3">
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-purple-800/30 border border-yellow-400/20 rounded-xl p-4 backdrop-blur-sm hover:border-yellow-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-purple-900 font-black text-lg shadow-lg">
                            👑
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">
                              {market.nat}
                            </div>
                            <div className="text-purple-300 text-sm">
                              Premium Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-yellow-400 font-mono text-3xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-8 py-3 rounded-lg font-bold transition-all text-lg ${
                              activeBet
                                ? "bg-yellow-400 text-purple-900 shadow-xl scale-105"
                                : "bg-purple-700 text-yellow-300 hover:bg-yellow-400/20 border border-yellow-400/30"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "ROYAL BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Royal History */}
              <div className="bg-purple-900/50 border border-yellow-400/20 rounded-xl p-4 mt-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold">
                    Royal Hand History
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-purple-800/50 border border-yellow-400/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-yellow-400 text-xs font-bold mb-2">
                        #{r.mid || i + 1}
                      </div>
                      <div className="text-2xl mb-1">👑</div>
                      <div className="text-white font-bold text-sm">
                        {r.val || r.res || "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Royal Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-purple-900/80 border border-yellow-400/30 rounded-xl p-4 sticky top-4 backdrop-blur-sm">
                <h3 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Diamond className="w-5 h-5" />
                  Royal Slip
                </h3>

                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-yellow-400 text-purple-900 shadow-lg"
                          : "bg-purple-800 text-purple-300 border border-yellow-400/20"
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
                      className="bg-purple-800/50 border border-yellow-400/20 rounded-lg p-3"
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
                        <span className="text-purple-300">@ {bet.odds}</span>
                        <span className="text-yellow-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-purple-400 text-center py-4 text-sm">
                      No royal bets selected
                    </p>
                  )}
                </div>

                <div className="bg-purple-800/50 border border-yellow-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Royal Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">Potential Crown</span>
                    <span className="text-yellow-400 font-bold">
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
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-purple-900 font-bold h-12 text-lg"
                  >
                    Place Royal Bets
                  </Button>
                  <Button
                    onClick={() => setBets([])}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                  >
                    Clear Royal Slip
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
