/**
 * Roulette Game Layout - For Golden Roulette, Tornaldo Roulette, Mini Roulette
 * Features: Wheel display, number grid, bet chips, hot/cold numbers
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flame, Snowflake, History, DollarSign } from "lucide-react";
import type { CasinoLiveData } from "@/services/casinoRealTimeService";

interface RouletteGameLayoutProps {
  gameInfo: { name: string; category: string; description: string };
  liveData: CasinoLiveData | null;
  results: any;
  onPlaceBet: (
    sid: number,
    nat: string,
    odds: number,
    type: "back" | "lay",
    stake: number,
  ) => Promise<void>;
}

export function RouletteGameLayout({
  gameInfo,
  liveData,
  results,
  onPlaceBet,
}: RouletteGameLayoutProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [chipValue, setChipValue] = useState(100);
  const [placing, setPlacing] = useState(false);

  const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36
  const redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  const blackNumbers = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];

  const getNumberColor = (num: number) => {
    if (num === 0) return "green";
    if (redNumbers.includes(num)) return "red";
    return "black";
  };

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const handlePlaceBet = async () => {
    if (selectedNumbers.length === 0) return;
    setPlacing(true);
    try {
      // Place bet logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSelectedNumbers([]);
    } finally {
      setPlacing(false);
    }
  };

  const lastResults = results?.lastresult || [];
  const hotNumbers = [7, 17, 23, 32]; // Mock data
  const coldNumbers = [2, 11, 19, 28]; // Mock data

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Main Game Area - 3 columns */}
      <div className="xl:col-span-3 space-y-4">
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-900 via-amber-900 to-yellow-900 border-0">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {gameInfo.name}
                </h1>
                <p className="text-amber-100">{gameInfo.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-200">Round</p>
                <p className="text-2xl font-bold text-white">
                  #{liveData?.mid || "..."}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Wheel Display */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <div className="p-8">
            <div className="relative">
              {/* Wheel */}
              <div className="w-80 h-80 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 shadow-2xl animate-spin-slow">
                  {/* Wheel segments */}
                  <div className="absolute inset-4 rounded-full bg-slate-900"></div>
                  <div className="absolute inset-8 rounded-full border-8 border-amber-500/30"></div>
                </div>

                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 shadow-2xl flex items-center justify-center">
                    {liveData?.gstatus === "1" ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white animate-pulse">
                          ?
                        </div>
                        <p className="text-xs text-white">Spinning...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white">
                          {lastResults[0] || 0}
                        </div>
                        <p className="text-xs text-white">Last Win</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ball */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-white shadow-lg"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Card className="bg-slate-800 border-slate-700">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-red-500" />
                      <p className="font-bold text-white">Hot Numbers</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {hotNumbers.map((num) => (
                        <Badge
                          key={num}
                          className="bg-red-600 text-white text-lg px-3 py-1"
                        >
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Snowflake className="w-5 h-5 text-blue-500" />
                      <p className="font-bold text-white">Cold Numbers</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {coldNumbers.map((num) => (
                        <Badge
                          key={num}
                          className="bg-blue-600 text-white text-lg px-3 py-1"
                        >
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Number Grid */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h3 className="font-bold text-white mb-4">Select Numbers</h3>

            {/* 0 */}
            <div className="mb-4">
              <Button
                size="lg"
                className={cn(
                  "w-full h-16 text-2xl font-bold",
                  selectedNumbers.includes(0)
                    ? "bg-green-700 ring-4 ring-yellow-500"
                    : "bg-green-600 hover:bg-green-700",
                )}
                onClick={() => toggleNumber(0)}
              >
                0
              </Button>
            </div>

            {/* 1-36 Grid */}
            <div className="grid grid-cols-12 gap-2">
              {numbers.slice(1).map((num) => (
                <Button
                  key={num}
                  className={cn(
                    "h-14 text-lg font-bold transition-all",
                    getNumberColor(num) === "red" &&
                      "bg-red-600 hover:bg-red-700",
                    getNumberColor(num) === "black" &&
                      "bg-slate-900 hover:bg-slate-800 border border-slate-600",
                    selectedNumbers.includes(num) &&
                      "ring-4 ring-yellow-500 scale-110",
                  )}
                  onClick={() => toggleNumber(num)}
                >
                  {num}
                </Button>
              ))}
            </div>

            {/* Outside Bets */}
            <div className="grid grid-cols-6 gap-2 mt-4">
              <Button className="col-span-2 bg-red-600 hover:bg-red-700 h-12">
                Red
              </Button>
              <Button className="col-span-2 bg-slate-900 hover:bg-slate-800 border border-slate-600 h-12">
                Black
              </Button>
              <Button className="col-span-2 bg-blue-600 hover:bg-blue-700 h-12">
                Even
              </Button>
              <Button className="col-span-2 bg-purple-600 hover:bg-purple-700 h-12">
                Odd
              </Button>
              <Button className="col-span-2 bg-green-600 hover:bg-green-700 h-12">
                1-18
              </Button>
              <Button className="col-span-2 bg-orange-600 hover:bg-orange-700 h-12">
                19-36
              </Button>
            </div>
          </div>
        </Card>

        {/* History */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Last Results</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {lastResults.slice(0, 15).map((num: number, idx: number) => {
                const color = getNumberColor(num);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg",
                      color === "red" && "bg-red-600",
                      color === "black" &&
                        "bg-slate-900 border-2 border-slate-600",
                      color === "green" && "bg-green-600",
                    )}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Bet Sidebar - 1 column */}
      <div className="xl:col-span-1">
        <Card className="bg-slate-800 border-slate-700 sticky top-4">
          <div className="p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white">Your Bets</h3>

            {/* Chip Selector */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Chip Value
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[100, 500, 1000, 5000].map((value) => (
                  <Button
                    key={value}
                    variant={chipValue === value ? "default" : "outline"}
                    onClick={() => setChipValue(value)}
                    className={cn(
                      chipValue === value &&
                        "bg-yellow-600 hover:bg-yellow-700",
                    )}
                  >
                    ₹{value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Numbers */}
            <Card className="bg-slate-700 border-slate-600">
              <div className="p-4">
                <p className="text-sm text-slate-400 mb-2">Selected Numbers</p>
                {selectedNumbers.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {selectedNumbers.map((num) => (
                      <Badge
                        key={num}
                        className="bg-blue-600 text-lg px-3 py-1"
                      >
                        {num}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No numbers selected
                  </p>
                )}
              </div>
            </Card>

            {/* Bet Summary */}
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-600">
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Total Bet:</span>
                  <span className="font-bold text-green-400">
                    ₹{(selectedNumbers.length * chipValue).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Possible Win:</span>
                  <span className="font-bold text-green-400">
                    ₹{(selectedNumbers.length * chipValue * 36).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Place Bet */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xl h-16"
              onClick={handlePlaceBet}
              disabled={placing || selectedNumbers.length === 0}
            >
              {placing ? (
                "Placing..."
              ) : (
                <>
                  <DollarSign className="w-6 h-6 mr-2" />
                  Place Bet
                </>
              )}
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-slate-600"
                onClick={() => setSelectedNumbers([])}
              >
                Clear All
              </Button>
              <Button variant="outline" className="w-full border-slate-600">
                Repeat Last Bet
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
