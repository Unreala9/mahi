# Casino WebSocket Integration

Real-time casino game data streaming using WebSocket (with HTTP polling fallback).

## Overview

The casino WebSocket service provides live updates for:

- Game status (active/inactive/suspended)
- Live odds and betting markets
- Round timers and IDs
- Game results
- Real-time score updates

## Architecture

### Files Created

1. **`src/services/casinoWebSocket.ts`** - Core WebSocket service
   - Manages WebSocket connections per game
   - Implements HTTP polling fallback
   - Handles reconnection logic
   - Provides subscription management

2. **`src/hooks/api/useCasinoLive.ts`** - React hooks
   - `useCasinoLive(gmid)` - Single game live data
   - `useCasinoLiveMultiple(gmids[])` - Multiple games tracking
   - `useCasinoResults(gmid, limit)` - Recent results history

3. **`src/components/casino/LiveCasinoGrid.tsx`** - UI component
   - Grid display of live casino games
   - Connection status indicators
   - Real-time data updates

4. **Updated `src/pages/CasinoGame.tsx`**
   - Shows live odds, timer, round ID
   - Connection status display
   - Recent results sidebar

## API Endpoints

### Casino Game Data

```
GET http://130.250.191.174:3009/casino/data?type=4&gmid={game_id}&key={api_key}
```

**Parameters:**

- `type`: 4 (casino type)
- `gmid`: Game ID (e.g., "worli3", "teen62")
- `key`: API key (default: "mahi4449839dbabkadbakwq1qqd")

**Response:**

```json
{
  "success": true,
  "msg": "Success",
  "status": 200,
  "data": {
    "gmid": "worli3",
    "gname": "Matka",
    "status": "active",
    "timer": 45,
    "roundId": "R12345",
    "mid": "M67890",
    "odds": {
      "gmid": "worli3",
      "markets": [
        {
          "mid": "M1",
          "name": "Main Market",
          "runners": [
            {
              "rid": "R1",
              "name": "Option A",
              "odds": 1.95,
              "status": "active"
            }
          ]
        }
      ]
    },
    "result": {
      "gmid": "worli3",
      "roundId": "R12344",
      "winner": "Option A",
      "result": "WIN",
      "timestamp": 1642784400000
    }
  }
}
```

## Usage Examples

### 1. Single Game Live Data

```tsx
import { useCasinoLive } from "@/hooks/api/useCasinoLive";

function GameComponent({ gmid }) {
  const { data, odds, result, status, isLoading, isConnected } =
    useCasinoLive(gmid);

  if (isLoading) return <div>Connecting...</div>;

  return (
    <div>
      <h2>{data?.gname}</h2>
      <div>Status: {isConnected ? "🟢 Live" : "🔴 Offline"}</div>
      {data?.timer && <div>Time: {data.timer}s</div>}
      {data?.roundId && <div>Round: {data.roundId}</div>}

      {/* Odds Display */}
      {odds?.markets.map((market) => (
        <div key={market.mid}>
          <h3>{market.name}</h3>
          {market.runners.map((runner) => (
            <button key={runner.rid} disabled={runner.status !== "active"}>
              {runner.name} @ {runner.odds}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 2. Multiple Games Dashboard

```tsx
import { useCasinoLiveMultiple } from "@/hooks/api/useCasinoLive";

function Dashboard({ games }) {
  const gmids = games.map((g) => g.gmid);
  const { getData, getStatus, connectedCount } = useCasinoLiveMultiple(gmids);

  return (
    <div>
      <div>
        Connected: {connectedCount} / {gmids.length}
      </div>
      {games.map((game) => {
        const liveData = getData(game.gmid);
        const status = getStatus(game.gmid);

        return (
          <div key={game.gmid}>
            <h3>{game.gname}</h3>
            <div>Status: {status}</div>
            {liveData?.timer && <div>{liveData.timer}s</div>}
          </div>
        );
      })}
    </div>
  );
}
```

### 3. Recent Results Tracking

```tsx
import { useCasinoResults } from "@/hooks/api/useCasinoLive";

