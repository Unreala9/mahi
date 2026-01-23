import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import type { CasinoGame } from "@/types/casino";
import type { CasinoGameData } from "@/services/casinoWebSocket";

export type Bet = {
  marketName: string;
  selectionName: string;
  odds: number;
  stake: number;
};

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
  bets,
  onRemoveBet,
  onUpdateStake,
  onPlaceBets,
  variant = "light",
}: {
  bets: Bet[];
  onRemoveBet: (index: number) => void;
  onUpdateStake: (index: number, stake: number) => void;
  onPlaceBets: () => void;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const totalStake = bets.reduce((acc, bet) => acc + bet.stake, 0);

  return (
    <div
      className={
        isDark
          ? "bg-[#1f2a37] border-l border-[#111827] text-white"
          : "bg-white border-l border-gray-200"
      }
    >
      <div
        className={
          isDark
            ? "bg-[#2f3a4a] px-3 py-2 font-bold text-sm"
            : "bg-[#34495e] text-white px-3 py-2 font-bold text-sm"
        }
      >
        My Bet
      </div>
      <div className="p-3">
        <div
          className={
            isDark
              ? "grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-300"
              : "grid grid-cols-3 gap-2 mb-2 text-xs font-semibold text-gray-600"
          }
        >
          <div>Selection</div>
          <div className="text-center">Odds</div>
          <div className="text-right">Stake</div>
        </div>

        {bets.length === 0 ? (
          <div
            className={
              isDark
                ? "min-h-[150px] flex items-center justify-center border-2 border-dashed border-[#374151] rounded-lg"
                : "min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
            }
          >
            <p className={isDark ? "text-gray-400 text-sm" : "text-gray-400 text-sm"}>
              Click on odds to add a bet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bets.map((bet, index) => (
              <div
                key={index}
                className={
                  isDark
                    ? "bg-[#2b3a4c] p-2 rounded-md"
                    : "bg-gray-100 p-2 rounded-md"
                }
              >
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold">{bet.selectionName}</span>
                  <button
                    onClick={() => onRemoveBet(index)}
                    className="text-red-400 hover:text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <div className="text-xs text-gray-400">{bet.marketName}</div>
                  <div className="text-center font-bold text-blue-400">
                    {bet.odds.toFixed(2)}
                  </div>
                  <input
                    type="number"
                    value={bet.stake}
                    onChange={(e) =>
                      onUpdateStake(index, Number(e.target.value))
                    }
                    className={
                      isDark
                        ? "w-full text-right px-2 py-1 bg-[#111827] border border-[#374151] rounded text-white"
                        : "w-full text-right px-2 py-1 border border-gray-300 rounded"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {bets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center font-bold">
            <span>Total Stake:</span>
            <span>{totalStake.toFixed(2)}</span>
          </div>
        )}

        <div className="mt-4">
          <Button
            onClick={onPlaceBets}
            disabled={bets.length === 0}
            className={
              isDark
                ? "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-sm font-bold disabled:bg-gray-500"
                : "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-sm font-bold disabled:bg-gray-500"
            }
          >
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
