# Simple Casino Settlement - Usage Guide

## 🎯 What This Does

Simple casino bet settlement - no cron jobs, no workers, just straightforward bet calculation.

---

## 📦 How It Works

```
1. User places bet → Saved in DB (status: PENDING)
2. Casino result comes → Call settlement function
3. Compare bet.selection with result
4. Update bet status (WIN/LOSS)
5. If WIN → Credit wallet
```

---

## 🚀 Usage Examples

### 1. Settle a Single Bet

```typescript
import { settleCasinoBet } from "@/services/simpleCasinoSettlement";

// When you get casino result
const result = await settleCasinoBet(
  123, // bet ID
  "Dragon", // winning selection
);

console.log(result);
// {
//   betId: 123,
//   isWin: true,
//   payout: 198,
//   ...
// }
```

### 2. Settle All Bets for a Round

```typescript
import { settleCasinoRound } from "@/services/simpleCasinoSettlement";

// When round completes
const settlements = await settleCasinoRound(
  "dt20", // game ID
  "20260211-1234", // round ID
  "Dragon", // winning selection
);

console.log(`Settled ${settlements.length} bets`);
```

### 3. Calculate Payout (Before Placing Bet)

```typescript
import { calculateCasinoPayout } from "@/services/simpleCasinoSettlement";

const payout = calculateCasinoPayout(100, 1.98);
console.log(`Potential win: ₹${payout}`); // ₹198
```

### 4. Get User Stats

```typescript
import { simpleCasinoSettlement } from "@/services/simpleCasinoSettlement";

const stats = await simpleCasinoSettlement.getUserSettlementStats(userId);

console.log(stats);
// {
//   totalBets: 50,
//   wonBets: 25,
//   lostBets: 25,
//   totalWagered: 5000,
//   totalWon: 5500,
//   totalLost: 2500,
//   netProfit: 3000
// }
```

---

## 🎮 Real-World Example: Dragon Tiger Game

```typescript
// components/DragonTigerGame.tsx

import { useState } from 'react';
import { settleCasinoRound } from '@/services/simpleCasinoSettlement';
import { casinoBettingService } from '@/services/casinoBettingService';

function DragonTigerGame() {
  const [currentRound, setCurrentRound] = useState('20260211-1234');
  const [result, setResult] = useState<string | null>(null);

  // User places bet
  const placeBet = async (selection: 'Dragon' | 'Tiger' | 'Tie') => {
    await casinoBettingService.placeBet({
      user_id: userId,
      game_id: 'dt20',
      game_name: 'Dragon Tiger',
      round_id: currentRound,
      selection,
      odds: 1.98,
      stake: 100,
    });
  };

  // When result comes from API
  const handleResult = async (winningSelection: string) => {
    setResult(winningSelection);

    // Settle all bets for this round
    const settlements = await settleCasinoRound(
      'dt20',
      currentRound,
      winningSelection
    );

    console.log(`Settled ${settlements.length} bets`);

    // Show winners
    const winners = settlements.filter(s => s.isWin);
    if (winners.length > 0) {
      toast.success(`${winners.length} winners! Total payout: ₹${winners.reduce((sum, w) => sum + w.payout, 0)}`);
    }

    // Start new round
    setCurrentRound(`20260211-${Date.now()}`);
    setResult(null);
  };

  return (
    <div>
      <h2>Dragon Tiger - Round {currentRound}</h2>

      <button onClick={() => placeBet('Dragon')}>Bet on Dragon (1.98x)</button>
      <button onClick={() => placeBet('Tiger')}>Bet on Tiger (1.98x)</button>
      <button onClick={() => placeBet('Tie')}>Bet on Tie (8.0x)</button>

      {/* Admin: Declare result */}
      <button onClick={() => handleResult('Dragon')}>Result: Dragon</button>
      <button onClick={() => handleResult('Tiger')}>Result: Tiger</button>
      <button onClick={() => handleResult('Tie')}>Result: Tie</button>

      {result && <p>Winner: {result}</p>}
    </div>
  );
}
```

---

## 🔄 Integration with Existing Casino API

```typescript
// Fetch result from Diamond API and settle
async function fetchAndSettle(gameId: string, roundId: string) {
  // 1. Fetch result from Diamond API
  const response = await fetch(
    `http://localhost:8080/api/diamond/casino/detail_result?type=1&mid=${gameId}`,
  );

  const data = await response.json();
  const winningSelection = data.data.result; // e.g., 'Dragon'

  // 2. Settle all bets for this round
  const settlements = await settleCasinoRound(
    gameId,
    roundId,
    winningSelection,
  );

  return settlements;
}
```

---

## 📊 Database Schema (Minimal)

You only need these tables (probably already have them):

```sql
-- casino_bets table
CREATE TABLE casino_bets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  game_id TEXT,
  round_id TEXT,
  selection TEXT,
  odds NUMERIC,
  stake NUMERIC,
  status TEXT DEFAULT 'PENDING', -- PENDING, WIN, LOSS
  win_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

-- wallets table (probably already exists)
CREATE TABLE wallets (
  user_id UUID PRIMARY KEY,
  balance NUMERIC DEFAULT 0
);
```

---

## ✅ What This Service Does

- ✅ Settle individual bets
- ✅ Settle entire rounds
- ✅ Calculate payouts
- ✅ Credit wallets automatically
- ✅ Track win/loss statistics
- ✅ Simple, no external dependencies

## ❌ What This Service Does NOT Do

- ❌ Auto-fetch results (you call it manually)
- ❌ Run on schedule (no cron)
- ❌ Proxy API calls
- ❌ Complex infrastructure

---

## 🎯 When to Call Settlement

**Option 1: Manual (Admin Panel)**

```typescript
// Admin clicks "Declare Result" button
<button onClick={() => settleCasinoRound('dt20', roundId, 'Dragon')}>
  Declare Dragon Winner
</button>
```

**Option 2: After Fetching Result**

```typescript
// After getting result from Diamond API
const result = await fetch("/api/diamond/casino/result");
const winner = result.data.result;
await settleCasinoRound(gameId, roundId, winner);
```

**Option 3: Webhook (if Diamond API supports)**

```typescript
// POST /api/casino/webhook
app.post("/api/casino/webhook", async (req, res) => {
  const { gameId, roundId, result } = req.body;
  await settleCasinoRound(gameId, roundId, result);
  res.json({ success: true });
});
```

---

## 🚀 Quick Start

1. **Copy the service file** to your project
2. **Use it in your components**:

```typescript
import { settleCasinoRound } from "@/services/simpleCasinoSettlement";

// When you have a result
await settleCasinoRound("dt20", "round-123", "Dragon");
```

That's it! No setup, no configuration, just works. 🎉
