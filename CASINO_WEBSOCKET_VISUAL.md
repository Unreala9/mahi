# Casino WebSocket - Visual Guide

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ CasinoGame   │  │ LiveGrid     │  │ Test Component│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                     React Hooks                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useCasinoLive(gmid)                                 │   │
│  │  useCasinoLiveMultiple(gmids[])                      │   │
│  │  useCasinoResults(gmid, limit)                       │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│              casinoWebSocket Service                         │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │                                                       │   │
│  │  ┌──────────────┐      ┌──────────────┐            │   │
│  │  │ WebSocket    │      │ HTTP Polling │            │   │
│  │  │ Connection   │ ───▶ │ Fallback     │            │   │
│  │  └──────────────┘      └──────────────┘            │   │
│  │                                                       │   │
│  │  • Subscription Management                           │   │
│  │  • Auto Reconnection                                 │   │
│  │  • Status Tracking                                   │   │
│  │  • Cleanup Logic                                     │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │    Diamond API Endpoint         │
        │  http://130.250.191.174:3009    │
        │  /casino/data?type=4&gmid=...   │
        └─────────────────────────────────┘
```

## 🔄 Data Flow

```
1. Component Mount
   ↓
2. useCasinoLive(gmid) called
   ↓
3. casinoWebSocket.subscribe(gmid, callback)
   ↓
4. Try WebSocket connection
   ↓
   ├─ Success → Real-time updates
   │
   └─ Failure → HTTP Polling (every 2s)
      ↓
5. API Response Received
   ↓
6. Transform to CasinoWebSocketMessage
   ↓
7. Notify all subscribers
   ↓
8. Update React state
   ↓
9. Component re-renders with live data
```

## 📊 Connection States

```
disconnected
    │
    ├─ subscribe() called
    │
    ▼
connecting
    │
    ├─ WebSocket success ──────▶ connected
    │                               │
    │                               │ (real-time updates)
    │                               │
    ├─ WebSocket fails ─────────▶ polling
    │                               │
    │                               │ (HTTP every 2s)
    │                               │
    └─ Max retries reached ─────▶ disconnected
```

## 🎮 Hook Usage Patterns

### Pattern 1: Single Game

```tsx
import { useCasinoLive } from "@/hooks/api/useCasinoLive";

function GamePage({ gameId }) {
  const { data, isConnected } = useCasinoLive(gameId);

  return (
    <div>
      <StatusIndicator connected={isConnected} />
      <Timer seconds={data?.timer} />
      <RoundDisplay roundId={data?.roundId} />
      <OddsDisplay odds={data?.odds} />
    </div>
  );
}
```

### Pattern 2: Multiple Games Dashboard

```tsx
import { useCasinoLiveMultiple } from "@/hooks/api/useCasinoLive";

function Dashboard({ games }) {
  const gmids = games.map((g) => g.gmid);
  const { getData, connectedCount } = useCasinoLiveMultiple(gmids);

  return (
    <div>
      <StatusBar connected={connectedCount} total={gmids.length} />
      <Grid>
        {games.map((game) => (
          <GameCard game={game} liveData={getData(game.gmid)} />
        ))}
      </Grid>
    </div>
  );
}
```

### Pattern 3: Results History

```tsx
import { useCasinoResults } from "@/hooks/api/useCasinoLive";

function ResultsPanel({ gameId }) {
  const results = useCasinoResults(gameId, 10);

  return (
    <div>
      <h3>Last 10 Results</h3>
      {results.map((result) => (
        <ResultCard
          key={result.roundId}
          winner={result.winner}
          result={result.result}
          timestamp={result.timestamp}
        />
      ))}
    </div>
  );
}
```

## 🎨 UI Component Structure

```
LiveCasinoGrid
├─ StatusBar (connection count)
└─ Grid
   ├─ GameCard 1 (with live data)
   │  ├─ Name
   │  ├─ Connection Indicator
   │  ├─ Timer
   │  └─ Round ID
   │
   ├─ GameCard 2 (with live data)
   └─ GameCard N...

CasinoGame (Enhanced)
├─ Header
│  ├─ Game Name
│  └─ Connection Status
├─ Main Content
│  ├─ Live Timer
│  ├─ Round ID
│  ├─ Game Image
│  └─ Live Odds
│     ├─ Market 1
│     │  └─ Runners with odds
│     └─ Market N...
└─ Sidebar
   ├─ Last Result
   └─ Connection Info

CasinoWebSocketTest
├─ Connection Controls
│  ├─ Game ID Input
│  ├─ Connect Button
│  └─ Disconnect Button
├─ Status Display
│  └─ Connection Indicator
├─ Live Data Display
│  ├─ Game Info
│  ├─ Timer
│  └─ Round ID
├─ Odds Display (if available)
└─ Debug Info
   └─ Raw JSON Data
