# Casino Games Implementation Guide

## Overview

This document outlines the complete casino games catalog implementation for the Mahi betting platform. All 88 casino games are now integrated with the settlement system, casino lobby, and game routing infrastructure.

## Implementation Summary

### ✅ Completed Tasks

1. **Settlement Support** - All 88 game types are monitored by `resultWebSocket.ts`
2. **Game Catalog** - Complete metadata for all games in `allCasinoGames.ts`
3. **API Mapping** - All game slugs mapped to Diamond API endpoints
4. **Casino Lobby** - Comprehensive lobby with filtering, search, and categorization
5. **Game Template** - Generic game component framework for rapid development
6. **Build Verification** - Project builds successfully with all changes

---

## Game Catalog (88 Games)

### 🃏 Teen Patti Games (20 games)

| ID  | Slug          | Name                 | Type       | Features                                  |
| --- | ------------- | -------------------- | ---------- | ----------------------------------------- |
| 1   | teen20        | Teen Patti 20        | Live       | Fast-paced, 5-6 players, 10-15s decisions |
| 2   | teen1         | Teen Patti 1         | Standard   | Beginner-friendly, tutorial tooltips      |
| 3   | teen3         | Teen Patti 3         | Analytics  | Statistics panel, win rate tracking       |
| 4   | teen6         | Teen Patti 6         | Premium    | 6-player rapid format                     |
| 5   | teen8         | Teen Patti 8         | Fast       | 8-player cash game, aggressive            |
| 6   | teen9         | Teen Patti 9         | Max        | 9-player max tables                       |
| 7   | teen32        | Teen Patti 32        | VIP        | High stakes, large buy-in                 |
| 8   | teen33        | Teen Patti 33        | Tournament | Fast-action tournament format             |
| 9   | teen41        | Teen Patti 41        | Premium    | Side bets, exotic rules                   |
| 10  | teen42        | Teen Patti 42        | Social     | Live chat, emoji reactions                |
| 11  | teen120       | Teen Patti 120       | Premium    | Ultra-fast, unlimited stakes              |
| 12  | queen         | Queen Top Open       | Premium    | Royal theme, high stakes                  |
| 13  | poison        | Poison Teen Patti    | Themed     | Dark theme, risky mechanics               |
| 14  | poison20      | Poison 20            | Fast       | Ultra-fast poison variant                 |
| 15  | mogambo       | Mogambo              | Themed     | Villain-themed Bollywood                  |
| 16  | teenpatti1day | Teen Patti VIP 1 Day | VIP        | Time-limited exclusive                    |
| 17  | teenmuf       | Muflis Teen Patti    | Variant    | Reverse rankings                          |
| 18  | teenmuf2      | Muflis Max           | Variant    | Enhanced reverse rules                    |
| 19  | patti2        | 2 Cards Teen Patti   | Simplified | 2-card variant                            |
| 20  | trio          | Trio                 | Simplified | 3-card simplified                         |

### 🐉 Dragon Tiger Games (7 games)

| ID  | Slug       | Name             | Features                            |
| --- | ---------- | ---------------- | ----------------------------------- |
| 21  | dt20       | Dragon Tiger 20  | Fast-paced, side bets, history      |
| 22  | dt6        | Dragon Tiger 6   | Ultra-fast, mobile optimized        |
| 23  | dt1        | Dragon Tiger 1   | Classic variant                     |
| 24  | dt202      | Dragon Tiger 202 | Multi-level markets, premium        |
| 25  | dtl20      | Dragon Tiger Low | Low card focus, special payouts     |
| 26  | dtlavanced | DTL Advanced     | Analytics dashboard, AI predictions |
| 27  | dtl20pro   | DTL 20 Pro       | Professional analytics              |

### ♠️ Poker Games (3 games)

| ID  | Slug    | Name                   | Features                |
| --- | ------- | ---------------------- | ----------------------- |
| 28  | poker20 | Texas Hold'em Poker 20 | Up to 9 players, live   |
| 29  | poker6  | Poker 6                | 6-max format, fast play |
| 30  | poker   | Poker Classic          | Standard poker          |

