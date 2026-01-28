# Sports Betting System - Complete Implementation

## Overview

This is a comprehensive sports betting system with real-time WebSocket connections, complete betting logic, and full UI integration for the Diamond API.

## Architecture

### Services

#### 1. Enhanced Sports WebSocket Service (`src/services/enhancedSportsWebSocket.ts`)

- Real-time odds updates for Match Odds, Bookmaker, and Fancy markets
- Live score updates integration
- Polling-based fallback (since Diamond API uses HTTP)
- Automatic subscription management
- Caching for efficient updates

**Features:**

- Subscribe to specific events and markets
- Automatic polling at configurable intervals (2s for odds, 3s for scores)
- Change detection to only broadcast when data updates
- Clean unsubscribe mechanism

**Usage:**

```typescript
import { enhancedSportsWebSocket } from "@/services/enhancedSportsWebSocket";

const unsubscribe = enhancedSportsWebSocket.subscribe(
  eventId,
  sid,
  (message) => {
    if (message.type === "odds_update") {
      // Handle odds update
    }
  },
  {
    markets: ["match_odds", "bookmaker", "fancy"],
    includeScore: true,
  },
);
```

#### 2. Enhanced Placed Bets Service (`src/services/enhancedPlacedBetsService.ts`)

- Place bets via POST API
- Monitor placed bets in real-time
- Get bet results
- Subscribe to bet events (placed, settled)
- Automatic polling for bet updates

**API Integration:**

```typescript
// Place a bet
const result = await enhancedPlacedBetsService.placeBet({
  event_id: 45554544,
  event_name: "IND vs AUS",
  market_id: 45554544,
  market_name: "10 OVER RUNS AUS(IND vs AUS)ADV",
  market_type: "FANCY",
  selection: "Yes",
  stake: 1000,
  odds: 95,
  bet_type: "BACK",
});

// Get placed bets
const bets = await enhancedPlacedBetsService.getPlacedBets(eventId);

// Get results
const results = await enhancedPlacedBetsService.getResults({
  event_id: 45554544,
  event_name: "IND vs AUS",
  market_id: 45554544,
  market_name: "10 OVER RUNS AUS(IND vs AUS)ADV",
});
```

#### 3. Betting Logic Service (`src/services/bettingLogicService.ts`)

- Complete bet slip management
- Stake validation
- Profit/liability calculations
- Balance management
- Quick bet functionality

**Features:**

- Add/remove bets from slip
- Update stakes with validation
- Calculate potential profits
- Place multiple bets at once
- Market-specific rules and limits

**Usage:**

```typescript
import { useBettingLogic } from "@/services/bettingLogicService";

const {
  betSlip,
  balance,
  exposure,
  totalStake,
  totalPotentialProfit,
  addToBetSlip,
  removeFromBetSlip,
  updateStake,
  placeBets,
  clearBetSlip,
} = useBettingLogic(userId);
```

### Components

#### 1. Market Odds Display (`src/components/sportsbook/MarketOddsDisplay.tsx`)

- Displays odds in back/lay format
- Color-coded buttons (blue for back, pink for lay)
- Shows runner names, odds, and available liquidity
- Handles suspended markets
- Mobile responsive design

#### 2. Enhanced Bet Slip (`src/components/sportsbook/EnhancedBetSlip.tsx`)

- Shows all bets in slip
- Edit stakes inline
- Quick stake buttons (100, 500, 1000, 5000)
- Shows potential profit per bet
- Total stake, exposure, and profit calculations
- Balance validation
- Place all bets with one click

#### 3. Enhanced Diamond Match Page (`src/pages/EnhancedDiamondMatch.tsx`)

- Full match details with live status
- Live score integration
- Live TV iframe
- Tabbed interface for different markets:
  - Match Odds
  - Bookmaker
  - Fancy/Session
- Real-time odds updates via WebSocket
- Integrated bet slip sidebar
- Responsive 3-column layout

### Types

#### Sports Betting Types (`src/types/sports-betting.ts`)

Comprehensive type definitions for:

- Market types: MATCH_ODDS, BOOKMAKER, FANCY, SESSION, TOSS
- Bet types: BACK, LAY
- Bet statuses: PENDING, MATCHED, SETTLED, CANCELLED
- Odds data structures
- WebSocket message formats
- API response types

### Hooks

#### Sports Betting Hooks (`src/hooks/api/useSportsBetting.ts`)

**1. useLiveMatchOdds**

```typescript
const { oddsData, isConnected, lastUpdate } = useLiveMatchOdds(eventId, sid, {
  markets: ["match_odds", "bookmaker", "fancy"],
  includeScore: true,
});
```