```

## 🔧 Service Internal Structure

```typescript
CasinoWebSocketService
│
├─ connections: Map<gmid, WebSocket>
│  └─ One WebSocket per game
│
├─ subscribers: Map<gmid, Set<callbacks>>
│  └─ Multiple callbacks per game
│
├─ pollingTimers: Map<gmid, Timer>
│  └─ HTTP polling fallback
│
├─ reconnectTimers: Map<gmid, Timer>
│  └─ Reconnection attempts
│
└─ Methods:
   ├─ subscribe(gmid, callback) → unsubscribe
   ├─ connect(gmid)
   ├─ disconnect(gmid)
   ├─ getStatus(gmid)
   └─ disconnectAll()
```

## 📡 Message Types

```typescript
CasinoWebSocketMessage {
  type: 'casino_data' | 'casino_odds' | 'casino_result'
  gmid: string
  data: CasinoGameData | CasinoOdds | CasinoResult
  timestamp: number
}

┌─────────────────────────────────────┐
│ casino_data                         │
├─────────────────────────────────────┤
│ • gmid                              │
│ • gname                             │
│ • status (active/inactive/suspended)│
│ • timer (seconds remaining)         │
│ • roundId (current round)           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ casino_odds                         │
├─────────────────────────────────────┤
│ • gmid                              │
│ • markets[]                         │
│   ├─ mid                            │
│   ├─ name                           │
│   └─ runners[]                      │
│      ├─ rid                         │
│      ├─ name                        │
│      ├─ odds (decimal)              │
│      └─ status                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ casino_result                       │
├─────────────────────────────────────┤
│ • gmid                              │
│ • roundId                           │
│ • winner                            │
│ • result                            │
│ • timestamp                         │
└─────────────────────────────────────┘
```

## 🎯 Real-World Example

```
User opens CasinoGame page for "worli3"
         │
         ▼
useCasinoLive("worli3") hook activates
         │
         ▼
Service starts HTTP polling
         │
         ├─ Poll #1 (0s) → Get initial data
         │   └─ Timer: 58s, Round: R12345
         │
         ├─ Poll #2 (2s) → Update
         │   └─ Timer: 56s, Round: R12345
         │
         ├─ Poll #3 (4s) → Update
         │   └─ Timer: 54s, Round: R12345
         │
         └─ ... continues every 2s

UI updates automatically with each poll:
┌────────────────────────────┐
│ 🟢 Matka - LIVE            │
│ ⏱️  Timer: 54s              │
│ 🎲 Round: R12345           │
│                            │
│ ┌──────────┐ ┌──────────┐ │
│ │ Option A │ │ Option B │ │
│ │   1.95   │ │   2.10   │ │
│ └──────────┘ └──────────┘ │
└────────────────────────────┘
```

## 🔍 Debugging Flow

```
Problem: No live data showing
         │
         ├─ Check 1: Is gmid valid?
         │   └─ Console: [Casino WS] Subscribing to game: worli3
         │
         ├─ Check 2: Is service connecting?
         │   └─ Console: [Casino WS] Starting HTTP polling for worli3
         │
         ├─ Check 3: Are API calls succeeding?
         │   └─ Network tab: Check /casino/data requests
         │
         ├─ Check 4: Is data being received?
         │   └─ Console: [Casino WS] Message received for worli3
         │
         └─ Check 5: Is component mounted?
             └─ React DevTools: Check hook state
```

## 📊 Performance Monitoring

```
Monitor These Metrics:
├─ Connection Count
│  └─ casinoWebSocket.connections.size
│
├─ Polling Timers
│  └─ casinoWebSocket.pollingTimers.size
│
├─ Active Subscribers
│  └─ casinoWebSocket.subscribers.size
│
├─ Network Requests
│  └─ DevTools Network Tab
│     └─ Should see requests every 2s per game
│
└─ Memory Usage
   └─ DevTools Performance Tab
      └─ Should stay stable over time
```

## ✅ Success Indicators

```
Working Correctly When:
✓ Console shows [Casino WS] logs
✓ Connection status shows "polling" or "connected"
✓ Timer counts down in UI
✓ Round ID displays correctly
✓ Network tab shows periodic API calls
✓ No error messages in console
✓ Component updates automatically
✓ Memory usage stays stable
```

## 🚀 Quick Test Checklist

```
□ Import: import { useCasinoLive } from "@/hooks/api/useCasinoLive"
□ Use hook: const { data, isConnected } = useCasinoLive("worli3")
□ Check console: Look for [Casino WS] logs
□ Verify status: isConnected should become true
□ Watch data: Timer should update every 2 seconds
□ Test cleanup: Navigate away, check for disconnection log
□ Test multiple: Use useCasinoLiveMultiple with array of IDs
□ Check network: API calls every 2s in Network tab
```

---

**Visual Summary:**

- **Architecture**: Service → Hooks → Components
- **Connection**: WebSocket attempt → HTTP fallback
- **Updates**: Every 2 seconds via polling
- **State Flow**: API → Service → Hook → Component
- **Debug**: Console logs at every step
- **Success**: Live timer updates automatically
