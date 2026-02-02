import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Grid3x3 } from "lucide-react";

interface Card32VariantGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function Card32VariantGame({ game }: Card32VariantGameProps) {
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

  // Group cards by range (8 per group)
  const groups = [
    {
      name: "8♠",
      range: "8 Cards",
      color: "from-slate-700 to-slate-900",
      textColor: "text-slate-200",
      cards: cards.slice(0, 8),
    },
    {
      name: "8♥",
      range: "8 Cards",
      color: "from-red-700 to-red-900",
      textColor: "text-red-200",
      cards: cards.slice(8, 16),
    },
    {
      name: "8♣",
      range: "8 Cards",
      color: "from-green-700 to-green-900",
      textColor: "text-green-200",
      cards: cards.slice(16, 24),
    },
    {
      name: "8♦",
      range: "8 Cards",
      color: "from-orange-700 to-orange-900",
      textColor: "text-orange-200",
      cards: cards.slice(24, 32),
    },
  ];

  // Find markets for each group
  const groupMarkets = groups.map((group) => {
    const market = gameData?.sub?.find((m: any) =>
      m.nat
        .toLowerCase()
        .includes(
          group.name
            .toLowerCase()
            .replace("♠", "")
            .replace("♥", "")
            .replace("♣", "")
            .replace("♦", ""),
        ),
    );
    return { ...group, market };
  });

  const lastCard = cards[cards.length - 1];

  // Additional side markets
  const sideMarkets =
    gameData?.sub?.filter(
      (m: any) => !groupMarkets.some((g) => g.market?.sid === m.sid),
    ) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          {/* Header */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid3x3 className="w-6 h-6 text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">{game.gname}</h1>
                  <p className="text-sm text-slate-400">
                    Round #{gameData?.mid}
                  </p>
                </div>
              </div>
              <div className="text-4xl font-black text-yellow-400 tabular-nums">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Center Card Reveal */}
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <h3 className="text-white font-bold text-center mb-4">
                  Last Revealed Card
                </h3>
                <div className="flex justify-center">
                  {lastCard ? (
                    <div className="relative group">
                      <div className="w-40 h-56 bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-2xl flex items-center justify-center text-8xl font-black border-4 border-purple-500 transform hover:scale-110 transition-all">
                        {lastCard}
                      </div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur-2xl opacity-50 -z-10 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="w-40 h-56 bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-slate-600 animate-pulse">
                      <Grid3x3 className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Group Tiles (2x2) */}
              <div className="grid grid-cols-2 gap-4">
                {groupMarkets.map((group, idx) => {
                  const betOnThis = bets.find(
                    (b) => b.sid === group.market?.sid,
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        group.market && handleMarketClick(group.market)
                      }
                      disabled={
                        !group.market || isMarketSuspended(group.market)
                      }
                      className={`relative group rounded-2xl overflow-hidden transition-all ${
                        betOnThis
                          ? "ring-4 ring-yellow-400 scale-105"
                          : "hover:scale-[1.02]"
                      } ${isMarketSuspended(group.market) ? "opacity-50" : ""}`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${group.color}`}
                      ></div>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30"></div>
                      <div className="relative h-64 flex flex-col items-center justify-center gap-4 p-4">
                        <div
                          className={`text-6xl font-black ${group.textColor} drop-shadow-2xl`}
                        >
                          {group.name}
                        </div>
                        <div
                          className={`text-sm ${group.textColor} opacity-80`}
                        >
                          {group.range}
                        </div>
                        <div className="text-yellow-300 text-4xl font-black drop-shadow-2xl">
                          {group.market?.b || group.market?.bs || "--"}
                        </div>

                        {/* Card Preview Grid */}
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          {group.cards
                            .slice(0, 8)
                            .map((card: string, i: number) => (
                              <div
                                key={i}
                                className="w-8 h-10 bg-white/90 rounded text-xs font-bold flex items-center justify-center text-slate-800"
                              >
                                {card}
                              </div>
                            ))}
                        </div>

                        {betOnThis && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-black text-lg font-black px-4 py-2 rounded-full shadow-2xl animate-bounce">
                            ₹{betOnThis.stake}
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                    </button>
                  );
                })}
              </div>

              {/* Side Markets */}
              {sideMarkets.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3">
                    Additional Markets
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

              {/* Narrow History Strip */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-3">
                <div className="flex gap-2 overflow-x-auto">
                  {resultData?.res?.slice(0, 20).map((r: any, i: number) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-10 h-12 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg ${
                        r.win === "1"
                          ? "bg-slate-700 text-slate-200"
                          : r.win === "2"
                            ? "bg-red-700 text-red-200"
                            : r.win === "3"
                              ? "bg-green-700 text-green-200"
                              : "bg-orange-700 text-orange-200"
                      }`}
                    >
                      {r.val || r.win}
                    </div>
                  ))}
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