**2. usePlacedBetsMonitor**

```typescript
const { placedBets, isConnected, lastUpdate } = usePlacedBetsMonitor(eventId);
```

**3. usePlaceBet**

```typescript
const { placeBet, isPlacing, error } = usePlaceBet();

const bet = await placeBet(
  eventId,
  eventName,
  marketId,
  marketName,
  "FANCY",
  "Yes",
  95,
  "BACK",
  1000,
);
```

**4. useBetResults**

```typescript
const { results, fetchResults, isLoading, error } = useBetResults(eventId);

await fetchResults(marketId, marketName, eventName);
```

## API Endpoints

### 1. Live Score API

```
GET https://score.akamaized.uk/diamond-live-score?gmid={eventId}
```

### 2. Place Bet API

```
POST http://130.250.191.174:3009/placed_bets?key=mahi4449839dbabkadbakwq1qqd
Content-Type: application/json

{
  "event_id": 45554544,
  "event_name": "IND vs AUS",
  "market_id": 45554544,
  "market_name": "10 OVER RUNS AUS(IND vs AUS)ADV",
  "market_type": "FANCY",
  "selection": "Yes",
  "stake": 1000,
  "odds": 95,
  "bet_type": "BACK"
}
```

### 3. Get Results API

```
POST http://130.250.191.174:3009/get-result?key=mahi4449839dbabkadbakwq1qqd
Content-Type: application/json

{
  "event_id": 45554544,
  "event_name": "IND vs AUS",
  "market_id": 45554544,
  "market_name": "10 OVER RUNS AUS(IND vs AUS)ADV"
}
```

### 4. Get Placed Bets API

```
GET http://130.250.191.174:3009/get_placed_bets?event_id={eventId}&key=mahi4449839dbabkadbakwq1qqd
```

## Betting Rules

### Stake Limits

- **Match Odds**: Min ₹100, Max ₹25,000, Max Profit ₹100,000
- **Bookmaker**: Min ₹100, Max ₹25,000, Max Profit ₹100,000
- **Fancy/Session**: Min ₹100, Max ₹25,000, Max Profit ₹100,000
- **Toss**: Min ₹100, Max ₹10,000, Max Profit ₹10,000

### Odds Limits

- Minimum odds: 1.01
- Maximum odds: 1000

### Profit Calculations

**Match Odds & Bookmaker:**

- Back: `profit = stake × (odds - 1)`
- Lay: `liability = stake × (odds - 1)`

**Fancy/Session:**

- Back: `profit = (stake × runs) / 100`
- Lay: `liability = (stake × runs) / 100`

## Real-Time Features

### Odds Updates

- Automatic polling every 2 seconds
- Change detection to minimize unnecessary updates
- Supports multiple simultaneous subscriptions
- Cached data for performance

### Score Updates

- Live score polling every 3 seconds
- Commentary and ball-by-ball updates
- Team scores, overs, wickets

### Bet Updates

- Monitor placed bets in real-time
- Automatic detection of new bets
- Status change notifications (matched, settled)
- Result declarations

## Usage Example

```typescript
import { EnhancedDiamondMatch } from '@/pages/EnhancedDiamondMatch';

// Route setup
<Route path="/match/:gmid/:sid?" element={<EnhancedDiamondMatch />} />
```

The page will:

1. Load match details
2. Connect to real-time odds updates
3. Display live scores (if live)
4. Show all available markets
5. Allow bet placement via bet slip
6. Monitor placed bets
7. Update balance and exposure

## Environment Variables

```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
```

## Future Enhancements

1. **True WebSocket Support**: When Diamond API adds WebSocket endpoints
2. **User Authentication**: Integrate with Supabase auth for user-specific bets
3. **Bet History**: Track all user bets with filtering and sorting
4. **Live Cashout**: Support for cashing out bets before settlement
5. **Bet Builder**: Accumulator and system bet support
6. **Push Notifications**: Notify users of bet outcomes
7. **Analytics Dashboard**: Betting statistics and insights
8. **Multi-Currency**: Support for different currencies
9. **Social Betting**: Share bets, follow tipsters
10. **Virtual Sports**: Integrate virtual sports betting

## Testing

### Manual Testing Checklist

- [ ] Load match page with valid gmid/sid
- [ ] Verify real-time odds updates
- [ ] Add bet to slip
- [ ] Edit stake amount
- [ ] Validate stake limits
- [ ] Place single bet
- [ ] Place multiple bets
- [ ] Check balance updates
- [ ] Monitor placed bets
- [ ] Verify bet settlement
- [ ] Test on mobile devices
- [ ] Test with suspended markets
- [ ] Test error handling

## License

Proprietary - All rights reserved
