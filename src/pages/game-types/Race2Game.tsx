import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Zap, Trophy, TrendingUp, Car, Volume2 } from "lucide-react";

interface Race2GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const RACERS = [
  { id: 1, name: "Red Thunder", color: "bg-red-600", position: 0 },
  { id: 2, name: "Blue Lightning", color: "bg-blue-600", position: 0 },
  { id: 3, name: "Green Velocity", color: "bg-green-600", position: 0 },
  { id: 4, name: "Yellow Flash", color: "bg-yellow-600", position: 0 },
  { id: 5, name: "Purple Storm", color: "bg-purple-600", position: 0 },
  { id: 6, name: "Orange Blaze", color: "bg-orange-600", position: 0 },
  { id: 7, name: "Pink Rocket", color: "bg-pink-600", position: 0 },
  { id: 8, name: "Cyan Comet", color: "bg-cyan-600", position: 0 },
];

export default function Race2Game({ game }: Race2GameProps) {
  const gameId = game?.gmid || "race2";
  const gameName = game?.gname || "Race 2";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedMarket, setSelectedMarket] = useState("WIN");
  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🏁 Race Closed!", variant: "destructive" });
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
      toast({ title: "🏁 Race Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        {/* Race Header */}
        <div className="bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 border-b border-blue-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-blue-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-slate-300 text-sm">
                  Race #{gameData?.mid} • 1200m • Virtual Racing Circuit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-slate-400 text-xs mb-1">
                  Current Leader
                </div>
                <div className="text-white font-bold">
                  #{Math.floor(Math.random() * 8) + 1} -{" "}
                  {RACERS[Math.floor(Math.random() * 8)].name}
                </div>
              </div>
              <div className="text-center bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-white font-mono text-2xl font-bold">
                  {gameData?.lt || 0}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4">
          {/* Race Track Visualization */}
          <div className="bg-gradient-to-b from-slate-900/50 to-slate-800/50 border-2 border-blue-700/50 rounded-2xl p-6 mb-6">
            <div className="relative h-80 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl overflow-hidden">
              {/* Track with Lanes */}
              <div className="absolute inset-0 flex flex-col justify-around p-4">
                {RACERS.map((racer, i) => (
                  <div
                    key={racer.id}
                    className="relative h-8 flex items-center"
                  >
                    {/* Lane Divider */}
                    <div className="absolute inset-0 border-b border-white/10"></div>

                    {/* Starting Line */}
                    <div className="absolute left-4 w-1 h-full bg-white/40"></div>

                    {/* Racer */}
                    <div
                      className={`absolute ${racer.color} w-12 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xl transition-all duration-1000`}
                      style={{
                        left: `${4 + Math.random() * 85}%`,
                        animation: `slideRight ${3 + Math.random() * 2}s ease-in-out infinite`,
                      }}
                    >
                      <Car className="w-4 h-4" />
                    </div>

                    {/* Lane Label */}
                    <div className="absolute left-6 text-white text-xs font-bold bg-black/70 px-2 py-1 rounded">
                      #{racer.id}
                    </div>

                    {/* Finish Line */}
                    <div className="absolute right-4 w-2 h-full bg-gradient-to-r from-white/60 to-yellow-500/60"></div>
                    <div className="absolute right-8 text-yellow-400 text-xs font-bold bg-black/70 px-2 py-1 rounded">
                      FINISH
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Race Progress Bar */}
            <div className="mt-4 flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000"
                    style={{ width: `${((gameData?.lt || 0) / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-400">
                  <span>Race Start</span>
                  <span>{gameData?.lt || 0}s to start • Live Audio</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Betting Markets */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-blue-400 font-bold text-lg">
                  Betting Markets
                </h2>
              </div>

              {/* Market Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  "WIN",
                  "PLACE",
                  "SHOW",
                  "EXACTA",
                  "TRIFECTA",
                  "SUPERFECTA",
                ].map((market) => (
                  <button
                    key={market}
                    onClick={() => setSelectedMarket(market)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                      selectedMarket === market
                        ? "bg-blue-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {market}
                  </button>
                ))}
              </div>

              {/* Racer Cards */}
              <div className="space-y-2">
                {RACERS.map((racer) => (
                  <button
                    key={racer.id}
                    onClick={() =>
                      handleMarketClick({
                        sid: racer.id,
                        nat: racer.name,
                        b: 1.5 + Math.random() * 5,
                      })
                    }
                    className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${racer.color} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                        #{racer.id}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">
                          {racer.name}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {selectedMarket} Market
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-400 font-mono text-3xl font-bold">
                      {(1.5 + Math.random() * 5).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Results History */}
              <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-bold">
                    Recent Results & Payouts
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {resultData?.res?.slice(0, 5).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-blue-400 text-xs font-bold mb-2">
                        Race #{r.mid || i + 1}
                      </div>
                      <div
                        className={`w-10 h-10 mx-auto ${RACERS[r.val % 8].color} rounded-full flex items-center justify-center text-white font-bold mb-2`}
                      >
                        #{r.val || Math.floor(Math.random() * 8) + 1}
                      </div>
                      <div className="text-yellow-400 text-sm font-bold">
                        ₹{(Math.random() * 10000 + 2000).toFixed(0)}
                      </div>
                      <div className="text-slate-400 text-xs">Win Payout</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Race Bet Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          @ {bet.odds.toFixed(2)}x
                        </span>
                        <span className="text-blue-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-6 text-sm">
                      No race bets selected
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Exposure</span>
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
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-bold h-12 text-base"
                  >
                    Place Race Bets ({bets.length})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() =>
                        setBets(
                          bets.map((bet) => ({ ...bet, stake: bet.stake * 2 })),
                        )
                      }
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                      disabled={bets.length === 0}
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10 text-xs"
                      disabled={bets.length === 0}
                    >
                      Repeat
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
