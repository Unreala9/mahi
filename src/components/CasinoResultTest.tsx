// src/components/CasinoResultTest.tsx
/**
 * Casino Result Testing Page
 *
 * Features:
 * - Fetch casino results from Diamond API
 * - View current round results
 * - Manually settle bets for testing
 * - View settlement history
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Trophy,
} from "lucide-react";
import {
  settleCasinoRound,
  simpleCasinoSettlement,
} from "@/services/simpleCasinoSettlement";
import { useToast } from "@/hooks/use-toast";

interface CasinoResult {
  mid: string;
  result: string;
  round: string;
  raw?: any;
}

export function CasinoResultTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CasinoResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CasinoResult | null>(
    null,
  );
  const [settlements, setSettlements] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch casino results from Diamond API
  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[CasinoResultTest] Fetching casino results...");

      const response = await fetch(
        "http://localhost:8080/api/diamond/casino/result?type=1",
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.data || !Array.isArray(data.data)) {
        throw new Error("Invalid response format");
      }

      console.log("[CasinoResultTest] Fetched results:", data.data);
      setResults(data.data);

      toast({
        title: "Results Fetched",
        description: `Found ${data.data.length} casino results`,
      });
    } catch (err: any) {
      console.error("[CasinoResultTest] Error:", err);
      setError(err.message || "Failed to fetch results");

      toast({
        title: "Error",
        description: err.message || "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Settle bets for a specific result
  const handleSettle = async (result: CasinoResult) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[CasinoResultTest] Settling bets for:", result);

      const settled = await settleCasinoRound(
        result.mid,
        result.round,
        result.result,
      );

      console.log("[CasinoResultTest] Settlement complete:", settled);

      setSettlements(settled);
      setSelectedResult(result);

      const winners = settled.filter((s) => s.isWin);
      const totalPayout = winners.reduce((sum, s) => sum + s.payout, 0);

      toast({
        title: "Settlement Complete",
        description: `Settled ${settled.length} bets. ${winners.length} winners. Total payout: ₹${totalPayout}`,
      });
    } catch (err: any) {
      console.error("[CasinoResultTest] Settlement error:", err);
      setError(err.message || "Failed to settle bets");

      toast({
        title: "Settlement Error",
        description: err.message || "Failed to settle bets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payout
  const [testStake, setTestStake] = useState("100");
  const [testOdds, setTestOdds] = useState("1.98");
  const calculatedPayout = simpleCasinoSettlement.calculatePayout(
    Number(testStake) || 0,
    Number(testOdds) || 0,
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Casino Result Testing</h1>
        <p className="text-muted-foreground">
          Fetch casino results and test bet settlement
        </p>
      </div>

      {/* Fetch Results */}
      <Card>
        <CardHeader>
          <CardTitle>Fetch Casino Results</CardTitle>
          <CardDescription>
            Get latest results from Diamond Casino API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={fetchResults}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Fetch Results
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Casino Results ({results.length})</CardTitle>
            <CardDescription>
              Click "Settle" to process bets for a round
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-bold text-lg">{result.mid}</p>
                        <p className="text-sm text-muted-foreground">
                          Round: {result.round}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Winner</p>
                      <p className="font-bold text-green-600">
                        {result.result}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSettle(result)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Settle Bets
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settlement Results */}
      {settlements.length > 0 && selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Settlement Results</CardTitle>
            <CardDescription>
              {selectedResult.mid} - Round {selectedResult.round} - Winner:{" "}
              {selectedResult.result}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    settlement.isWin
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settlement.isWin ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-bold">
                          Bet #{settlement.betId} - {settlement.selection}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Stake: ₹{settlement.stake} @ {settlement.odds}x
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {settlement.isWin ? "Payout" : "Lost"}
                      </p>
                      <p
                        className={`font-bold text-lg ${
                          settlement.isWin ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {settlement.isWin ? "+" : "-"}₹
                        {settlement.isWin
                          ? settlement.payout
                          : settlement.stake}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total Bets</p>
                  <p className="text-2xl font-bold">{settlements.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Winners</p>
                  <p className="text-2xl font-bold text-green-600">
                    {settlements.filter((s) => s.isWin).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Payout</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {settlements
                      .filter((s) => s.isWin)
                      .reduce((sum, s) => sum + s.payout, 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Calculator</CardTitle>
          <CardDescription>Calculate potential winnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stake">Stake Amount</Label>
              <Input
                id="stake"
                type="number"
                value={testStake}
                onChange={(e) => setTestStake(e.target.value)}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="odds">Odds</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                value={testOdds}
                onChange={(e) => setTestOdds(e.target.value)}
                placeholder="1.98"
              />
            </div>

            <div>
              <Label>Potential Payout</Label>
              <div className="h-10 flex items-center justify-center bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-xl font-bold text-green-600">
                  ₹{calculatedPayout}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Fetch Results" to get latest casino results</li>
            <li>Click "Settle Bets" on any result to process pending bets</li>
            <li>View settlement details and payouts</li>
            <li>Use calculator to test payout calculations</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