### 💎 Baccarat Games (5 games)

| ID  | Slug       | Name             | Features                |
| --- | ---------- | ---------------- | ----------------------- |
| 31  | baccarat   | Baccarat         | Elegant, roadmap, live  |
| 32  | baccarat2  | Baccarat 2       | Enhanced UX, smart odds |
| 33  | btable     | Baccarat Table   | Multi-table support     |
| 34  | btable2    | Baccarat Table 2 | VIP, advanced roadmaps  |
| 35  | baccarat29 | Baccarat 29      | Premium high-stakes     |

### 🎡 Roulette Games (3 games)

| ID  | Slug           | Name            | Features                     |
| --- | -------------- | --------------- | ---------------------------- |
| 36  | ourroullete    | Our Roulette    | 3D wheel, European           |
| 37  | uniqueroulette | Unique Roulette | Progressive jackpot, bonuses |
| 38  | goldenroulette | Golden Roulette | Luxury theme, premium        |

### 🎴 Andar Bahar Games (2 games)

| ID  | Slug | Name              | Features                   |
| --- | ---- | ----------------- | -------------------------- |
| 39  | ab20 | Andar Bahar 20    | Joker card, fast rounds    |
| 40  | abj  | Andar Bahar Joker | Joker multipliers, premium |

### 🂡 32 Cards Games (2 games)

| ID  | Slug     | Name        | Features                  |
| --- | -------- | ----------- | ------------------------- |
| 41  | card32eu | 32 Cards EU | 4 panels, European style  |
| 42  | card32   | 32 Cards    | Clean design, fast repeat |

### 🍀 Lucky 7 Games (4 games)

| ID  | Slug      | Name               | Features                      |
| --- | --------- | ------------------ | ----------------------------- |
| 43  | lucky7    | Lucky 7            | Below/7/Above, neon theme     |
| 44  | lucky7eu  | Lucky 7 European   | Premium, European theme       |
| 45  | lucky7eu2 | Lucky 7 European 2 | Enhanced tiers, sophisticated |
| 46  | lucky7g   | Lucky 7 Beach      | Beach theme, tropical         |

### 🃏 Other Card Games (3 games)

| ID    | Slug                      | Name             | Features           |
| ----- | ------------------------- | ---------------- | ------------------ |
| 47    | 3cardj                    | 3 Card Judgement | Hand A vs B        |
| 48    | war                       | Casino War       | Player vs Dealer   |
| 49-51 | joker20, joker120, joker1 | Joker variants   | Wild cards, themed |

### 🔢 Number/Lottery Games (9 games)

| ID  | Slug        | Name         | Features                  |
| --- | ----------- | ------------ | ------------------------- |
| 52  | kbc         | KBC          | Game show theme           |
| 53  | notenum     | Notenum      | Number lottery            |
| 54  | lottcard    | Lottcard     | Card lottery hybrid       |
| 55  | lottcard2   | Lottcard 2   | Multi-tier jackpot        |
| 56  | worli       | Worli        | Number grid betting       |
| 57  | worli2      | Worli 2      | Streamlined rapid betting |
| 58  | worli3      | Worli 3      | Advanced combinations     |
| 59  | matkamarket | Matka Market | Open/Close markets        |
| 60  | matka       | Matka        | Traditional Matka         |

### 🎲 Dice Games (2 games)

| ID  | Slug   | Name    | Features               |
| --- | ------ | ------- | ---------------------- |
| 61  | sicbo  | Sicbo   | 3-dice, organized grid |
| 62  | sicbo2 | Sicbo 2 | Streamlined, faster    |

### 🏏 Cricket Games (8 games)

