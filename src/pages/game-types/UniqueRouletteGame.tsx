import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import { casinoBettingService } from "@/services/casinoBettingService";
import { useToast } from "@/hooks/use-toast";
import { Crown, Sparkles, TrendingUp, Flame, Clock } from "lucide-react";

interface Game {
  gmid: string;
}

interface UniqueRouletteGameProps {
  game: Game;
}

interface Bet {
  type: string;
  numbers: number[];
  amount: number;
  payout: string;
}

interface JackpotWinner {
  player: string;
  amount: number;
  timestamp: string;
}

const INSIDE_BETS = [
  { type: "straight", label: "Straight Up", payout: "35:1" },
  { type: "split", label: "Split", payout: "17:1" },
  { type: "street", label: "Street", payout: "11:1" },
  { type: "corner", label: "Corner", payout: "8:1" },
  { type: "line", label: "Line", payout: "5:1" },
];

const OUTSIDE_BETS = [
  { id: "red", label: "Red", payout: "1:1", color: "from-red-600 to-red-800" },
  {
    id: "black",
    label: "Black",
    payout: "1:1",
    color: "from-gray-700 to-gray-900",
  },
  {
    id: "even",
    label: "Even",
    payout: "1:1",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "odd",
    label: "Odd",
    payout: "1:1",
    color: "from-purple-600 to-purple-800",
  },
  {
    id: "1-18",
    label: "1-18",
    payout: "1:1",
    color: "from-green-600 to-green-800",
  },
  {
    id: "19-36",
    label: "19-36",
    payout: "1:1",
    color: "from-teal-600 to-teal-800",
  },
  {
    id: "dozen1",
    label: "1st Dozen",
    payout: "2:1",
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "dozen2",
    label: "2nd Dozen",
    payout: "2:1",
    color: "from-violet-600 to-violet-800",
  },
  {
    id: "dozen3",
    label: "3rd Dozen",
    payout: "2:1",
    color: "from-fuchsia-600 to-fuchsia-800",
  },
];

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

const BONUS_FEATURES = [
  {
    title: "Lucky 7 Streak",
    description: "Land on 7 twice in a row = 2x payout multiplier",
    icon: "🎰",
  },
  {
    title: "Triple Zero Bonus",
    description: "Three consecutive 0 = 5x jackpot contribution",
    icon: "💎",
  },
  {
    title: "Color Streak Reward",
    description: "5 same color in a row = 3x next bet multiplier",
    icon: "🌈",
  },
  {
    title: "Perfect Dozen",
    description: "All 12 numbers hit in dozen = Progressive unlock",
    icon: "🎯",
  },
];

const HOT_NUMBERS = [17, 23, 7, 11, 32];
const COLD_NUMBERS = [13, 34, 2, 28, 5];

const JACKPOT_HISTORY: JackpotWinner[] = [
  { player: "Player***8472", amount: 125000, timestamp: "2h ago" },
  { player: "Lucky***2901", amount: 98000, timestamp: "5h ago" },
  { player: "Spin***7453", amount: 187000, timestamp: "1d ago" },
];

