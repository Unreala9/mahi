import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GameResult {
  mid: number | string;
  win: string;
}

interface ResultsHistoryProps {
  results: GameResult[];
  gameName?: string;
  className?: string;
}

export function ResultsHistory({
  results = [],
  gameName,
  className,
}: ResultsHistoryProps) {
  const [showAll, setShowAll] = useState(false);

  // Show only recent results (last 10)
  const recentResults = results.slice(0, 10);

  // Map win values to labels and colors
  const getResultDisplay = (win: string) => {
    const resultMap: Record<
      string,
      { label: string; color: string; bgColor: string }
    > = {
      "1": { label: "W", color: "text-white", bgColor: "bg-green-600" },
      "2": { label: "L", color: "text-white", bgColor: "bg-red-600" },
      "0": { label: "T", color: "text-white", bgColor: "bg-yellow-600" },
    };

    return (
      resultMap[win] || {
        label: win,
        color: "text-white",
        bgColor: "bg-gray-600",
      }
    );
  };

  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="bg-slate-800/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">Last Results</span>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-blue-400 hover:text-blue-300 text-xs underline">
                View All
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {gameName
                    ? `${gameName} - Results History`
                    : "Results History"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-4">
                {results.map((result, idx) => {
                  const display = getResultDisplay(result.win);
                  return (
                    <div
                      key={`${result.mid}-${idx}`}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        "font-bold text-sm shadow-lg",
                        display.bgColor,
                        display.color,
                      )}
                      title={`Round: ${result.mid}`}
                    >
                      {display.label}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Results chips */}
        <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {recentResults.length > 0 ? (
            recentResults.map((result, idx) => {
              const display = getResultDisplay(result.win);
              return (
                <div
                  key={`${result.mid}-${idx}`}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    "font-bold text-sm shadow-lg transition-transform hover:scale-110",
                    display.bgColor,
                    display.color,
                  )}
                  title={`Round: ${result.mid}`}
                >
                  {display.label}
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-sm py-2">No results yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultsStatsProps {
  results: GameResult[];
}

export function ResultsStats({ results }: ResultsStatsProps) {
  const wins = results.filter((r) => r.win === "1").length;
  const losses = results.filter((r) => r.win === "2").length;
  const ties = results.filter((r) => r.win === "0").length;

  const winRate =
    results.length > 0 ? ((wins / results.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-4 gap-2 text-center text-xs">
      <div className="bg-slate-800/50 rounded p-2">
        <div className="text-gray-400">Total</div>
        <div className="text-white font-bold">{results.length}</div>
      </div>
      <div className="bg-green-900/30 rounded p-2">
        <div className="text-gray-400">Wins</div>
        <div className="text-green-400 font-bold">{wins}</div>
      </div>
      <div className="bg-red-900/30 rounded p-2">
        <div className="text-gray-400">Loss</div>
        <div className="text-red-400 font-bold">{losses}</div>
      </div>
      <div className="bg-yellow-900/30 rounded p-2">
        <div className="text-gray-400">Win %</div>
        <div className="text-yellow-400 font-bold">{winRate}%</div>
      </div>
    </div>
  );
}
