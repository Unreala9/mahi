/**
 * Enhanced Odds Display Component with Betting Functionality
 * Shows odds with real-time updates and allows placing bets
 */

import { useState } from "react";
import { useSportsMatch } from "@/hooks/api/useEnhancedBetting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EnhancedOddsDisplayProps {
  gmid: number;
  sid: number;
  marketType: "match_odds" | "bookmaker" | "fancy" | "toss";
  className?: string;
}

export function EnhancedOddsDisplay({
  gmid,
  sid,
  marketType,
  className,
}: EnhancedOddsDisplayProps) {
  const { odds, loadingOdds, placeBet } = useSportsMatch(gmid, sid);
  const { toast } = useToast();
  const [selectedBet, setSelectedBet] = useState<{
    selection: string;
    selectionId: number;
    odds: number;
    type: "BACK" | "LAY";
  } | null>(null);
  const [stake, setStake] = useState<number>(100);
  const [placing, setPlacing] = useState(false);

  const handleBetClick = (
    selection: string,
    selectionId: number,
    odds: number,
    type: "BACK" | "LAY",
  ) => {
    setSelectedBet({ selection, selectionId, odds, type });
  };

  const handlePlaceBet = async () => {
    if (!selectedBet || !stake) return;

    try {
      setPlacing(true);
      await placeBet({
        market_id: parseInt(odds?.mid || "0"),
        market_name: marketType.toUpperCase().replace("_", " "),
        market_type: marketType.toUpperCase() as any,
        selection: selectedBet.selection,
        selection_id: selectedBet.selectionId,
        odds: selectedBet.odds,
        stake: stake,
        bet_type: selectedBet.type,
        is_lay: selectedBet.type === "LAY",
      });

      toast({
        title: "Bet Placed Successfully!",
        description: `${selectedBet.type} ${selectedBet.selection} @ ${selectedBet.odds} for ₹${stake}`,
      });

      setSelectedBet(null);
      setStake(100);
    } catch (error: any) {
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loadingOdds) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!odds) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No odds available
        </p>
      </Card>
    );
  }

  const marketData = odds[marketType] || [];

  if (marketData.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-sm text-muted-foreground text-center">
          No odds for this market
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Market Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold capitalize">
          {marketType.replace("_", " ")}
        </h3>
        <Badge variant="outline">Live</Badge>
      </div>

      {/* Odds Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold">
                  Selection
                </th>
                {marketType === "fancy" ? (
                  <>
                    <th className="text-center p-3 text-sm font-semibold">
                      Runs
                    </th>
                    <th className="text-center p-3 text-sm font-semibold w-24">
                      Yes
                    </th>
                    <th className="text-center p-3 text-sm font-semibold w-24">
                      No
                    </th>
                  </>
                ) : (
                  <>
                    <th className="text-center p-3 text-sm font-semibold w-24">
                      Back
                    </th>
                    <th className="text-center p-3 text-sm font-semibold w-24">
                      Lay
                    </th>
                  </>
                )}
                <th className="text-center p-3 text-sm font-semibold w-20">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {marketType === "fancy"
                ? (marketData as any[]).map((runner: any, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-medium">{runner.runner_name}</div>
                        {runner.min_stake && runner.max_stake && (
                          <div className="text-xs text-muted-foreground">
                            Min: ₹{runner.min_stake} | Max: ₹{runner.max_stake}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {runner.runs || 0}
                      </td>
                      <td className="p-3">
                        {runner.yes && runner.yes.length > 0 ? (
                          <Button
                            size="sm"
                            className={cn(
                              "w-full bg-blue-500 hover:bg-blue-600 transition-colors",
                              runner.status !== "ACTIVE" &&
                                "opacity-50 cursor-not-allowed",
                            )}
                            disabled={runner.status !== "ACTIVE"}
                            onClick={() =>
                              handleBetClick(
                                runner.runner_name,
                                runner.selectionId,
                                runner.yes[0].price,
                                "BACK",
                              )
                            }
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {runner.yes[0].price}
                              </span>
                              <span className="text-xs">
                                {runner.yes[0].size}
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {runner.no && runner.no.length > 0 ? (
                          <Button
                            size="sm"
                            className={cn(
                              "w-full bg-pink-500 hover:bg-pink-600 transition-colors",
                              runner.status !== "ACTIVE" &&
                                "opacity-50 cursor-not-allowed",
                            )}
                            disabled={runner.status !== "ACTIVE"}
                            onClick={() =>
                              handleBetClick(
                                runner.runner_name,
                                runner.selectionId,
                                runner.no[0].price,
                                "LAY",
                              )
                            }
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {runner.no[0].price}
                              </span>
                              <span className="text-xs">
                                {runner.no[0].size}
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            runner.status === "ACTIVE"
                              ? "default"
                              : runner.status === "SUSPENDED"
                                ? "secondary"
                                : "destructive"
                          }
                          className="w-full justify-center text-xs"
                        >
                          {runner.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                : marketData.map((runner: any, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{runner.runner_name}</td>
                      <td className="p-3">
                        {runner.back && runner.back.length > 0 ? (
                          <Button
                            size="sm"
                            className={cn(
                              "w-full bg-blue-500 hover:bg-blue-600 transition-colors",
                              runner.status !== "ACTIVE" &&
                                "opacity-50 cursor-not-allowed",
                            )}
                            disabled={runner.status !== "ACTIVE"}
                            onClick={() =>
                              handleBetClick(
                                runner.runner_name,
                                runner.selectionId,
                                runner.back[0].price,
                                "BACK",
                              )
                            }
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {runner.back[0].price}
                              </span>
                              <span className="text-xs">
                                {runner.back[0].size}
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {runner.lay && runner.lay.length > 0 ? (
                          <Button
                            size="sm"
                            className={cn(
                              "w-full bg-pink-500 hover:bg-pink-600 transition-colors",
                              runner.status !== "ACTIVE" &&
                                "opacity-50 cursor-not-allowed",
                            )}
                            disabled={runner.status !== "ACTIVE"}
                            onClick={() =>
                              handleBetClick(
                                runner.runner_name,
                                runner.selectionId,
                                runner.lay[0].price,
                                "LAY",
                              )
                            }
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">
                                {runner.lay[0].price}
                              </span>
                              <span className="text-xs">
                                {runner.lay[0].size}
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            runner.status === "ACTIVE"
                              ? "default"
                              : runner.status === "SUSPENDED"
                                ? "secondary"
                                : "destructive"
                          }
                          className="w-full justify-center text-xs"
                        >
                          {runner.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bet Slip */}
      {selectedBet && (
        <Card className="p-4 border-2 border-primary animate-in slide-in-from-bottom">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{selectedBet.selection}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedBet.type} @ {selectedBet.odds}
                </p>
              </div>
              <Badge
                variant={
                  selectedBet.type === "BACK" ? "default" : "destructive"
                }
              >
                {selectedBet.type}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake">Stake Amount (₹)</Label>
              <Input
                id="stake"
                type="number"
                value={stake}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                min={100}
                step={100}
                className="font-mono text-lg"
              />
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => setStake(amount)}
                    className="flex-1"
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Potential Win:</span>
              <span className="text-lg font-bold text-green-600">
                ₹
                {(
                  stake *
                  (selectedBet.type === "BACK"
                    ? selectedBet.odds - 1
                    : selectedBet.odds)
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedBet(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceBet}
                disabled={placing || stake < 100}
              >
                {placing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  "Place Bet"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-blue-500" />
          <span>Back (Bet For)</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-pink-500" />
          <span>Lay (Bet Against)</span>
        </div>
      </div>
    </div>
  );
}
