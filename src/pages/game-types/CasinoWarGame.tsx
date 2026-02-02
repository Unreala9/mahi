import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Swords, Clock } from "lucide-react";

interface CasinoWarGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function CasinoWarGame({ game }: CasinoWarGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 5000];

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
      toast({ title: "⚔️ Bets Placed - WAR IS ON!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const playerCard = cards[0];
  const dealerCard = cards[1];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-orange-950 to-red-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/40 via-orange-900/40 to-red-900/40 border-b-2 border-red-600/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                    CASINO WAR
                  </h1>
                  <p className="text-orange-300 text-sm">
                    Battle #{gameData?.mid || "---"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-400" />
                <div className="text-4xl font-bold text-yellow-400 tabular-nums">
                  {gameData?.lt || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          {/* Main Battle Area */}
          <div className="p-6 space-y-6">
            {/* Card Zones */}
            <div className="grid grid-cols-2 gap-8">
              {/* Player Card */}
              <div className="text-center space-y-4">
                <div className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-lg">
                  <h3 className="text-2xl font-bold text-white tracking-wider">
                    PLAYER
                  </h3>
                </div>
                <div className="flex justify-center">
                  {playerCard ? (
                    <div className="w-32 h-44 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-6xl font-bold border-4 border-blue-400 transform hover:scale-105 transition-transform">
                      {playerCard}
                    </div>
                  ) : (
                    <div className="w-32 h-44 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border-4 border-slate-600"></div>
                  )}
                </div>
              </div>

              {/* Dealer Card */}
              <div className="text-center space-y-4">
                <div className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-full shadow-lg">
                  <h3 className="text-2xl font-bold text-white tracking-wider">
                    DEALER
                  </h3>
                </div>
                <div className="flex justify-center">
                  {dealerCard ? (
                    <div className="w-32 h-44 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-6xl font-bold border-4 border-red-400 transform hover:scale-105 transition-transform">
                      {dealerCard}
                    </div>
                  ) : (
                    <div className="w-32 h-44 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border-4 border-slate-600"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Betting Areas */}
            <div className="grid grid-cols-3 gap-4">
              {gameData?.sub?.slice(0, 3).map((market: any) => {
                const betOnThis = bets.find((b) => b.sid === market.sid);
                const isWar = market.nat.toLowerCase().includes("war");
                const isTie = market.nat.toLowerCase().includes("tie");
                return (
                  <button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    disabled={isMarketSuspended(market)}
                    className={`relative h-36 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                      isWar
                        ? "bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 border-orange-400"
                        : isTie
                          ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 border-purple-400"
                          : "bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 border-blue-400"
                    } ${betOnThis ? "ring-4 ring-yellow-400 shadow-2xl scale-105" : ""} ${
                      isMarketSuspended(market)
                        ? "opacity-40 grayscale"
                        : "hover:shadow-2xl"
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                    <div className="relative flex flex-col items-center justify-center h-full gap-2">
                      <div className="text-white text-2xl font-black uppercase tracking-wider drop-shadow-lg">
                        {market.nat}
                      </div>
                      <div className="text-yellow-300 text-4xl font-black drop-shadow-lg">
                        {market.b || market.bs}
                      </div>
                      {betOnThis && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                          ₹{betOnThis.stake}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Additional Markets */}
            {gameData?.sub && gameData.sub.length > 3 && (
              <div className="grid grid-cols-4 gap-3">
                {gameData.sub.slice(3).map((market: any) => {
                  const betOnThis = bets.find((b) => b.sid === market.sid);
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={isMarketSuspended(market)}
                      className={`h-24 rounded-xl border-2 transition-all ${
                        betOnThis
                          ? "bg-gradient-to-br from-yellow-600 to-orange-700 border-yellow-400 scale-105"
                          : "bg-slate-800 border-slate-600 hover:border-orange-500"
                      } ${isMarketSuspended(market) ? "opacity-40" : "hover:scale-105"}`}
                    >
                      <div className="text-white text-sm font-bold px-2">
                        {market.nat}
                      </div>
                      <div className="text-yellow-400 text-lg font-bold">
                        {market.b || market.bs}
                      </div>
                      {betOnThis && (
                        <div className="text-white text-xs">
                          ₹{betOnThis.stake}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* History */}
            <Card className="bg-slate-900/90 border-red-700/30">
              <div className="p-4">
                <h4 className="text-orange-300 font-bold mb-3">
                  Battle History
                </h4>
                <div className="flex gap-2 overflow-x-auto">
                  {resultData?.res?.slice(0, 15).map((r: any, i: number) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${
                        r.win === "1"
                          ? "bg-blue-600"
                          : r.win === "2"
                            ? "bg-red-600"
                            : "bg-orange-600"
                      }`}
                    >
                      {r.win === "1" ? "P" : r.win === "2" ? "D" : "W"}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bet Slip */}
          <div className="bg-gradient-to-b from-slate-950 to-black border-l-4 border-red-700/30 p-5">
            <h3 className="text-orange-300 font-bold text-xl mb-4">Bet Slip</h3>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Chip Value</p>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-14 rounded-lg font-bold transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-red-600 to-orange-600 text-white scale-105 ring-2 ring-red-400"
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
                  <div className="text-4xl mb-2">⚔️</div>
                  <p className="text-sm">No bets placed</p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-lg p-3 border border-orange-600/30"
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
              <div className="bg-red-900/40 border-2 border-red-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-orange-200">Total:</span>
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
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 font-bold text-lg"
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
                  className="border-orange-600 text-orange-400 text-xs"
                  onClick={() => {
                    if (bets.length > 0)
                      setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })));
                  }}
                >
                  Double
                </Button>
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 text-xs"
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
