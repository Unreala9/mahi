import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  CardPlaceholder,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface GenericCardGameProps {
  game: CasinoGame;
}

export function GenericCardGame({ game }: GenericCardGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Game Display Area */}
          <div className="px-4 py-4">
            <div className="bg-gradient-to-br from-[#34495e] to-[#2c3e50] rounded-lg p-4 border-2 border-gray-600 shadow-lg">
              <div className="text-center mb-4">
                <h2 className="text-white text-xl font-bold mb-1">
                  {game.gname}
                </h2>
                <div className="text-gray-400 text-xs">
                  Round ID: {liveData?.roundId || "Waiting..."}
                </div>
              </div>

              {/* Cards */}
              <div className="flex justify-center gap-3 mb-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <CardPlaceholder key={i} />
                  ))}
              </div>

              {/* Result Display */}
              <div className="bg-black rounded-lg p-4 border border-gray-700">
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-1">RESULT</div>
                  <div className="text-white text-4xl font-bold">
                    {liveData?.result || "?"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generic Betting Options */}
          <div className="px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-lg font-bold shadow-lg">
                <div className="text-xs mb-1">Option A</div>
                <div className="text-2xl">1.95</div>
              </button>
              <button className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-4 rounded-lg font-bold shadow-lg">
                <div className="text-xs mb-1">Option B</div>
                <div className="text-2xl">1.95</div>
              </button>
            </div>
            <button className="w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-4 rounded-lg font-bold shadow-lg">
              <div className="text-xs mb-1">Bonus Bet</div>
              <div className="text-2xl">5.00</div>
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
