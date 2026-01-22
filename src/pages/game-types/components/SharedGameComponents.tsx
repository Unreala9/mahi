import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import type { CasinoGameData } from "@/services/casinoWebSocket";
import { BettingChipSelector } from "@/components/casino/BettingChip";
import { useState } from "react";

// Shared Components for Game Types

export function GameHeader({
  game,
  liveData,
  showTimer = false,
}: {
  game: CasinoGame;
  liveData?: CasinoGameData | null;
  showTimer?: boolean;
}) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChevronUp className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-300 transition-colors" />
          <h1 className="text-white font-bold text-lg uppercase tracking-wide">
            {game.gname}
          </h1>
          <button className="text-blue-400 text-sm underline hover:text-blue-300 transition-colors">
            Rules
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-sm font-semibold">LIVE</span>
          </div>

          {/* Round ID */}
          <div className="text-white text-sm">
            Round:{" "}
            <span className="font-mono font-bold">
              {liveData?.roundId || "Waiting..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardPlaceholder() {
  return (
    <div className="w-16 h-24 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
      <div className="w-12 h-20 border border-dashed border-slate-500 rounded" />
    </div>
  );
}

interface BetSlipItem {
  market: string;
  odds: number;
  stake: number;
}

export function BetSlipSidebar({
  betAmount,
  setBetAmount,
}: {
  betAmount: string;
  setBetAmount: (v: string) => void;
}) {
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<BetSlipItem[]>([]);

  const handleChipSelect = (amount: number) => {
    setSelectedChip(amount);
    setBetAmount(String(amount));
  };

  return (
    <div className="bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-3 font-bold">
        My Bet Slip
      </div>

      {/* Bets list */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs font-semibold text-gray-600">
          <div>Market</div>
          <div className="text-center">Odds</div>
          <div className="text-right">Stake</div>
        </div>

        {bets.length > 0 ? (
          <div className="space-y-2">
            {bets.map((bet, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 text-sm bg-blue-50 p-2 rounded"
              >
                <div className="font-medium truncate">{bet.market}</div>
                <div className="text-center font-mono">
                  {bet.odds.toFixed(2)}
                </div>
                <div className="text-right">₹{bet.stake}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-400 text-sm text-center">
              No bets placed
              <br />
              <span className="text-xs">Click on odds to add</span>
            </p>
          </div>
        )}

        {/* Stake input */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-2 block font-semibold">
              Select Stake Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition-all"
            />
          </div>

          {/* Betting chips */}
          <div>
            <label className="text-xs text-gray-600 mb-2 block font-semibold">
              Quick Select
            </label>
            <BettingChipSelector
              selectedAmount={selectedChip}
              onAmountChange={handleChipSelect}
            />
          </div>

          {/* Place bet button */}
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all">
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
      <div className="bg-slate-800/50 rounded-lg overflow-hidden">
        <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">Last Results</span>
          <button className="text-blue-400 hover:text-blue-300 text-xs underline">
            View All
          </button>
        </div>
        <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {mockResults.map((item, idx) => (
            <div
              key={idx}
              className={`${item.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg hover:scale-110 transition-transform`}
            >
              {item.result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
