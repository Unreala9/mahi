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

interface DragonTigerGameProps {
  game: CasinoGame;
}

export function DragonTigerGame({ game }: DragonTigerGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Cards */}
          <div className="px-4 py-4 flex justify-around items-center">
            <div className="text-center">
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                DRAGON
              </h3>
              <CardPlaceholder />
            </div>
            <div className="text-white text-4xl font-bold">VS</div>
            <div className="text-center">
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                TIGER
              </h3>
              <CardPlaceholder />
            </div>
          </div>

          {/* Game Canvas */}
          <div className="mx-4 mb-4 bg-black border-2 border-gray-600 h-[350px]" />

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-3 gap-3">
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Dragon</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[0]?.odds?.toFixed(2) || "1.98"}
              </div>
            </button>
            <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Tie</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[1]?.odds?.toFixed(2) || "11.00"}
              </div>
            </button>
            <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Tiger</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[2]?.odds?.toFixed(2) || "1.98"}
              </div>
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
