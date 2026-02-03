import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Clock, Target, Zap, TrendingUp } from "lucide-react";

interface WorliVariant2GameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const WORLI_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

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

export default function WorliVariant2Game({ game }: WorliVariant2GameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );

  const gameId = game?.gmid || "worli2";
  const gameName = game?.gname || "Worli 2";

  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [50, 100, 500, 1000, 5000];

  const handleNumberClick = (number: number) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(number)) {
      newSelected.delete(number);
    } else {
      newSelected.add(number);
    }
    setSelectedNumbers(newSelected);

    // Create or update bet for this number
    const existingBet = bets.find((b) => b.nat === number.toString());
    if (existingBet && !newSelected.has(number)) {
      setBets(bets.filter((b) => b.nat !== number.toString()));
    } else if (!existingBet && newSelected.has(number)) {
      setBets([
        ...bets,
        {
          sid: number,
          nat: number.toString(),
          stake: selectedChip,
          odds: 18, // Standard Worli odds
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
      toast({ title: "🎯 Worli Numbers Locked!" });
      setBets([]);
      setSelectedNumbers(new Set());
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialPayout = bets.reduce(
    (sum, bet) => sum + bet.stake * bet.odds,
    0,
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        {/* Header with Draw Info */}
        <div className="bg-slate-900/90 border-b border-orange-500/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-orange-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-slate-400 text-sm">
                  Draw #{gameData?.mid} • Rapid Number Betting
                </p>
              </div>
            </div>
            <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
              <div className="text-white font-mono text-2xl font-bold">
                {gameData?.lt || 0}s
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full p-4">
          {/* Number Grid */}
          <div className="mb-6">
            <h2 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Select Numbers
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {WORLI_NUMBERS.map((number, index) => (
                <button
                  key={number}
                  onClick={() => handleNumberClick(number)}
                  className={`h-16 w-16 rounded-xl font-bold text-white text-xl transition-all duration-200 border-2 ${
                    selectedNumbers.has(number)
                      ? `${NUMBER_COLORS[index]} border-white shadow-xl scale-110`
                      : `${NUMBER_COLORS[index]} border-transparent hover:border-white hover:scale-105 opacity-80`
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Numbers & Betting Info */}
          <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-slate-400 text-sm mb-1">
                  Selected Numbers
                </div>
                <div className="text-orange-400 font-bold text-lg">
                  {selectedNumbers.size > 0
                    ? Array.from(selectedNumbers).join(", ")
                    : "None"}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">
                  Total Bet Amount
                </div>
                <div className="text-white font-bold text-lg">
                  ₹{totalStake.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">
                  Potential Payout
                </div>
                <div className="text-green-400 font-bold text-lg">
                  ₹{potentialPayout.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* History Strip */}
          <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="text-orange-400 font-bold text-sm">
                Last 10 Results
              </h3>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {resultData?.res?.slice(0, 10).map((result: any, i: number) => (
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

          {/* Control Strip */}
          <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl p-4 sticky bottom-4">
            <div className="flex flex-col gap-4">
              {/* Chip Selector */}
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${
                        selectedChip === chip
                          ? "bg-orange-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => {
                    setSelectedNumbers(new Set());
                    setBets([]);
                  }}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
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
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                  disabled={bets.length === 0}
                >
                  Double
                </Button>
                <Button
                  onClick={handlePlaceBets}
                  disabled={bets.length === 0}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold px-8"
                >
                  Place Bet ({selectedNumbers.size} Numbers)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
