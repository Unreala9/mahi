# Diamond Betting API Integration

## Overview
This project integrates the **Diamond Betting API** to provide a comprehensive betting platform with sports betting and live casino games.

## API Configuration

### Base URL
```
http://130.250.191.174:3009
```

### API Key
```
mahi4449839dbabkadbakwq1qqd
```

The API key is passed as a query parameter: `?key=mahi4449839dbabkadbakwq1qqd`

## Implemented Features

### 🏆 Sports Betting

#### 1. All Sports & Matches
- **Endpoint**: `/allSportid` - Get list of all available sports
- **Endpoint**: `/tree` - Get all matches across all sports (live & upcoming)
- **Endpoint**: `/esid?sid={sportId}` - Get matches for specific sport

#### 2. Match Details & Odds
- **Endpoint**: `/getDetailsData?gmid={matchId}&sid={sportId}` - Get detailed match information
- **Endpoint**: `/getPriveteData?gmid={matchId}&sid={sportId}` - Get match odds, bookmaker, and fancy markets

#### 3. Live Scores
- **Endpoint**: `/score?gtv={graphicId}&sid={sportId}` - Get live score iframe URL

#### 4. Bet Management
- **POST** `/placed_bets` - Submit placed bets
- **POST** `/get-result` - Get bet results
- **GET** `/get_placed_bets?event_id={eventId}` - Get all results for an event

### 🎰 Live Casino

#### 1. Casino Tables
- **Endpoint**: `/casino/tableid` - Get all available casino tables

#### 2. Casino Game Data
- **Endpoint**: `/casino/data?type={tableId}` - Get live casino game data
- **Endpoint**: `/casino/result?type={tableId}` - Get last round result
- **Endpoint**: `/casino/detail_result?type={tableId}&mid={roundId}` - Get detailed round result

## File Structure

### Services
- **`src/services/diamondApi.ts`** - Core API service with all endpoints
  - getAllSportIds()
  - getAllMatches()
  - getMatchesBySport(sportId)
  - getMatchDetails(gmid, sid)
  - getMatchOdds(gmid, sid)
  - getCasinoTables()
  - getCasinoData(type)
  - placeBet(betData)
  - getResult(resultData)

### Hooks
- **`src/hooks/api/useDiamond.ts`** - React Query hooks for data fetching
  - useSportIds()
  - useAllMatches()
  - useMatchesBySport(sportId)
  - useMatchDetails(gmid, sid)
  - useMatchOdds(gmid, sid)
  - useCasinoTables()
  - useCasinoData(type)
  - usePlaceBet()

### Components
- **`src/components/sportsbook/DiamondMatchRow.tsx`** - Match display with expandable odds
- **`src/components/sportsbook/BetSlip.tsx`** - Updated to handle new bet format

### Pages
- **`src/pages/Sportsbook.tsx`** - Main sportsbook page with:
  - Sports filter sidebar
  - Live/Upcoming tabs
  - Real-time match updates (30s refresh)
  - Expandable odds display
  - Live match indicators
  
- **`src/pages/CasinoLive.tsx`** - Live casino page with:
  - Casino table selection
  - Real-time game data
  - Last result display
  - Live odds updates (5s refresh)

## Features

### Sportsbook Features
✅ Display all sports with icons
✅ Filter by sport
✅ Show live matches with 🔴 indicator
✅ Separate live and upcoming matches
✅ Real-time odds updates (10s refresh for odds, 30s for matches)
✅ Expandable match cards showing:
  - Match Odds (Back/Lay)
  - Bookmaker odds
  - Fancy markets
✅ Add selections to bet slip
✅ Support for both Back and Lay betting

### Casino Features
✅ List all casino tables
✅ Real-time game data
✅ Last result display
✅ Current round information
✅ Live odds display
✅ Auto-refresh (5s for casino data)

### Betting Features
✅ Multi-selection bet slip
✅ Support for single and accumulator bets
✅ Back and Lay betting support
✅ Live bet indicators
✅ Potential return calculation
✅ Demo mode support

## API Response Handling

### Sports Data Format
```typescript
{
  gmid: number;          // Match ID
  sid: number;           // Sport ID
  sname: string;         // Sport name
  name: string;          // Match name (e.g., "Team A vs Team B")
  is_live: boolean;      // Live match indicator
  start_date: string;    // Match start time
  cname: string;         // Competition name
}
```

### Odds Data Format
```typescript
{
  match_odds: [{
    nation: string;      // Runner name
    back: { price, size };
    lay: { price, size };
  }],
  bookmaker: [...],
  fancy: [{
    runner_name: string;
    runs: number;
    back: { price, size };
    lay: { price, size };
  }]
}
```

## Auto-Refresh Intervals
- **Match List**: 30 seconds
- **Match Odds**: 10 seconds
- **Casino Data**: 5 seconds
- **Casino Results**: 10 seconds
- **Sport IDs**: 5 minutes (cached)

## Navigation
- **Sportsbook**: `/sports`
- **Live Casino**: `/casino-live`

Access via sidebar menu:
- 🏆 Sportsbook
- 🎲 Live Casino

## Usage Examples

### Fetching Sports
```typescript
const { data: sports } = useSportIds();
// Returns: [{ sid: 1, name: "Cricket", icon: "🏏" }, ...]
```

### Fetching Matches
```typescript
// All matches
const { data: allMatches } = useAllMatches();

// Specific sport
const { data: matches } = useMatchesBySport(4); // Cricket
```

### Getting Match Odds
```typescript
const { data: odds } = useMatchOdds(gmid, sid);
// Returns: { match_odds: [...], bookmaker: [...], fancy: [...] }
```

### Placing a Bet
```typescript
const { mutate: placeBet } = usePlaceBet();

placeBet({
  event_id: 123456,
  event_name: "India vs Australia",
  market_id: 789,
  market_name: "Match Odds",
  market_type: "MATCH_ODDS"
});
```

## Error Handling
All API calls include:
- Network error handling
- Response validation
- Null data checks
- Console logging for debugging

## Next Steps
Potential enhancements:
1. WebSocket integration for real-time updates
2. Bet history tracking
3. User balance integration
4. Payment gateway integration
5. Live streaming integration
6. Advanced filters and search
7. Favorites and watchlists
8. Bet builder functionality
9. Cash-out feature
10. Statistics and analytics

## Support
For API documentation, refer to `api-1.json` in the project root.

## Notes
- All monetary values are in INR (₹)
- Match IDs (gmid) are unique across the platform
- Sport IDs (sid) are consistent across all endpoints
- Both Back (blue) and Lay (pink) betting are supported
- Live matches have auto-refresh enabled for odds
- Casino games refresh at 5-second intervals for live data
