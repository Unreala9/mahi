# Updated Casino Games - Detailed Design Specifications

## Overview

5 casino games have been updated with comprehensive design specifications based on detailed UI/UX requirements.

---

## 1. Teen Patti 20 (teen20)

**Category**: Teen Patti
**Status**: Live Game ✅
**API Type**: teen20

### Design Features

- **Table Layout**: Top-view oval table
- **Players**: 5-6 player seats with avatars
- **Display Elements**:
  - Avatar, username, chip stack per player
  - Last action indicator (pack, chaal, show)
  - Main pot & boot amount in center with glow
  - My cards at bottom

### Controls

- Decision buttons: Pack, Chaal, Side-show, Show
- Bet slider or fixed buttons for quick chaal increases
- 10-15 second countdown timer per decision

### Visual Theme

- Dark luxurious felt background
- Gold and neon green accents
- Betting exchange brand styling

### Additional UI

- Compact hand-ranking panel (Trail, Pure Sequence, Sequence, Color, Pair, High Card)
- Small hand-history strip on one side
- Mobile-optimized with large tappable buttons

---

## 2. Our Roulette (ourroullete)

**Category**: Roulette
**Status**: Live Game ✅
**API Type**: ourroullete

### Design Features

- **Split-Screen Layout**:
  - 3D-rendered roulette wheel on one side with spin animation
  - High-contrast betting table grid on the other side

### Betting Grid

**Inside Bets**: Straight, Split, Street, Corner, Line
**Outside Bets**:

- Red/Black
- Odd/Even
- 1–18, 19–36
- Dozens
- Columns

### Controls (Bottom Bar)

- Chip selection bar
- Clear/Undo/Rebet/Double buttons
- Large "Place Bet"/"Spin" area

### History & Analytics

- History strip: last 20 winning numbers
- Hot/cold indicators
- Percentage of Red/Black, Odd/Even

### Visual Theme

- Sleek dark theme
- Neon accent colors
- Subtle glow around active bet areas

### Additional UI

- Round countdown bar at top
- Bet summary panel with total stake and potential win
- Desktop and mobile readable/clickable

---

## 3. Dragon Tiger 20 (dt20)

**Category**: Dragon Tiger
**Status**: Live Game ✅
**API Type**: dt20

### Design Features

- **Bold split-screen layout**:
  - Dragon on the left (red)
  - Tiger on the right (blue)
  - Each as large, clearly tappable bet zone

### Betting Areas

- Optional "Tie" at center
- Suited/side bets below main zones
- Distinct colors and odds labels

### Display Elements

- Big countdown timer (upper center)
- Two oversized card reveal areas for Dragon and Tiger
- Smooth flip animations

### Controls (Bottom)

- Chips bar
- Quick-actions: Clear bets, Repeat, Double
- Concise bet slip summary

### Visual Theme

- Contrasting colors: red for Dragon, blue for Tiger
- Dark background

### Additional UI

- Vertical history column showing previous outcomes (D, T, Tie) with small icons
- Portrait mobile optimized
- Main bet zones remain dominant on mobile

---

## 4. Andar Bahar 20 (ab20)

**Category**: Andar Bahar
**Status**: Live Game ✅
**API Type**: ab20

### Design Features

- **Central focus**: Joker card at top-middle
- **Two large betting areas**:
  - Andar (left)
  - Bahar (right)

### Card Timeline

- Vertical list or two columns of dealt cards
- Goes alternately to Andar and Bahar
- Forms visual timeline of the round

### Controls (Bottom Bar)

- Chip selector
- Total bet amount display
- Main controls in single, ergonomic bar:
  - Place bet
  - Clear
  - Repeat

### Visual Theme

- Dark table background
- Rich blue/green tones
- Bright highlight colors on winning side after each round

### Additional UI

- Compact history panel: recent results (A/B and number of cards dealt)
- Visible round countdown timer
- Large finger-friendly text labels and chips for mobile

---

## 5. 32 Cards EU (card32eu)

**Category**: 32 Cards
**API Type**: card32eu

### Design Features

- **Main area**: Four big betting panels
  - In a row on desktop
  - 2x2 grid on mobile
- Each panel represents a card group or number set

### Panel Information

- Clearly displayed labels
- Odds
- Total pool
- My stake

### Card Reveal

- Large single-card reveal area above panels
- Smooth slide or flip animation
- Shows the drawn card each round

### Controls (Bottom)

- Chip chooser
- Bet controls: Clear, Repeat, Double
- Concise bet slip summary with total stake and possible win

### Visual Theme

- Dark background
- Each of the four panels has a distinct, vivid color
- Quick visual recognition for preferred groups

### Additional UI

- Slim history bar/table: last 10 results (drawn card and winning panel)
- Round countdown timer centered at top
- Fast minimal-click interactions for quick repeat betting

---

## Implementation Status

| Game            | Slug        | Updated | Build Status |
| --------------- | ----------- | ------- | ------------ |
| Teen Patti 20   | teen20      | ✅      | ✅ Pass      |
| Our Roulette    | ourroullete | ✅      | ✅ Pass      |
| Dragon Tiger 20 | dt20        | ✅      | ✅ Pass      |
| Andar Bahar 20  | ab20        | ✅      | ✅ Pass      |
| 32 Cards EU     | card32eu    | ✅      | ✅ Pass      |

---

## Access URLs

- **Casino Lobby**: `http://localhost:8081/casino-lobby`
- **Teen Patti 20**: `http://localhost:8081/casino/teen20`
- **Our Roulette**: `http://localhost:8081/casino/ourroullete`
- **Dragon Tiger 20**: `http://localhost:8081/casino/dt20`
- **Andar Bahar 20**: `http://localhost:8081/casino/ab20`
- **32 Cards EU**: `http://localhost:8081/casino/card32eu`

---

## Next Steps

Each game currently uses the **GenericGameTemplate** component which shows:

- Game name, description, and badges
- Features list
- Recent results history
- Bet slip sidebar
- Info/History/Stats tabs

### To Implement Full Game UI:

1. Create specific component in `src/pages/game-types/[GameName].tsx`
2. Implement the detailed design specifications above
3. Connect to Diamond API for live data
4. Integrate betting controls
5. Update route in `App.tsx` to use specific component

### Priority Order:

1. **teen20** - Most popular Teen Patti variant
2. **dt20** - Fast-paced Dragon Tiger
3. **ab20** - Popular Andar Bahar
4. **ourroullete** - Classic European Roulette
5. **card32eu** - 32 Cards game

---

## Files Modified

- `src/data/allCasinoGames.ts` - Updated descriptions and features for 5 games
- Build verified successfully ✅

---

## Technical Notes

- All games support automatic settlement via `resultWebSocket.ts`
- API types mapped correctly to Diamond API endpoints
- Mobile-responsive layouts specified
- Dark theme with brand-appropriate accent colors
- Large tappable elements for mobile usability
