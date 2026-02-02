import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, RotateCcw, Trash2 } from "lucide-react";

interface RouletteGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

// Roulette number layout
const rouletteLayout = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
];

const redNumbers = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export default function RouletteGame({ game }: RouletteGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);

  const gameId = game?.gmid || "roulette13";
  const gameName = game?.gname || "Roulette";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  // Debug logging
  useEffect(() => {
    console.log("=== ROULETTE GAME DEBUG ===");
    console.log("Game ID:", gameId);
    console.log("Game Name:", gameName);
    console.log("Game Data:", gameData);
    console.log("Result Data:", resultData);
    if (gameData?.sub) {
      console.log("Available Markets:", gameData.sub.length);
      console.log(
        "Market Names:",
        gameData.sub.map((m: any) => m.nat).slice(0, 10),
      );
      console.log("First Market Structure:", gameData.sub[0]);
    }
    console.log("========================");
  }, [gameData, resultData, game]);

  const chips = [25, 50, 100, 200, 500, 1000];

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-600";
    return redNumbers.includes(num) ? "bg-red-600" : "bg-gray-900";
  };

  const handleNumberClick = (num: number) => {
    console.log("Number clicked:", num);
    console.log("GameData available:", !!gameData);
    console.log("Markets available:", gameData?.sub?.length || 0);

    if (!gameData?.sub || gameData.sub.length === 0) {
      toast({
        title: "Game Data Loading",
        description: "Please wait for markets to load...",
        variant: "destructive",
      });
      return;
    }

    console.log("Looking for market with nat =", num.toString());
    const market = gameData.sub.find((m: any) => m.nat === num.toString());
    console.log("Market found:", market);

    if (!market) {
      console.log(
        "All available markets:",
        gameData.sub.map((m: any) => ({ sid: m.sid, nat: m.nat })),
      );
      toast({
        title: "Market Not Available",
        description: `Number ${num} is not available for betting`,
        variant: "destructive",
      });
      return;
    }

    if (isMarketSuspended(market)) {
      toast({
        title: "Betting Suspended",
        description: "This market is currently not accepting bets",
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
      toast({
        title: "✅ Bet Updated",
        description: `Number ${num}: ₹${existingBet.stake + selectedChip}`,
      });
    } else {
      setBets([
        ...bets,
        {
          sid: market.sid,
          nat: market.nat,
          stake: selectedChip,
          odds: market.b || market.bs || 2,
        },
      ]);
      toast({
        title: "✅ Bet Added",
        description: `Number ${num}: ₹${selectedChip}`,
      });
    }
  };

  const handleOutsideBet = (betType: string) => {
    console.log("Outside bet clicked:", betType);
    console.log("GameData available:", !!gameData);
    console.log("Markets available:", gameData?.sub?.length || 0);

    if (!gameData?.sub || gameData.sub.length === 0) {
      toast({
        title: "Game Data Loading",
        description: "Please wait for markets to load...",
        variant: "destructive",
      });
      return;
    }

    console.log("Looking for market with nat (case-insensitive) =", betType);
    const market = gameData.sub.find(
      (m: any) => m.nat && m.nat.toLowerCase() === betType.toLowerCase(),
    );
    console.log("Market found:", market);

    if (!market) {
      console.log(
        "All available market names:",
        gameData.sub.map((m: any) => m.nat).filter(Boolean),
      );
      toast({
        title: "Market Not Available",
        description: `${betType} is not available`,
        variant: "destructive",
      });
      return;
    }

    if (isMarketSuspended(market)) {
      toast({
        title: "Betting Suspended",
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
      toast({
        title: "✅ Bet Updated",
        description: `${betType}: ₹${existingBet.stake + selectedChip}`,
      });
    } else {
      setBets([
        ...bets,
        {
          sid: market.sid,
          nat: market.nat,
          stake: selectedChip,
          odds: market.b || market.bs || 2,
        },
      ]);
      toast({
        title: "✅ Bet Added",
        description: `${betType}: ₹${selectedChip}`,
      });
    }
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0) return;

    if (!gameData?.mid) {
      toast({
        title: "❌ Cannot Place Bet",
        description: "Waiting for game data...",
        variant: "destructive",
      });
      return;
    }

    try {
      let successCount = 0;
      for (const bet of bets) {
        await casinoBettingService.placeCasinoBet({
          gameId: gameId,
          gameName: gameName,
          roundId: gameData.mid.toString(),
          marketId: bet.sid.toString(),
          marketName: bet.nat,
          selection: bet.nat,
          odds: bet.odds,
          stake: bet.stake,
          betType: "BACK",
        });
        successCount++;
      }
      toast({
        title: `✅ ${successCount} Bet${successCount > 1 ? "s" : ""} Placed Successfully`,
        description: `Total stake: ₹${totalStake}`,
      });
      setBets([]);
    } catch (error: any) {
      console.error("Bet placement error:", error);
      toast({
        title: "❌ Error placing bets",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleUndoBet = () => {
    if (bets.length > 0) {
      setBets(bets.slice(0, -1));
    }
  };

  const handleClearBets = () => {
    setBets([]);
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);

  const getBetOnNumber = (num: number) => {
    return bets.find((b) => b.nat === num.toString());
  };

  const lastResults =
    resultData?.res?.slice(0, 11).map((r: any) => r.win) || [];

  // Calculate dynamic statistics from last results
  const calculateStats = () => {
    if (!lastResults || lastResults.length === 0) {
      return {
        first12: 0,
        second12: 0,
        third12: 0,
        red: 0,
        black: 0,
        odd: 0,
        even: 0,
        low: 0,
        high: 0,
      };
    }

    const total = lastResults.length;
    const stats = {
      first12: 0,
      second12: 0,
      third12: 0,
      red: 0,
      black: 0,
      odd: 0,
      even: 0,
      low: 0,
      high: 0,
    };

    lastResults.forEach((result: any) => {
      const num = parseInt(result);
      if (isNaN(num)) return;

      // 12s
      if (num >= 1 && num <= 12) stats.first12++;
      else if (num >= 13 && num <= 24) stats.second12++;
      else if (num >= 25 && num <= 36) stats.third12++;

      // Colors
      if (num > 0) {
        if (redNumbers.includes(num)) stats.red++;
        else stats.black++;
      }

      // Odd/Even
      if (num > 0) {
        if (num % 2 === 0) stats.even++;
        else stats.odd++;
      }

      // Low/High
      if (num >= 1 && num <= 18) stats.low++;
      else if (num >= 19 && num <= 36) stats.high++;
    });

    return {
      first12: total > 0 ? ((stats.first12 / total) * 100).toFixed(2) : "0.00",
      second12:
        total > 0 ? ((stats.second12 / total) * 100).toFixed(2) : "0.00",
      third12: total > 0 ? ((stats.third12 / total) * 100).toFixed(2) : "0.00",
      red: total > 0 ? ((stats.red / total) * 100).toFixed(2) : "0.00",
      black: total > 0 ? ((stats.black / total) * 100).toFixed(2) : "0.00",
      odd: total > 0 ? ((stats.odd / total) * 100).toFixed(2) : "0.00",
      even: total > 0 ? ((stats.even / total) * 100).toFixed(2) : "0.00",
      low: total > 0 ? ((stats.low / total) * 100).toFixed(2) : "0.00",
      high: total > 0 ? ((stats.high / total) * 100).toFixed(2) : "0.00",
    };
  };

  const stats = calculateStats();

  // Get min/max from markets
  const minBet =
    gameData?.sub?.length > 0
      ? Math.min(
          ...gameData.sub.filter((m: any) => m.min).map((m: any) => m.min),
        )
      : 25;
  const maxBet =
    gameData?.sub?.length > 0
      ? Math.max(
          ...gameData.sub.filter((m: any) => m.max).map((m: any) => m.max),
        )
      : 100000;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-gray-950 p-4">
        {/* Loading State */}
        {!gameData && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-emerald-300 text-lg">Loading game data...</p>
            </div>
          </div>
        )}

        {/* Premium Header */}
        <div className="bg-gradient-to-r from-emerald-900/50 via-green-900/50 to-emerald-900/50 backdrop-blur-md border-2 border-emerald-600/40 rounded-2xl p-4 mb-4 shadow-2xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-300 bg-clip-text text-transparent">
                {gameName}
              </h1>
              <p className="text-emerald-300/80 text-sm mt-1">
                Round ID: {gameData?.mid || "---"}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-black/30 px-6 py-3 rounded-xl border border-emerald-500/30">
                <p className="text-emerald-400 text-xs mb-1">Time Remaining</p>
                <p className="text-5xl font-bold text-white tabular-nums">
                  {gameData?.lt || 0}s
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-300/70 text-xs">Markets</p>
                <p className="text-white font-bold text-lg">
                  {gameData?.sub?.length || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-300/70 text-xs">Bet Range</p>
                <p className="text-white font-bold text-lg">
                  ₹{minBet} -{" "}
                  {maxBet >= 100000
                    ? `${(maxBet / 100000).toFixed(0)}L`
                    : maxBet.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          {/* Roulette Table */}
          <div className="bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-green-900/40 backdrop-blur-md border-2 border-emerald-600/30 rounded-2xl p-6 shadow-2xl">
            {/* Chip Selector - Premium Style */}
            <div className="mb-6">
              <h3 className="text-emerald-300 font-bold text-sm mb-3">
                SELECT CHIP VALUE
              </h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedChip(chip)}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm shadow-2xl transition-all duration-200 hover:scale-110 ${
                      selectedChip === chip
                        ? "ring-4 ring-yellow-400 scale-110 shadow-yellow-500/50"
                        : ""
                    } ${
                      chip === 25
                        ? "bg-gradient-to-br from-cyan-400 to-cyan-600 text-white"
                        : chip === 50
                          ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                          : chip === 100
                            ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
                            : chip === 200
                              ? "bg-gradient-to-br from-pink-400 to-pink-600 text-white"
                              : chip === 500
                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                : "bg-gradient-to-br from-yellow-400 to-amber-600 text-black"
                    }`}
                  >
                    ₹{chip >= 1000 ? `${chip / 1000}K` : chip}
                    {selectedChip === chip && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <Button
                onClick={handleUndoBet}
                disabled={bets.length === 0}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-2 rounded-xl shadow-lg disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                onClick={() => {
                  toast({ title: "Bets repeated!" });
                }}
                disabled={bets.length === 0}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-xl shadow-lg disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Repeat
              </Button>
              <Button
                onClick={handleClearBets}
                disabled={bets.length === 0}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold px-6 py-2 rounded-xl shadow-lg disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>

            {/* Back/Lay Buttons */}
            <div className="flex gap-2 mb-4">
              <Button className="flex-1 h-12 bg-blue-400 hover:bg-blue-500 text-black font-bold rounded-full">
                Back
              </Button>
              <Button className="flex-1 h-12 bg-pink-400 hover:bg-pink-500 text-black font-bold rounded-full">
                Lay
              </Button>
            </div>

            {/* Roulette Table Grid */}
            <div className="flex gap-1">
              {/* Green 0 */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleNumberClick(0)}
                  className="bg-green-600 text-white font-bold rounded h-full px-4 hover:ring-2 ring-yellow-400 transition-all relative"
                >
                  <span className="text-3xl">0</span>
                  {getBetOnNumber(0) && (
                    <span className="absolute top-1 right-1 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                      ₹{getBetOnNumber(0)!.stake}
                    </span>
                  )}
                </button>
              </div>

              {/* Number Grid */}
              <div className="flex-1">
                <div className="grid grid-rows-3 gap-1 mb-1">
                  {rouletteLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-12 gap-1">
                      {row.map((num) => {
                        const bet = getBetOnNumber(num);
                        return (
                          <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className={`${getNumberColor(num)} text-white font-bold h-12 rounded hover:ring-2 ring-yellow-400 transition-all relative flex items-center justify-center`}
                          >
                            <span className="text-sm">{num}</span>
                            {bet && (
                              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1 rounded">
                                ₹{bet.stake}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Bottom Row - 1st12, 2nd12, 3rd12 */}
                <div className="grid grid-cols-3 gap-1">
                  {["1st12", "2nd12", "3rd12"].map((section) => (
                    <button
                      key={section}
                      onClick={() => handleOutsideBet(section)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 rounded transition-all"
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - 2to1 */}
              <div className="flex flex-col gap-1">
                {[0, 1, 2].map((row) => (
                  <button
                    key={row}
                    onClick={() => handleOutsideBet("2to1")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 px-3 rounded transition-all"
                  >
                    2to1
                  </button>
                ))}
              </div>
            </div>

            {/* Outside Bets - Premium Design */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Red/Black */}
              <button
                onClick={() => handleOutsideBet("Red")}
                className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                RED
              </button>
              <button
                onClick={() => handleOutsideBet("Black")}
                className="bg-gradient-to-br from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl shadow-lg border-2 border-gray-600 transition-all"
              >
                BLACK
              </button>

              {/* Odd/Even */}
              <button
                onClick={() => handleOutsideBet("Odd")}
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                ODD
              </button>
              <button
                onClick={() => handleOutsideBet("Even")}
                className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                EVEN
              </button>

              {/* Low/High */}
              <button
                onClick={() => handleOutsideBet("1to18")}
                className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                1-18
              </button>
              <button
                onClick={() => handleOutsideBet("19to36")}
                className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                19-36
              </button>
            </div>
          </div>

          {/* Right Sidebar - Premium Statistics and Bet Slip */}
          <div className="space-y-4">
            {/* Live Statistics Panel */}
            <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 backdrop-blur-md border-2 border-emerald-600/30 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-emerald-300 font-bold text-lg mb-4 flex items-center gap-2">
                📊 Live Statistics
              </h3>
              <div className="space-y-3">
                {/* Dozen Stats */}
                <div className="bg-black/30 rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 mb-2 font-bold">
                    DOZENS DISTRIBUTION
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-lg">
                        {stats.first12}%
                      </div>
                      <div className="text-xs text-slate-400">1st 12</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-lg">
                        {stats.second12}%
                      </div>
                      <div className="text-xs text-slate-400">2nd 12</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-lg">
                        {stats.third12}%
                      </div>
                      <div className="text-xs text-slate-400">3rd 12</div>
                    </div>
                  </div>
                </div>

                {/* Color Stats */}
                <div className="bg-black/30 rounded-xl p-3 border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 mb-2 font-bold">
                    COLOR RATIO
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-600"></div>
                      <div className="flex-1">
                        <div className="text-white font-bold">{stats.red}%</div>
                        <div className="text-xs text-slate-400">Red</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-900 border border-white"></div>
                      <div className="flex-1">
                        <div className="text-white font-bold">
                          {stats.black}%
                        </div>
                        <div className="text-xs text-slate-400">Black</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Odd/Even & Hi/Lo Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded-xl p-3 border border-emerald-500/20">
                    <div className="text-xs text-emerald-400 mb-1 font-bold">
                      ODD/EVEN
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {stats.odd}% / {stats.even}%
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-emerald-500/20">
                    <div className="text-xs text-emerald-400 mb-1 font-bold">
                      LOW/HIGH
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {stats.low}% / {stats.high}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Slip */}
            <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 backdrop-blur-md border-2 border-emerald-600/30 rounded-2xl p-5 shadow-2xl">
              <h3 className="text-emerald-300 font-bold text-lg mb-4">
                🎲 Bet Slip
              </h3>
              {bets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-sm">
                    No bets placed yet
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Click on numbers or sections to place bets
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-emerald-400 font-bold border-b border-emerald-600/30 pb-2">
                    <div>BET</div>
                    <div className="text-center">ODDS</div>
                    <div className="text-right">STAKE</div>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-3 gap-2 text-sm bg-black/30 p-3 rounded-xl border border-emerald-500/20"
                      >
                        <div className="text-white font-bold">{bet.nat}</div>
                        <div className="text-yellow-400 text-center font-bold">
                          {bet.odds}
                        </div>
                        <div className="text-white text-right font-bold">
                          ₹{bet.stake}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-emerald-600/30 pt-3 space-y-2">
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl">
                      <span className="text-emerald-300 font-bold">
                        Total Stake:
                      </span>
                      <span className="text-yellow-400 font-bold text-lg">
                        ₹{totalStake}
                      </span>
                    </div>
                    <Button
                      onClick={handlePlaceBets}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl shadow-2xl"
                    >
                      Place All Bets
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Last Results - Premium Design */}
        <div className="mt-4 bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-800/50 backdrop-blur-md border-2 border-emerald-600/30 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-300 font-bold text-lg">
              🎯 Recent Results
            </h3>
            <span className="text-xs text-slate-400">
              Last {lastResults.length} Spins
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {lastResults.map((result: any, i: number) => {
              const num = parseInt(result);
              const isRed = redNumbers.includes(num);
              return (
                <div
                  key={i}
                  className={`min-w-[3rem] h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg border-2 ${
                    num === 0
                      ? "bg-green-600 border-green-400"
                      : isRed
                        ? "bg-red-600 border-red-400"
                        : "bg-gray-900 border-gray-600"
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
