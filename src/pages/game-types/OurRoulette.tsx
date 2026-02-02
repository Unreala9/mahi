import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const BETTING_GRID = {
  inside: [
    { number: 3, type: "straight" },
    { number: 6, type: "straight" },
    { number: 9, type: "straight" },
    { number: 12, type: "straight" },
    { number: 15, type: "straight" },
    { number: 18, type: "straight" },
    { number: 21, type: "straight" },
    { number: 24, type: "straight" },
    { number: 27, type: "straight" },
    { number: 30, type: "straight" },
    { number: 33, type: "straight" },
    { number: 36, type: "straight" },
  ],
  outside: [
    { name: "1-18", odds: "1:1", color: "blue" },
    { name: "EVEN", odds: "1:1", color: "blue" },
    { name: "RED", odds: "1:1", color: "red" },
    { name: "BLACK", odds: "1:1", color: "black" },
    { name: "ODD", odds: "1:1", color: "blue" },
    { name: "19-36", odds: "1:1", color: "blue" },
  ],
};

const WINNING_HISTORY = [
  { number: 17, color: "black", isHot: false },
  { number: 23, color: "red", isHot: true },
  { number: 7, color: "red", isHot: false },
  { number: 32, color: "red", isHot: true },
  { number: 15, color: "black", isHot: false },
  { number: 19, color: "red", isHot: false },
  { number: 4, color: "black", isHot: true },
  { number: 21, color: "red", isHot: false },
  { number: 2, color: "black", isHot: false },
  { number: 25, color: "red", isHot: true },
  { number: 17, color: "black", isHot: true },
  { number: 34, color: "red", isHot: false },
  { number: 6, color: "black", isHot: false },
  { number: 27, color: "red", isHot: true },
  { number: 13, color: "black", isHot: false },
  { number: 36, color: "red", isHot: true },
  { number: 11, color: "black", isHot: false },
  { number: 30, color: "red", isHot: false },
  { number: 8, color: "black", isHot: false },
  { number: 23, color: "red", isHot: true },
];

const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

