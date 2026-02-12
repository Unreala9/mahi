# Casino Betting System - Quick Reference

## 🎯 Key Differences: Casino vs Sports

| Aspect            | Sports Betting              | Casino Betting         |
| ----------------- | --------------------------- | ---------------------- |
| **ID Structure**  | `event_id` + `market_id`    | `game_id` (gmid) only  |
| **Bet Tracking**  | `/placed_bets` API required | Local DB only          |
| **Result API**    | `/get-result`               | `/casino/result`       |
| **Settlement**    | Match completion            | Round completion       |
| **Odds Source**   | Live API polling            | Provider auto-update   |
| **Round Concept** | No rounds                   | Each round is separate |

---

## 📡 API Endpoints

### Diamond Casino API

```bash
# 1. Get Casino Games List
GET http://130.250.191.174:3009/casino/data?type=1&key=API_KEY

# 2. Get Casino Results
GET http://130.250.191.174:3009/casino/result?type=1&key=API_KEY

# 3. Get Detailed Result for Specific Game
GET http://130.250.191.174:3009/casino/detail_result?type=1&mid=dt20&key=API_KEY
```

### Cloudflare Worker Endpoints

```bash
# 1. Get Casino Games (Proxied)
GET https://your-worker.workers.dev/casino/data?type=1

# 2. Get Casino Results (Proxied)
GET https://your-worker.workers.dev/casino/result?type=1

# 3. Place Casino Bet
POST https://your-worker.workers.dev/casino/bet
Content-Type: application/json

{
  "user_id": "uuid",
  "game_id": "dt20",
  "game_name": "Dragon Tiger",
  "round_id": "20260211-1234",
  "selection": "Dragon",
  "odds": 1.98,
  "stake": 100
}

# 4. Manual Settlement (Admin)
POST https://your-worker.workers.dev/casino/settle
Content-Type: application/json

{
  "game_id": "dt20",
  "round_id": "20260211-1234",
  "result": "Dragon"
}
```

---

## 🗄️ Database Schema

### casino_bets table

```sql
id              bigserial PRIMARY KEY
user_id         uuid (FK to auth.users)
game_id         text (e.g., 'dt20')
game_name       text
round_id        text
selection       text (e.g., 'Dragon', 'Player', 'Red')
odds            numeric(10,4)
stake           numeric(18,2)
status          text ('PENDING', 'WIN', 'LOSS', 'VOID')
win_amount      numeric(18,2)
created_at      timestamptz
settled_at      timestamptz
```

### casino_results table (Anti-Duplicate)

```sql
id              bigserial PRIMARY KEY
game_id         text
round_id        text
result          text (winning selection)
raw             jsonb (full API response)
created_at      timestamptz
UNIQUE(game_id, round_id)  -- Prevents duplicate settlement
```

---

## 🔄 Bet Flow

```
1. User selects game + selection + stake
   ↓
2. Frontend calls Worker /casino/bet
   ↓
3. Worker validates wallet balance
   ↓
4. Worker deducts from wallet
   ↓
5. Worker saves bet to casino_bets (status: PENDING)
   ↓
6. Worker logs transaction
   ↓
7. Return success to frontend
```

---

## ⚙️ Auto-Settlement Flow

```
CRON (every 15 seconds)
   ↓
1. Fetch /casino/result from Diamond API
   ↓
2. For each result:
   ├─ Check if already settled (casino_results table)
   ├─ If new: Save to casino_results
   ├─ Find PENDING bets (game_id + round_id match)
   ├─ For each bet:
   │  ├─ Compare bet.selection with result.winner
   │  ├─ If match: status = WIN, calculate payout
   │  ├─ If no match: status = LOSS
   │  ├─ Update bet in casino_bets
   │  └─ If WIN: Credit wallet + log transaction
   └─ Done
```

---

## 🎮 Common Casino Games

| Game ID    | Game Name        | Selections           |
| ---------- | ---------------- | -------------------- |
| `dt20`     | Dragon Tiger     | Dragon, Tiger, Tie   |
| `dt6`      | Dragon Tiger 6   | Dragon, Tiger, Tie   |
| `teen`     | Teen Patti       | Player A, Player B   |
| `teen20`   | Teen Patti 20-20 | Player A, Player B   |
| `poker`    | Poker            | Player, Banker       |
| `poker6`   | Poker 6          | Player, Banker       |
| `lucky7`   | Lucky 7          | Low, High, Lucky 7   |
| `ab20`     | Andar Bahar      | Andar, Bahar         |
| `baccarat` | Baccarat         | Player, Banker, Tie  |
| `32cards`  | 32 Cards         | 8, 9, 10, J, Q, K, A |

