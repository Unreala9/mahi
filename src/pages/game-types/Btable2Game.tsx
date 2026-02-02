import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Clock,
  Zap,
  Trophy,
  TrendingUp,
  Crown,
  Info,
  BarChart3,
} from "lucide-react";

interface Btable2GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

export default function Btable2Game({ game }: Btable2GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(1000);
  const [showRoadmaps, setShowRoadmaps] = useState(false);

  const gameId = game?.gmid || "btable2";
  const gameName = game?.gname || "Baccarat Table 2";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [1000, 5000, 10000, 25000, 50000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎰 Bets Closed!", variant: "destructive" });
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
      toast({ title: "💎 VIP Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/10 to-slate-950 flex flex-col font-sans">
        {/* VIP Header */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-green-900/90 to-emerald-900/90 border-b border-yellow-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-400" />
              <div>
                <h1 className="text-yellow-400 font-black text-2xl uppercase flex items-center gap-2">
                  {gameName}
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-black">
                    VIP
                  </span>
                </h1>
                <p className="text-green-200 text-sm">
                  Premium Baccarat • Hand #{gameData?.mid} • Table Limits:
                  ₹1,000 - ₹500,000
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-slate-900/60 border border-yellow-500/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-yellow-400 text-xs mb-1">Commission</div>
                <div className="text-white font-bold">Banker 5%</div>
              </div>
              <div className="text-center bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-black" />
                <div className="text-black font-mono text-2xl font-bold">
                  {gameData?.lt || 0}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4">
          {/* Baccarat Table */}
          <div className="bg-gradient-to-br from-green-900/30 via-emerald-800/40 to-green-900/30 border-2 border-yellow-700/50 rounded-3xl p-8 mb-6 relative shadow-2xl">
            {/* Shoe & Burn Card Tracker */}
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-yellow-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="text-yellow-400 text-xs mb-1">Shoe Status</div>
              <div className="text-white font-bold text-sm">Cards: 248/312</div>
              <div className="text-slate-400 text-xs">Burn: 7 cards</div>
            </div>

            {/* Table Layout */}
            <div className="relative h-[500px] bg-gradient-radial from-green-700/40 via-green-800/60 to-green-900/80 rounded-3xl border-8 border-yellow-700/20 p-8">
              {/* Betting Zones */}
              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                {/* Player Zone */}
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 1, nat: "PLAYER", b: 2.0 })
                  }
                  className="group relative bg-slate-900/60 border-4 border-blue-500 rounded-2xl p-6 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
                >
                  <div className="text-center">
                    <div className="text-blue-400 font-black text-3xl mb-2">
                      PLAYER
                    </div>
                    <div className="text-white font-mono text-5xl font-bold">
                      2.00
                    </div>
                    <div className="text-blue-300 text-sm mt-2">1:1 Payout</div>
                  </div>
                  {bets.find((b) => b.nat === "PLAYER") && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ₹{bets.find((b) => b.nat === "PLAYER")?.stake}
                    </div>
                  )}
                </button>

                {/* Tie Zone */}
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 2, nat: "TIE", b: 9.0 })
                  }
                  className="group relative bg-slate-900/60 border-4 border-green-500 rounded-2xl p-6 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/30 transition-all"
                >
                  <div className="text-center">
                    <div className="text-green-400 font-black text-3xl mb-2">
                      TIE
                    </div>
                    <div className="text-white font-mono text-5xl font-bold">
                      9.00
                    </div>
                    <div className="text-green-300 text-sm mt-2">
                      8:1 Payout
                    </div>
                  </div>
                  {bets.find((b) => b.nat === "TIE") && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ₹{bets.find((b) => b.nat === "TIE")?.stake}
                    </div>
                  )}
                </button>

                {/* Banker Zone */}
                <button
                  onClick={() =>
                    handleMarketClick({ sid: 3, nat: "BANKER", b: 1.95 })
                  }
                  className="group relative bg-slate-900/60 border-4 border-red-500 rounded-2xl p-6 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/30 transition-all"
                >
                  <div className="text-center">
                    <div className="text-red-400 font-black text-3xl mb-2">
                      BANKER
                    </div>
                    <div className="text-white font-mono text-5xl font-bold">
                      1.95
                    </div>
                    <div className="text-red-300 text-sm mt-2">
                      0.95:1 (5% comm.)
                    </div>
                  </div>
                  {bets.find((b) => b.nat === "BANKER") && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ₹{bets.find((b) => b.nat === "BANKER")?.stake}
                    </div>
                  )}
                </button>
              </div>

              {/* Premium Side Bets */}
              <div className="grid grid-cols-4 gap-3 max-w-5xl mx-auto">
                {[
                  { name: "Player Pair", odds: 12.0, color: "blue" },
                  { name: "Banker Pair", odds: 12.0, color: "red" },
                  { name: "Lucky Six", odds: 21.0, color: "purple" },
                  { name: "Suited Tie", odds: 201.0, color: "yellow" },
                ].map((bet, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      handleMarketClick({
                        sid: i + 10,
                        nat: bet.name,
                        b: bet.odds,
                      })
                    }
                    className={`bg-slate-900/60 border-2 border-${bet.color}-500/40 rounded-xl p-4 hover:border-${bet.color}-500 transition-all`}
                  >
                    <div
                      className={`text-${bet.color}-400 font-bold text-sm mb-1`}
                    >
                      {bet.name}
                    </div>
                    <div className="text-white font-mono text-2xl font-bold">
                      {bet.odds.toFixed(1)}x
                    </div>
                  </button>
                ))}
              </div>

              {/* Small/Big Bets */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-4">
                <button
                  onClick={() =>
                    handleMarketClick({
                      sid: 20,
                      nat: "SMALL (4 cards)",
                      b: 2.5,
                    })
                  }
                  className="bg-slate-900/60 border-2 border-orange-500/40 rounded-xl p-3 hover:border-orange-500 transition-all"
                >
                  <div className="text-orange-400 font-bold">
                    SMALL (4 cards)
                  </div>
                  <div className="text-white font-mono text-xl font-bold">
                    2.50x
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleMarketClick({
                      sid: 21,
                      nat: "BIG (5-6 cards)",
                      b: 1.54,
                    })
                  }
                  className="bg-slate-900/60 border-2 border-pink-500/40 rounded-xl p-3 hover:border-pink-500 transition-all"
                >
                  <div className="text-pink-400 font-bold">BIG (5-6 cards)</div>
                  <div className="text-white font-mono text-xl font-bold">
                    1.54x
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Roadmaps & Analytics */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Advanced Roadmaps
                </h2>
                <Button
                  onClick={() => setShowRoadmaps(!showRoadmaps)}
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  {showRoadmaps ? "Hide" : "Show"} Roadmaps
                </Button>
              </div>

              {showRoadmaps && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Bead Road */}
                  <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold text-sm mb-3">
                      Bead Road
                    </h3>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 60 }).map((_, i) => {
                        const result = ["P", "B", "T"][
                          Math.floor(Math.random() * 3)
                        ];
                        const color =
                          result === "P"
                            ? "bg-blue-500"
                            : result === "B"
                              ? "bg-red-500"
                              : "bg-green-500";
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 ${color} rounded-full border border-white/30 flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {result}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big Road */}
                  <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold text-sm mb-3">
                      Big Road
                    </h3>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 60 }).map((_, i) => {
                        const result = Math.random() > 0.5 ? "B" : "P";
                        const color =
                          result === "B" ? "border-red-500" : "border-blue-500";
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 ${color} border-2 rounded-full`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big Eye Road */}
                  <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold text-sm mb-3">
                      Big Eye Road
                    </h3>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 60 }).map((_, i) => {
                        const color =
                          Math.random() > 0.5
                            ? "border-red-500"
                            : "border-blue-500";
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 ${color} border-2 rounded`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Small Road & Cockroach Road */}
                  <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold text-sm mb-3">
                      Small Road / Cockroach
                    </h3>
                    <div className="grid grid-cols-12 gap-1 mb-3">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const color =
                          Math.random() > 0.5
                            ? "border-red-500"
                            : "border-blue-500";
                        return (
                          <div
                            key={i}
                            className={`w-6 h-6 ${color} border-2`}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const color =
                          Math.random() > 0.5
                            ? "text-red-500"
                            : "text-blue-500";
                        return (
                          <div key={i} className={`w-6 h-6 ${color} text-lg`}>
                            /
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Session Statistics
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-blue-500/20 rounded-lg p-3 text-center">
                    <div className="text-blue-400 text-xs mb-1">
                      Player Wins
                    </div>
                    <div className="text-white font-bold text-2xl">42</div>
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/20 rounded-lg p-3 text-center">
                    <div className="text-red-400 text-xs mb-1">Banker Wins</div>
                    <div className="text-white font-bold text-2xl">45</div>
                  </div>
                  <div className="bg-slate-800/50 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-green-400 text-xs mb-1">Ties</div>
                    <div className="text-white font-bold text-2xl">8</div>
                  </div>
                  <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-3 text-center">
                    <div className="text-yellow-400 text-xs mb-1">Pairs</div>
                    <div className="text-white font-bold text-2xl">12</div>
                  </div>
                </div>
              </div>

              {/* Recent Results */}
              <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
                <h3 className="text-yellow-400 font-bold mb-4">
                  Last 10 Hands
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {resultData?.res?.slice(0, 10).map((r: any, i: number) => {
                    const result = ["PLAYER", "BANKER", "TIE"][r.val % 3];
                    const color =
                      result === "PLAYER"
                        ? "bg-blue-500"
                        : result === "BANKER"
                          ? "bg-red-500"
                          : "bg-green-500";
                    return (
                      <div
                        key={i}
                        className={`${color} rounded-lg px-4 py-3 min-w-[100px] text-center`}
                      >
                        <div className="text-white font-bold text-sm">
                          {result}
                        </div>
                        <div className="text-white/80 text-xs mt-1">
                          #{r.mid || i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-yellow-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  VIP Bet Slip
                </h3>

                {/* VIP Info */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-yellow-400" />
                    <div className="text-yellow-400 text-xs font-bold">
                      VIP Table Limits
                    </div>
                  </div>
                  <div className="text-white text-sm">
                    Min: ₹1,000 • Max: ₹500,000
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    Higher limits available on request
                  </div>
                </div>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-yellow-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-3"
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
                        <span className="text-yellow-400 font-bold">
                          ₹{bet.stake.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No bets placed
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Exposure</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Potential Win</span>
                    <span className="text-green-400 font-bold">
                      ₹
                      {bets
                        .reduce((s, b) => s + b.stake * b.odds, 0)
                        .toFixed(0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold h-12"
                  >
                    Place VIP Bets ({bets.length})
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
                      className="border-green-500 text-green-400 hover:bg-green-500/10 text-xs"
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
