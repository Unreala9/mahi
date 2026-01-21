import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Sparkles } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface KenoGameProps {
  game: CasinoGame;
}

export function KenoGame({ game }: KenoGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const maxSelection = 10;
  const totalNumbers = 80;

  const toggleNumber = (num: number) => {
    if (isDrawing) return;

    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      } else if (prev.length < maxSelection) {
        return [...prev, num];
      }
      return prev;
    });
  };

  const startDraw = () => {
    setIsDrawing(true);
    setDrawnNumbers([]);

    // Simulate drawing 20 numbers
    const drawn: number[] = [];
    const drawInterval = setInterval(() => {
      if (drawn.length < 20) {
        let newNum;
        do {
          newNum = Math.floor(Math.random() * totalNumbers) + 1;
        } while (drawn.includes(newNum));
        drawn.push(newNum);
        setDrawnNumbers([...drawn]);
      } else {
        clearInterval(drawInterval);
        setIsDrawing(false);
      }
    }, 200);
  };

  const matches = selectedNumbers.filter((num) =>
    drawnNumbers.includes(num),
  ).length;

  const payoutTable = [
    { matches: 10, payout: "10000x" },
    { matches: 9, payout: "2500x" },
    { matches: 8, payout: "1000x" },
    { matches: 7, payout: "150x" },
    { matches: 6, payout: "50x" },
    { matches: 5, payout: "10x" },
    { matches: 4, payout: "2x" },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e]">
          <GameHeader game={game} liveData={liveData} />

          {/* Keno Board */}
          <div className="px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Stats */}
              <div className="bg-[#1a252f] rounded-lg p-4 mb-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Selected</div>
                  <div className="text-blue-400 text-2xl font-bold">
                    {selectedNumbers.length}/{maxSelection}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Matches</div>
                  <div className="text-green-400 text-2xl font-bold">
                    {matches}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-xs">Drawn</div>
                  <div className="text-yellow-400 text-2xl font-bold">
                    {drawnNumbers.length}/20
                  </div>
                </div>
              </div>

              {/* Number Grid */}
              <div className="bg-[#1a252f] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: totalNumbers }, (_, i) => i + 1).map(
                    (num) => {
                      const isSelected = selectedNumbers.includes(num);
                      const isDrawn = drawnNumbers.includes(num);
                      const isMatch = isSelected && isDrawn;

                      return (
                        <button
                          key={num}
                          onClick={() => toggleNumber(num)}
                          disabled={isDrawing}
                          className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                            isMatch
                              ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-green-300 animate-pulse"
                              : isSelected
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-2 border-blue-300"
                                : isDrawn
                                  ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-2 border-yellow-300"
                                  : "bg-[#34495e] text-gray-300 hover:bg-[#3f5a71] border border-gray-600"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="bg-[#1a252f] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Bet Amount
                    </label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="100"
                      disabled={isDrawing}
                      className="w-full px-4 py-3 bg-[#2c3e50] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => setSelectedNumbers([])}
                      disabled={isDrawing}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={startDraw}
                  disabled={isDrawing || selectedNumbers.length === 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6 text-lg font-bold"
                >
                  {isDrawing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Drawing Numbers...
                    </>
                  ) : (
                    "Start Draw"
                  )}
                </Button>
              </div>

              {/* Payout Table */}
              <div className="bg-[#1a252f] rounded-lg p-4">
                <h3 className="text-yellow-400 font-bold mb-3 text-center">
                  PAYOUT TABLE
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {payoutTable.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`rounded p-3 text-center ${
                        matches === entry.matches
                          ? "bg-gradient-to-br from-green-600 to-green-700 border-2 border-green-400"
                          : "bg-[#2c3e50]"
                      }`}
                    >
                      <div className="text-white font-bold text-lg">
                        {entry.matches} Hits
                      </div>
                      <div className="text-yellow-400 font-bold text-xl">
                        {entry.payout}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