---

## 💡 Frontend Usage Examples

### Fetch Casino Games

```typescript
import { casinoBettingService } from "@/services/casinoBettingService";

const games = await casinoBettingService.fetchCasinoGames();
console.log(games);
// [{ gmid: 'dt20', gname: 'Dragon Tiger', ... }]
```

### Place Casino Bet

```typescript
const result = await casinoBettingService.placeBet({
  user_id: userId,
  game_id: "dt20",
  game_name: "Dragon Tiger",
  round_id: "current-round-id",
  selection: "Dragon",
  odds: 1.98,
  stake: 100,
});

if (result.success) {
  console.log("Bet placed!", result.bet);
}
```

### Get Bet History

```typescript
const bets = await casinoBettingService.getBetHistory("PENDING");
console.log("Pending bets:", bets);
```

### Subscribe to Real-Time Updates

```typescript
const unsubscribe = casinoBettingService.subscribeToBetUpdates((bet) => {
  console.log("Bet updated:", bet);
  if (bet.status === "WIN") {
    toast.success(`You won ₹${bet.win_amount}!`);
  }
});

// Cleanup
unsubscribe();
```

---

## 🔐 Security Best Practices

1. **Never expose API keys in frontend**
   - ✅ Use Cloudflare Worker as proxy
   - ❌ Don't call Diamond API directly from React

2. **Use Service Role Key server-side only**
   - ✅ Store in Cloudflare secrets
   - ❌ Never commit to git

3. **Validate wallet balance before bet**
   - ✅ Check in Worker before saving bet
   - ❌ Don't trust frontend validation alone

4. **Prevent duplicate settlement**
   - ✅ Use unique constraint on (game_id, round_id)
   - ✅ Ignore duplicate key errors in cron

5. **Log all transactions**
   - ✅ Save to wallet_transactions table
   - ✅ Include ref_id for audit trail

---

## 🐛 Common Issues & Solutions

### Issue: Bet placed but wallet not deducted

**Cause**: Worker couldn't reach Supabase
**Solution**: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in worker secrets

### Issue: Bets not settling automatically

**Cause**: Cron not running or results not found
**Solution**:

1. Check worker logs: `wrangler tail`
2. Verify cron schedule in Cloudflare Dashboard
3. Test Diamond API manually: `curl http://130.250.191.174:3009/casino/result?type=1&key=API_KEY`

### Issue: Duplicate settlements

**Cause**: Race condition (multiple cron runs)
**Solution**: Already handled! The unique constraint on `casino_results` prevents this.

### Issue: Wrong winner credited

**Cause**: Selection name mismatch
**Solution**: Ensure bet.selection exactly matches result.result (case-sensitive!)

---

## 📊 Useful SQL Queries

### Check pending bets

```sql
SELECT * FROM casino_bets WHERE status = 'PENDING' ORDER BY created_at DESC;
```

### Check recent settlements

```sql
SELECT * FROM casino_bets WHERE settled_at > NOW() - INTERVAL '1 hour' ORDER BY settled_at DESC;
```

### Check wallet balance

```sql
SELECT * FROM wallets WHERE user_id = 'YOUR_USER_ID';
```

### Check settlement history for a game

```sql
SELECT * FROM casino_results WHERE game_id = 'dt20' ORDER BY created_at DESC LIMIT 10;
```

### Get user's casino stats

```sql
SELECT get_casino_bet_stats('YOUR_USER_ID');
```

---

## 🚀 Performance Tips

1. **Index optimization**: Already added in migration
2. **Cron frequency**: 15 seconds is optimal (balance between speed and cost)
3. **Batch processing**: Worker processes all results in one cron run
4. **Connection pooling**: Supabase handles this automatically

---

## 📞 Quick Commands

```bash
# Deploy worker
cd workers/casino-worker && npm run deploy

# View logs
wrangler tail

# Test cron locally
wrangler dev --test-scheduled

# Set secret
wrangler secret put SECRET_NAME

# Run migration
# Supabase Dashboard → SQL Editor → Paste migration → Run
```

---

**🎰 Happy Betting!**
