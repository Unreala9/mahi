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

interface PokerGameProps {
  game: CasinoGame;
}

export function PokerGame({ game }: PokerGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Community Cards */}
          <div className="px-4 py-4">
            <h3 className="text-white font-bold mb-2 text-sm uppercase">
              COMMUNITY CARDS
            </h3>
            <div className="flex gap-2 justify-center mb-6">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <CardPlaceholder key={i} />
                ))}
            </div>
          </div>

          {/* Player and Dealer Hands */}
          <div className="px-4 py-4 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                PLAYER HAND
              </h3>
              <div className="flex gap-2">
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
              <div className="mt-2 text-yellow-400 text-xs font-semibold">
                High Card
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                DEALER HAND
              </h3>
              <div className="flex gap-2">
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
              <div className="mt-2 text-yellow-400 text-xs font-semibold">
                Pair
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-4 gap-2">
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-4 px-2 rounded text-sm font-bold">
              Call
            </button>
            <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white py-4 px-2 rounded text-sm font-bold">
              Raise
            </button>
            <button className="bg-[#27ae60] hover:bg-[#229954] text-white py-4 px-2 rounded text-sm font-bold">
              Check
            </button>
            <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-4 px-2 rounded text-sm font-bold">
              Fold
            </button>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
