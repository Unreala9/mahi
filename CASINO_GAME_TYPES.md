# Casino Game Type Architecture

## Overview

The casino game pages now dynamically render different layouts based on the game type. Each casino game is automatically routed to its appropriate type-specific component.

## Architecture

### Game Type Router

**File:** `src/pages/CasinoGame.tsx`

The router analyzes the game name and ID to determine the appropriate component:

```typescript
function getGameType(game: CasinoGame): string {
  // Pattern matching based on game name and gmid
  // Returns: mogambo | teenpatti | dragon-tiger | andar-bahar |
  //          roulette | poker | baccarat | matka | card32 |
  //          lucky7 | cricket | generic
}
```

### Game Type Components

All game type components are located in `src/pages/game-types/`:

1. **MogamboGame.tsx**
   - Layout: Daga/Teja cards + Mogambo card
   - Betting: 1.47 and 2.94 odds buttons
   - Special: 3-card total display
   - Canvas area for game animation

2. **TeenpattiGame.tsx**
   - Layout: Player A vs Player B (3 cards each)
   - Betting: Two-option betting (1.98 odds each)
   - Display: Side-by-side player comparison

3. **DragonTigerGame.tsx**
   - Layout: Dragon vs Tiger (1 card each)
   - Betting: Dragon (1.98) | Tie (11.00) | Tiger (1.98)
   - Display: VS layout with centered cards

4. **AndarBaharGame.tsx**
   - Layout: Center joker + Andar/Bahar sides (5 cards each)
   - Betting: Andar (1.90) vs Bahar (2.10)
   - Display: Split layout with multiple cards

5. **RouletteGame.tsx**
   - Layout: Roulette wheel (64x64) with all numbers 0-36
   - Betting: RED/BLACK (1.98), EVEN/ODD (1.98), 0 (35x)
   - Display: Full number grid + color options

6. **PokerGame.tsx**
   - Layout: 5 community cards + Player/Dealer hands (2 cards each)
   - Betting: Call, Raise, Check, Fold
   - Display: Community cards + player hands + hand rankings

7. **BaccaratGame.tsx**
   - Layout: Player vs Banker (3 cards each)
   - Betting: Player (1.95) | Tie (8.00) | Banker (1.90)
   - Display: Card totals shown for each side

8. **MatkaGame.tsx**
   - Layout: 3 draw numbers in colorful circles
   - Betting: Numbers 0-9 grid + Single/Jodi/Patti types
   - Display: Gradient buttons, number selection grid

9. **Card32Game.tsx**
   - Layout: 8 drawn cards displayed
   - Betting: Suit betting (♠♥♦♣) + Range betting (8-J, Q-K, A)
   - Display: Suit symbols with color coding

10. **Lucky7Game.tsx**
    - Layout: Large Lucky 7 wheel + single drawn card
    - Betting: Below 7 (1.98) | Lucky 7 (11.0) | Above 7 (1.98)
    - Display: Gold gradient wheel with large "7"

11. **CricketGame.tsx**
    - Layout: Cricket pitch with score display
    - Betting: Even/Odd runs + specific runs (0,1,2,3,4,6) + Wicket
    - Display: Green pitch, last 6 balls, runs/wickets counter

12. **GenericCardGame.tsx**
    - Layout: 5 cards + result display
    - Betting: Option A/B (1.95 each) + Bonus Bet (5.00)
    - Display: Fallback for unrecognized game types

## Shared Components

**File:** `src/pages/game-types/components/SharedGameComponents.tsx`

### GameHeader

- Displays game name, rules link, and round ID
- Shows live data from WebSocket

### CardPlaceholder

- Standardized card display (16x24 with dashed border)
- Used across all card-based games

### BetSlipSidebar

- Right sidebar for bet management
- Stake input + quick bet buttons (100, 500, 1000, 5000)
- Place Bet button
- Shows matched bets, odds, and stake

### ResultsSection

- Last 10 results display
- Color-coded result indicators (W/L)
- "View All" button for full history

## Live Data Integration

All game types use the `useCasinoLive` hook:

```typescript
const { data: liveData } = useCasinoLive(game.gmid);
```

**Available Data:**

- `liveData?.roundId` - Current round identifier
- `liveData?.result` - Game result
- `liveData?.odds` - Live odds updates
- `liveData?.status` - Game status (open/closed/running)

## Game Type Detection Logic

The system uses pattern matching to detect game types:

| Pattern                                          | Game Type    |
| ------------------------------------------------ | ------------ |
| Contains "mogambo"                               | Mogambo      |
| Contains "teenpatti" or "teen patti" or "3 card" | Teenpatti    |
| Contains "dragon" AND "tiger"                    | Dragon Tiger |
| Contains "andar" AND "bahar"                     | Andar Bahar  |
| Contains "roulette"                              | Roulette     |
| Contains "poker"                                 | Poker        |
| Contains "baccarat"                              | Baccarat     |
| Contains "matka" or "worli"                      | Matka        |
| Contains "32 card"                               | Card32       |
| Contains "lucky 7" or "lucky7"                   | Lucky7       |
| Contains "cricket" or sports keywords            | Cricket      |
| No match                                         | Generic      |

## Design System

### Color Palette

- Background: `#2c3e50` (dark blue-gray)
- Header: `#34495e` (lighter blue-gray)
- Primary buttons: Blue gradients (`#5dade2`, `#3498db`)
- Accent colors: Red (`#e74c3c`), Yellow (`#f39c12`), Green (`#27ae60`)

### Layout Structure

```
┌─────────────────────────────────────┬──────────┐
│ GameHeader (Round ID, Rules)       │          │
├─────────────────────────────────────┤  Bet     │
│                                     │  Slip    │
│ Cards/Game Display                  │  Sidebar │
│                                     │          │
├─────────────────────────────────────┤  (320px) │
│ Betting Options                     │          │
├─────────────────────────────────────┤          │
│ Results Section                     │          │
└─────────────────────────────────────┴──────────┘
```

## Usage

When a user navigates to `/casino/:gmid`, the system:

1. Fetches game data from the Diamond API
2. Determines game type using pattern matching
3. Routes to appropriate game component
4. Initializes live data connection
5. Renders game-specific layout with betting options

## Adding New Game Types

To add a new game type:

1. Create new component in `src/pages/game-types/YourGame.tsx`
2. Import in `CasinoGame.tsx`
3. Add pattern detection in `getGameType()` function
4. Add case in switch statement
5. Use shared components for consistency

## Future Enhancements

- [ ] Connect betting functionality to API
- [ ] Add card animations and transitions
- [ ] Implement real-time odds updates
- [ ] Add sound effects per game type
- [ ] Implement bet history per game
- [ ] Add game statistics and analytics
- [ ] Mobile-responsive layouts
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
