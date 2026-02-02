import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketActive, isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp } from "lucide-react";

interface BaccaratGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function BaccaratGame({ game }: BaccaratGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [100, 500, 1000, 5000, 10000, 25000];

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
      toast({ title: `✅ Bet placed on ${market.nat}` });
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

  const cards = gameData?.card?.split(",") || [];
  const playerCards = cards.slice(0, 3);
  const bankerCards = cards.slice(3, 6);

  // Calculate roadmap statistics
  const playerWins =
    resultData?.res?.filter((r: any) => r.win === "1").length || 0;
  const bankerWins =
    resultData?.res?.filter((r: any) => r.win === "2").length || 0;
  const tieWins =
    resultData?.res?.filter((r: any) => r.win === "3").length || 0;
  const totalGames = playerWins + bankerWins + tieWins;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-950 to-teal-950">
        {/* Elegant Header */}
        <div className="bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20 border-b-2 border-amber-600/30 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                    BACCARAT
                  </h1>
                  <p className="text-emerald-300 text-sm font-medium">
                    Round: {gameData?.mid || "---"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-yellow-400 tabular-nums">
                  {gameData?.lt || 0}
                </div>
                <div className="text-xs text-amber-300 uppercase tracking-wider">
                  Seconds
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
          {/* Main Table Area */}
          <div className="p-6 space-y-6">
            {/* Elegant Table with Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-800/40 to-emerald-900/40 rounded-3xl border-4 border-amber-700/50 shadow-2xl"></div>
              <div className="relative p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Player Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                      <h3 className="text-2xl font-bold text-blue-300 tracking-wider">
                        PLAYER
                      </h3>
                      <div className="w-8 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                    </div>
                    <div className="flex justify-center gap-3">
                      {playerCards.length > 0
                        ? playerCards.map((c, i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-white rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold border-2 border-amber-300/50 transform hover:scale-105 transition-transform"
                            >
                              {c}
                            </div>
                          ))
                        : [0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 shadow-inner"
                            ></div>
                          ))}
                    </div>
                  </div>

                  {/* Banker Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                      <h3 className="text-2xl font-bold text-red-300 tracking-wider">
                        BANKER
                      </h3>
                      <div className="w-8 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                    </div>
                    <div className="flex justify-center gap-3">
                      {bankerCards.length > 0
                        ? bankerCards.map((c, i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-white rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold border-2 border-amber-300/50 transform hover:scale-105 transition-transform"
                            >
                              {c}
                            </div>
                          ))
                        : [0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-20 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-slate-600 shadow-inner"
                            ></div>
                          ))}
                    </div>
                  </div>
                </div>

                {/* Main Betting Areas - Top View Table */}
                <div className="grid grid-cols-3 gap-6">
                  {gameData?.sub
                    ?.filter((m: any) =>
                      ["Player", "Banker", "Tie"].some((name) =>
                        m.nat.includes(name),
                      ),
                    )
                    .slice(0, 3)
                    .map((market: any) => {
                      const betOnThis = bets.find((b) => b.sid === market.sid);
                      const isPlayer = market.nat.includes("Player");
                      const isBanker = market.nat.includes("Banker");
                      return (
                        <button
                          key={market.sid}
                          onClick={() => handleMarketClick(market)}
                          disabled={isMarketSuspended(market)}
                          className={`relative h-40 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                            isPlayer
                              ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 border-blue-400 hover:shadow-blue-500/50"
                              : isBanker
                                ? "bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-red-400 hover:shadow-red-500/50"
                                : "bg-gradient-to-br from-green-600 via-green-700 to-green-900 border-green-400 hover:shadow-green-500/50"
                          } ${betOnThis ? "ring-4 ring-yellow-400 shadow-2xl" : ""} ${
                            isMarketSuspended(market)
                              ? "opacity-40 cursor-not-allowed grayscale"
                              : "hover:shadow-2xl"
                          }`}
                        >
                          <div className="absolute inset-0 bg-white/5 rounded-xl"></div>
                          <div className="relative h-full flex flex-col items-center justify-center gap-2">
                            <div className="text-white text-2xl font-bold tracking-wide drop-shadow-lg">
                              {market.nat.toUpperCase()}
                            </div>
                            <div className="text-yellow-300 text-3xl font-black drop-shadow-lg">
                              {market.b || market.bs}
                            </div>
                            {betOnThis && (
                              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                                ₹{betOnThis.stake}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Side Bets */}
                <div className="mt-6">
                  <div className="text-center mb-3">
                    <span className="text-amber-300 text-sm font-semibold uppercase tracking-wider">
                      Side Bets
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {gameData?.sub
                      ?.filter(
                        (m: any) =>
                          !["Player", "Banker", "Tie"].some((name) =>
                            m.nat.includes(name),
                          ),
                      )
                      .slice(0, 8)
                      .map((market: any) => {
                        const betOnThis = bets.find(
                          (b) => b.sid === market.sid,
                        );
                        return (
                          <button
                            key={market.sid}
                            onClick={() => handleMarketClick(market)}
                            disabled={isMarketSuspended(market)}
                            className={`h-20 rounded-xl border-2 transition-all ${
                              betOnThis
                                ? "bg-gradient-to-br from-amber-600 to-yellow-700 border-yellow-400 shadow-lg"
                                : "bg-slate-800/80 border-slate-600 hover:border-amber-500"
                            } ${isMarketSuspended(market) ? "opacity-40" : "hover:scale-105"}`}
                          >
                            <div className="text-white text-xs font-semibold text-center px-1">
                              {market.nat}
                            </div>
                            <div className="text-yellow-400 text-sm font-bold mt-1">
                              {market.b || market.bs}
                            </div>
                            {betOnThis && (
                              <div className="text-white text-xs mt-1">
                                ₹{betOnThis.stake}
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap - Bead Road */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-amber-700/30 backdrop-blur">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h4 className="text-amber-300 font-bold text-lg">
                    Roadmap & Statistics
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-900/40 border-2 border-blue-500/30 rounded-lg p-3 text-center">
                    <div className="text-blue-300 text-sm font-medium">
                      Player Wins
                    </div>
                    <div className="text-white text-3xl font-bold">
                      {playerWins}
                    </div>
                    <div className="text-blue-400 text-xs">
                      {totalGames > 0
                        ? `${((playerWins / totalGames) * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="bg-red-900/40 border-2 border-red-500/30 rounded-lg p-3 text-center">
                    <div className="text-red-300 text-sm font-medium">
                      Banker Wins
                    </div>
                    <div className="text-white text-3xl font-bold">
                      {bankerWins}
                    </div>
                    <div className="text-red-400 text-xs">
                      {totalGames > 0
                        ? `${((bankerWins / totalGames) * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                  </div>
                  <div className="bg-green-900/40 border-2 border-green-500/30 rounded-lg p-3 text-center">
                    <div className="text-green-300 text-sm font-medium">
                      Tie
                    </div>
                    <div className="text-white text-3xl font-bold">
                      {tieWins}
                    </div>
                    <div className="text-green-400 text-xs">
                      {totalGames > 0
                        ? `${((tieWins / totalGames) * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {resultData?.res?.slice(0, 20).map((r: any, i: number) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg ${
                        r.win === "1"
                          ? "bg-blue-600 text-white"
                          : r.win === "2"
                            ? "bg-red-600 text-white"
                            : "bg-green-600 text-white"
                      }`}
                    >
                      {r.win === "1" ? "P" : r.win === "2" ? "B" : "T"}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-l-4 border-amber-700/30 p-5">
            <h3 className="text-amber-300 font-bold text-xl mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full"></div>
              Bet Slip
            </h3>

            {/* Chip Selector */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3 font-medium">
                Select Chip Value
              </p>
              <div className="grid grid-cols-3 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-14 rounded-lg font-bold text-sm transition-all transform ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white scale-105 shadow-lg ring-2 ring-yellow-400"
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
                  <div className="text-4xl mb-2">🎰</div>
                  <p className="text-sm">No bets placed yet</p>
                </div>
              ) : (
                bets.map((bet, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 border border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold text-sm">
                        {bet.nat}
                      </span>
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
                      <span className="text-slate-400">@ {bet.odds}</span>
                      <span className="text-yellow-400 font-bold">
                        ₹{bet.stake}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                      Potential Win: ₹{(bet.stake * bet.odds).toFixed(0)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {bets.length > 0 && (
              <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-2 border-amber-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-200 font-semibold">
                    Total Stake:
                  </span>
                  <span className="text-yellow-300 font-bold text-xl">
                    ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200 text-sm">Potential Win:</span>
                  <span className="text-emerald-300 font-bold text-lg">
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
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    if (bets.length > 0) {
                      const doubled = bets.map((b) => ({
                        ...b,
                        stake: b.stake * 2,
                      }));
                      setBets(doubled);
                      toast({ title: "Bets doubled!" });
                    }
                  }}
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-950"
                >
                  Double
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
