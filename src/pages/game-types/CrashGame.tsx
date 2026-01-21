import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { TrendingUp, DollarSign } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface CrashGameProps {
  game: CasinoGame;
}

export function CrashGame({ game }: CrashGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [cashOutAt, setCashOutAt] = useState("2.00");
  const [autoCashOut, setAutoCashOut] = useState(false);
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const currentMultiplier = liveData?.result || "1.00";
  const isPlaying = liveData?.status === "active";

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
          <GameHeader game={game} liveData={liveData} />

          {/* Crash Graph */}
          <div className="px-4 py-6">
            <div className="bg-black rounded-lg p-6 border-2 border-blue-500/30 relative overflow-hidden">
              {/* Multiplier Display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div
                  className={`text-8xl font-bold transition-all duration-300 ${
                    isPlaying ? "text-green-400 animate-pulse" : "text-gray-500"
                  }`}
                >
                  {currentMultiplier}x
                </div>
                <div className="text-center text-gray-400 text-sm mt-2">
                  {isPlaying ? "In Flight..." : "Waiting for next round"}
                </div>
              </div>

              {/* Graph Canvas */}
              <div className="h-[400px] relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20">
                  {Array(100)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="border border-blue-500/20"></div>
                    ))}
                </div>

                {/* Trend Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  {isPlaying && (
                    <polyline
                      points="0,400 100,300 200,200 300,150 400,100"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="4"
                      className="animate-pulse"
                    />
                  )}
                </svg>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                <div
                  className={`w-3 h-3 rounded-full ${isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
                ></div>
                <span className="text-white text-sm font-semibold">
                  {isPlaying ? "FLYING" : "PREPARING"}
                </span>
              </div>
            </div>
          </div>

          {/* Betting Controls */}
          <div className="px-4 py-4">
            <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Bet Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="100"
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1f2e] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">
                    Auto Cash Out At
                  </label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={cashOutAt}
                      onChange={(e) => setCashOutAt(e.target.value)}
                      placeholder="2.00"
                      step="0.1"
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1f2e] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCashOut}
                    onChange={(e) => setAutoCashOut(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300 text-sm">Auto Cash Out</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-bold rounded-lg shadow-lg"
                  disabled={isPlaying}
                >
                  {isPlaying ? "In Flight" : "Place Bet"}
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-6 text-lg font-bold rounded-lg shadow-lg"
                  disabled={!isPlaying}
                >
                  Cash Out
                </Button>
              </div>
            </div>
          </div>

          {/* Live Bets Table */}
          <div className="px-4 py-4">
            <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-bold mb-3">LIVE BETS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 py-2 px-2">
                        Player
                      </th>
                      <th className="text-right text-gray-400 py-2 px-2">
                        Bet
                      </th>
                      <th className="text-right text-gray-400 py-2 px-2">
                        @ Multiplier
                      </th>
                      <th className="text-right text-gray-400 py-2 px-2">
                        Win
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="text-white py-2 px-2">Player1</td>
                      <td className="text-right text-white py-2 px-2">₹100</td>
                      <td className="text-right text-green-400 py-2 px-2">
                        2.5x
                      </td>
                      <td className="text-right text-green-400 py-2 px-2">
                        ₹250
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
