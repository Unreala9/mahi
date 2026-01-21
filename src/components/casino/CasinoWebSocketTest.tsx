import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Activity, Wifi, WifiOff, Clock, TrendingUp } from "lucide-react";

/**
 * Test component for Casino WebSocket functionality
 * Usage: Add to a page and input a game ID (e.g., "worli3", "teen62")
 */
export function CasinoWebSocketTest() {
  const [gmid, setGmid] = useState("worli3");
  const [activeGmid, setActiveGmid] = useState<string | null>(null);

  const { data, odds, result, status, isLoading, isConnected, error } =
    useCasinoLive(activeGmid);

  const handleConnect = () => {
    setActiveGmid(gmid);
  };

  const handleDisconnect = () => {
    setActiveGmid(null);
  };

  return (
    <div className="space-y-4 p-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Casino WebSocket Test
        </h2>

        {/* Connection Controls */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter game ID (e.g., worli3)"
            value={gmid}
            onChange={(e) => setGmid(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleConnect} disabled={!gmid || !!activeGmid}>
            Connect
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            disabled={!activeGmid}
          >
            Disconnect
          </Button>
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <Badge variant="default">Connected</Badge>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-muted-foreground" />
              <Badge variant="outline">{status}</Badge>
            </>
          )}
          {activeGmid && (
            <span className="text-sm text-muted-foreground">
              Game: {activeGmid}
            </span>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Connecting to game...
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <p className="text-sm text-destructive">Error: {error}</p>
        </Card>
      )}

      {/* Live Data Display */}
      {data && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">{data.gname}</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Game ID</p>
              <p className="font-mono">{data.gmid}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Status</p>
              <Badge
                variant={data.status === "active" ? "default" : "secondary"}
              >
                {data.status}
              </Badge>
            </div>
            {data.timer && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Timer</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{data.timer}s</span>
                </div>
              </div>
            )}
            {data.roundId && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Round ID
                </p>
                <p className="font-mono text-sm">{data.roundId}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-secondary/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">Raw Data:</p>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Odds Display */}
      {odds && odds.markets && odds.markets.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Odds
          </h3>

          <div className="space-y-3">
            {odds.markets.map((market) => (
              <div
                key={market.mid}
                className="border border-border p-3 rounded"
              >
                <p className="text-sm font-bold mb-2">{market.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {market.runners.map((runner) => (
                    <div
                      key={runner.rid}
                      className={`p-2 border rounded flex justify-between items-center ${
                        runner.status === "active"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/30"
                      }`}
                    >
                      <span className="text-sm">{runner.name}</span>
                      <Badge variant="outline">{runner.odds.toFixed(2)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Result Display */}
      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Last Result</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Round ID:</span>
              <span className="font-mono">{result.roundId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Winner:</span>
              <Badge>{result.winner}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Result:</span>
              <span className="font-semibold">{result.result}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time:</span>
              <span className="text-sm">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* No Data State */}
      {!activeGmid && !isLoading && (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            Enter a game ID and click Connect to start receiving live data
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Example game IDs: worli3, teen62, poker, baccarat
          </p>
        </Card>
      )}
    </div>
  );
}
