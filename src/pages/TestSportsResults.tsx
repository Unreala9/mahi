/**
 * Test Page for Sports Results API
 * Tests the new bet-incoming and get-result endpoints
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  Trash2,
} from "lucide-react";
import { diamondApi } from "@/services/diamondApi";

interface TestLog {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  data?: unknown;
}

export default function TestSportsResults() {
  // Form state
  const [eventId, setEventId] = useState("45554544");
  const [eventName, setEventName] = useState("IND vs AUS");
  const [marketId, setMarketId] = useState("8845554544");
  const [marketName, setMarketName] = useState(
    "9 OVER RUNS AUS(IND vs AUS)ADV",
  );
  const [marketType, setMarketType] = useState("FANCY");
  const [sportId, setSportId] = useState("4");

  // Results state
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [betRegistered, setBetRegistered] = useState(false);

  const addLog = (
    message: string,
    type: TestLog["type"] = "info",
    data?: unknown,
  ) => {
    const log: TestLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
    };
    setLogs((prev) => [log, ...prev]);
    console.log(`[${type.toUpperCase()}]`, message, data);
  };

  const clearLogs = () => {
    setLogs([]);
    setBetRegistered(false);
  };

  // Test 0: Check API connectivity
  const testConnectivity = async () => {
    setIsLoading(true);
    addLog("Testing API connectivity...", "info");

    try {
      const apiUrl = import.meta.env.VITE_RESULTS_API_URL;

      if (!apiUrl) {
        addLog("❌ VITE_RESULTS_API_URL not configured", "error");
        setIsLoading(false);
        return;
      }

      addLog(`Checking connection to: ${apiUrl}`, "info");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/bet-incoming`, {
        method: "OPTIONS", // Try OPTIONS first for CORS preflight
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      addLog(`✅ Server responded with status: ${response.status}`, "success");
      addLog("API is reachable", "success");
    } catch (error) {
      const err = error as Error;

      if (err.name === "AbortError") {
        addLog("❌ Connection timeout after 5 seconds", "error");
      } else {
        addLog(`❌ Connection failed: ${err.message}`, "error", err);
      }

      addLog("This could be a CORS issue or the API might be down", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 1: Register bet via /bet-incoming
  const testBetIncoming = async () => {
    setIsLoading(true);
    addLog("Testing /bet-incoming endpoint...", "info");

    try {
      const betData = {
        event_id: Number(eventId),
        event_name: eventName,
        market_id: Number(marketId),
        market_name: marketName,
        market_type: marketType,
        sport_id: Number(sportId),
      };

      addLog("Sending bet registration request", "info", betData);

      const result = await diamondApi.registerPlacedBet(betData);

      if (result.success) {
        addLog("✅ Bet registered successfully!", "success", result);
        setBetRegistered(true);
      } else {
        addLog(`❌ Bet registration failed: ${result.error}`, "error", result);
      }
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Error: ${err.message}`, "error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Fetch result via /get-result
  const testGetResult = async () => {
    setIsLoading(true);
    addLog("Testing /get-result endpoint...", "info");

    try {
      const request = {
        event_id: Number(eventId),
        event_name: eventName,
        market_id: Number(marketId),
        market_name: marketName,
        market_type: marketType,
      };

      addLog("Fetching result", "info", request);

      const result = await diamondApi.getMarketResult(request);

      if (result) {
        addLog("✅ Result fetched successfully!", "success", result);

        // Display result details
        if (result.is_declared) {
          addLog(`📊 Final Result: ${result.final_result}`, "success");
        } else {
          addLog("⏳ Result not yet declared", "warning");
        }
      } else {
        addLog("❌ No result data returned", "error");
      }
    } catch (error) {
      const err = error as Error;
      addLog(`❌ Error: ${err.message}`, "error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Complete flow (register + fetch)
  const testCompleteFlow = async () => {
    addLog("=== Starting Complete Flow Test ===", "info");

    await testBetIncoming();

    // Wait a moment between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testGetResult();

    addLog("=== Complete Flow Test Finished ===", "info");
  };

  // Load example data
  const loadExample = (example: "fancy" | "matchOdds") => {
    if (example === "fancy") {
      setEventId("45554544");
      setEventName("IND vs AUS");
      setMarketId("8845554544");
      setMarketName("9 OVER RUNS AUS(IND vs AUS)ADV");
      setMarketType("FANCY");
      setSportId("4");
    } else {
      setEventId("45554544");
      setEventName("IND vs AUS");
      setMarketId("45554544");
      setMarketName("MATCH_ODDS");
      setMarketType("MATCH_ODDS");
      setSportId("4");
    }
    addLog(`Loaded ${example} example data`, "info");
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white">
      <div className="container mx-auto p-6 max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Sports Results API Test</h1>
          <p className="text-muted-foreground">
            Test the new bet-incoming and get-result endpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Example Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Load</CardTitle>
                <CardDescription>Load example data</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("fancy")}
                >
                  Fancy Example
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample("matchOdds")}
                >
                  Match Odds Example
                </Button>
              </CardContent>
            </Card>

            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Test Data</CardTitle>
                <CardDescription>
                  Enter match and market details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Event ID</Label>
                  <Input
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="e.g., 45554544"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., IND vs AUS"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Market ID</Label>
                  <Input
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                    placeholder="e.g., 8845554544"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Market Name</Label>
                  <Input
                    value={marketName}
                    onChange={(e) => setMarketName(e.target.value)}
                    placeholder="e.g., MATCH_ODDS"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Market Type</Label>
                  <Select value={marketType} onValueChange={setMarketType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MATCH_ODDS">Match Odds</SelectItem>
                      <SelectItem value="BOOKMAKER">Bookmaker</SelectItem>
                      <SelectItem value="FANCY">Fancy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sport ID</Label>
                  <Select value={sportId} onValueChange={setSportId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⚽ Soccer</SelectItem>
                      <SelectItem value="2">🎾 Tennis</SelectItem>
                      <SelectItem value="4">🏏 Cricket</SelectItem>
                      <SelectItem value="5">🏀 Basketball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={testConnectivity}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertCircle className="mr-2 h-4 w-4" />
                  )}
                  Test API Connectivity
                </Button>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Full endpoint tests:
                  </p>
                </div>

                <Button
                  onClick={testBetIncoming}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Test /bet-incoming
                </Button>

                <Button
                  onClick={testGetResult}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Test /get-result
                </Button>

                <Button
                  onClick={testCompleteFlow}
                  disabled={isLoading}
                  variant="default"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Test Complete Flow
                </Button>

                <Button
                  onClick={clearLogs}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Logs
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            {betRegistered && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Bet registered! You can now fetch the result.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Logs */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Test Logs</CardTitle>
                <CardDescription>
                  Real-time test results ({logs.length} entries)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No logs yet. Run a test to see results.
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border text-sm space-y-2 ${
                          log.type === "success"
                            ? "bg-green-50 border-green-200 dark:bg-green-950"
                            : log.type === "error"
                              ? "bg-red-50 border-red-200 dark:bg-red-950"
                              : log.type === "warning"
                                ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950"
                                : "bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {log.type === "success" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {log.type === "error" && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            {log.type === "warning" && (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {log.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-medium">{log.message}</p>
                        {log.data && (
                          <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {import.meta.env.VITE_RESULTS_API_URL ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-muted-foreground">API URL:</Label>
              <code className="ml-2 bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_RESULTS_API_URL || "NOT SET"}
              </code>
            </div>
            <div>
              <Label className="text-muted-foreground">API Key:</Label>
              <code className="ml-2 bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_RESULTS_API_KEY ? "✓ Set" : "NOT SET"}
              </code>
            </div>
            <div>
              <Label className="text-muted-foreground">Client Ref:</Label>
              <code className="ml-2 bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_RESULTS_CLIENT_REF || "NOT SET"}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Network Error?</strong> This can happen due to:
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>CORS policy blocking requests from localhost</li>
              <li>API server not reachable or down</li>
              <li>Incorrect API URL in .env file</li>
              <li>
                Missing environment variables (restart dev server after .env
                changes)
              </li>
            </ul>
            <p className="mt-2">
              Check the browser console (F12 → Console) for detailed error
              messages.
            </p>
          </AlertDescription>
        </Alert>

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <Badge className="mb-2">POST</Badge>
              <code className="ml-2 bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_RESULTS_API_URL}/bet-incoming
              </code>
              <p className="text-muted-foreground mt-1 ml-2">
                Register a placed bet (required before fetching results)
              </p>
            </div>
            <div>
              <Badge className="mb-2">POST</Badge>
              <code className="ml-2 bg-muted px-2 py-1 rounded">
                {import.meta.env.VITE_RESULTS_API_URL}/get-result
              </code>
              <p className="text-muted-foreground mt-1 ml-2">
                Fetch result for a specific market
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
