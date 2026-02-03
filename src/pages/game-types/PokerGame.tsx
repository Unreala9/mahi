import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Users, Clock, TrendingUp } from "lucide-react";

interface PokerGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

interface MarketType {
  sid: number;
  nat: string;
  b: number;
  bs: number;
  sr: number;
  gstatus: "ACTIVE" | "SUSPENDED" | string;
  min: number;
  max: number;
  subtype: string;
  etype: string;
}

interface ResultType {
  mid: string;
  win: string;
}

// Player seat positions (9 seats around oval table) as Tailwind utility strings
const seatPositions = [
  "top-[50%] left-[50%] -translate-x-1/2 -translate-y-[150%]", // Bottom center (Player)
  "top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2",
  "top-[50%] left-[5%] translate-x-0 -translate-y-1/2",
  "top-[25%] left-[15%] -translate-x-1/2 -translate-y-1/2",
  "top-[10%] left-[35%] -translate-x-1/2 translate-y-0",
  "top-[5%] left-[50%] -translate-x-1/2 translate-y-0",
  "top-[10%] left-[65%] -translate-x-1/2 translate-y-0",
  "top-[25%] left-[85%] -translate-x-1/2 -translate-y-1/2",
  "top-[50%] left-[95%] -translate-x-[100%] -translate-y-1/2",
];

export default function PokerGame({ game }: PokerGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);

  const gameId = game?.gmid || "poker";
  const gameName = game?.gname || "Poker";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: MarketType) => {
    if (isMarketSuspended(market.gstatus)) {
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
      toast({ title: "🎉 Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const cards = gameData?.card?.split(",") || [];
  const communityCards = cards.slice(0, 5);

  if (!gameData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-white text-xl">Loading {gameName}...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30 border-b border-purple-500/30 backdrop-blur-sm">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    TEXAS HOLD'EM POKER
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
          {/* Main Table Area */}
          <div className="p-6">
            {/* Poker Table */}
            <div className="relative h-[600px] mb-6">
              {/* Oval Table */}
              <div className="absolute inset-8 bg-gradient-to-br from-green-800 to-green-900 rounded-[50%] border-8 border-amber-700 shadow-2xl">
                <div className="absolute inset-4 border-4 border-amber-600/30 rounded-[50%]"></div>

                {/* Center Pot & Community Cards */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="mb-4">
                    <div className="text-yellow-400 text-sm font-semibold mb-2">
                      POT
                    </div>
                    <div className="text-white text-3xl font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
                    </div>
                  </div>

                  {/* Community Cards */}
                  <div className="flex gap-2 justify-center">
                    {communityCards.length > 0
                      ? communityCards.map((c, i) => (
                          <div
                            key={i}
                            className="w-12 h-16 bg-white rounded-lg shadow-2xl flex items-center justify-center text-lg font-bold border-2 border-yellow-400/50"
                          >
                            {c}
                          </div>
                        ))
                      : [0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-12 h-16 bg-slate-700/80 rounded-lg border-2 border-slate-600"
                          ></div>
                        ))}
                  </div>
                </div>

                {/* Player Seats */}
                {gameData?.sub
                  ?.slice(0, 9)
                  .map((market: MarketType, idx: number) => {
                    const betOnThis = bets.find((b) => b.sid === market.sid);
                    const position = seatPositions[idx] || seatPositions[0];

                    return (
                      <div key={market.sid} className={`absolute ${position}`}>
                        <button
                          onClick={() => handleMarketClick(market)}
                          disabled={isMarketSuspended(market?.gstatus)}
                          className={`w-28 h-32 rounded-xl border-3 transition-all ${
                            betOnThis
                              ? "bg-gradient-to-br from-yellow-600 to-amber-700 border-yellow-400 shadow-lg shadow-yellow-500/50 scale-105"
                              : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:border-purple-500"
                          } ${isMarketSuspended(market?.gstatus) ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                        >
                          <div className="p-2">
                            <div className="w-8 h-8 rounded-full bg-purple-600 mx-auto mb-1 flex items-center justify-center text-xs font-bold text-white">
                              P{idx + 1}
                            </div>
                            <div className="text-white text-xs font-bold mb-1 truncate">
                              {market.nat}
                            </div>
                            <div className="text-yellow-400 text-sm font-bold">
                              {market.b || market.bs}
                            </div>
                            {betOnThis && (
                              <div className="text-white text-xs mt-1 bg-black/40 rounded px-1">
                                ₹{betOnThis.stake}
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Statistics & History */}
            <Card className="bg-slate-900/90 border-purple-700/30">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h4 className="text-purple-300 font-bold">Hand History</h4>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {resultData?.res
                    ?.slice(0, 15)
                    .map((r: ResultType, i: number) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-bold text-xs text-white shadow-lg"
                      >
                        {r.win}
                      </div>
                    ))}
                </div>
              </div>
            </Card>

            {/* Available Markets Grid */}
            <div className="mt-6">
              <h3 className="text-purple-300 font-bold text-lg mb-3">
                All Markets
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {gameData?.sub?.slice(9).map((market: MarketType) => {
                  const betOnThis = bets.find((b) => b.sid === market.sid);
                  return (
                    <button
                      key={market.sid}
                      onClick={() => handleMarketClick(market)}
                      disabled={isMarketSuspended(market?.gstatus)}
                      className={`h-20 rounded-lg border-2 transition-all ${
                        betOnThis
                          ? "bg-gradient-to-br from-yellow-600 to-amber-700 border-yellow-400"
                          : "bg-slate-800 border-slate-600 hover:border-purple-500"
                      } ${isMarketSuspended(market?.gstatus) ? "opacity-40" : "hover:scale-105"}`}
                    >
                      <div className="text-white text-xs font-semibold px-2">
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

          {/* Bet Slip */}
          <div className="bg-slate-950 border-l border-purple-700/30 p-5">
            <h3 className="text-purple-300 font-bold text-xl mb-4">Bet Slip</h3>

            {/* Chips */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Chip Value</p>
              <div className="grid grid-cols-2 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`h-14 rounded-lg font-bold transition-all ${
                      selectedChip === chip
                        ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white scale-105"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    ₹{chip.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bets */}
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
                    className="bg-slate-800 rounded-lg p-3 border border-slate-700"
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
              <div className="bg-purple-900/40 border-2 border-purple-600/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">Total:</span>
                  <span className="text-yellow-300 font-bold text-xl">
                    ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
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
