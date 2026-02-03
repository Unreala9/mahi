# 🎰 Casino Games Integration - Complete Implementation Guide

**Status**: ✅ **FULLY READY TO USE**
**Date**: 2025
**Version**: 3.0 - Quick Actions Edition

---

## 📈 What You Have Now

### ✅ Fully Integrated Games (24):

**AndarBahar20, AndarBahar3Game, AndarBahar4Game, AndarBaharJ, Baccarat, Baccarat2Game, BaccaratTable, BallByBall, Card32EU, Card32J, CasinoWar, CricketMatch20Game, DragonTiger20, DragonTiger6, Joker20, KBC, Lucky7, Lucky7EU, OurRoulette, Poker20, Race20, Sicbo, Sicbo2, TeenPatti20, ThreeCardJ, Worli, Worli3**

### ✨ Features Included:

#### 1. Live API Data 🌐

- Real-time market data polling
- Live odds updates every 1 second
- Current round ID display
- Game status monitoring

#### 2. Betting Panel 💰

- **Chip Selection**: ₹10, ₹50, ₹100, ₹500, ₹1000, ₹5000
- **Live Markets**: All available betting options with current odds
- **Quick Action Buttons** (NEW):
  - 🔁 **Repeat** - Repeat your last bet amount
  - ➗ **Half** - Reduce bet by 50%
  - ✖️ **Double** - Double your bet amount
  - ➖ **Min** - Set to ₹10 (minimum)
  - ➕ **Max** - Set to ₹5000 (maximum)
- **Real-time Calculations**: Stake and potential winning display
- **Market Status**: Shows suspended markets in red
- **Connection Status**: Live/Connecting indicator
- **Round Tracking**: Current round ID visible

#### 3. Betting Logic ✅

- Click any market or click chip then click market
- Multiple bets on same round (Repeat/Half/Double buttons make this easy!)
- Real-time balance deduction via wallet
- Suspend betting when market suspended

#### 4. Result Tracking 🏆

- Displays last round winner
- Shows round ID
- Auto-updates when game ends
- Win/loss calculation

---

## 🎮 How It Works (Step by Step)

### Scenario: User Plays Dragon Tiger 20

```
1. User opens Dragon Tiger 20 page
   ↓
2. useUniversalCasinoGame hook connects to API
   ↓
3. Gets live markets:
   - Dragon: 1.90x
   - Tiger: 1.90x
   - Tie: 9.00x
   ↓
4. Shows betting panel with:
   - Live odds for each option
   - Chip values (₹10-₹5000)
   - Quick action buttons (Repeat, Half, Double, Min, Max)
   ↓
5. User clicks quick action "Double":
   ✖️ Selected chip changes: ₹100 → ₹200
   ↓
6. User clicks "Dragon" market:
   ✅ Bet placed: ₹200 on Dragon @ 1.90x
   ✅ Potential win: ₹380
   ✅ Wallet balance deducted ₹200
   ↓
7. Game ends - API returns result
   ↓
8. "Last Result" card shows:
   - Round ID: 12345
   - Winner: Dragon
   - Your Bet: ₹200 @ 1.90x = ₹380 WIN!
   ✅ Wallet updated +₹380
```

---

## 💻 Code Example

### Use in ANY Game Page:

```tsx
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

export default function MyGame() {
  // 1. Add hook with your game type
  const {
    markets, // All betting markets with live odds
    roundId, // Current round ID
    result, // Last result
    placeBet, // Function to place bet
    placedBets, // Map of bets placed
    totalStake, // Total ₹ staked
    potentialWin, // Total ₹ potential winning
    isSuspended, // Are markets suspended?
    isConnected, // API connected?
    clearBets, // Clear placed bets
  } = useUniversalCasinoGame({
    gameType: "dt20", // Game type code
    gameName: "Dragon Tiger 20",
  });

  return (
    <div>
      {/* 2. Add betting panel */}
      <CasinoBettingPanel
        markets={markets}
        onPlaceBet={placeBet}
        placedBets={placedBets}
        totalStake={totalStake}
        potentialWin={potentialWin}
        onClearBets={clearBets}
        isSuspended={isSuspended}
        roundId={roundId}
      />

      {/* 3. Get markets for your game */}
      {markets.map((market) => (
        <div key={market.sid}>
          <h2>{market.nat}</h2>
          <p>Odds: {(market.b / 100).toFixed(2)}x</p>
        </div>
      ))}

      {/* 4. Display last result */}
      {result && <p>Winner: {result.win}</p>}
    </div>
  );
}
```

