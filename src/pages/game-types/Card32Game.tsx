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

interface Card32GameProps {
  game: CasinoGame;
}

export function Card32Game({ game }: Card32GameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  const suits = ["♠", "♥", "♦", "♣"];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Drawn Cards */}
          <div className="px-4 py-4">
            <h3 className="text-white font-bold mb-2 text-sm uppercase">
              DRAWN CARDS
            </h3>
            <div className="flex gap-2 flex-wrap mb-6">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <CardPlaceholder key={i} />
                ))}
            </div>
          </div>

          {/* Suit Betting */}
          <div className="px-4 py-4">
            <h3 className="text-white font-bold mb-3 text-sm uppercase">
              BET ON SUIT
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {suits.map((suit, idx) => (
                <button
                  key={suit}
                  className={`${
                    idx % 2 === 0
                      ? "bg-gray-900 hover:bg-gray-800"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white py-8 rounded-lg text-5xl font-bold shadow-lg`}
                >
                  {suit}
                </button>
              ))}
            </div>

            {/* Range Betting */}
            <h3 className="text-white font-bold mb-3 text-sm uppercase">
              BET ON RANGE
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="bg-[#3498db] hover:bg-[#2980b9] text-white py-6 rounded font-bold">
                8-J (3.5x)
              </button>
              <button className="bg-[#f39c12] hover:bg-[#e67e22] text-white py-6 rounded font-bold">
                Q-K (3.5x)
              </button>
              <button className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-6 rounded font-bold">
                A (5x)
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
