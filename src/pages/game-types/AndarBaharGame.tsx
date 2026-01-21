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

interface AndarBaharGameProps {
  game: CasinoGame;
}

export function AndarBaharGame({ game }: AndarBaharGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Joker Card */}
          <div className="px-4 py-4 text-center">
            <h3 className="text-white font-bold mb-2 text-sm uppercase">
              JOKER
            </h3>
            <div className="flex justify-center">
              <CardPlaceholder />
            </div>
          </div>

          {/* Andar/Bahar Cards */}
          <div className="px-4 py-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase text-center">
                ANDAR
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <CardPlaceholder key={i} />
                  ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase text-center">
                BAHAR
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <CardPlaceholder key={i} />
                  ))}
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Andar</div>
              <div className="text-3xl font-bold">1.90</div>
            </button>
            <button className="bg-[#3498db] hover:bg-[#2980b9] text-white py-6 px-4 rounded">
              <div className="text-sm mb-1">Bahar</div>
              <div className="text-3xl font-bold">2.10</div>
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
