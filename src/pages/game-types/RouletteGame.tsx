import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface RouletteGameProps {
  game: CasinoGame;
}

export function RouletteGame({ game }: RouletteGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  const rouletteNumbers = [
    { num: 0, color: "bg-green-600" },
    ...Array.from({ length: 36 }, (_, i) => ({
      num: i + 1,
      color: [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
      ].includes(i + 1)
        ? "bg-red-600"
        : "bg-gray-900",
    })),
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Roulette Wheel */}
          <div className="px-4 py-6 flex justify-center">
            <div className="w-64 h-64 rounded-full border-8 border-amber-700 bg-gradient-to-br from-amber-900 to-amber-700 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-4 border-white bg-gray-900 flex items-center justify-center">
                <div className="text-white text-4xl font-bold">
                  {liveData?.result || "?"}
                </div>
              </div>
            </div>
          </div>

          {/* Betting Grid */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button className="bg-red-600 hover:bg-red-700 text-white py-4 rounded font-bold">
                RED (1.98)
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 text-white py-4 rounded font-bold">
                BLACK (1.98)
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white py-4 rounded font-bold">
                0 (35x)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="bg-[#3498db] hover:bg-[#2980b9] text-white py-4 rounded font-bold">
                EVEN (1.98)
              </button>
              <button className="bg-[#9b59b6] hover:bg-[#8e44ad] text-white py-4 rounded font-bold">
                ODD (1.98)
              </button>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {rouletteNumbers.map(({ num, color }) => (
                <button
                  key={num}
                  className={`${color} hover:opacity-80 text-white py-3 rounded text-sm font-bold`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
