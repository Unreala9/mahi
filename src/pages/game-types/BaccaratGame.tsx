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

interface BaccaratGameProps {
  game: CasinoGame;
}

export function BaccaratGame({ game }: BaccaratGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Player and Banker Cards */}
          <div className="px-4 py-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                PLAYER
              </h3>
              <div className="flex gap-2 mb-2">
                <CardPlaceholder />
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
              <div className="text-white text-xl font-bold">Total: 7</div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                BANKER
              </h3>
              <div className="flex gap-2 mb-2">
                <CardPlaceholder />
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
              <div className="text-white text-xl font-bold">Total: 5</div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="mx-4 mb-4 bg-black border-2 border-gray-600 h-[300px]" />

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-3 gap-3">
            <button className="bg-[#3498db] hover:bg-[#2980b9] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Player</div>
              <div className="text-3xl font-bold">1.95</div>
            </button>
            <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Tie</div>
              <div className="text-3xl font-bold">8.00</div>
            </button>
            <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Banker</div>
              <div className="text-3xl font-bold">1.90</div>
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
