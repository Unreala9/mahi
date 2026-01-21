import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface CricketGameProps {
  game: CasinoGame;
}

export function CricketGame({ game }: CricketGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const { data: liveData } = useCasinoLive(game.gmid);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Cricket Pitch */}
          <div className="px-4 py-6 bg-gradient-to-b from-green-700 to-green-800 mx-4 rounded-lg border-4 border-white shadow-lg">
            <div className="text-center mb-4">
              <h3 className="text-white font-bold text-2xl uppercase">
                Over {liveData?.over || "1"}
              </h3>
              <div className="text-yellow-400 text-5xl font-bold my-4">
                {liveData?.runs || "0"} / {liveData?.wickets || "0"}
              </div>
            </div>

            {/* Last 6 Balls */}
            <div className="flex justify-center gap-2 mb-4">
              {["4", "6", "0", "1", "W", "2"].map((ball, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    ball === "W"
                      ? "bg-red-600"
                      : ball === "6"
                        ? "bg-purple-600"
                        : ball === "4"
                          ? "bg-blue-600"
                          : "bg-gray-700"
                  }`}
                >
                  {ball}
                </div>
              ))}
            </div>
          </div>

          {/* Betting Options */}
          <div className="px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-6 rounded-lg font-bold shadow-lg">
                <div className="text-sm mb-1">Even Run</div>
                <div className="text-3xl">1.98</div>
              </button>
              <button className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-6 rounded-lg font-bold shadow-lg">
                <div className="text-sm mb-1">Odd Run</div>
                <div className="text-3xl">1.98</div>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3, 4, 6].map((run) => (
                <button
                  key={run}
                  className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-4 rounded-lg font-bold text-xl shadow-lg"
                >
                  {run}
                </button>
              ))}
              <button className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-4 rounded-lg font-bold text-xl shadow-lg col-span-2">
                Wicket
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