---

## 🎯 Game Type Codes Reference

Copy the right code for each game:

```typescript
// Andar Bahar Series
"ab20"; // Andar Bahar 20
"ab3"; // Andar Bahar 3
"ab4"; // Andar Bahar 4
"abj"; // Andar Bahar J

// Dragon Tiger Series
"dt20"; // Dragon Tiger 20
"dt6"; // Dragon Tiger 6

// Baccarat Series
"bac"; // Baccarat
"bac2"; // Baccarat 2
"bactbl"; // Baccarat Table

// Card Games
"c32eu"; // Card 32 EU
"c32j"; // Card 32 J

// Other Games
"aaa2"; // AAA 2
"bbb"; // Ball By Ball
"bt2"; // B Table 2
"br"; // Beach Roulette
"cwar"; // Casino War
"cm20"; // Cricket Match 20
"jkr20"; // Joker 20
"kbc"; // KBC
"l7"; // Lucky 7
"l7eu"; // Lucky 7 EU
"or"; // Our Roulette
"pk20"; // Poker 20
"r20"; // Race 20
"sb"; // Sicbo
"sb2"; // Sicbo 2
"tp20"; // Teen Patti 20
"tcj"; // Three Card Jackpot
"worli"; // Worli
"worli3"; // Worli 3
```

---

## 🚀 Adding to Remaining 52 Games

### Copy This Template:

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

