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
  Target,
  TrendingUp,
  AlertCircle,
  Play,
} from "lucide-react";

interface SuperOver3GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const BALL_OUTCOMES = [
  { runs: 0, label: "Dot Ball", odds: 4.2, color: "bg-gray-600" },
  { runs: 1, label: "Single", odds: 3.8, color: "bg-blue-600" },
  { runs: 2, label: "Double", odds: 5.2, color: "bg-green-600" },
  { runs: 3, label: "Triple", odds: 8.5, color: "bg-yellow-600" },
  { runs: 4, label: "Boundary", odds: 6.2, color: "bg-orange-600" },
  { runs: 6, label: "Six", odds: 9.8, color: "bg-red-600" },
  { runs: "W", label: "Wicket", odds: 7.2, color: "bg-purple-600" },
];

export default function SuperOver3Game({ game }: SuperOver3GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [currentBall, setCurrentBall] = useState(1);
  const [superOverStarted, setSuperOverStarted] = useState(false);

  const gameId = game?.gmid || "superover3";
  const gameName = game?.gname || "Super Over 3";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [100, 500, 1000, 2000, 5000];

  const handleMarketClick = (market: any) => {
    if (isMarketSuspended(market)) {
      toast({
        title: "⚡ Super Over Market Suspended!",
        variant: "destructive",
      });
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

  const handleQuickBet = (outcome: any) => {
    const marketId = outcome.runs === "W" ? 999 : outcome.runs + 100;
    const existingBet = bets.find((b) => b.sid === marketId);
    if (existingBet) {
      setBets(
        bets.map((b) =>
          b.sid === marketId ? { ...b, stake: b.stake + selectedChip } : b,
        ),
      );
    } else {
      setBets([
        ...bets,
        {
          sid: marketId,
          nat: outcome.label,
          stake: selectedChip,
          odds: outcome.odds,
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
      toast({ title: "⚡ Super Over Bets Placed!" });
      setBets([]);
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const superOverTimer = Math.max((gameData?.lt || 300) - 240, 0); // Last 5 minutes for super over
  const ballProgress = Math.min(currentBall, 6);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-red-950 flex flex-col font-sans">
        {/* Super Over Header */}
        <div className="bg-black/90 border-b border-orange-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-orange-400" />
              <div>
                <h1 className="text-orange-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-slate-300 text-sm">
                  ⚡ Cricket Super Over • High Stakes Finish ⚡
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-white font-mono text-2xl font-bold">
                  {superOverTimer}s
                </div>
              </div>
              {!superOverStarted && superOverTimer <= 30 && (
                <div className="animate-pulse bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Starting Soon!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          {/* Super Over Context */}
          <div className="bg-gradient-to-r from-slate-800/60 via-orange-900/40 to-slate-800/60 border-2 border-orange-400/30 rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team Context */}
              <div>
                <h2 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Super Over Context
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/50 rounded-lg p-3">
                    <div>
                      <div className="text-white font-bold">Mumbai Indians</div>
                      <div className="text-slate-400 text-sm">
                        Batting First
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold text-lg">
                        Target: 15
                      </div>
                      <div className="text-slate-300 text-sm">From 6 balls</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/50 rounded-lg p-3">
                    <div>
                      <div className="text-white font-bold">
                        Royal Challengers
                      </div>
                      <div className="text-slate-400 text-sm">Bowling</div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold text-lg">
                        Defending
                      </div>
                      <div className="text-slate-300 text-sm">Super Over</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Players & Ball Progress */}
              <div>
                <h3 className="text-orange-400 font-bold mb-4">Live Action</h3>
                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Batsman</span>
                      <span className="text-slate-400 text-sm">Bowler</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-white font-bold">Rohit Sharma*</div>
                      <div className="text-white font-bold">Jasprit Bumrah</div>
                    </div>
                  </div>

                  {/* Ball Progress */}
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">
                        Super Over Progress
                      </span>
                      <span className="text-orange-400 font-bold text-sm">
                        {ballProgress}/6 Balls
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                        style={{ width: `${(ballProgress / 6) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-black/50 rounded-lg p-2">
                      <div className="text-orange-400 font-bold text-lg">
                        8/0
                      </div>
                      <div className="text-slate-400 text-xs">
                        Current Score
                      </div>
                    </div>
                    <div className="bg-black/50 rounded-lg p-2">
                      <div className="text-red-400 font-bold text-lg">
                        7 Req
                      </div>
                      <div className="text-slate-400 text-xs">From 3 balls</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Rapid Micro-Markets */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-orange-400 font-bold text-lg flex items-center gap-2">
                <Play className="w-5 h-5" />
                Super Over Markets • Ball {ballProgress}
              </h2>

              {/* Quick Ball Outcome Bets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {BALL_OUTCOMES.map((outcome) => (
                  <button
                    key={outcome.runs}
                    onClick={() => handleQuickBet(outcome)}
                    className={`p-4 rounded-xl text-white font-bold transition-all duration-200 hover:scale-105 ${outcome.color} border-2 border-transparent hover:border-white`}
                  >
                    <div className="text-2xl mb-1">{outcome.runs}</div>
                    <div className="text-sm opacity-90">{outcome.label}</div>
                    <div className="text-xs mt-1">{outcome.odds}x</div>
                  </button>
                ))}
              </div>

              {/* Advanced Markets */}
              <div className="space-y-3">
                <h3 className="text-orange-400 font-bold">
                  Advanced Super Over Markets
                </h3>
                {gameData?.sub?.map((market: any) => {
                  const activeBet = bets.find((b) => b.sid === market.sid);
                  return (
                    <div
                      key={market.sid}
                      className="bg-slate-800/50 border border-orange-400/20 rounded-xl p-4 hover:border-orange-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
                            ⚡
                          </div>
                          <div>
                            <div className="text-white font-bold">
                              {market.nat}
                            </div>
                            <div className="text-orange-300 text-sm">
                              Super Over Market
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-orange-400 font-mono text-2xl font-bold">
                            {market.b || market.bs}
                          </div>
                          <button
                            onClick={() => handleMarketClick(market)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                              activeBet
                                ? "bg-orange-500 text-white shadow-lg"
                                : "bg-slate-700 text-orange-300 hover:bg-orange-600/50"
                            }`}
                          >
                            {activeBet ? `₹${activeBet.stake}` : "QUICK BET"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Super Over History */}
              <div className="bg-slate-900/60 border border-orange-400/20 rounded-xl p-4 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h3 className="text-orange-400 font-bold text-sm">
                    Recent Super Over Trends
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400 mb-2">
                      Most Common Outcomes:
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white">Boundaries (4s)</span>
                        <span className="text-orange-400">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Singles</span>
                        <span className="text-orange-400">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Sixes</span>
                        <span className="text-orange-400">24%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-2">
                      Previous Super Over:
                    </div>
                    <div className="flex gap-1">
                      {[6, 4, 1, 0, 6, 2].map((runs, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                            runs === 0
                              ? "bg-gray-600"
                              : runs === 1 || runs === 2
                                ? "bg-blue-600"
                                : runs === 4
                                  ? "bg-orange-600"
                                  : runs === 6
                                    ? "bg-red-600"
                                    : "bg-slate-600"
                          }`}
                        >
                          {runs}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Total: 19 runs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Bet Slip */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/80 border border-orange-400/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Super Over Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-orange-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip > 999 ? `${chip / 1000}k` : chip}
                    </button>
                  ))}
                </div>

                {/* Active Bets */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-orange-400/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.nat}
                        </span>
                        <button
                          onClick={() =>
                            setBets(bets.filter((b) => b.sid !== bet.sid))
                          }
                          className="text-red-400 text-xs hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-orange-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No super over bets
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-orange-400/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Total Exposure</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Max Super Win</span>
                    <span className="text-orange-400 font-bold">
                      ₹
                      {Math.max(
                        ...bets.map((b) => b.stake * b.odds),
                        0,
                      ).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold h-12"
                  >
                    Lock Super Bets ({bets.length})
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
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/10 text-xs"
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
