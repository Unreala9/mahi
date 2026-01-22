import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import type { CasinoGameData } from "@/services/casinoWebSocket";

// Shared Components for Game Types

export function GameHeader({
  game,
  liveData,
}: {
  game: CasinoGame;
  liveData?: CasinoGameData | null;
}) {
  return (
    <div className="bg-[#34495e] px-3 py-2 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center gap-2">
        <ChevronUp className="w-4 h-4 text-blue-400 cursor-pointer hover:text-blue-300" />
        <h1 className="text-white font-bold text-base uppercase tracking-wide">
          {game.gname}
        </h1>
        <button className="text-blue-400 text-xs underline hover:text-blue-300">
          Rules
        </button>
      </div>
      <div className="text-white text-xs">
        Round ID:{" "}
        <span className="font-mono">{liveData?.roundId || "Waiting..."}</span>
      </div>
    </div>
  );
}

export function CardPlaceholder() {
  return (
    <div className="w-10 h-14 bg-[#ecf0f1] border-2 border-gray-400 rounded-lg flex items-center justify-center">
      <div className="w-8 h-12 border border-dashed border-gray-400 rounded" />
    </div>
  );
}

export function BetSlipSidebar({
  betAmount,
  setBetAmount,
}: {
  betAmount: string;
  setBetAmount: (v: string) => void;
}) {
  return (
    <div className="bg-white border-l border-gray-200">
      <div className="bg-[#34495e] text-white px-3 py-2 font-bold text-sm">My Bet</div>
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-600">
          <div>Matched Bet</div>
          <div className="text-center">Odds</div>
          <div className="text-right">Stake</div>
        </div>
        <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-400 text-sm">No bets placed</p>
        </div>
        <div className="mt-3 space-y-2">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Stake Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(String(amount))}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1.5 rounded text-xs font-semibold"
              >
                {amount}
              </button>
            ))}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-sm font-bold">
            Place Bet
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ResultsSection() {
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
    <div className="px-4 py-3">
      <div className="bg-[#34495e] rounded-t p-2 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Last Result</span>
        <button className="text-blue-400 hover:text-blue-300 text-xs">
          View All
        </button>
      </div>
      <div className="bg-[#2c3e50] rounded-b p-3 flex gap-2 overflow-x-auto">
        {mockResults.map((item, idx) => (
          <div
            key={idx}
            className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
          >
            {item.result}
          </div>
        ))}
      </div>
    </div>
  );
}
