import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";
import { BettingChipSelector } from "@/components/casino/BettingChip";
import { cn } from "@/lib/utils";

interface MatkaGameProps {
  game: CasinoGame;
}

export function MatkaGame({ game }: MatkaGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [selectedChip, setSelectedChip] = useState(100);
  const [activeBetType, setActiveBetType] = useState<
    "jodi" | "single" | "pana" | "sp" | "dp" | "trio" | "cycle" | "motor"
  >("single");
  const { data: liveData } = useCasinoLive(game.gmid);

  const numbers = Array.from({ length: 10 }, (_, i) => i);

  // Market timing tabs
  const markets = [
    { name: "RIGA CLOSE", time: "00:35:24", status: "active" },
    { name: "ASIA OPEN", time: "01:35:24", status: "upcoming" },
    { name: "ASIA CLOSE", time: "02:35:24", status: "upcoming" },
    { name: "TAJ OPEN", time: "03:35:24", status: "upcoming" },
    { name: "TAJ CLOSE", time: "04:35:24", status: "upcoming" },
    { name: "GULF OPEN", time: "05:35:24", status: "upcoming" },
    { name: "GULF CLOSE", time: "06:35:24", status: "upcoming" },
    { name: "DIAMOND", time: "07:30:24", status: "upcoming" },
  ];

  const betTypes = [
    {
      id: "jodi",
      label: "Jodi",
      multiplier: "90x",
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "single",
      label: "Single",
      multiplier: "9.5x",
      color: "from-red-500 to-red-700",
    },
    {
      id: "pana",
      label: "Pana",
      multiplier: "140x",
      color: "from-green-500 to-green-700",
    },
    {
      id: "sp",
      label: "SP",
      multiplier: "150x",
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "dp",
      label: "DP",
      multiplier: "200x",
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "trio",
      label: "Trio",
      multiplier: "600x",
      color: "from-pink-500 to-pink-700",
    },
    {
      id: "cycle",
      label: "Cycle",
      multiplier: "3x",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      id: "motor",
      label: "Motor SP",
      multiplier: "125x",
      color: "from-indigo-500 to-indigo-700",
    },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900">
          <GameHeader game={game} liveData={liveData} />

          {/* Market Timing Tabs */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {markets.map((market) => (
                <button
                  key={market.name}
                  className={cn(
                    "flex-shrink-0 px-4 py-3 rounded-lg transition-all",
                    "border-2",
                    market.status === "active"
                      ? "bg-gradient-to-br from-green-600 to-green-700 border-green-400 text-white shadow-lg"
                      : "bg-slate-800/50 border-slate-600 text-gray-400 hover:bg-slate-700/50",
                  )}
                >
                  <div className="text-sm font-bold">{market.name}</div>
                  <div className="text-xs font-mono mt-1 flex items-center gap-1">
                    {market.status === "active" && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                    {market.time}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Draw Display */}
          <div className="px-6 py-6 text-center bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700">
            <h3 className="text-white font-bold mb-4 text-lg uppercase tracking-wide">
              Current Draw - RIGA CLOSE
            </h3>
            <div className="flex justify-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <div className="text-gray-900 text-4xl font-bold">
                  {liveData?.result?.split("-")[0] || "?"}
                </div>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <div className="text-white text-4xl font-bold">
                  {liveData?.result?.split("-")[1] || "?"}
                </div>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                <div className="text-white text-4xl font-bold">
                  {liveData?.result?.split("-")[2] || "?"}
                </div>
              </div>
            </div>
          </div>

          {/* Chip Selector */}
          <div className="px-6 py-4 bg-slate-800/30">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold text-sm uppercase">
                Set Your Coin Amount and Start 1-Click Bet!
              </label>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-bold transition-colors">
                Reset
              </button>
            </div>
            <BettingChipSelector
              selectedAmount={selectedChip}
              onAmountChange={setSelectedChip}
              amounts={[0, 25, 50, 100, 200, 500, 1000]}
            />
          </div>

          {/* Bet Type Tabs */}
          <div className="px-6 py-3 border-y border-slate-700">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {betTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveBetType(type.id as any)}
                  className={cn(
                    "flex-shrink-0 px-6 py-2 rounded-lg transition-all font-bold text-sm",
                    activeBetType === type.id
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Number Grid for Single Bets */}
          {activeBetType === "single" && (
            <div className="px-6 py-6">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide flex items-center justify-between">
                <span>Single Digit Betting</span>
                <span className="text-green-400">9.5x Payout</span>
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {numbers.map((num) => (
                  <button
                    key={num}
                    className="group relative bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl  py-12 shadow-lg transform hover:scale-105 transition-all"
                  >
                    <div className="text-5xl font-bold">{num}</div>
                    {/* Bet amount indicator */}
                    <div className="absolute bottom-2 right-2 bg-white/20 rounded px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{selectedChip}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jodi Betting Grid */}
          {activeBetType === "jodi" && (
            <div className="px-6 py-6">
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide flex items-center justify-between">
                <span>Jodi (Pair) Betting</span>
                <span className="text-green-400">90x Payout</span>
              </h3>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 100 }, (_, i) => (
                  <button
                    key={i}
                    className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white rounded-lg py-4 shadow-lg transform hover:scale-110 transition-all text-sm font-bold"
                  >
                    {i.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other bet types placeholder */}
          {activeBetType !== "single" && activeBetType !== "jodi" && (
            <div className="px-6 py-12">
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-xl p-12 text-center">
                <p className="text-gray-400 text-lg mb-2">
                  {betTypes.find((t) => t.id === activeBetType)?.label} Betting
                </p>
                <p className="text-gray-500 text-sm">
                  Select your{" "}
                  {betTypes.find((t) => t.id === activeBetType)?.label}{" "}
                  combination
                </p>
              </div>
            </div>
          )}

          <ResultsSection />
        </div>

        <BetSlipSidebar betAmount={betAmount} setBetAmount={setBetAmount} />
      </div>
    </MainLayout>
  );
}
