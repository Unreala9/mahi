import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface AndarBaharVariantGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function AndarBaharVariantGame({
  game,
}: AndarBaharVariantGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "⚠️ Suspended", variant: "destructive" });
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
      toast({ title: "✅ Bet Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const jokerCard = cards[0];

  // Find main markets
  const andarMarket = gameData?.sub?.find(
    (m: any) => m.nat.toLowerCase() === "andar",
  );
  const baharMarket = gameData?.sub?.find(
    (m: any) => m.nat.toLowerCase() === "bahar",
  );
  const sideMarkets =
    gameData?.sub?.filter((m: any) => m !== andarMarket && m !== baharMarket) ||
    [];

  const andarBet = bets.find((b) => b.sid === andarMarket?.sid);
  const baharBet = bets.find((b) => b.sid === baharMarket?.sid);

  // Card history - zig-zag layout
  const history = resultData?.res?.slice(0, 20) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-wide">
                    {game.gname}
                  </h1>
                  <p className="text-sm text-purple-300">
                    Round #{gameData?.mid}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="text-5xl font-black text-yellow-400 tabular-nums drop-shadow-2xl">
                  {gameData?.lt || 0}
                </div>
                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Glowing Joker Card - Center */}
              <div className="relative flex justify-center py-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                </div>
                {jokerCard ? (
                  <div className="relative">
                    <div className="w-32 h-48 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-2xl shadow-2xl flex items-center justify-center text-7xl font-black border-4 border-yellow-200 transform hover:scale-105 transition-transform">
                      {jokerCard}
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur-xl opacity-70 -z-10 animate-pulse"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      JOKER
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-slate-600 animate-pulse">
                    <Sparkles className="w-12 h-12 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Andar & Bahar - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* ANDAR - Left */}
                <button
                  onClick={() => andarMarket && handleMarketClick(andarMarket)}
                  disabled={!andarMarket || isMarketSuspended(andarMarket)}
                  className={`relative group h-48 rounded-2xl overflow-hidden transition-all ${
                    andarBet
                      ? "ring-4 ring-yellow-400 scale-105"
                      : "hover:scale-[1.02]"
                  } ${isMarketSuspended(andarMarket) ? "opacity-50" : ""}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-950"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
                  <div className="relative h-full flex flex-col items-center justify-center gap-3">
                    <div className="text-white text-5xl font-black tracking-widest drop-shadow-2xl">
                      ANDAR
                    </div>
                    <div className="text-yellow-300 text-4xl font-black drop-shadow-2xl">
                      {andarMarket?.b || andarMarket?.bs || "--"}
                    </div>
                    {andarBet && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black text-lg font-black px-4 py-1 rounded-full shadow-2xl animate-bounce">
                        ₹{andarBet.stake}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                </button>

                {/* BAHAR - Right */}
                <button
                  onClick={() => baharMarket && handleMarketClick(baharMarket)}
                  disabled={!baharMarket || isMarketSuspended(baharMarket)}
                  className={`relative group h-48 rounded-2xl overflow-hidden transition-all ${
                    baharBet
                      ? "ring-4 ring-yellow-400 scale-105"
                      : "hover:scale-[1.02]"
                  } ${isMarketSuspended(baharMarket) ? "opacity-50" : ""}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
                  <div className="relative h-full flex flex-col items-center justify-center gap-3">
                    <div className="text-white text-5xl font-black tracking-widest drop-shadow-2xl">
                      BAHAR
                    </div>
                    <div className="text-yellow-300 text-4xl font-black drop-shadow-2xl">
                      {baharMarket?.b || baharMarket?.bs || "--"}
                    </div>
                    {baharBet && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-black text-lg font-black px-4 py-1 rounded-full shadow-2xl animate-bounce">
                        ₹{baharBet.stake}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                </button>
              </div>

              {/* Side Markets Grid */}
              {sideMarkets.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3">
                    Side Bets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sideMarkets.map((market: any) => {
                      const betOnThis = bets.find((b) => b.sid === market.sid);
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          disabled={isMarketSuspended(market)}
                          className={`h-20 rounded-lg transition-all text-sm font-bold ${
                            betOnThis
                              ? "bg-gradient-to-br from-purple-600 to-purple-800 ring-2 ring-yellow-400"
                              : "bg-slate-800 hover:bg-slate-700"
                          } ${isMarketSuspended(market) ? "opacity-50" : ""}`}
                        >
                          <div className="text-white text-xs mb-1">
                            {market.nat}
                          </div>
                          <div className="text-yellow-300 text-lg font-black">
                            {market.b || market.bs}
                          </div>
                          {betOnThis && (
                            <div className="text-yellow-400 text-xs mt-1">
                              ₹{betOnThis.stake}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Zig-Zag Timeline History */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                <h3 className="text-white font-bold text-sm mb-3">
                  Card History
                </h3>
                <div className="relative h-32 overflow-x-auto">
                  <div className="flex items-center gap-4">
                    {history.map((h: any, i: number) => {
                      const isAndar = h.win === "1";
                      const yOffset = i % 2 === 0 ? "top-2" : "bottom-2";
                      return (
                        <div
                          key={i}
                          className={`absolute ${yOffset} flex flex-col items-center gap-1`}
                          style={{ left: `${i * 48}px` }}
                        >
                          <div
                            className={`w-10 h-14 rounded-lg shadow-lg flex items-center justify-center text-xl font-bold border-2 ${
                              isAndar
                                ? "bg-red-600 border-red-400 text-white"
                                : "bg-blue-600 border-blue-400 text-white"
                            }`}
                          >
                            {isAndar ? "A" : "B"}
                          </div>
                          <div
                            className={`w-1 h-8 ${isAndar ? "bg-red-500" : "bg-blue-500"}`}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Slip Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sticky top-4">
                <h3 className="text-white font-bold text-lg mb-4">Bet Slip</h3>

                {/* Chip Selector */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs mb-2">Select Chip</p>
                  <div className="grid grid-cols-3 gap-2">
                    {chips.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setSelectedChip(chip)}
                        className={`h-12 rounded-lg font-bold text-sm transition-all ${
                          selectedChip === chip
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black scale-105"
                            : "bg-slate-800 text-white hover:bg-slate-700"
                        }`}
                      >
                        ₹{chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Bets */}
                <div className="mb-4 space-y-2">
                  {bets.map((bet) => (
                    <div key={bet.sid} className="bg-slate-800 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white font-medium">
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
                        <span className="text-slate-400">Odds: {bet.odds}</span>
                        <span className="text-green-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No bets yet
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="bg-slate-800 rounded-lg p-3 mb-4">
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
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 font-bold text-lg h-12"
                  >
                    Place Bet
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
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
      </div>
    </MainLayout>
  );
}