| ID  | Slug         | Name             | Features               |
| --- | ------------ | ---------------- | ---------------------- |
| 63  | cmatch20     | Cricket Match 20 | Ball-by-ball markets   |
| 64  | cmeter       | Cricket Meter    | Live metric betting    |
| 65  | cmeter1      | Cricket Meter 1  | Single-ball granular   |
| 66  | cricketv3    | Cricket V3       | Comprehensive platform |
| 67  | cricketline  | Cricket Line     | Run ladder betting     |
| 68  | cricketline2 | Cricket Line 2   | Advanced ladder        |
| 69  | superover3   | Super Over 3     | Super Over markets     |
| 70  | superover2   | Super Over 2     | Extended analytics     |
| 71  | ballbyball   | Ball by Ball     | Micro-betting          |

### 🏇 Racing Games (8 games)

| ID    | Slug         | Name          | Features               |
| ----- | ------------ | ------------- | ---------------------- |
| 72    | race20       | Race 20       | Virtual racing         |
| 73    | race17       | Race 17       | 17-second ultra-rapid  |
| 74    | race2        | Race 2        | Traditional racing     |
| 75    | raceadvanced | Race Advanced | Professional analytics |
| 76    | trap         | Trap          | Greyhound racing       |
| 77    | trap20       | Trap 20       | Simplified trap        |
| 78    | thetrap      | The Trap      | Gamified maze          |
| 79-80 | aaa, aaa2    | AAA variants  | Virtual sports         |

### ⚽ Football Games (3 games)

| ID  | Slug         | Name          | Features               |
| --- | ------------ | ------------- | ---------------------- |
| 81  | goal         | Goal          | Virtual football live  |
| 82  | footballlive | Football Live | Extensive markets      |
| 83  | soccerpro    | Soccer Pro    | Professional analytics |

### 🎯 Special/Other Games (5 games)

| ID  | Slug         | Name            | Features             |
| --- | ------------ | --------------- | -------------------- |
| 84  | dolidana     | Dolidana        | Holi festival theme  |
| 85  | dolidana2    | Dolidana 2      | Advanced multipliers |
| 86  | bollywood    | Bollywood       | Multi-game hub       |
| 87  | dum10        | Dum 10          | 10-player virtual    |
| 88  | vippatti1day | VIP Patti 1 Day | Exclusive VIP        |

---

## File Structure

```
src/
├── data/
│   ├── allCasinoGames.ts          # Complete game catalog (NEW)
│   └── casinoGames.ts             # Original casino data
├── pages/
│   ├── CasinoLobby.tsx            # New comprehensive lobby (NEW)
│   ├── GenericGameTemplate.tsx    # Game component template (NEW)
│   ├── Casino.tsx                 # Original casino page
│   └── TestSettlement.tsx         # Settlement testing
├── services/
│   ├── resultWebSocket.ts         # Monitors all 88 games (UPDATED)
│   └── autoSettlementService.ts   # Settlement logic (UPDATED)
└── App.tsx                        # Routes updated (UPDATED)
```

---

## Routes

| Route               | Component           | Description               |
| ------------------- | ------------------- | ------------------------- |
| `/casino-lobby`     | CasinoLobby         | Main lobby with all games |
| `/casino/:slug`     | GenericGameTemplate | Dynamic game pages        |
| `/casino`           | Casino              | Original casino page      |
| `/casino-old/:gmid` | CasinoGame          | Legacy casino game        |
| `/test-settlement`  | TestSettlement      | Settlement debugging      |

---

## Features Implemented

### 1. Settlement System ✅

- **File**: `src/services/resultWebSocket.ts`
- **Status**: Monitors all 88 game types every 5 seconds
- **Features**:
  - Polls Diamond API for new results
  - Tracks last checked round IDs
  - Automatically triggers settlement
  - Supports all game categories

### 2. Complete Game Catalog ✅

- **File**: `src/data/allCasinoGames.ts`
- **Status**: 88 games with full metadata
- **Features**:
  - Game ID, slug, name, API type
  - Category, description, features
  - VIP/Premium/Live flags
  - Helper functions for filtering

### 3. Casino Lobby ✅