export default function UniqueRouletteGame({ game }: UniqueRouletteGameProps) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [progressiveJackpot, setProgressiveJackpot] = useState(847325);
  const [showBonusInfo, setShowBonusInfo] = useState(false);

  const { gameData, resultData } = useCasinoWebSocket(game.gmid);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 25));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const jackpotTimer = setInterval(() => {
      setProgressiveJackpot(
        (prev) => prev + Math.floor(Math.random() * 50) + 10,
      );
    }, 3000);
    return () => clearInterval(jackpotTimer);
  }, []);

  const handleOutsideBet = (betId: string, payout: string) => {
    if (timeRemaining <= 2) {
      toast({
        title: "Betting Closed",
        description: "Wheel is spinning",
        variant: "destructive",
      });
      return;
    }

    const newBet: Bet = {
      type: betId,
      numbers: [], // Would be populated based on bet type
      amount: selectedChip,
      payout,
    };
    setBets([...bets, newBet]);

    casinoBettingService.placeCasinoBet(
      game.gmid,
      gameData?.mid || "",
      "",
      betId,
      selectedChip.toString(),
      selectedChip,
      "0",
      "0",
      "0",
    );

    toast({
      title: "Bet Placed!",
      description: `₹${selectedChip} on ${betId} (${payout})`,
    });
  };

  const simulateSpin = () => {
    setIsSpinning(true);
    const result = Math.floor(Math.random() * 37); // 0-36

    setTimeout(() => {
      setWinningNumber(result);
      setIsSpinning(false);
      setTimeRemaining(25);

      toast({
        title: "Winner!",
        description: `Number ${result} wins!`,
      });
    }, 5000);
  };

  const getTotalStake = () => {
    return bets.reduce((sum, b) => sum + b.amount, 0);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-red-950 to-black p-4">
        <div className="max-w-[1900px] mx-auto">
          {/* Progressive Jackpot Header */}
          <div className="bg-gradient-to-r from-yellow-900/60 via-amber-900/60 to-yellow-900/60 backdrop-blur-md border-4 border-yellow-500/60 rounded-3xl p-6 mb-4 shadow-2xl shadow-yellow-500/30 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-yellow-400 animate-bounce" />
                <div>
                  <div className="text-yellow-300 text-sm uppercase tracking-wide">
                    Progressive Jackpot
                  </div>
                  <div className="text-white font-bold text-5xl">
                    ₹{progressiveJackpot.toLocaleString()}
                  </div>
                  <div className="text-yellow-400 text-xs mt-1">
                    🎯 Land on 7 three times in a row to win!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-yellow-300 text-sm">Spin #</div>
                  <div className="text-white font-mono text-2xl font-bold">
                    {gameData?.mid || "8472"}
                  </div>
                </div>

                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                    timeRemaining <= 5
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400"
                  }`}
                >
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Roulette Wheel & Stats - Left */}
            <div className="lg:col-span-1 space-y-4">
              {/* 3D Wheel Simulation */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-4 border-purple-500/50 rounded-3xl p-6 shadow-2xl">
                <div className="relative">
                  <div
                    className={`w-full aspect-square rounded-full bg-gradient-to-br from-red-800 via-black to-green-800 border-8 border-yellow-500 shadow-2xl flex items-center justify-center ${
                      isSpinning ? "animate-spin" : ""
                    }`}
                    style={{ animationDuration: isSpinning ? "2s" : "0s" }}
                  >
                    {winningNumber !== null && !isSpinning ? (
                      <div className="text-center">
                        <div className="text-white font-bold text-6xl">
                          {winningNumber}
                        </div>
                        <div className="text-yellow-400 text-sm mt-2">
                          WINNER!
                        </div>
                      </div>
                    ) : (
                      <div className="text-white text-4xl">🎰</div>
                    )}
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
                </div>

                <Button
                  onClick={simulateSpin}
                  disabled={isSpinning}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl disabled:opacity-50"
                >
                  {isSpinning ? "🎡 Spinning..." : "🎡 Spin Wheel"}
                </Button>
              </div>

              {/* Heat Map */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Hot & Cold
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-orange-400 text-sm font-semibold mb-2 flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      Hot Numbers
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {HOT_NUMBERS.map((num) => (
                        <div
                          key={num}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-cyan-400 text-sm font-semibold mb-2 flex items-center gap-1">
                      ❄️ Cold Numbers
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {COLD_NUMBERS.map((num) => (
                        <div
                          key={num}
                          className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Jackpot History */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Recent Winners
                </h3>
                <div className="space-y-2">
                  {JACKPOT_HISTORY.map((winner, idx) => (
                    <div
                      key={idx}
                      className="bg-black/40 rounded-lg p-3 border border-yellow-600/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm">
                          {winner.player}
                        </span>
                        <span className="text-yellow-400 text-xs">
                          {winner.timestamp}
                        </span>
                      </div>
                      <div className="text-green-400 font-bold text-lg">
                        +₹{winner.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Betting Grid - Center */}
            <div className="lg:col-span-2">
              {/* Bonus Features Toggle */}
              <div className="mb-4">
                <Button
                  onClick={() => setShowBonusInfo(!showBonusInfo)}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {showBonusInfo ? "Hide" : "Show"} Bonus Features
                </Button>
              </div>

              {showBonusInfo && (
                <div className="bg-gradient-to-br from-pink-900/60 to-purple-900/60 backdrop-blur-md border-2 border-pink-500/40 rounded-2xl p-5 mb-4 shadow-2xl">
                  <h3 className="text-pink-300 font-bold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Special Bonus Rules
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {BONUS_FEATURES.map((feature) => (
                      <div
                        key={feature.title}
                        className="bg-black/40 rounded-xl p-4 border-2 border-pink-500/30"
                      >
                        <div className="text-4xl mb-2">{feature.icon}</div>
                        <div className="text-pink-300 font-bold text-sm mb-1">
                          {feature.title}
                        </div>
                        <div className="text-purple-200 text-xs">
                          {feature.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roulette Betting Grid */}
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-md border-4 border-green-600/50 rounded-3xl p-6 shadow-2xl mb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Zero */}
                  <div className="col-span-3 bg-green-600 rounded-lg p-4 text-center text-white font-bold text-2xl border-2 border-green-400 cursor-pointer hover:bg-green-500">
                    0
                  </div>

                  {/* Numbers 1-36 */}
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
                    const isRed = [
                      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32,
                      34, 36,
                    ].includes(num);
                    return (
                      <div
                        key={num}
                        className={`${
                          isRed
                            ? "bg-red-600 border-red-400"
                            : "bg-gray-900 border-gray-700"
                        } rounded-lg p-3 text-center text-white font-bold text-lg border-2 cursor-pointer hover:scale-110 transform transition-all shadow-lg`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outside Bets */}
              <div className="grid grid-cols-3 gap-3">
                {OUTSIDE_BETS.map((bet) => (
                  <button
                    key={bet.id}
                    onClick={() => handleOutsideBet(bet.id, bet.payout)}
                    disabled={timeRemaining <= 2}
                    className={`bg-gradient-to-br ${bet.color} hover:opacity-90 rounded-xl p-4 shadow-2xl border-2 border-white/30 transform hover:scale-105 transition-all disabled:opacity-50`}
                  >
                    <div className="text-white font-bold text-lg mb-1">
                      {bet.label}
                    </div>
                    <div className="bg-white/20 rounded px-2 py-1 text-white text-sm font-bold">
                      {bet.payout}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Slip & Controls - Right */}
            <div className="lg:col-span-1 space-y-4">
              {/* Bet Slip */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-xl mb-4">
                  Bet Slip
                </h3>
                {bets.length === 0 ? (
                  <div className="text-center py-8 text-purple-300">
                    <div className="text-5xl mb-2">🎰</div>
                    <div className="text-sm">Place your bets</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                    {bets.map((bet, idx) => (
                      <div
                        key={idx}
                        className="bg-black/40 rounded-lg p-3 border border-purple-500/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-semibold text-sm">
                            {bet.type}
                          </span>
                          <span className="text-purple-300 text-xs">
                            {bet.payout}
                          </span>
                        </div>
                        <div className="text-yellow-400 font-bold">
                          ₹{bet.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bets.length > 0 && (
                  <div className="space-y-3 border-t border-purple-500/30 pt-3">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Total Stake</span>
                      <span className="text-yellow-400">
                        ₹{getTotalStake()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => setBets([])}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 text-xs rounded-lg"
                      >
                        Clear
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs rounded-lg">
                        Rebet
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white py-2 text-xs rounded-lg">
                        2x
                      </Button>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-4 text-lg font-bold rounded-xl shadow-2xl">
                      Place Bet
                    </Button>
                  </div>
                )}
              </div>

              {/* Chip Selector */}
              <div className="bg-gradient-to-br from-purple-900/60 to-red-900/60 backdrop-blur-md border-2 border-purple-500/40 rounded-2xl p-5 shadow-2xl">
                <h3 className="text-purple-300 font-bold text-lg mb-4">
                  Chip Value
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={`relative rounded-xl p-4 font-bold text-lg shadow-xl transform hover:scale-105 transition-all border-2 ${
                        selectedChip === value
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white border-yellow-300 scale-105"
                          : "bg-gray-800 text-gray-400 border-gray-700"
                      }`}
                    >
                      ₹{value >= 1000 ? `${value / 1000}K` : value}
                      {selectedChip === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
