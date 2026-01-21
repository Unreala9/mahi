import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface PlinkoGameProps {
  game: CasinoGame;
}

export function PlinkoGame({ game }: PlinkoGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const multipliers = {
    low: ["1.5", "1.2", "1.1", "1.0", "0.5", "1.0", "1.1", "1.2", "1.5"],
    medium: ["3.0", "1.5", "0.5", "0.3", "0.0", "0.3", "0.5", "1.5", "3.0"],
    high: ["10", "3.0", "0.5", "0.2", "0.0", "0.2", "0.5", "3.0", "10"],
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#2c3e50] to-[#1a252f]">
          <GameHeader game={game} liveData={liveData} />

          {/* Plinko Board */}
          <div className="px-4 py-6">
            <div className="bg-gradient-to-b from-[#34495e] to-[#2c3e50] rounded-lg p-6 border-2 border-yellow-500/30 relative">
              {/* Drop Zone */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>

              {/* Pegs */}
              <div className="relative h-[400px] flex flex-col justify-around">
                {Array(8)
                  .fill(0)
                  .map((_, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-8">
                      {Array(rowIdx + 3)
                        .fill(0)
                        .map((_, pegIdx) => (
                          <div
                            key={pegIdx}
                            className="w-3 h-3 bg-gray-400 rounded-full shadow-lg"
                          ></div>
                        ))}
                    </div>
                  ))}
              </div>

              {/* Ball */}
              {liveData?.status === "active" && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce"></div>
              )}

              {/* Multiplier Zones */}
              <div className="grid grid-cols-9 gap-1 mt-4">
                {multipliers[risk].map((mult, idx) => (
                  <div
                    key={idx}
                    className={`py-3 px-2 rounded text-center font-bold text-white ${
                      parseFloat(mult) >= 3
                        ? "bg-green-600"
                        : parseFloat(mult) >= 1
                          ? "bg-blue-600"
                          : parseFloat(mult) > 0
                            ? "bg-yellow-600"
                            : "bg-red-600"
                    }`}
                  >
                    {mult}x
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-4">
            <div className="bg-[#34495e] rounded-lg p-4 border border-gray-600">
              <div className="mb-4">
                <label className="text-gray-300 text-sm mb-2 block">
                  Risk Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRisk(level)}
                      className={`py-2 px-4 rounded font-semibold ${
                        risk === level
                          ? level === "low"
                            ? "bg-green-600 text-white"
                            : level === "medium"
                              ? "bg-yellow-600 text-white"
                              : "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6 text-lg font-bold rounded-lg">
                Drop Ball
              </Button>
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
