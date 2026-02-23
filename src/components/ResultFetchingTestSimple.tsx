// src/components/ResultFetchingTestSimple.tsx
/**
 * Simplified Test Component for Result Fetching
 * Shows step-by-step process: Track → Fetch Result
 */

import { useState } from "react";
import { diamondApi } from "@/services/diamondApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ResultFetchingTestSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    "idle" | "tracking" | "fetching" | "complete"
  >("idle");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test data from your JSON
  const testData = {
    event_id: 856162940,
    event_name: "SA W vs PAK W",
    market_id: 6273906464321,
    market_name: "MATCH_ODDS",
    market_type: "MATCH_ODDS",
  };

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setTrackResult(null);
    setResult(null);

    try {
      // Step 1: Track the bet
      setStep("tracking");
      console.log("Step 1: Tracking bet...", testData);

      const tracked = await diamondApi.registerPlacedBet(testData);
      setTrackResult(tracked);

      if (!tracked.success) {
        throw new Error("Failed to track bet");
      }

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Fetch result
      setStep("fetching");
      console.log("Step 2: Fetching result...");

      const resultData = await diamondApi.getMarketResult({
        event_id: testData.event_id,
        event_name: testData.event_name,
        market_id: testData.market_id,
        market_name: testData.market_name,
      });

      setResult(resultData);
      setStep("complete");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setStep("idle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Result Fetching Test (Simple)</h1>
        <p className="text-muted-foreground">
          Step-by-step result fetching demonstration
        </p>
      </div>

      {/* Test Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data</CardTitle>
          <CardDescription>
            Using MATCH_ODDS example from your JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Event ID:</span>
            <span className="font-mono">{testData.event_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Event Name:</span>
            <span>{testData.event_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Market ID:</span>
            <span className="font-mono">{testData.market_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Market Name:</span>
            <span>{testData.market_name}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={handleTest}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Processing..." : "Test Result Fetching"}
      </Button>

      {/* Progress Steps */}
      {step !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Step 1: Tracking */}
            <div className="flex items-center gap-3">
              {step === "tracking" ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : trackResult?.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">
                  Step 1: Track Bet via /placed_bets
                </div>
                {trackResult && (
                  <div className="text-sm text-muted-foreground">
                    {trackResult.success
                      ? "✅ Tracked successfully"
                      : "❌ Failed to track"}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Fetching */}
            <div className="flex items-center gap-3">
              {step === "fetching" ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              ) : step === "complete" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <div>
                <div className="font-medium">
                  Step 2: Fetch Result via /get-result
                </div>
                {result && (
                  <div className="text-sm text-muted-foreground">
                    ✅ Result fetched
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result Data</CardTitle>
            <CardDescription>Raw response from API</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertDescription>
          <strong>Note:</strong> For live matches, result will be "PENDING" or
          "SUSPENDED". Results are only available after match completion.
        </AlertDescription>
      </Alert>
    </div>
  );
}
