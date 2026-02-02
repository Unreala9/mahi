import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { CasinoGame } from "@/types/casino";
import { isMarketSuspended } from "@/lib/casinoUtils";
import { casinoBettingService } from "@/services/casinoBettingService";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Clock,
  Ticket,
  TrendingUp,
  Star,
  Volume2,
  BarChart3,
} from "lucide-react";

interface NotenumGameProps {
  game?: CasinoGame;
}

interface Bet {
  sid: number;
  nat: string;
  stake: number;
  odds: number;
}

const LOTTERY_NUMBERS = Array.from({ length: 90 }, (_, i) => i + 1);

const getNumberColor = (number: number) => {
  const colors = [
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
  ];
  return colors[number % colors.length];
};

export default function NotenumGame({ game }: NotenumGameProps) {
  const gameId = game?.gmid || "notenum";
  const gameName = game?.gname || "Note Number";
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState(100);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { gameData, resultData } = useCasinoWebSocket(gameId);

  const chips = [50, 100, 500, 1000, 2000];

  // Play sound when number is selected
  const playSelectSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+TwuWceAzuG0fPOfy4FJXbE8N2TQghPm+Xro3sYHjuB1fXKbC0FNYvI8N5+SgdRk+XunVgLEkOZ4OyGUxcK",
    );
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors
  };

  const handleNumberClick = (number: number) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(number)) {
      newSelected.delete(number);
      setBets(bets.filter((b) => b.nat !== number.toString()));
    } else {
      if (newSelected.size >= 10) {
        toast({ title: "Maximum 10 numbers allowed", variant: "destructive" });
        return;
      }
      newSelected.add(number);
      setBets([
        ...bets,
        {
          sid: number,
          nat: number.toString(),
          stake: selectedChip,
          odds: 8.5, // Lottery odds
        },
      ]);
      playSelectSound();
    }
    setSelectedNumbers(newSelected);
  };

  const handleQuickPick = () => {
    const randomNumbers = new Set<number>();
    while (randomNumbers.size < 6) {
      randomNumbers.add(Math.floor(Math.random() * 90) + 1);
    }

    const newBets = Array.from(randomNumbers).map((num) => ({
      sid: num,
      nat: num.toString(),
      stake: selectedChip,
      odds: 8.5,
    }));

    setSelectedNumbers(randomNumbers);
    setBets(newBets);
    playSelectSound();
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
      toast({ title: "🎫 Lottery Tickets Purchased!" });
      setBets([]);
      setSelectedNumbers(new Set());
    } catch (error) {
      toast({ title: "❌ Error", variant: "destructive" });
    }
  };

  // Calculate frequency for hot/cold analysis
  const numberFrequency = LOTTERY_NUMBERS.slice(0, 50).map((num) => {
    const count =
      resultData?.res
        ?.slice(0, 100)
        ?.filter(
          (r: any) =>
            r.val?.toString().includes(num.toString()) ||
            r.res?.toString().includes(num.toString()),
        )?.length || 0;
    return { number: num, frequency: count };
  });

  const hotNumbers = numberFrequency
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const coldNumbers = numberFrequency
    .sort((a, b) => a.frequency - b.frequency)
    .slice(0, 10);

  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialPrize = bets.reduce(
    (sum, bet) => sum + bet.stake * bet.odds,
    0,
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col font-sans">
        {/* Header */}
        <div className="bg-black/80 border-b border-purple-400/30 p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-purple-400 font-black text-xl uppercase">
                  {gameName}
                </h1>
                <p className="text-slate-300 text-sm">
                  Draw #{gameData?.mid} • {new Date().toLocaleDateString()} •
                  Number Lottery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg ${soundEnabled ? "bg-purple-600 text-white" : "bg-slate-600 text-slate-400"}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-white font-mono text-2xl font-bold">
                  {gameData?.lt || 0}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-6xl mx-auto w-full p-4">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Number Grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-purple-400 font-bold text-lg flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Select Your Lucky Numbers (Max 10)
                </h2>
                <Button
                  onClick={handleQuickPick}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                >
                  Quick Pick (6)
                </Button>
              </div>

              <div className="grid grid-cols-9 sm:grid-cols-10 gap-2">
                {LOTTERY_NUMBERS.map((number) => {
                  const isSelected = selectedNumbers.has(number);
                  const isHot = hotNumbers.some((h) => h.number === number);
                  const isCold = coldNumbers.some((c) => c.number === number);

                  return (
                    <button
                      key={number}
                      onClick={() => handleNumberClick(number)}
                      className={`h-12 w-12 rounded-lg font-bold text-white text-sm transition-all duration-200 border-2 relative ${
                        isSelected
                          ? `${getNumberColor(number)} border-white shadow-xl scale-110`
                          : `${getNumberColor(number)} border-transparent hover:border-white hover:scale-105 opacity-80`
                      } ${isHot ? "ring-2 ring-red-400" : isCold ? "ring-2 ring-blue-400" : ""}`}
                    >
                      {number}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Running Totals */}
              <div className="bg-black/60 border border-purple-400/30 rounded-xl p-4">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">
                      Selected Numbers
                    </div>
                    <div className="text-purple-400 font-bold text-lg">
                      {selectedNumbers.size}/10
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedNumbers.size > 0
                        ? Array.from(selectedNumbers)
                            .sort((a, b) => a - b)
                            .join(", ")
                        : "None selected"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">
                      Total Stake
                    </div>
                    <div className="text-white font-bold text-lg">
                      ₹{totalStake.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">
                      Potential Prize
                    </div>
                    <div className="text-green-400 font-bold text-lg">
                      ₹{potentialPrize.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Results */}
              <div className="bg-black/60 border border-purple-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <h3 className="text-purple-400 font-bold text-sm">
                    Recent Winning Numbers
                  </h3>
                </div>
                <div className="space-y-2">
                  {resultData?.res
                    ?.slice(0, 5)
                    .map((result: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="text-slate-400 text-xs w-16">
                          Draw {result.mid || i + 1}:
                        </div>
                        <div className="flex gap-1">
                          {(result.val || result.res || "1,5,12,23,34,45")
                            .toString()
                            .split(",")
                            .slice(0, 6)
                            .map((num: string, j: number) => (
                              <div
                                key={j}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${getNumberColor(
                                  parseInt(num.trim()) || 1,
                                )}`}
                              >
                                {num.trim() ||
                                  Math.floor(Math.random() * 90) + 1}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Chip Selector */}
              <div className="bg-black/80 border border-purple-400/30 rounded-xl p-4">
                <h3 className="text-purple-400 font-bold mb-3">Ticket Price</h3>
                <div className="grid grid-cols-5 gap-1">
                  {chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedChip(chip)}
                      className={`h-10 rounded font-bold text-xs ${
                        selectedChip === chip
                          ? "bg-purple-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      ₹{chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hot & Cold Analysis */}
              <div className="bg-black/80 border border-purple-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-purple-400 font-bold text-sm">
                    Number Analysis
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-red-400 font-bold mb-2">
                      🔥 HOT NUMBERS
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotNumbers.slice(0, 10).map((n) => (
                        <button
                          key={n.number}
                          onClick={() => handleNumberClick(n.number)}
                          className={`w-8 h-8 rounded text-xs font-bold ${
                            selectedNumbers.has(n.number)
                              ? "bg-red-500 text-white"
                              : "bg-red-600/30 text-red-300 hover:bg-red-500 hover:text-white"
                          }`}
                        >
                          {n.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-blue-400 font-bold mb-2">
                      ❄️ COLD NUMBERS
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {coldNumbers.slice(0, 10).map((n) => (
                        <button
                          key={n.number}
                          onClick={() => handleNumberClick(n.number)}
                          className={`w-8 h-8 rounded text-xs font-bold ${
                            selectedNumbers.has(n.number)
                              ? "bg-blue-500 text-white"
                              : "bg-blue-600/30 text-blue-300 hover:bg-blue-500 hover:text-white"
                          }`}
                        >
                          {n.number}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-black/80 border border-purple-400/30 rounded-xl p-4 sticky top-4">
                <h3 className="text-purple-400 font-bold mb-4">
                  Lottery Controls
                </h3>

                <div className="space-y-3">
                  <Button
                    onClick={handlePlaceBets}
                    disabled={bets.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold h-12 text-lg"
                  >
                    Buy Tickets ({selectedNumbers.size})
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        setSelectedNumbers(new Set());
                        setBets([]);
                      }}
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Clear All
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
                      Double Stake
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
