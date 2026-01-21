import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { ChevronUp } from "lucide-react";
import type { CasinoGame } from "@/types/casino";

interface MogamboGameProps {
  game: CasinoGame;
}

export function MogamboGame({ game }: MogamboGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const mockResults = [
    { result: "L", color: "bg-red-600" },
    { result: "W", color: "bg-green-600" },
    { result: "L", color: "bg-red-600" },
    { result: "L", color: "bg-red-600" },
    { result: "L", color: "bg-red-600" },
    { result: "L", color: "bg-red-600" },
    { result: "W", color: "bg-green-600" },
    { result: "W", color: "bg-green-600" },
    { result: "W", color: "bg-green-600" },
    { result: "L", color: "bg-red-600" },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        {/* Main Game Area */}
        <div className="bg-[#2c3e50]">
          {/* Header */}
          <div className="bg-[#34495e] px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <ChevronUp className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-300" />
              <h1 className="text-white font-bold text-lg uppercase tracking-wide">
                {game.gname}
              </h1>
              <button className="text-blue-400 text-sm underline hover:text-blue-300">
                Rules
              </button>
            </div>
            <div className="text-white text-sm">
              Round ID:{" "}
              <span className="font-mono">
                {liveData?.roundId || "192260121123710"}
              </span>
            </div>
          </div>

          {/* Total Display */}
          <div className="px-4 py-2">
            <div className="bg-yellow-400 text-black font-bold px-3 py-1 inline-block text-sm">
              TOTAL: 0
            </div>
          </div>

          {/* Card Display Area */}
          <div className="px-4 py-4 space-y-4">
            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                DAGA / TEJA
              </h3>
              <div className="flex gap-3">
                <CardPlaceholder />
                <CardPlaceholder />
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2 text-sm uppercase">
                MOGAMBO
              </h3>
              <div className="flex gap-3">
                <CardPlaceholder />
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="mx-4 mb-4 bg-black border-2 border-gray-600 h-[400px] relative flex items-end justify-end p-6">
            <div className="flex gap-4">
              <div className="w-20 h-24 bg-[#3d5a80] rounded-lg flex items-center justify-center border-2 border-gray-600">
                <span className="text-white text-5xl font-bold">1</span>
              </div>
              <div className="w-20 h-24 bg-[#3d5a80] rounded-lg flex items-center justify-center border-2 border-gray-600">
                <span className="text-white text-5xl font-bold">2</span>
              </div>
            </div>
          </div>

          {/* Betting Options */}
          <div className="px-4 py-4 grid grid-cols-2 gap-3">
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-6 px-4 rounded transition-colors">
              <div className="text-sm font-medium mb-1">Daga / Teja</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[0]?.odds?.toFixed(2) || "1.47"}
              </div>
            </button>
            <button className="bg-[#5dade2] hover:bg-[#4a9fd6] text-white py-6 px-4 rounded transition-colors">
              <div className="text-sm font-medium mb-1">Mogambo</div>
              <div className="text-3xl font-bold">
                {odds?.markets?.[0]?.runners?.[1]?.odds?.toFixed(2) || "2.94"}
              </div>
            </button>
          </div>

          {/* 3 Card Total */}
          <div className="px-4 py-3">
            <div className="bg-[#ecf0f1] rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold text-sm">
                  3 Card Total
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-pink-200 rounded p-3 text-center">
                  <div className="text-3xl font-bold text-gray-800">21</div>
                  <div className="text-xs text-gray-600">100</div>
                </div>
                <div className="bg-blue-200 rounded p-3 text-center">
                  <div className="text-3xl font-bold text-gray-800">21</div>
                  <div className="text-xs text-gray-600">80</div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Results */}
          <div className="px-4 py-4">
            <div className="bg-[#34495e] rounded-t p-3 flex items-center justify-between">
              <span className="text-white font-semibold">Last Result</span>
              <button
                onClick={() => setShowAllResults(!showAllResults)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                View All
              </button>
            </div>
            <div className="bg-[#2c3e50] rounded-b p-4 flex gap-2 overflow-x-auto">
              {mockResults.map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {item.result}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}

function CardPlaceholder() {
  return (
    <div className="w-16 h-24 bg-[#ecf0f1] border-2 border-gray-400 rounded-lg flex items-center justify-center">
      <div className="w-12 h-20 border border-dashed border-gray-400 rounded" />
    </div>
  );
}

function BetSlipSidebar({
  betAmount,
  setBetAmount,
}: {
  betAmount: string;
  setBetAmount: (v: string) => void;
}) {
  return (
    <div className="bg-white border-l border-gray-200">
      <div className="bg-[#34495e] text-white px-4 py-3 font-bold">My Bet</div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-600">
          <div>Matched Bet</div>
          <div className="text-center">Odds</div>
          <div className="text-right">Stake</div>
        </div>
        <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-400 text-sm">No bets placed</p>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Stake Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(String(amount))}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm font-semibold transition-colors"
              >
                {amount}
              </button>
            ))}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold">
            Place Bet
          </Button>
        </div>
      </div>
    </div>
  );
}
