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

interface Lucky7GameProps {
  game: CasinoGame;
}

export function Lucky7Game({ game }: Lucky7GameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Lucky 7 Wheel */}
          <div className="px-4 py-6 flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border-8 border-yellow-500 bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center shadow-2xl">
                <div className="text-white text-9xl font-bold drop-shadow-lg">
                  7
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-yellow-300"></div>
            </div>
          </div>

          {/* Drawn Card */}
          <div className="px-4 py-4 text-center">
            <h3 className="text-white font-bold mb-2 text-sm uppercase">
              DRAWN CARD
            </h3>
            <div className="flex justify-center mb-4">
              <CardPlaceholder />
            </div>
          </div>

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-3 gap-3">
            <button className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-8 px-4 rounded-lg shadow-lg">
              <div className="text-lg mb-1 font-semibold">Below 7</div>
              <div className="text-4xl font-bold">1.98</div>
            </button>
            <button className="bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white py-8 px-4 rounded-lg shadow-lg">
              <div className="text-lg mb-1 font-semibold">Lucky 7</div>
              <div className="text-4xl font-bold">11.0</div>
            </button>
            <button className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-8 px-4 rounded-lg shadow-lg">
              <div className="text-lg mb-1 font-semibold">Above 7</div>
              <div className="text-4xl font-bold">1.98</div>
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
