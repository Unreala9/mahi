import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { ChevronUp } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  CardPlaceholder,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface TeenpattiGameProps {
  game: CasinoGame;
}

export function TeenpattiGame({ game }: TeenpattiGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Cards Display */}
          <div className="px-4 py-4 space-y-4">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                PLAYER A
              </h3>
              <div className="flex gap-2">
                <CardPlaceholder />
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                PLAYER B
              </h3>
              <div className="flex gap-2">
                <CardPlaceholder />
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="mx-4 mb-4 bg-black border-2 border-gray-600 h-[350px]" />

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-6 px-4 rounded">
              <div className="text-sm font-medium mb-1">Player A</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[0]?.odds?.toFixed(2) || "1.98"}
              </div>
            </button>
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-6 px-4 rounded">
              <div className="text-sm font-medium mb-1">Player B</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[1]?.odds?.toFixed(2) || "1.98"}
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
