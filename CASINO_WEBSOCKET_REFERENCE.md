# Casino WebSocket - Quick Reference

## 🚀 Quick Start

### Import Hook

```tsx
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
```

### Use in Component

```tsx
function MyGame({ gameId }) {
  const { data, odds, status, isConnected } = useCasinoLive(gameId);

  return (
    <div>
      <h1>{data?.gname}</h1>
      <p>Status: {isConnected ? "🟢 Live" : "⚪ Offline"}</p>
      {data?.timer && <p>⏱️ {data.timer}s</p>}
      {data?.roundId && <p>🎲 Round: {data.roundId}</p>}
    </div>
  );
}
```

## 📦 Available Hooks

### 1. useCasinoLive(gmid)

Single game live data

```tsx
const {
  data, // CasinoGameData | null
  odds, // CasinoOdds | null
  result, // CasinoResult | null
  status, // 'connected' | 'connecting' | 'polling' | 'disconnected'
  isLoading, // boolean
  error, // string | null
  isConnected, // boolean
} = useCasinoLive("worli3");
```

### 2. useCasinoLiveMultiple(gmids[])

Multiple games dashboard

```tsx
const {
  getData, // (gmid: string) => CasinoGameData | undefined
  getOdds, // (gmid: string) => CasinoOdds | undefined
  getStatus, // (gmid: string) => string
  dataMap, // Map<string, CasinoGameData>
  oddsMap, // Map<string, CasinoOdds>
  statusMap, // Map<string, string>
  isLoading, // boolean
  connectedCount, // number
} = useCasinoLiveMultiple(["worli3", "teen62", "poker"]);
```

### 3. useCasinoResults(gmid, limit)

Recent results tracking

```tsx
const results = useCasinoResults("worli3", 10); // CasinoResult[]
```

## 🎮 Game IDs

Common game IDs to test with:

- `worli3` - Matka
- `teen62` - VIP Teenpatti
- `poker` - Poker 1-Day
- `baccarat` - Baccarat
- `dt20` - Dragon Tiger
- `ab20` - Andar Bahar
- `roulette13` - Roulette

## 📊 Data Types

### CasinoGameData

```typescript
{
  gmid: string;           // Game ID
  gname: string;          // Game name
  status: 'active' | 'inactive' | 'suspended';
  odds?: CasinoOdds;      // Current odds
  result?: CasinoResult;  // Last result
  timer?: number;         // Countdown timer (seconds)
  roundId?: string;       // Current round ID
  timestamp: number;      // Update timestamp
}
```

### CasinoOdds

```typescript
{
  gmid: string;
  markets: [{
    mid: string;          // Market ID
    name: string;         // Market name
    runners: [{
      rid: string;        // Runner ID
      name: string;       // Runner name
      odds: number;       // Decimal odds
      status: 'active' | 'suspended' | 'closed';
    }]
  }]
}
```

### CasinoResult

```typescript
{
  gmid: string;
  roundId: string;
  winner: string;
  result: string;
  timestamp: number;
}
```

## 🔧 Direct Service Access

### Subscribe to Updates

```typescript
import { casinoWebSocket } from "@/services/casinoWebSocket";

const unsubscribe = casinoWebSocket.subscribe("worli3", (message) => {
  console.log(message.type, message.data);
});

// Later: cleanup
unsubscribe();
```

### Check Status

```typescript
const status = casinoWebSocket.getStatus("worli3");
// Returns: 'connected' | 'connecting' | 'polling' | 'disconnected'
```

### Disconnect All

```typescript
casinoWebSocket.disconnectAll();
```

## 🎨 UI Components

### LiveCasinoGrid

```tsx
import { LiveCasinoGrid } from "@/components/casino/LiveCasinoGrid";

<LiveCasinoGrid games={casinoGames} maxDisplay={20} />;
```

### CasinoWebSocketTest

```tsx
import { CasinoWebSocketTest } from "@/components/casino/CasinoWebSocketTest";

<CasinoWebSocketTest />;
```

## 🌐 API Endpoint

```
GET http://130.250.191.174:3009/casino/data
```

**Required Parameters:**

- `type=4` (casino type)
- `gmid={game_id}`
- `key={api_key}`

**Example:**

```
http://130.250.191.174:3009/casino/data?type=4&gmid=worli3&key=mahi4449839dbabkadbakwq1qqd
```

