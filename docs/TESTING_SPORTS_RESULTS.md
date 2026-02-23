# Testing Sports Results API

## Quick Start

### 1. Access the Test Page

Navigate to: **http://localhost:5173/test-sports-results**

This dedicated test page allows you to test both new API endpoints in a user-friendly interface.

## Test Endpoints

### 1. `/bet-incoming` - Register Bet Placement

**Purpose:** Track that a bet has been placed (required before fetching results)

**Request:**

```json
{
  "event_id": 45554544,
  "event_name": "IND vs AUS",
  "market_id": 8845554544,
  "market_name": "9 OVER RUNS AUS(IND vs AUS)ADV",
  "market_type": "FANCY",
  "client_ref": "mahi_client",
  "api_key": "knqkdkqndkqn",
  "sport_id": "4"
}
```

### 2. `/get-result` - Fetch Result

**Purpose:** Get the declared result for a market

**Request:**

```json
{
  "event_id": 45554544,
  "event_name": "IND vs AUS",
  "market_id": 45554544,
  "market_name": "10 OVER RUNS AUS(IND vs AUS)ADV",
  "market_type": "FANCY",
  "client_ref": "mahi_client"
}
```

**Response:**

```json
{
  "id": 1,
  "event_id": "45554544",
  "event_name": "IND vs AUS",
  "market_id": "45554544",
  "market_name": "10 OVER RUNS AUS(IND vs AUS)ADV",
  "market_type": "FANCY",
  "sport_id": 4,
  "is_declared": true,
  "is_roleback": false,
  "final_result": "50",
  "createdAt": "2026-02-11T11:30:16+08:00"
}
```

## Testing Flow

### Option 1: Complete Automated Flow

1. Click **"Test Complete Flow"** button
2. Watch as it:
   - Registers the bet via `/bet-incoming`
   - Waits 1 second
   - Fetches the result via `/get-result`
3. Review the logs to see each step

### Option 2: Manual Step-by-Step

1. **Load Example Data:**
   - Click "Fancy Example" or "Match Odds Example"
   - Or manually enter your test data

2. **Register Bet:**
   - Click "Test /bet-incoming"
   - Verify success in logs

3. **Fetch Result:**
   - Click "Test /get-result"
   - View the result details

### Option 3: Custom Test Data

1. Fill in the form with your own:
   - Event ID and Name
   - Market ID and Name
   - Market Type (MATCH_ODDS, BOOKMAKER, or FANCY)
   - Sport ID (Cricket = 4)

2. Run individual tests or complete flow

## Market Types

- **MATCH_ODDS**: Standard match winner markets
- **BOOKMAKER**: Bookmaker markets
- **FANCY**: Session/fancy markets (e.g., "10 OVER RUNS")

## Sport IDs

- `1` - ⚽ Soccer
- `2` - 🎾 Tennis
- `4` - 🏏 Cricket (default)
- `5` - 🏀 Basketball

## Interpreting Results

### Success Indicators

- ✅ Green badges = Success
- Check marks in logs
- Result data displayed in JSON format

### Result Fields

- `is_declared`: Whether the market has been settled
- `final_result`: The winning result (e.g., "50" for runs)
- `is_roleback`: If the result was rolled back/cancelled

### Error Handling

- ❌ Red badges = Error
- Error messages shown in logs
- Check network/console for details

## Testing in Production Code

The integration is automatic in your betting flow:

```typescript
// When a bet is placed:
await diamondApi.registerPlacedBet({
  event_id: 45554544,
  event_name: "IND vs AUS",
  market_id: 8845554544,
  market_name: "9 OVER RUNS",
  market_type: "FANCY",
  sport_id: 4,
});

// Later, to fetch result:
const result = await diamondApi.getMarketResult({
  event_id: 45554544,
  event_name: "IND vs AUS",
  market_id: 45554544,
  market_name: "9 OVER RUNS",
  market_type: "FANCY",
});
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_RESULTS_API_URL=https://dia-results.cricketid.xyz/api
VITE_RESULTS_API_KEY=knqkdkqndkqn
VITE_RESULTS_CLIENT_REF=mahi_client
```

## Troubleshooting

### Issue: "Failed to register bet"

- Check network connectivity
- Verify API key in `.env`
- Ensure event_id and market_id are valid numbers

### Issue: "No result data returned"

- The market may not be declared yet
- Verify you called `/bet-incoming` first
- Check if the market_id matches exactly

### Issue: "CORS errors"

- Ensure you're using the proxy or correct domain
- Check API URL in environment variables

## Development Tools

- **Browser DevTools**: Check Network tab for raw requests/responses
- **Console Logs**: All API calls are logged with `[Diamond API]` prefix
- **Test Page Logs**: Real-time log viewer in the test UI

## Next Steps

Once testing is successful:

1. Place real bets through the sportsbook UI
2. Verify bet registration happens automatically
3. Check that results can be fetched for settled markets
4. Monitor logs for any errors or issues
