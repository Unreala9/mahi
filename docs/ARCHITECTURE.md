# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Diamond API Server                       │
│          http://130.250.191.174:3009                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ HTTP Polling
                    │ (15s intervals)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              WebSocket Service (websocket.ts)                │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Sports    │  │  Matches   │  │   Cache    │           │
│  │  Poller    │  │  Poller    │  │  Manager   │           │
│  │  (5 min)   │  │  (15 sec)  │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│         Event Emitter (sports:update, matches:update)        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ Event Subscription
                    ▼
┌─────────────────────────────────────────────────────────────┐
│        useLiveSportsData Hook (useLiveSportsData.ts)        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    State Management                   │  │
│  │  • sports: SportId[]                                  │  │
│  │  • matches: MatchEvent[]                             │  │
│  │  • liveMatches: MatchEvent[]                         │  │
│  │  • isLoading: boolean                                │  │
│  │  • isConnected: boolean                              │  │
│  │  • error: string | null                              │  │
│  │  • lastUpdate: number                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│              Methods: refresh(), on(), off()                 │
└───────────────────┬─────────────────┬───────────────────────┘
                    │                 │
        ┌───────────┴────────┐   ┌───┴──────────┐
        ▼                    ▼   ▼              ▼
┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐
│    Sidebar       │  │   Sportsbook    │  │  Other       │
│   Component      │  │     Page        │  │ Components   │
└──────────────────┘  └─────────────────┘  └──────────────┘
```

## Data Flow Sequence

```
1. Application Starts
   ├─> WebSocket Service initializes
   ├─> Check for cached data
   └─> Start polling immediately

2. Component Mounts (Sidebar/Sportsbook)
   ├─> Call useLiveSportsData()
   ├─> Subscribe to WebSocket events
   ├─> Get cached data instantly
   └─> Show UI with data

3. WebSocket Service Polling
   ├─> Fetch sports list (every 5 min)
   ├─> Fetch matches (every 15 sec)
   ├─> Compare with cached data
   └─> Emit events only if changed

4. Hook Receives Events
   ├─> sports:update event
   ├─> matches:update event
   ├─> Update component state
   └─> Trigger React re-render

5. Component Re-renders
   ├─> Display new data
   ├─> Update live counters
   └─> Show connection status

6. User Interaction
   ├─> Click refresh button
   ├─> Call refresh() method
   └─> Force immediate update

7. Component Unmounts
   ├─> Unsubscribe from events
   ├─> Clean up listeners
   └─> Keep service running for other components
```

## Component Hierarchy

```
App
 │
 ├─ MainLayout
 │   │
 │   ├─ Sidebar ───────────┐
 │   │   └─ useLiveSportsData()  } Share same data instance
 │   │                            } via singleton WebSocket service
 │   └─ MainContent               }
 │       │                        }
 │       └─ Sportsbook ───────────┘
 │           └─ useLiveSportsData()
 │
 └─ Other Routes
     └─ (Can also use useLiveSportsData())
```

## State Management

```
┌────────────────────────────────────────────────────────┐
│              WebSocket Service (Singleton)              │
│                                                         │
│  Global State:                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  cache: {                                        │ │
│  │    sports: SportId[],                           │ │
│  │    matches: MatchEvent[],                       │ │
│  │    lastUpdate: timestamp                        │ │
│  │  }                                               │ │
│  │                                                  │ │
│  │  listeners: Map<event, Set<callback>>           │ │
│  │  isConnecting: boolean                          │ │
│  │  shouldReconnect: boolean                       │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
                           │
                           │ Event emission
                           ▼
