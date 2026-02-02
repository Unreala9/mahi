import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

interface DragonTigerVariantGameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function DragonTigerVariantGame({
  game,
}: DragonTigerVariantGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 2500];

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
  const dragonCard = cards[0];
  const tigerCard = cards[1];

  // Find main markets
  const dragonMarket = gameData?.sub?.find(
    (m: any) =>
      m.nat.toLowerCase().includes("dragon") &&
      !m.nat.toLowerCase().includes("tie"),
  );
  const tigerMarket = gameData?.sub?.find(
    (m: any) =>
      m.nat.toLowerCase().includes("tiger") &&
      !m.nat.toLowerCase().includes("tie"),
  );
  const tieMarket = gameData?.sub?.find((m: any) =>
    m.nat.toLowerCase().includes("tie"),
  );
  const sideMarkets =
    gameData?.sub?.filter(
      (m: any) => m !== dragonMarket && m !== tigerMarket && m !== tieMarket,
    ) || [];

  const dragonBet = bets.find((b) => b.sid === dragonMarket?.sid);
  const tigerBet = bets.find((b) => b.sid === tigerMarket?.sid);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-950 to-blue-950 flex flex-col">
        {/* Ultra-Compact Header */}
        <div className="bg-black/50 border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">{game.gname}</span>
            <span className="text-slate-400 text-xs">#{gameData?.mid}</span>
          </div>
          <div className="text-yellow-400 font-bold text-2xl tabular-nums">
            {gameData?.lt || 0}s
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Main Dragon/Tiger Zones - HUGE */}
          <div className="flex-1 grid grid-rows-2 gap-2 p-2">
            {/* DRAGON - Top Half */}
            <button
              onClick={() => dragonMarket && handleMarketClick(dragonMarket)}
              disabled={!dragonMarket || isMarketSuspended(dragonMarket)}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                dragonBet
                  ? "bg-gradient-to-br from-red-600 via-red-700 to-red-900 ring-4 ring-yellow-400"
                  : "bg-gradient-to-br from-red-700 via-red-800 to-red-950"
              } ${isMarketSuspended(dragonMarket) ? "opacity-50" : "active:scale-95"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="relative h-full flex flex-col items-center justify-center gap-4">
                <div className="text-white text-6xl font-black tracking-wider drop-shadow-2xl">
                  🐉 DRAGON
                </div>
                {dragonCard && (
                  <div className="w-24 h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center text-5xl font-bold border-4 border-yellow-400">
                    {dragonCard}
                  </div>
                )}
                <div className="text-yellow-300 text-5xl font-black drop-shadow-2xl">
                  {dragonMarket?.b || dragonMarket?.bs || "--"}
                </div>
                {dragonBet && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xl font-black px-6 py-2 rounded-full shadow-2xl">
                    ₹{dragonBet.stake}
                  </div>
                )}
              </div>
            </button>

            {/* TIGER - Bottom Half */}
            <button
              onClick={() => tigerMarket && handleMarketClick(tigerMarket)}
              disabled={!tigerMarket || isMarketSuspended(tigerMarket)}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                tigerBet
                  ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 ring-4 ring-yellow-400"
                  : "bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950"
              } ${isMarketSuspended(tigerMarket) ? "opacity-50" : "active:scale-95"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
              <div className="relative h-full flex flex-col items-center justify-center gap-4">
                <div className="text-white text-6xl font-black tracking-wider drop-shadow-2xl">
                  🐅 TIGER
                </div>
                {tigerCard && (
                  <div className="w-24 h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center text-5xl font-bold border-4 border-yellow-400">
                    {tigerCard}
                  </div>
                )}
                <div className="text-yellow-300 text-5xl font-black drop-shadow-2xl">
                  {tigerMarket?.b || tigerMarket?.bs || "--"}
                </div>
                {tigerBet && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xl font-black px-6 py-2 rounded-full shadow-2xl">
                    ₹{tigerBet.stake}
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Tie & Side Bets - Compact Row */}
          <div className="bg-black/80 border-t border-white/10 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {tieMarket && (
                <button
                  onClick={() => handleMarketClick(tieMarket)}
                  disabled={isMarketSuspended(tieMarket)}
                  className={`flex-shrink-0 h-16 px-6 rounded-lg font-bold text-lg transition-all ${
                    bets.find((b) => b.sid === tieMarket.sid)
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 ring-2 ring-yellow-400"
                      : "bg-green-700/50 hover:bg-green-600/70"
                  }`}
                >
                  <div className="text-white">TIE</div>
                  <div className="text-yellow-300">
                    {tieMarket.b || tieMarket.bs}
                  </div>
                </button>
              )}
              {sideMarkets.slice(0, 6).map((market: any) => {
                const betOnThis = bets.find((b) => b.sid === market.sid);
                return (
                  <button
                    key={market.sid}
                    onClick={() => handleMarketClick(market)}
                    disabled={isMarketSuspended(market)}
                    className={`flex-shrink-0 h-16 px-4 rounded-lg text-sm font-bold transition-all ${
                      betOnThis
                        ? "bg-purple-600 ring-2 ring-yellow-400"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    <div className="text-white text-xs">{market.nat}</div>
                    <div className="text-yellow-300">
                      {market.b || market.bs}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Control Bar - Ultra Compact */}
          <div className="bg-black border-t border-white/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSelectedChip(chip)}
                  className={`flex-1 h-10 rounded-lg font-bold text-xs transition-all ${
                    selectedChip === chip
                      ? "bg-yellow-500 text-black scale-105"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2 text-white text-sm">
              <span>Stake: ₹{bets.reduce((s, b) => s + b.stake, 0)}</span>
              <span className="text-slate-400">|</span>
              <span className="text-green-400">
                Win: ₹
                {bets.reduce((s, b) => s + b.stake * b.odds, 0).toFixed(0)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={handlePlaceBets}
                disabled={bets.length === 0}
                className="col-span-2 bg-green-600 hover:bg-green-700 font-bold"
              >
                BET
              </Button>
              <Button
                onClick={() => setBets([])}
                variant="outline"
                className="border-red-600 text-red-400"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-400"
                onClick={() => {
                  if (bets.length > 0)
                    setBets(bets.map((b) => ({ ...b, stake: b.stake * 2 })));
                }}
              >
                2x
              </Button>
            </div>
          </div>

          {/* History Strip - Very Compact */}
          <div className="bg-black/90 border-t border-white/10 px-3 py-2">
            <div className="flex gap-1 overflow-x-auto">
              {resultData?.res?.slice(0, 20).map((r: any, i: number) => (
                <div
                  key={i}
                  className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                    r.win === "1"
                      ? "bg-red-600"
                      : r.win === "2"
                        ? "bg-blue-600"
                        : "bg-green-600"
                  } text-white`}
                >
                  {r.win === "1" ? "D" : r.win === "2" ? "T" : "="}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