export default function OurRoulette() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedChip, setSelectedChip] = useState(100);
  const [totalStake, setTotalStake] = useState(0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [placedBets, setPlacedBets] = useState<any[]>([]);

  const redCount = WINNING_HISTORY.filter((h) => h.color === "red").length;
  const blackCount = WINNING_HISTORY.filter((h) => h.color === "black").length;
  const evenCount = WINNING_HISTORY.filter((h) => h.number % 2 === 0).length;
  const oddCount = WINNING_HISTORY.filter((h) => h.number % 2 !== 0).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsSpinning(true);
          setTimeout(() => setIsSpinning(false), 5000);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBet = (betType: string, odds: number) => {
    const newBet = { type: betType, amount: selectedChip, odds };
    setPlacedBets([...placedBets, newBet]);
    setTotalStake(totalStake + selectedChip);
    setPotentialWin(potentialWin + selectedChip * odds);
  };

  const handleClearBets = () => {
    setPlacedBets([]);
    setTotalStake(0);
    setPotentialWin(0);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-purple-600/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino-lobby")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex-1 max-w-xl mx-4">
                <div className="bg-gray-800 rounded-full h-3 overflow-hidden border border-purple-500/30">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-1000"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-1">
                  Betting closes in {countdown}s
                </p>
              </div>
              <Badge className="bg-green-600 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - 3D Wheel */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gray-800/50 border-purple-600/20 p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 rounded-full flex items-center justify-center relative overflow-hidden border-4 border-yellow-600/30 shadow-2xl shadow-purple-600/20">
                  {/* Decorative wheel segments */}
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#dc2626,#000000,#dc2626,#000000,#dc2626,#000000,#dc2626,#000000,#dc2626,#000000)]"></div>
                  <div
                    className={cn(
                      "absolute inset-4 rounded-full bg-gray-900 border-2 border-yellow-500 flex items-center justify-center transition-transform duration-5000",
                      isSpinning && "animate-spin"
                    )}
                  >
                    <div className="text-center">
                      <p className="text-6xl font-bold text-yellow-500">17</p>
                      <p className="text-sm text-gray-400 mt-2">Last Number</p>
                    </div>
                  </div>
                  {/* Ball indicator */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse"></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-gray-900/50 rounded p-3 border border-red-600/30">
                    <p className="text-red-500 text-xs mb-1">Red</p>
                    <p className="text-white font-bold">{((redCount / 20) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-gray-600/30">
                    <p className="text-gray-400 text-xs mb-1">Black</p>
                    <p className="text-white font-bold">{((blackCount / 20) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-blue-600/30">
                    <p className="text-blue-500 text-xs mb-1">Even</p>
                    <p className="text-white font-bold">{((evenCount / 20) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-3 border border-purple-600/30">
                    <p className="text-purple-500 text-xs mb-1">Odd</p>
                    <p className="text-white font-bold">{((oddCount / 20) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </Card>

              {/* History Strip */}
              <Card className="bg-gray-800/50 border-purple-600/20 p-4">
                <h3 className="text-purple-400 font-bold mb-3 flex items-center justify-between">
                  <span>Last 20 Numbers</span>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-red-500" />
                    <span className="text-gray-400">Hot</span>
                  </div>
                </h3>
                <div className="grid grid-cols-10 gap-1">
                  {WINNING_HISTORY.map((result, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "aspect-square rounded flex items-center justify-center text-xs font-bold relative",
                        result.color === "red"
                          ? "bg-red-600 text-white"
                          : "bg-gray-900 text-white border border-gray-700",
                        result.isHot && "ring-2 ring-yellow-500"
                      )}
                    >
                      {result.number}
                      {result.isHot && (
                        <TrendingUp className="w-2 h-2 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right - Betting Grid */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-purple-600/20 p-6">
                <h3 className="text-purple-400 font-bold mb-4">Betting Table</h3>

                {/* Betting Grid */}
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/20 mb-6">
                  {/* Numbers Grid */}
                  <div className="grid grid-cols-12 gap-1 mb-4">
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePlaceBet(`Number ${num}`, 35)}
                        className={cn(
                          "aspect-square rounded flex items-center justify-center font-bold text-sm transition-all hover:scale-105 border-2",
                          [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num)
                            ? "bg-red-700 hover:bg-red-600 border-red-500 text-white"
                            : "bg-gray-900 hover:bg-gray-800 border-gray-700 text-white"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Outside Bets */}
                  <div className="grid grid-cols-6 gap-2">
                    {BETTING_GRID.outside.map((bet, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlaceBet(bet.name, 2)}
                        className={cn(
                          "p-3 rounded font-bold text-sm transition-all hover:scale-105 border-2",
                          bet.color === "red"
                            ? "bg-red-700 hover:bg-red-600 border-red-500 text-white"
                            : bet.color === "black"
                            ? "bg-gray-900 hover:bg-gray-800 border-gray-700 text-white"
                            : "bg-blue-700 hover:bg-blue-600 border-blue-500 text-white"
                        )}
                      >
                        <div>{bet.name}</div>
                        <div className="text-xs opacity-75">{bet.odds}</div>
                      </button>
                    ))}
                  </div>

                  {/* Dozens & Columns */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button
                      onClick={() => handlePlaceBet("1st 12", 3)}
                      className="p-3 rounded font-bold bg-purple-700 hover:bg-purple-600 border-2 border-purple-500 text-white"
                    >
                      1st 12 (2:1)
                    </button>
                    <button
                      onClick={() => handlePlaceBet("2nd 12", 3)}
                      className="p-3 rounded font-bold bg-purple-700 hover:bg-purple-600 border-2 border-purple-500 text-white"
                    >
                      2nd 12 (2:1)
                    </button>
                    <button
                      onClick={() => handlePlaceBet("3rd 12", 3)}
                      className="p-3 rounded font-bold bg-purple-700 hover:bg-purple-600 border-2 border-purple-500 text-white"
                    >
                      3rd 12 (2:1)
                    </button>
                  </div>
                </div>

                {/* Chip Selector */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-gray-400 text-sm mr-2">Select Chip:</span>
                  {CHIP_VALUES.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedChip(value)}
                      className={cn(
                        "w-14 h-14 rounded-full font-bold text-sm border-4 transition-all hover:scale-110",
                        selectedChip === value
                          ? "bg-yellow-600 border-yellow-400 text-white ring-2 ring-yellow-300"
                          : "bg-gray-700 border-gray-600 text-gray-300"
                      )}
                    >
                      ₹{value}
                    </button>
                  ))}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button variant="outline" onClick={handleClearBets} className="border-red-600 text-red-500">
                    Clear
                  </Button>
                  <Button variant="outline" className="border-blue-600 text-blue-500">
                    Undo
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-500">
                    Rebet
                  </Button>
                  <Button variant="outline" className="border-purple-600 text-purple-500">
                    Double
                  </Button>
                </div>

                {/* Bet Summary */}
                <Card className="bg-gray-900/50 border-purple-600/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-xs">Total Stake</p>
                      <p className="text-white font-bold text-xl">₹{totalStake}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Potential Win</p>
                      <p className="text-green-500 font-bold text-xl">₹{potentialWin}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold text-lg py-6"
                    disabled={totalStake === 0 || isSpinning}
                  >
                    {isSpinning ? "🎰 Spinning..." : "🎲 PLACE BET & SPIN"}
                  </Button>
                </Card>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
