// src/components/ResultFetchingDebug.tsx
/**
 * Debug Component for Result Fetching
 * Shows actual API requests and responses
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
import { Loader2, AlertCircle, Info } from "lucide-react";

export function ResultFetchingDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState("856162940");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const testGetPlacedBets = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);

    try {
      addLog("Testing /get_placed_bets endpoint...");

      const API_KEY = "mahi4449839dbabkadbakwq1qqd";
      const url = `http://localhost:8080/api/diamond/get_placed_bets?event_id=${eventId}&key=${API_KEY}`;

      addLog(`URL: ${url}`);

      const response = await fetch(url);
      addLog(`Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog(`Response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok) {
        addLog("✅ Success! This endpoint works.");
        addLog(`Found ${data.data?.length || 0} tracked markets`);
      } else {
        addLog("❌ Failed");
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testTrackBet = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);

    try {
      addLog("Testing /placed_bets endpoint (tracking)...");

      const API_KEY = "mahi4449839dbabkadbakwq1qqd";
      const url = `http://localhost:8080/api/diamond/placed_bets?key=${API_KEY}`;

      const payload = {
        event_id: Number(eventId),
        event_name: "Test Event",
        market_id: 6273906464321,
        market_name: "MATCH_ODDS",
        market_type: "MATCH_ODDS",
      };

      addLog(`URL: ${url}`);
      addLog(`Payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      addLog(`Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog(`Response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok) {
        addLog("✅ Bet tracked successfully!");
      } else {
        addLog("❌ Failed to track bet");
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetResult = async () => {
    setIsLoading(true);
    setError(null);
    setLogs([]);

    try {
      addLog("Testing /get-result endpoint...");

      const API_KEY = "mahi4449839dbabkadbakwq1qqd";
      const url = `http://localhost:8080/api/diamond/get-result?key=${API_KEY}`;

      const payload = {
        event_id: Number(eventId),
        event_name: "Test Event",
        market_id: 6273906464321,
        market_name: "MATCH_ODDS",
      };

      addLog(`URL: ${url}`);
      addLog(`Payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      addLog(`Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        addLog(`Response: ${JSON.stringify(data, null, 2)}`);
        addLog("✅ Result fetched successfully!");
      } else {
        const errorText = await response.text();
        addLog(`Error Response: ${errorText}`);
        addLog("❌ Failed to fetch result");
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addLog(`❌ Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Result API Debug Tool</h1>
        <p className="text-muted-foreground">
          Test individual API endpoints and see raw requests/responses
        </p>
      </div>

      {/* Event ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="eventId">Event ID</Label>
            <Input
              id="eventId"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="856162940"
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
          <CardDescription>Test each endpoint individually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={testGetPlacedBets}
            className="w-full"
            variant="outline"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            1. Test GET /get_placed_bets (Check tracked bets)
          </Button>

          <Button onClick={testTrackBet} className="w-full" variant="outline">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            2. Test POST /placed_bets (Track a bet)
          </Button>

          <Button onClick={testGetResult} className="w-full" variant="outline">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            3. Test POST /get-result (Fetch result)
          </Button>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>First check if event has tracked bets (Button 1)</li>
            <li>If no tracked bets, track one first (Button 2)</li>
            <li>Then try to fetch result (Button 3)</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Logs Display */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>
              Detailed request/response information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs space-y-1 max-h-96 overflow-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
