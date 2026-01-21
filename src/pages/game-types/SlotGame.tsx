import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Volume2 } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import {
  BetSlipSidebar,
  GameHeader,
  ResultsSection,
} from "./components/SharedGameComponents";

interface SlotGameProps {
  game: CasinoGame;
}

export function SlotGame({ game }: SlotGameProps) {
  const [betAmount, setBetAmount] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"]);
  const { data: liveData, odds } = useCasinoLive(game.gmid);

  const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "⭐", "7️⃣"];

  const spin = () => {
    setIsSpinning(true);

    // Simulate spinning animation
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      setIsSpinning(false);
      // Final result
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
    }, 2000);
  };

  const payoutTable = [
    { symbol: "7️⃣", combo: "7️⃣ 7️⃣ 7️⃣", payout: "100x" },
    { symbol: "💎", combo: "💎 💎 💎", payout: "50x" },
    { symbol: "⭐", combo: "⭐ ⭐ ⭐", payout: "25x" },
    { symbol: "🔔", combo: "🔔 🔔 🔔", payout: "15x" },
    { symbol: "🍇", combo: "🍇 🍇 🍇", payout: "10x" },
    { symbol: "🍊", combo: "🍊 🍊 🍊", payout: "5x" },
    { symbol: "🍋", combo: "🍋 🍋 🍋", payout: "3x" },
    { symbol: "🍒", combo: "🍒 🍒 🍒", payout: "2x" },
  ];

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#8e44ad] to-[#2c3e50]">
          <GameHeader game={game} liveData={liveData} />

          {/* Slot Machine */}
          <div className="px-4 py-6">
            <div className="max-w-3xl mx-auto">
              {/* Machine Frame */}
              <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-2xl p-8 border-8 border-yellow-900 shadow-2xl">
                {/* Top Display */}
                <div className="bg-black rounded-lg p-4 mb-6">
                  <div className="text-yellow-400 text-center text-2xl font-bold tracking-wider animate-pulse">
                    {liveData?.status === "active"
                      ? "SPINNING..."
                      : "GOOD LUCK!"}
                  </div>
                </div>

                {/* Reels */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {reels.map((symbol, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square bg-white rounded-xl flex items-center justify-center text-8xl border-4 border-gray-800 shadow-inner ${
                        isSpinning ? "animate-spin" : ""
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>

                {/* Win Line */}
                <div className="relative mb-6">
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-red-500 -translate-y-1/2"></div>
                </div>

                {/* Control Panel */}
                <div className="bg-[#2c3e50] rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-gray-400 text-xs">Bet</div>
                      <div className="text-yellow-400 text-xl font-bold">
                        {betAmount || "0"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-xs">Win</div>
                      <div className="text-green-400 text-xl font-bold">0</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-xs">Balance</div>
                      <div className="text-white text-xl font-bold">1000</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Bet Amount"
                      disabled={isSpinning}
                      className="flex-1 px-4 py-3 bg-[#34495e] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                    <Button
                      onClick={spin}
                      disabled={isSpinning}
                      className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg"
                    >
                      {isSpinning ? "SPINNING..." : "SPIN"}
                    </Button>
                    <Button
                      variant="outline"
                      className="px-4 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payout Table */}
              <div className="mt-6 bg-[#2c3e50] rounded-lg p-4 border border-gray-700">
                <h3 className="text-yellow-400 font-bold mb-3 text-center">
                  PAYTABLE
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {payoutTable.map((entry, idx) => (
                    <div
                      key={idx}
                      className="bg-[#34495e] rounded p-2 text-center"
                    >
                      <div className="text-2xl mb-1">{entry.combo}</div>
                      <div className="text-yellow-400 font-bold">
                        {entry.payout}
                      </div>
                    </div>
                  ))}
                </div>
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