┌────────────────────────────────────────────────────────┐
│           React Component Local State                  │
│              (via useLiveSportsData)                   │
│                                                         │
│  Component Instance State:                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │  sports: SportId[]           (from cache)       │ │
│  │  matches: MatchEvent[]       (from cache)       │ │
│  │  liveMatches: MatchEvent[]   (filtered)        │ │
│  │  isLoading: boolean          (local state)     │ │
│  │  isConnected: boolean        (from service)    │ │
│  │  error: string | null        (local state)     │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│                    Request Layer                        │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  Cache Layer                            │
│  • Stores last successful response                      │
│  • Returns cached data immediately                      │
│  • Updates in background                                │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Change Detection Layer                     │
│  • Compares new data with cached data                   │
│  • Generates hash for quick comparison                  │
│  • Only emits events if data changed                    │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                Event Emission Layer                     │
│  • Emits specific events (sports:update, etc.)          │
│  • Batches related updates                              │
│  • Throttles rapid changes                              │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│               React Update Layer                        │
│  • useMemo for expensive calculations                   │
│  • useCallback for stable references                    │
│  • Conditional rendering for optimization               │
└─────────────────────────────────────────────────────────┘
```

## Polling Strategy

```
Time (seconds)    0    5    10   15   20   25   30
                  │    │    │    │    │    │    │
Sports            ●────────────────────────────────► (5 min)
                  │    │    │    │    │    │    │
Matches           ●────────●────────●────────●─────► (15 sec)
                  │    │    │    │    │    │    │
Live Odds         ●────●────●────●────●────●────●─► (5 sec)
                  │    │    │    │    │    │    │
Change Detection  ●────●────●────●────●────●────●─►
                  │    │    │    │    │    │    │
Event Emission    ●────?────?────●────?────?────●─►
                  │         (only if changed)      │
                  │                                 │
                  └─────────────────────────────────┘
                           30 second window

Legend:
  ● = API Call
  ? = Potential Event (only if data changed)
  ─ = Time progression
```

## Memory Management

```
Component Lifecycle
┌────────────────────────────────────────────────────────┐
│                                                         │
│  Mount                                                 │
│    ├─> Subscribe to events                            │
│    ├─> Get cached data                                │
│    └─> Start receiving updates                        │
│                                                         │
│  Update (on data change)                               │
│    ├─> Receive event                                  │
│    ├─> Update local state                             │
│    └─> Trigger re-render                              │
│                                                         │
│  Unmount                                               │
│    ├─> Unsubscribe from events ✅                     │
│    ├─> Clear local state ✅                           │
│    └─> WebSocket service continues (for other comps)  │
│                                                         │
└────────────────────────────────────────────────────────┘

WebSocket Service Lifecycle
┌────────────────────────────────────────────────────────┐
│                                                         │
│  Initialize (on first component mount)                 │
│    ├─> Create singleton instance                      │
│    ├─> Initialize cache                               │
│    └─> Start polling                                  │
│                                                         │
│  Running (while any component subscribed)              │
│    ├─> Poll APIs                                      │
│    ├─> Update cache                                   │
│    └─> Emit events                                    │
│                                                         │
│  Persist (even when components unmount)                │
│    └─> Keep running for future mounts                 │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────┐
│   API Call     │
└───────┬────────┘
        │
        ▼
    ┌───────┐
    │Success?│
    └───┬───┘
        │
   ┌────┴────┐
   │   YES   │   NO
   │         │
   ▼         ▼
┌──────┐  ┌──────────────┐
│Cache │  │ Error Handler │
│Update│  └──────┬────────┘
└──┬───┘         │
   │             ▼
   │    ┌────────────────┐
   │    │ Emit Error Event│
   │    └────────┬────────┘
   │             │
   ▼             ▼
┌──────────────────────┐
│   Retry Logic        │
│  • Max 10 attempts   │
│  • 5s delay          │
│  • Exponential back  │
└──────────────────────┘
```

---

This architecture ensures:
- ✅ Fast initial load (cached data)
- ✅ Real-time updates (polling)
- ✅ Efficient memory usage (cleanup)
- ✅ No unnecessary re-renders (change detection)
- ✅ Graceful error handling (retry logic)
- ✅ Scalable (singleton service)