function ResultsHistory({ gmid }) {
  const results = useCasinoResults(gmid, 10); // Last 10 results

  return (
    <div>
      <h3>Recent Results</h3>
      {results.map((result, idx) => (
        <div key={`${result.roundId}-${idx}`}>
          <div>Round: {result.roundId}</div>
          <div>Winner: {result.winner}</div>
          <div>Result: {result.result}</div>
          <div>{new Date(result.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Direct Service Usage (Advanced)

```tsx
import { casinoWebSocket } from "@/services/casinoWebSocket";

// Subscribe to updates
const unsubscribe = casinoWebSocket.subscribe("worli3", (message) => {
  console.log("Message type:", message.type);
  console.log("Data:", message.data);

  switch (message.type) {
    case "casino_data":
      // Handle game data update
      break;
    case "casino_odds":
      // Handle odds update
      break;
    case "casino_result":
      // Handle result
      break;
  }
});

// Check connection status
const status = casinoWebSocket.getStatus("worli3");
console.log("Connection status:", status); // 'connected' | 'polling' | 'disconnected'

// Clean up when done
unsubscribe();
```

## Connection Modes

### 1. WebSocket Mode (Preferred)

- Real-time bidirectional communication
- Endpoint: `ws://130.250.191.174:3009/casino/stream?gmid={id}&key={key}`
- Automatically reconnects on disconnect
- Max 5 reconnection attempts

### 2. HTTP Polling Mode (Fallback)

- Falls back automatically if WebSocket fails
- Polls every 2 seconds
- Same API endpoint as regular HTTP requests
- More reliable but higher latency

## Configuration

### Environment Variables

```env
# API Configuration
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_PROTOCOL=http
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd

# WebSocket Configuration
VITE_DIAMOND_WS_PROTOCOL=ws
```

### Polling Interval

Edit `casinoWebSocket.ts`:

```typescript
const timer = setInterval(poll, 2000); // Change 2000 to desired ms
```

### Reconnection Settings

Edit `casinoWebSocket.ts`:

```typescript
private maxReconnectAttempts = 5; // Max reconnection attempts
private reconnectDelay = 3000; // Base delay between attempts (ms)
```

## Message Types

### `casino_data`

Complete game state update including status, timer, round ID.

### `casino_odds`

Market odds update with runners and betting options.

### `casino_result`

Result of completed round with winner and outcome.

### `casino_status`

Game status change (active/inactive/suspended).

## Error Handling

The service handles:

- Network failures (auto-reconnect)
- WebSocket not supported (fallback to polling)
- Invalid game IDs (graceful skip)
- API errors (logged to console)
- Connection timeouts (auto-retry)

## Performance

- **Multiple games**: Efficiently manages separate connections per game
- **Auto cleanup**: Connections close when no subscribers remain
- **Debouncing**: Prevents redundant reconnection attempts
- **Memory efficient**: Clears old results and unused subscriptions

## Testing

### Test Individual Game

1. Navigate to `/casino/worli3` (or any game ID)
2. Check browser console for WebSocket logs
3. Verify live data displays (timer, status, odds)
4. Monitor connection status indicator

### Test Dashboard

1. Go to Casino page with multiple games
2. Import and use `<LiveCasinoGrid />` component
3. Verify connection count updates
4. Check individual game statuses

### Debug Logging

All WebSocket activity is logged with `[Casino WS]` prefix:

```
[Casino WS] Subscribing to game: worli3
[Casino WS] Starting HTTP polling for worli3
[Casino WS] Message received for worli3: casino_data
[Casino WS] Disconnecting from worli3
```

## Troubleshooting

### No Live Data Showing

1. Check browser console for `[Casino WS]` logs
2. Verify API endpoint is accessible
3. Confirm game ID is valid
4. Check API key is correct

### Connection Keeps Dropping

1. Check network stability
2. Verify server WebSocket support
3. Service will auto-fallback to HTTP polling
4. Increase `reconnectDelay` for unstable networks

### High CPU/Memory Usage

1. Limit number of simultaneous connections
2. Use `useCasinoLiveMultiple` instead of multiple `useCasinoLive`
3. Increase polling interval
4. Clean up subscriptions properly

## Future Enhancements

- [ ] WebSocket server-side implementation (currently polling only)
- [ ] Message compression for bandwidth optimization
- [ ] Batch updates for multiple games
- [ ] Historical data caching
- [ ] Live bet placement integration
- [ ] Real-time animations for updates
- [ ] Sound notifications for results
- [ ] Connection quality indicators
- [ ] Offline mode with cached data

## API Documentation

For complete API documentation, see:

- `DIAMOND_API_INTEGRATION.md`
- Diamond API endpoint: http://130.250.191.174:3009

## License

Part of MetaBull Arena platform.