## ⚙️ Configuration

### Environment Variables

```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

### Polling Interval

Default: 2 seconds
Change in `casinoWebSocket.ts`:

```typescript
const timer = setInterval(poll, 2000); // milliseconds
```

### Reconnection

- Max attempts: 5
- Base delay: 3 seconds (exponential backoff)

## 🔍 Debugging

### Console Logs

```
[Casino WS] Subscribing to game: worli3
[Casino WS] Starting HTTP polling for worli3
[Casino WS] Polling error for worli3: [error]
[Casino WS] Disconnecting from worli3
```

### Test Connection

1. Open browser DevTools
2. Navigate to game page
3. Watch for `[Casino WS]` logs
4. Check Network tab for polling requests

## 📱 Status Indicators

```tsx
{
  isConnected ? (
    <Badge variant="default">🟢 Live</Badge>
  ) : (
    <Badge variant="outline">⚪ {status}</Badge>
  );
}
```

## 🎯 Common Patterns

### Conditional Rendering

```tsx
{
  data && (
    <div>
      <h2>{data.gname}</h2>
      {data.timer && <p>Time: {data.timer}s</p>}
      {data.roundId && <p>Round: {data.roundId}</p>}
    </div>
  );
}
```

### Loading State

```tsx
{
  isLoading && <div>Connecting...</div>;
}
{
  error && <div>Error: {error}</div>;
}
{
  data && <GameDisplay data={data} />;
}
```

### Multiple Games

```tsx
const gmids = games.map((g) => g.gmid);
const { getData, connectedCount } = useCasinoLiveMultiple(gmids);

return (
  <div>
    <p>
      Connected: {connectedCount} / {gmids.length}
    </p>
    {games.map((game) => (
      <GameCard key={game.gmid} game={game} liveData={getData(game.gmid)} />
    ))}
  </div>
);
```

## ⚡ Performance Tips

1. **Limit Connections**: Max 10-20 simultaneous games
2. **Use Multi Hook**: Prefer `useCasinoLiveMultiple` over multiple `useCasinoLive`
3. **Clean Up**: Always unmount components properly
4. **Optimize Renders**: Use `React.memo` for game cards
5. **Debounce Updates**: If showing many games, throttle re-renders

## 🚨 Error Handling

### Hook Level

```tsx
const { data, error } = useCasinoLive(gmid);

if (error) {
  return <div>Connection error: {error}</div>;
}
```

### Service Level

Errors are automatically logged to console and handled gracefully.

## 📚 Documentation

- **Full Guide**: `CASINO_WEBSOCKET.md`
- **Summary**: `CASINO_WEBSOCKET_SUMMARY.md`
- **This Reference**: `CASINO_WEBSOCKET_REFERENCE.md`

## ✅ Checklist for Integration

- [ ] Import hook: `useCasinoLive`
- [ ] Pass game ID (gmid)
- [ ] Handle loading state
- [ ] Display connection status
- [ ] Show timer if available
- [ ] Display round ID if available
- [ ] Show odds if needed
- [ ] Handle errors gracefully
- [ ] Clean up on unmount

## 🎉 Example: Complete Game Page

```tsx
import { useCasinoLive } from "@/hooks/api/useCasinoLive";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock } from "lucide-react";

function GamePage({ gameId }) {
  const { data, odds, status, isConnected } = useCasinoLive(gameId);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{data?.gname || "Loading..."}</h1>
        <Badge variant={isConnected ? "default" : "outline"}>
          <Wifi className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      </div>

      {/* Live Info */}
      {data && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{data.timer}s remaining</span>
          </div>
          <p className="text-sm text-muted-foreground">Round: {data.roundId}</p>
        </div>
      )}

      {/* Odds */}
      {odds?.markets.map((market) => (
        <div key={market.mid} className="mt-4">
          <h3 className="font-bold mb-2">{market.name}</h3>
          <div className="grid grid-cols-2 gap-2">
            {market.runners.map((runner) => (
              <button
                key={runner.rid}
                disabled={runner.status !== "active"}
                className="p-2 border rounded"
              >
                {runner.name} @ {runner.odds}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
```

---

**Ready to use!** 🚀 Start with `useCasinoLive(gmid)` in your component.