export default function MyGameName() {
  const navigate = useNavigate();

  // ✅ STEP 1: Add hook with your game type
  const {
    markets,
    roundId,
    result,
    placeBet,
    placedBets,
    totalStake,
    potentialWin,
    isSuspended,
    isConnected,
    clearBets,
  } = useUniversalCasinoGame({
    gameType: "your-code-here", // <- Replace with your game code
    gameName: "Your Game Name", // <- Replace with display name
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Your Game Name</h1>
          <div className="flex gap-4">
            <Badge className="bg-blue-600">Round: {roundId}</Badge>
            {isConnected ? (
              <Badge className="bg-green-600">🔴 Live</Badge>
            ) : (
              <Badge className="bg-red-600">Connecting...</Badge>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ✅ STEP 2: Add betting panel here */}
          <div className="lg:col-span-1">
            {markets.length > 0 && (
              <CasinoBettingPanel
                markets={markets}
                onPlaceBet={placeBet}
                placedBets={placedBets}
                totalStake={totalStake}
                potentialWin={potentialWin}
                onClearBets={clearBets}
                isSuspended={isSuspended}
                roundId={roundId}
              />
            )}

            {/* Last Result */}
            {result && (
              <Card className="mt-4 p-4 bg-gray-800/50 border-yellow-600/20">
                <h3 className="text-yellow-400 font-bold mb-3">Last Result</h3>
                <p className="text-white">Winner: {result.win}</p>
                <p className="text-gray-400 text-sm">Round: {result.mid}</p>
              </Card>
            )}
          </div>

          {/* ✅ STEP 3: Your game display here */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-gray-900 border-blue-600/30">
              <h2 className="text-white font-bold mb-4">Game Area</h2>

              {/* ✅ STEP 4: Get markets for your game */}
              <div className="grid grid-cols-2 gap-4">
                {markets.map((market) => (
                  <Button
                    key={market.sid}
                    onClick={() => {
                      // User will use betting panel to place bets
                    }}
                    className="p-6 h-auto flex flex-col"
                  >
                    <span className="font-bold">{market.nat}</span>
                    <span className="text-sm">
                      {(market.b / 100).toFixed(2)}x
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## ✅ Quick Action Buttons Explained

### 🔁 Repeat

```
Current chip: ₹100
Click "Repeat"
Last bet was: ₹100
→ Chip stays ₹100 (or sets to last bet)
```

### ➗ Half

```
Current chip: ₹1000
Click "Half"
→ Chip becomes ₹500
(Divide by 2)
```

### ✖️ Double

```
Current chip: ₹100
Click "Double"
→ Chip becomes ₹200
(Multiply by 2, max ₹5000)
```

### ➖ Min

```
Current chip: ₹5000
Click "Min"
→ Chip becomes ₹10
(Minimum allowed)
```

### ➕ Max

```
Current chip: ₹100
Click "Max"
→ Chip becomes ₹5000
(Maximum allowed)
```

---

## 🔧 Troubleshooting

### ❌ "Live" indicator not showing

**Problem**: API not connected
**Solution**: Check Diamond API key in `.env`

### ❌ Odds not updating

**Problem**: useUniversalCasinoGame not polling
**Solution**:

1. Check `gameType` code is correct
2. Verify API endpoint returns markets
3. Check browser console for errors

### ❌ Can't place bets

**Problem**: Wallet error
**Solution**:

1. Check wallet balance > stake
2. Verify casinoBettingService is connected
3. Check bet placement response in console

### ❌ Quick action buttons not working

**Problem**: Missing imports or wrong component
**Solution**:

1. Check `CasinoBettingPanel` imported
2. Verify all props passed correctly
3. Check component file is in `src/components/casino/`

---

## 📊 File Structure

```
src/
├── hooks/
│   └── useUniversalCasinoGame.ts        ← Core hook
│       (fetches API data, places bets)
│
├── components/casino/
│   └── CasinoBettingPanel.tsx            ← Betting UI
│       (all quick actions, chips, odds)
│
├── pages/game-types/
│   ├── AndarBahar20.tsx                 ✅ Complete example
│   ├── DragonTiger20.tsx                ✅ Complete example
│   ├── Baccarat.tsx                     ✅ Complete example
│   ├── [24 other integrated games]      ✅ All ready
│   └── [52 games needing integration]   ⏳ Use template above
│
├── services/
│   └── casinoBettingService.ts          ← Wallet integration
│
└── lib/
    └── supabase.ts                      ← API calls
```

---

## 🎉 You're All Set!

### What You Have:

✅ **24 fully integrated games**
✅ **Quick action buttons** (Repeat, Half, Double, Min, Max)
✅ **Live API data** from Diamond API
✅ **Real-time odds** display
✅ **Betting panel** with wallet integration
✅ **Result tracking**
✅ **Connection monitoring**

### What's Ready to Use:

✅ Betting system works
✅ Odds update live
✅ Bets deduct from wallet
✅ Results display correctly
✅ Quick actions speed up betting

### Next: Add to Remaining Games

Use the template above to add to remaining 52 games.
Copy-paste, replace game code, and you're done!

---

## 📞 Quick Reference

**Hook File**: `src/hooks/useUniversalCasinoGame.ts`
**Panel Component**: `src/components/casino/CasinoBettingPanel.tsx`
**Example Game**: `src/pages/game-types/AndarBahar20.tsx`
**Integration Guide**: `UPDATED_ANDARBAHAR20_TEMPLATE.md`
**Game Type Codes**: Listed above in this document

---

## 🏁 Status

| Item                                           | Status      |
| ---------------------------------------------- | ----------- |
| Hook implementation                            | ✅ Complete |
| Betting panel UI                               | ✅ Complete |
| Quick actions (Repeat, Half, Double, Min, Max) | ✅ Complete |
| 24 games integrated                            | ✅ Complete |
| API integration                                | ✅ Complete |
| Wallet deduction                               | ✅ Complete |
| Result display                                 | ✅ Complete |
| Documentation                                  | ✅ Complete |
| Template for remaining games                   | ✅ Complete |

**Overall Progress: 32% (24/76 games)**
**Time to complete remaining: ~2-3 hours (template provided)**

---

**You're ready to go! 🚀 Ab sirf games khelna baaki hai!**
