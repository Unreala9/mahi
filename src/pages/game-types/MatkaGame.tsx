import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface MatkaGameProps {
  game: CasinoGame;
}

export function MatkaGame({ game }: MatkaGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  const numbers = Array.from({ length: 10 }, (_, i) => i);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Current Draw */}
          <div className="px-4 py-6 text-center">
            <h3 className="text-white font-bold mb-3 text-lg uppercase">
              CURRENT DRAW
            </h3>
            <div className="flex justify-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <div className="text-gray-900 text-3xl font-bold">
                  {liveData?.result?.split("-")[0] || "?"}
                </div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <div className="text-white text-3xl font-bold">
                  {liveData?.result?.split("-")[1] || "?"}
                </div>
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <div className="text-white text-3xl font-bold">
                  {liveData?.result?.split("-")[2] || "?"}
                </div>
              </div>
            </div>
          </div>

          {/* Number Selection Grid */}
          <div className="px-4 py-4">
            <h3 className="text-white font-bold mb-3 text-sm uppercase">
              SELECT NUMBERS
            </h3>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {numbers.map((num) => (
                <button
                  key={num}
                  className="bg-gradient-to-br from-[#3498db] to-[#2980b9] hover:from-[#2980b9] hover:to-[#21618c] text-white py-6 rounded-lg text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform"
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Betting Types */}
            <div className="grid grid-cols-3 gap-2">
              <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-4 rounded font-bold">
                Single (9.5x)
              </button>
              <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white py-4 rounded font-bold">
                Jodi (90x)
              </button>
              <button className="bg-[#27ae60] hover:bg-[#229954] text-white py-4 rounded font-bold">
                Patti (140x)
              </button>
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
