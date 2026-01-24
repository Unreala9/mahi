/**
 * Market Odds Display Component
 * Displays match odds, bookmaker, fancy, and session markets
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RunnerOdds, MarketType, BetType } from "@/types/sports-betting";
import { cn } from "@/lib/utils";

interface MarketOddsDisplayProps {
  marketType: MarketType;
  runners: RunnerOdds[];
  onBetClick: (
    selection: string,
    odds: number,
    betType: BetType,
    selectionId?: number,
  ) => void;
  disabled?: boolean;
}

export function MarketOddsDisplay({
  marketType,
  runners,
  onBetClick,
  disabled = false,
}: MarketOddsDisplayProps) {
  const isFancy = marketType === "FANCY" || marketType === "SESSION";

  if (!runners || runners.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground text-center">
          No odds available
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-muted p-2 px-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold">
          <div className="col-span-5 md:col-span-6">Selection</div>
          <div className="col-span-7 md:col-span-6">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-blue-500/10 text-blue-600 rounded px-2 py-1">
                Back
              </div>
              <div className="bg-pink-500/10 text-pink-600 rounded px-2 py-1">
                Lay
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Runners */}
      <div className="divide-y">
        {runners.map((runner, index) => (
          <div
            key={index}
            className="p-2 px-4 hover:bg-muted/50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Selection Name */}
              <div className="col-span-5 md:col-span-6">
                <div className="flex items-center gap-2">
                  {runner.nat && <span className="text-sm">{runner.nat}</span>}
                  <span className="text-sm font-medium">
                    {runner.runner_name}
                  </span>
                  {runner.runs !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {runner.runs}
                    </Badge>
                  )}
                </div>
                {runner.status === "SUSPENDED" && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    Suspended
                  </Badge>
                )}
              </div>

              {/* Back/Lay Odds */}
              <div className="col-span-7 md:col-span-6">
                <div className="grid grid-cols-2 gap-2">
                  {/* Back Odds */}
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto py-2 px-2 bg-blue-500/10 hover:bg-blue-500/20 border-blue-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    disabled={
                      disabled || !runner.back || runner.status === "SUSPENDED"
                    }
                    onClick={() =>
                      runner.back &&
                      onBetClick(
                        runner.runner_name,
                        runner.back.price,
                        "BACK",
                        runner.runner_id,
                      )
                    }
                  >
                    <div className="text-center w-full">
                      <div className="text-sm font-bold text-blue-700">
                        {runner.back?.price || "-"}
                      </div>
                      {runner.back?.size && (
                        <div className="text-xs text-blue-600">
                          {runner.back.size}
                        </div>
                      )}
                    </div>
                  </Button>

                  {/* Lay Odds */}
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto py-2 px-2 bg-pink-500/10 hover:bg-pink-500/20 border-pink-300",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    disabled={
                      disabled || !runner.lay || runner.status === "SUSPENDED"
                    }
                    onClick={() =>
                      runner.lay &&
                      onBetClick(
                        runner.runner_name,
                        runner.lay.price,
                        "LAY",
                        runner.runner_id,
                      )
                    }
                  >
                    <div className="text-center w-full">
                      <div className="text-sm font-bold text-pink-700">
                        {runner.lay?.price || "-"}
                      </div>
                      {runner.lay?.size && (
                        <div className="text-xs text-pink-600">
                          {runner.lay.size}
                        </div>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Betting Limits */}
            {(runner.min || runner.max) && (
              <div className="text-xs text-muted-foreground mt-1">
                Min: ₹{runner.min || 100} | Max: ₹{runner.max || 25000}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
