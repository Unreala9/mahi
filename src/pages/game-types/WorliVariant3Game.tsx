import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Target, BarChart3, TrendingUp, Zap } from "lucide-react";

interface WorliVariant3GameProps {
  game: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
  type: "single" | "combo";
}

const WORLI_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);
const COMBO_BETS = [
  {
    name: "Evens",
    numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    odds: 1.9,
    color: "bg-blue-600",
  },
  {
    name: "Odds",
    numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
    odds: 1.9,
    color: "bg-red-600",
  },
  {
    name: "1-10",
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    odds: 1.9,
    color: "bg-green-600",
  },
  {
    name: "11-20",
    numbers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    odds: 1.9,
    color: "bg-purple-600",
  },
  {
    name: "Low (1-5)",
    numbers: [1, 2, 3, 4, 5],
    odds: 3.8,
    color: "bg-orange-600",
  },
  {
    name: "High (16-20)",
    numbers: [16, 17, 18, 19, 20],
    odds: 3.8,
    color: "bg-pink-600",
  },
];

const NUMBER_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-red-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-600",
  "bg-purple-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-orange-600",
  "bg-teal-600",
  "bg-cyan-600",
];

export default function WorliVariant3Game({ game }: WorliVariant3GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set());
  const { gameData, resultData } = useCasinoWebSocket(game.gmid);

  const chips = [50, 100, 500, 1000, 5000];

  const handleNumberClick = (number: number) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(number)) {
      newSelected.delete(number);
      setBets(bets.filter((b) => b.nat !== number.toString()));
    } else {
      newSelected.add(number);
      setBets([
        ...bets,
        {
          sid: number,
          nat: number.toString(),
          stake: selectedChip,
          odds: 18,
          type: "single",
        },
      ]);
    }
    setSelectedNumbers(newSelected);
  };

  const handleComboClick = (combo: any) => {
    const newSelectedCombos = new Set(selectedCombos);
    if (newSelectedCombos.has(combo.name)) {
      newSelectedCombos.delete(combo.name);
      setBets(bets.filter((b) => b.nat !== combo.name));
    } else {
      newSelectedCombos.add(combo.name);
      setBets([
        ...bets,
        {
          sid: 100 + COMBO_BETS.indexOf(combo),
          nat: combo.name,
          stake: selectedChip,
          odds: combo.odds,
          type: "combo",
        },
      ]);
    }
    setSelectedCombos(newSelectedCombos);
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
      toast({ title: "🎯 Advanced Worli Bets Placed!" });
      setBets([]);
      setSelectedNumbers(new Set());
      setSelectedCombos(new Set());
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  // Calculate frequency for heatmap
  const numberFrequency = WORLI_NUMBERS.map((num) => {
    const count =
      resultData?.res
        ?.slice(0, 50)
        ?.filter((r: any) => parseInt(r.val || r.res || "0") === num)?.length ||
      0;
    return { number: num, frequency: count };
  });

  const maxFreq = Math.max(...numberFrequency.map((n) => n.frequency), 1);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-cyan-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-cyan-500" />
              <div>
                <h1 className="text-cyan-400 font-black text-xl uppercase">
                  {game.gname}
                </h1>
                <p className="text-slate-400 text-sm">
                  Draw #{gameData?.mid} • Advanced Multi-Bet System
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
              <div className="text-white font-mono text-2xl font-bold">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Betting Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Number Grid */}
              <div>
                <h2 className="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Single Numbers
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {WORLI_NUMBERS.map((number, index) => {
                    const freq =
                      numberFrequency.find((n) => n.number === number)
                        ?.frequency || 0;
                    const intensity = freq / maxFreq;
                    return (
                      <button
                        key={number}
                        onClick={() => handleNumberClick(number)}
                        className={`h-16 w-16 rounded-xl font-bold text-white text-xl transition-all duration-200 border-2 relative ${
                          selectedNumbers.has(number)
                            ? `${NUMBER_COLORS[index]} border-white shadow-xl scale-110`
                            : `${NUMBER_COLORS[index]} border-transparent hover:border-white hover:scale-105 opacity-80`
                        }`}
                        style={{
                          boxShadow: selectedNumbers.has(number)
                            ? undefined
                            : `inset 0 0 20px rgba(255,255,255,${intensity * 0.5})`,
                        }}
                      >
                        {number}
                        {freq > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs text-black font-bold">
                            {freq}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Combination Bets */}
              <div>
                <h2 className="text-cyan-400 font-bold text-lg mb-4">
                  Quick Combinations
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMBO_BETS.map((combo) => (
                    <button
                      key={combo.name}
                      onClick={() => handleComboClick(combo)}
                      className={`p-4 rounded-xl font-bold text-white transition-all duration-200 border-2 ${
                        selectedCombos.has(combo.name)
                          ? `${combo.color} border-white shadow-xl scale-105`
                          : `${combo.color} border-transparent hover:border-white hover:scale-105 opacity-80`
                      }`}
                    >
                      <div className="text-lg mb-1">{combo.name}</div>
                      <div className="text-sm opacity-75">{combo.odds}x</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-cyan-400 font-bold text-sm">
                    Last 15 Results
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {resultData?.res
                    ?.slice(0, 15)
                    .map((result: any, i: number) => (
                      <div
                        key={i}
                        className={`min-w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 ${
                          NUMBER_COLORS[
                            (parseInt(result.val || result.res || "1") - 1) % 20
                          ]
                        } border-white/20`}
                      >
                        {result.val ||
                          result.res ||
                          Math.floor(Math.random() * 20) + 1}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Bet Slip & Analytics */}
            <div className="lg:col-span-4 space-y-4">
              {/* Expanded Bet Slip */}
              <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-cyan-400 font-bold text-lg mb-4">
                  Advanced Bet Slip
                </h3>

                {/* Chip Selector */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-cyan-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>

                {/* Bet List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {bets.map((bet) => (
                    <div
                      key={bet.sid}
                      className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-medium text-sm truncate">
                          {bet.type === "combo" ? "🎯" : "🔢"} {bet.nat}
                        </span>
                        <button
                          onClick={() => {
                            setBets(bets.filter((b) => b.sid !== bet.sid));
                            if (bet.type === "single") {
                              setSelectedNumbers((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(parseInt(bet.nat));
                                return newSet;
                              });
                            } else {
                              setSelectedCombos((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(bet.nat);
                                return newSet;
                              });
                            }
                          }}
                          className="text-red-400 text-xs hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">@ {bet.odds}x</span>
                        <span className="text-cyan-400 font-bold">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-sm">
                      No bets selected
                    </p>
                  )}
                </div>

                {/* Bet Summary */}
                <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Exposure</span>
                    <span className="text-white font-bold">
                      ₹{bets.reduce((s, b) => s + b.stake, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Max Potential Win</span>
                    <span className="text-cyan-400 font-bold">
                      ₹
                      {Math.max(
                        ...bets.map((b) => b.stake * b.odds),
                        0,
                      ).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">
                      Singles: {bets.filter((b) => b.type === "single").length}
                    </span>
                    <span className="text-slate-400">
                      Combos: {bets.filter((b) => b.type === "combo").length}
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold h-12"
                  >
                    Place All Bets ({bets.length})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => {
                        setSelectedNumbers(new Set());
                        setSelectedCombos(new Set());
                        setBets([]);
                      }}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => {
                        setBets(
                          bets.map((bet) => ({ ...bet, stake: bet.stake * 2 })),
                        );
                      }}
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                      disabled={bets.length === 0}
                    >
                      Double
                    </Button>
                    <Button
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                      disabled={bets.length === 0}
                    >
                      Repeat
                    </Button>
                  </div>
                </div>
              </div>

              {/* Analytics Panel */}
              <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-cyan-400 font-bold text-sm">
                    Hot & Cold Numbers
                  </h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      Most Drawn (Last 50)
                    </div>
                    <div className="flex gap-1">
                      {numberFrequency
                        .sort((a, b) => b.frequency - a.frequency)
                        .slice(0, 5)
                        .map((n) => (
                          <div
                            key={n.number}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            {n.number}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      Least Drawn (Cold)
                    </div>
                    <div className="flex gap-1">
                      {numberFrequency
                        .sort((a, b) => a.frequency - b.frequency)
                        .slice(0, 5)
                        .map((n) => (
                          <div
                            key={n.number}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold"
                          >
                            {n.number}
                          </div>
                        ))}
                    </div>
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
