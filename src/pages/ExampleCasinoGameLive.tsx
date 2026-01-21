// Example implementation of Casino WebSocket in a page
// You can copy this and modify for your needs

import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Wifi, WifiOff, Clock, Activity, TrendingUp } from "lucide-react";

/**
 * Example Casino Game Page with Live WebSocket Data
 *
 * This demonstrates how to integrate the casino WebSocket
 * to show live game data, odds, and results.
 */
export default function ExampleCasinoGamePage() {
  // Replace 'worli3' with any game ID
  const gameId = "worli3";

  const {
    data, // Live game data (timer, round ID, status)
    odds, // Current betting odds and markets
    result, // Last round result
    status, // Connection status
    isLoading, // Loading state
    isConnected, // Boolean: is connected?
    error, // Error message if any
  } = useCasinoLive(gameId);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto p-4">
        {/* Header with Connection Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="w-8 h-8" />
                {data?.gname || "Casino Game"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Game ID: {gameId}
              </p>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <Badge variant="default" className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    Live
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <Badge variant="outline" className="flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    {status}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">
                Connecting to live game...
              </p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 border-destructive bg-destructive/5">
            <p className="text-destructive font-semibold">Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              The service will automatically retry connecting...
            </p>
          </Card>
        )}

        {/* Live Game Data */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Game Area */}
            <Card className="md:col-span-2 p-6">
              <h2 className="text-xl font-bold mb-4">Current Round</h2>

              {/* Game Status Badge */}
              <div className="mb-4">
                <Badge
                  variant={data.status === "active" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              {/* Live Timer */}
              {data.timer && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Time Remaining
                      </p>
                      <p className="text-3xl font-mono font-bold tabular-nums">
                        {data.timer}s
                      </p>
                    </div>
                  </div>
                  {/* Visual timer bar */}
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000 w-full" />
                  </div>
                </div>
              )}

              {/* Round ID */}
              {data.roundId && (
                <div className="p-3 bg-card border rounded">
                  <p className="text-xs text-muted-foreground uppercase">
                    Round ID
                  </p>
                  <p className="text-lg font-mono font-semibold">
                    {data.roundId}
                  </p>
                </div>
              )}

              {/* Live Odds Display */}
              {odds && odds.markets && odds.markets.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Live Betting Odds
                  </h3>

                  <div className="space-y-4">
                    {odds.markets.map((market) => (
                      <div key={market.mid} className="border rounded-lg p-4">
                        <p className="font-semibold mb-3">{market.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {market.runners.map((runner) => (
                            <Button
                              key={runner.rid}
                              variant={
                                runner.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              disabled={runner.status !== "active"}
                              className="h-auto py-3 flex flex-col items-start gap-1"
                            >
                              <span className="text-sm font-medium">
                                {runner.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-lg font-bold"
                              >
                                {runner.odds.toFixed(2)}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Sidebar - Last Result */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Last Result</h3>

              {result ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Round
                    </p>
                    <p className="text-sm font-mono">{result.roundId}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Winner
                    </p>
                    <Badge className="mt-1 text-base">{result.winner}</Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Result
                    </p>
                    <p className="text-lg font-semibold">{result.result}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Time
                    </p>
                    <p className="text-sm">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Waiting for results...
                </p>
              )}

              {/* Connection Info */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  Connection Info
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    Status: <span className="font-mono">{status}</span>
                  </p>
                  <p>
                    Mode:{" "}
                    <span className="font-mono">
                      {status === "polling" ? "HTTP Polling (2s)" : "WebSocket"}
                    </span>
                  </p>
                  <p>
                    Last Update:{" "}
                    <span className="font-mono">
                      {data.timestamp
                        ? new Date(data.timestamp).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !data && !error && (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              No live data available for this game
            </p>
          </Card>
        )}

        {/* Developer Info (Remove in production) */}
        <Card className="p-4 bg-secondary/20">
          <details>
            <summary className="text-sm font-semibold cursor-pointer">
              Developer Info (Debug)
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Connection Status:</p>
                <code className="block p-2 bg-card rounded mt-1">{status}</code>
              </div>
              <div>
                <p className="text-muted-foreground">Raw Data:</p>
                <pre className="p-2 bg-card rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </Card>
      </div>
    </MainLayout>
  );
}

/**
 * Usage Instructions:
 *
 * 1. Import this component in your routes
 * 2. Change the gameId to any valid game ID
 * 3. Customize the UI as needed
 * 4. Remove debug info before production
 *
 * Available Game IDs:
 * - worli3 (Matka)
 * - teen62 (VIP Teenpatti)
 * - poker (Poker 1-Day)
 * - baccarat (Baccarat)
 * - dt20 (Dragon Tiger)
 * - ab20 (Andar Bahar)
 * - roulette13 (Roulette)
 */