- **File**: `src/pages/CasinoLobby.tsx`
- **Status**: Fully functional
- **Features**:
  - Search by name/description
  - Filter by category (17 categories)
  - Filter by VIP/Premium/Live
  - Responsive grid layout
  - Game cards with badges
  - Navigation to game pages

### 4. Game Template Framework ✅

- **File**: `src/pages/GenericGameTemplate.tsx`
- **Status**: Ready for game implementations
- **Features**:
  - Dynamic game loading by slug
  - Displays game info, features, badges
  - Shows recent results from API
  - Bet slip sidebar
  - Stats tracking placeholder
  - Responsive design

### 5. API Integration ✅

- All 88 game slugs mapped to API types
- Settlement service monitors all games
- Result fetching for game history

---

## Usage Guide

### Navigate to Casino Lobby

```
http://localhost:8081/casino-lobby
```

### Access Specific Game

```
http://localhost:8081/casino/teen20
http://localhost:8081/casino/dt20
http://localhost:8081/casino/poker6
```

### Search & Filter

- Use search bar to find games by name
- Click category tabs to filter
- Toggle VIP/Premium/Live buttons

### Test Settlement

```
http://localhost:8081/test-settlement
```

---

## Next Steps (Game Implementation)

Each game needs its specific UI implementation. The template provides:

- Header with game info
- Main game area (placeholder)
- Bet slip sidebar
- Results history
- Stats tracking

### Example: Implementing Teen Patti 20

1. Create `src/pages/game-types/TeenPatti20.tsx`
2. Import game logic from design specs
3. Add betting controls, card display, player seats
4. Connect to Diamond API for live data
5. Integrate with bet placement service
6. Update route in `App.tsx` to use specific component

### Priority Games to Implement

1. **teen20** - Most popular Teen Patti
2. **dt20** - Most popular Dragon Tiger
3. **poker20** - Texas Hold'em
4. **baccarat** - Classic Baccarat
5. **ourroullete** - European Roulette

---

## Technical Details

### Settlement Flow

```
1. resultWebSocket polls API every 5s
2. New result detected → triggers settleCasinoBets()
3. Fetches pending bets for game
4. Compares bet.selection with result.win
5. Calls edge function to settle
6. Updates bet status, credits wallet
```

### Game Routing

```
/casino-lobby → Browse all games
/casino/teen20 → Load Teen Patti 20
GenericGameTemplate:
  - useParams() gets slug
  - getGameBySlug() loads metadata
  - fetchCasinoResult() loads history
  - Renders game template
```

### Data Flow

```
allCasinoGames.ts (metadata)
    ↓
CasinoLobby (browse/search)
    ↓
GenericGameTemplate (load game)
    ↓
[Future] Specific game component
    ↓
Betting API → Settlement
```

---

## Environment Variables

```env
VITE_DIAMOND_API_HOST=130.250.191.174:3009
VITE_DIAMOND_API_KEY=mahi4449839dbabkadbakwq1qqd
VITE_DIAMOND_API_PROTOCOL=http
```

---

## Testing Checklist

- [x] Build succeeds without errors
- [x] Casino lobby loads with all 88 games
- [x] Search functionality works
- [x] Category filtering works
- [x] VIP/Premium/Live filters work
- [x] Game pages load via slug routing
- [x] Settlement service monitors all games
- [x] API results fetch successfully
- [ ] Place bets on games (requires game UI)
- [ ] Verify automatic settlement (requires active bets)

---

## Summary

**Status**: ✅ Complete Implementation Framework

All foundation work is complete:

- 88 games cataloged with full metadata
- Settlement system monitors all game types
- Casino lobby with search/filter functionality
- Generic game template for rapid development
- Routes configured for all games

**Ready for**: Individual game UI implementations using the provided design specifications.

---

## Support

For questions or issues:

1. Check game metadata in `allCasinoGames.ts`
2. Test settlement at `/test-settlement`
3. Review console logs for WebSocket polling
4. Verify API responses in Network tab
