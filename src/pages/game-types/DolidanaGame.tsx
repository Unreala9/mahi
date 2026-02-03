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
  Sparkles,
  Flower2,
} from "lucide-react";

interface DolidanaGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const FESTIVAL_COLORS = [
  { id: 1, name: "Pink Splash", color: "bg-pink-500", icon: "💗", odds: 2.5 },
  { id: 2, name: "Purple Rain", color: "bg-purple-500", icon: "💜", odds: 3.0 },
  { id: 3, name: "Green Spring", color: "bg-green-500", icon: "💚", odds: 2.8 },
  { id: 4, name: "Yellow Sun", color: "bg-yellow-500", icon: "💛", odds: 3.2 },
  { id: 5, name: "Blue Sky", color: "bg-blue-500", icon: "💙", odds: 2.6 },
  { id: 6, name: "Orange Glow", color: "bg-orange-500", icon: "🧡", odds: 3.5 },
];

export default function DolidanaGame({ game }: DolidanaGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [revealedColor, setRevealedColor] = useState<number | null>(null);

  // Use provided game or default to dolidana
  const gameId = game?.gmid || "dolidana";
  const gameName = game?.gname || "Dolidana";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 5000, 10000];

  console.log("DolidanaGame rendering", {
    gameId,
    gameName,
    gameData,
    resultData,
  });

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({ title: "🎨 Festival Betting Closed!", variant: "destructive" });
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
      toast({ title: "🎨 Festival Bets Placed! Good Luck!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col font-sans overflow-hidden">
        {/* DEBUG: This should always be visible */}
        <div className="text-white text-4xl p-8 bg-red-500 z-50">
          DOLIDANA GAME - {gameName} - ID: {gameId}
        </div>

        {/* Vibrant Festival Header */}
        <div className="bg-gradient-to-r from-pink-900/60 via-purple-900/60 to-blue-900/60 border-b-2 border-pink-500 p-4 backdrop-blur-sm relative overflow-hidden">
          {/* Animated Festival Particles */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <div className="flex justify-between items-center max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-3">
              <Flower2 className="w-10 h-10 text-pink-400 animate-pulse" />
              <div>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-black text-3xl uppercase">
                  {gameName}
                </h1>
                <p className="text-pink-300 text-sm font-bold">
                  Round #{gameData?.mid} • Festival of Colors • Holi Special
                </p>
              </div>
            </div>
            <div className="text-center bg-black/80 border-2 border-pink-500 px-8 py-4 rounded-xl shadow-2xl shadow-pink-500/50">
              <Clock className="w-6 h-6 mx-auto mb-2 text-pink-400 animate-pulse" />
              <div className="text-pink-400 font-mono text-4xl font-black">
                {gameData?.lt || 0}s
              </div>
              <div className="text-purple-400 text-xs font-bold mt-1">
                FESTIVAL LIVE!
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full p-4">
          {/* Central Color Reveal Area */}
          <div className="bg-gradient-to-br from-pink-950/20 via-purple-950/20 to-blue-950/20 border-2 border-pink-500/50 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
            {/* Holi-inspired Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMTUiIGZpbGw9IiNlYzQ4OTkiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] animate-pulse"></div>
            </div>

            {/* Color Reveal Animation Area */}
            <div className="relative h-96 bg-gradient-radial from-slate-900 via-slate-800 to-slate-900 rounded-3xl border-4 border-pink-500/30 flex items-center justify-center overflow-hidden">
              {/* Animated Color Splash Effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                {revealedColor ? (
                  <div className="relative">
                    <div
                      className={`w-64 h-64 ${FESTIVAL_COLORS[revealedColor - 1].color} rounded-full shadow-2xl animate-ping absolute`}
                    ></div>
                    <div
                      className={`w-64 h-64 ${FESTIVAL_COLORS[revealedColor - 1].color} rounded-full shadow-2xl flex items-center justify-center relative z-10`}
                    >
                      <div className="text-center">
                        <div className="text-9xl mb-4">
                          {FESTIVAL_COLORS[revealedColor - 1].icon}
                        </div>
                        <div className="text-white font-black text-3xl">
                          {FESTIVAL_COLORS[revealedColor - 1].name}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Sparkles className="w-24 h-24 text-pink-400 mx-auto mb-6 animate-pulse" />
                    <div className="text-pink-400 font-black text-4xl mb-2">
                      FESTIVAL REVEAL
                    </div>
                    <div className="text-purple-400 text-xl">
                      Place your bets on the winning color!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div className="mt-6 relative">
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border-2 border-pink-500/50">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-1000 shadow-lg animate-pulse"
                  style={{ width: `${((gameData?.lt || 0) / 60) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-pink-400 font-bold">🎨 BETTING OPEN</span>
                <span className="text-purple-400 font-bold">
                  {gameData?.lt || 0}s remaining
                </span>
                <span className="text-blue-400 font-bold">REVEAL SOON 🎉</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Color Betting Zones */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-pink-400 font-black text-xl flex items-center gap-2">
                <Zap className="w-6 h-6 animate-pulse" />
                FESTIVAL COLOR ZONES
              </h2>

              {/* Colorful Betting Panels */}
              <div className="grid md:grid-cols-3 gap-4">
                {FESTIVAL_COLORS.map((festColor) => (
                  <button
                    key={festColor.id}
                    onClick={() =>
                      handleMarketClick({
                        sid: festColor.id,
                        nat: festColor.name,
                        b: festColor.odds,
                      })
                    }
                    className={`${festColor.color} bg-opacity-20 border-2 border-opacity-50 rounded-2xl p-6 hover:bg-opacity-30 hover:shadow-2xl transition-all relative overflow-hidden`}
                    style={{ borderColor: festColor.color.replace("bg-", "") }}
                  >
                    {/* Glowing Effect */}
                    <div
                      className={`absolute inset-0 ${festColor.color} opacity-0 hover:opacity-10 transition-opacity`}
                    ></div>

                    <div className="relative z-10">
                      <div className="text-7xl mb-3 animate-bounce">
                        {festColor.icon}
                      </div>
                      <div className="text-white font-black text-xl mb-2">
                        {festColor.name}
                      </div>
                      <div className="text-white/80 text-sm mb-3">
                        Festival Color #{festColor.id}
                      </div>
                      <div className="bg-black/60 rounded-lg py-3 px-4">
                        <div className="text-white font-mono text-3xl font-black">
                          {festColor.odds.toFixed(1)}x
                        </div>
                        <div className="text-white/80 text-xs mt-1">
                          Win Multiplier
                        </div>
                      </div>
                      {bets.find((b) => b.sid === festColor.id) && (
                        <div className="mt-3 bg-green-500 text-white px-3 py-2 rounded-lg font-bold text-sm">
                          ✓ ₹{bets.find((b) => b.sid === festColor.id)?.stake}{" "}
                          Bet
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Special Festival Combos */}
              <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-blue-950/40 border border-pink-500/30 rounded-xl p-4">
                <h3 className="text-pink-400 font-bold text-sm mb-3 flex items-center gap-2 uppercase">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  🎨 Special Festival Combinations
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      handleMarketClick({ sid: 10, nat: "Pink+Purple", b: 5.5 })
                    }
                    className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-4 hover:shadow-xl transition-all"
                  >
                    <div className="text-white font-bold text-sm mb-1">
                      Pink + Purple
                    </div>
                    <div className="text-white font-mono text-xl font-bold">
                      5.5x
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleMarketClick({
                        sid: 11,
                        nat: "Yellow+Orange",
                        b: 6.0,
                      })
                    }
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 hover:shadow-xl transition-all"
                  >
                    <div className="text-white font-bold text-sm mb-1">
                      Yellow + Orange
                    </div>
                    <div className="text-white font-mono text-xl font-bold">
                      6.0x
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      handleMarketClick({ sid: 12, nat: "Green+Blue", b: 5.8 })
                    }
                    className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 hover:shadow-xl transition-all"
                  >
                    <div className="text-white font-bold text-sm mb-1">
                      Green + Blue
                    </div>
                    <div className="text-white font-mono text-xl font-bold">
                      5.8x
                    </div>
                  </button>
                </div>
              </div>

              {/* Festival Parade - Results History */}
              <div className="bg-gradient-to-br from-pink-950/20 via-purple-950/20 to-blue-950/20 border border-pink-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-yellow-400 font-black text-sm uppercase">
                    🎉 Festival Parade - Recent Winners
                  </h3>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {resultData?.res?.slice(0, 6).map((r: any, i: number) => {
                    const colorId = ((r.val ?? i) % 6) + 1;
                    const festColor =
                      FESTIVAL_COLORS[colorId - 1] || FESTIVAL_COLORS[0];
                    return (
                      <div
                        key={i}
                        className="bg-black/60 border border-pink-500/30 rounded-xl p-3 text-center"
                      >
                        <div className="text-pink-400 text-xs font-bold mb-2">
                          #{r.mid || i + 1}
                        </div>
                        <div
                          className={`w-12 h-12 mx-auto ${festColor.color} rounded-full flex items-center justify-center text-3xl shadow-lg mb-2`}
                        >
                          {festColor.icon}
                        </div>
                        <div className="text-white text-xs font-bold truncate">
                          {festColor.name}
                        </div>
                        <div className="text-green-400 text-xs mt-1">
                          ₹{(Math.random() * 8000 + 2000).toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-gradient-to-br from-black via-slate-900 to-black border-2 border-pink-500 rounded-xl p-4 sticky top-4 shadow-2xl shadow-pink-500/30">
                <h3 className="text-pink-400 font-black text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  FESTIVAL BET SLIP
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs transition-all ${
                        selectedChip === chip
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-pink-500/30"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {bets.map((bet) => {
                    const festColor = FESTIVAL_COLORS.find(
                      (c) => c.name === bet.nat,
                    );
                    return (
                      <div
                        key={bet.sid}
                        className={`bg-gradient-to-r ${festColor?.color || "from-slate-800"} bg-opacity-20 border border-pink-500/30 rounded-lg p-3`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            {festColor && (
                              <span className="text-2xl">{festColor.icon}</span>
                            )}
                            <span className="text-white font-bold text-sm truncate">
                              {bet.nat}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setBets(bets.filter((b) => b.sid !== bet.sid))
                            }
                            className="text-red-400 text-xs font-bold hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">
                            @ {bet.odds.toFixed(1)}x
                          </span>
                          <span className="text-pink-400 font-bold">
                            ₹{bet.stake}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-6 text-sm">
                      No festival bets selected 🎨
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Total Stake</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Potential Win</span>
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
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-400 hover:via-purple-400 hover:to-blue-400 text-white font-black h-14 text-lg shadow-2xl shadow-pink-500/50"
                  >
                    🎨 PLACE FESTIVAL BETS ({bets.length})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setBets([])}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/20 text-xs font-bold"
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
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 text-xs font-bold"
                      disabled={bets.length === 0}
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      className="border-pink-500 text-pink-400 hover:bg-pink-500/20 text-xs font-bold"
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
