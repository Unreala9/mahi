# Casino Game Mechanics Implementation Guide

## Overview

This document outlines the implementation details for all casino game mechanics across 11 different tabs.

## Game Categories & Tabs

### 1. SMART Tab - Premium Slot & Multiplier Games (22 games)

**Focus:** High-quality crash games, slots, and premium multipliers

#### Crash/Multiplier Games

- **JBEX, Cricket X, Football X, Capparossa, AviaStar, Helicopter X**
- **Mechanics:**
  - Real-time multiplier counter (1.00x → infinite)
  - Live betting rounds (30-60 second rounds)
  - Instant cashout before crash
  - WebSocket for real-time updates
  - Provably fair verification
  - Auto-cashout feature
  - Live player count and bets

- **Tech Stack:**
  - WebSocket (Socket.io) for real-time multiplier
  - React hooks for state management
  - Canvas for smooth animations
  - Crypto verification for fairness

#### Plinko/Board Games

- **Balloon, Plinko X**
- **Mechanics:**
  - Physics-based ball drop
  - Multiple multiplier zones at bottom
  - Adjustable risk levels (low/medium/high)
  - Visual trail animation
  - Bet amount selection

- **Tech Stack:**
  - Matter.js or Phaser for physics
  - Canvas for rendering
  - Tween animations

#### Strategy Games

- **Mines, Tower X, Smash**
- **Mechanics:**
  - Grid-based selection
  - Risk vs reward gameplay
  - Progressive multipliers
  - Instant reveal or continue
  - Cash out anytime

- **Implementation:**

```typescript
interface MinesGame {
  gridSize: 5 | 7 | 9;
  mineCount: number;
  revealedCells: number[];
  currentMultiplier: number;
  cashOut: () => void;
  reveal: (cellIndex: number) => "safe" | "mine";
}
```

#### Card/Prediction Games

- **HiLo**
- **Mechanics:**
  - Simple higher/lower prediction
  - 5-30 second rounds
  - Quick settlements
  - Streak bonuses
  - Fair card shuffle algorithm

#### Wheel Games

- **Mini Roulette**
- **Mechanics:**
  - Spinning wheel animation (CSS/Canvas)
  - Number selection interface
  - Random landing position
  - Multiple bet types
  - Payout calculation

#### Slots

- **HollX, Foxy 20, Bonus 4 Bonanza, Book of Futurian, Wilds & Gods**
- **Mechanics:**
  - 3-5 reels with spin animation
  - Symbol matching logic
  - Payline calculations
  - Bonus rounds
  - Free spins
  - Wild/Scatter symbols

#### Lottery/Keno

- **Russian Keno, French Keno**
- **Mechanics:**
  - Number selection (pick 1-10 numbers)
  - Ball draw animation
  - Match counting
  - Dynamic payouts based on hits

---

### 2. OUR Tab - In-House Exclusive Games (6 games)

#### Diam 11 (Diamond Extraction)

- **Mechanics:**
  - Pick diamonds from grid
  - Each pick increases multiplier
  - Risk of hitting empty/bomb
  - Cash out anytime

#### Player Battle (PvP)

- **Mechanics:**
  - Real-time player vs player
  - Matchmaking system
  - Turn-based or simultaneous play
  - Elo rating system
  - Bet matching

#### Snakes & Ladders

- **Mechanics:**
  - Classic board game with betting
  - Dice roll with multipliers
  - Snake/Ladder animations
  - Progressive jackpot

#### Club Rummy

- **Mechanics:**
  - Standard Rummy rules
  - 2-6 players
  - Card dealing algorithm
  - Hand evaluation
  - Declare/Drop options
  - Points calculation

#### UDO Classic & UDO Lands

- **Mechanics:**
  - Dice-based gameplay
  - Territory capture
  - Multiplayer support
  - Turn-based strategy

---

### 3. AVIATOR Tab - Mini Quick Games (8 games)

**Focus:** Fast-paced, instant-win games with 10-30 second rounds

All games should have:

- Quick load times
- Minimal UI
- Instant payouts
- Mobile-optimized controls

---

### 4. POPOK Tab - Rapid Fire Games (8 games)

#### Chicky Choice & Tappy Bird

- **Mechanics:**
  - Timing-based gameplay
  - Click/Tap controls
  - Score-to-multiplier conversion
  - Quick rounds (15-30 seconds)

#### Andar Bahar

- **Mechanics:**
  - Indian card game
  - Single card dealt (Joker)
  - Bet on Andar (left) or Bahar (right)
  - Simple matching rules
  - Fast rounds

#### Crash Variants (Infinity, Extreme)

- Higher volatility versions
- Larger multiplier potential
- Faster crash times

---

### 5. PASCAL Tab - Live Table Games (8 games)

**All games feature live dealers via video stream**

#### Golden Roulette & Tornaldo Roulette

- **Mechanics:**
  - Live roulette wheel
  - Video stream integration
  - Betting interface
  - Timer countdown
  - Statistics panel
  - Hot/Cold numbers

#### Blackjack 3 Hands

- **Mechanics:**
  - Play 3 hands simultaneously
  - Standard blackjack rules
  - Hit/Stand/Double/Split
  - Insurance option
  - Side bets

#### Color Hunt

- **Mechanics:**
  - Color prediction (Red/Green/Blue)
  - Simple betting interface
  - Quick rounds
  - Color history display

---

### 6. SCRATCH Tab - Instant Win (1 game)

#### Lucky Scratch

- **Mechanics:**
  - Scratch card with 9 panels
  - Click or drag to reveal
  - Match 3 symbols to win
  - Instant payout
  - Multiple card types

- **Implementation:**

```typescript
interface ScratchCard {
  panels: Symbol[9];
  revealed: boolean[9];
  scratch: (index: number) => void;
  checkWin: () => number; // returns payout
}
```

---

### 7. DARWIN Tab - Evolution Gaming (7 games)

**Premium live dealer games powered by Evolution Gaming**

All games include:

- HD video streams
- Professional dealers
- Multiple camera angles
- Chat functionality
- Game history
- Advanced statistics

#### Baccarat Variants

- Standard, Pairs, VIP tables
- Standard Baccarat rules
- Player/Banker/Tie betting
- Commission tracking
- Shoe history

#### High Low Dice Evolution

- Live dice rolling
- Over/Under predictions
- Multiple betting options

#### Blossom Evo Bingo

- 90-ball bingo
- Multiple cards
- Auto-daub
- Pattern wins

---

### 8. GEMINI Tab - Provably Fair Games (9 games)

**All games feature cryptographic verification**

Each game must implement:

```typescript
interface ProvablyFairGame {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  generateResult: () => any;
  verify: (result: any) => boolean;
  getVerificationLink: () => string;
}
```

#### Marbles 1v1 & 5v5

- **Mechanics:**
  - Physics-based marble racing
  - Choose marble color
  - Real-time race animation
  - PvP betting

#### 100x Limbo

- **Mechanics:**
  - Choose target multiplier (1.01x - 100x)
  - Roll under target number
  - Provably fair number generation
  - Instant results

---

### 9. STUDIO21 Tab - Themed Exclusive Games (9 games)

**Focus:** Unique themed experiences

#### Alien Abduction, Pirate or Parrot, Venus Flytrap

- **Mechanics:**
  - Story-driven gameplay
  - Multiple rounds
  - Theme-specific bonuses
  - Animated characters
  - Progressive features

---

### 10. BEON Tab - Aviation/Flight Games (5 games)

All crash-style games with aviation themes:

- Plane/helicopter animations
- Altitude-based multipliers
- Themed sound effects
- Weather effects

---

### 11. JACKTOP Tab - Instant Win & Chicken Games (4 games)

#### Lucky Chicken Crossing

- **Mechanics:**
  - Choose path for chicken
  - Avoid obstacles
  - Progressive multipliers
  - Cash out before danger

#### Mega Deal

- **Mechanics:**
  - Deal or No Deal style
  - Box selection
  - Banker offers
  - Risk vs reward

---

## Core Technical Implementation

### 1. WebSocket Manager

```typescript
class CasinoWebSocket {
  connect(gameId: string): void;
  subscribe(event: string, callback: Function): void;
  emit(event: string, data: any): void;
  disconnect(): void;
}
```

### 2. Game State Management

```typescript
interface GameState {
  gameId: string;
  status: "idle" | "betting" | "playing" | "result";
  balance: number;
  currentBet: number;
  result?: any;
  history: GameRound[];
}
```

### 3. Fair Verification System

```typescript
class FairnessVerifier {
  generateServerSeed(): string;
  combineSeeds(server: string, client: string, nonce: number): string;
  calculateResult(combined: string): number;
  verify(
    server: string,
    client: string,
    nonce: number,
    result: number,
  ): boolean;
}
```

### 4. Animation Engine

- Use requestAnimationFrame for smooth 60fps
- Canvas for complex animations
- CSS transitions for simple effects
- Tween libraries (GSAP) for advanced effects

### 5. Betting System

```typescript
interface BetSystem {
  placeBet(amount: number, prediction: any): Promise<BetResult>;
  cashOut(gameId: string): Promise<number>;
  getBalance(): number;
  getBetHistory(limit: number): Bet[];
}
```

### 6. Sound System

```typescript
class SoundManager {
  play(sound: "win" | "lose" | "bet" | "cashout"): void;
  setVolume(level: number): void;
  mute(): void;
}
```

---

## API Endpoints Required

### Game Endpoints

- `GET /casino/games` - List all games
- `GET /casino/game/:id` - Game details
- `POST /casino/bet` - Place bet
- `POST /casino/cashout` - Cash out
- `GET /casino/history` - Bet history
- `GET /casino/verify/:gameId` - Verify fairness

### WebSocket Events

- `game:start` - Game round started
- `game:update` - Real-time game updates
- `game:result` - Game result
- `bet:placed` - Bet confirmation
- `cashout:success` - Cashout confirmation

---

## Performance Optimizations

1. **Lazy Loading**: Load game components on demand
2. **Image Optimization**: Use WebP format, lazy load images
3. **WebSocket Pooling**: Reuse connections
4. **State Caching**: Cache game states
5. **Animation Throttling**: Use requestAnimationFrame
6. **Code Splitting**: Split by game type

---

## Mobile Optimization

- Touch-optimized controls
- Responsive layouts
- Reduced animations on mobile
- Offline state handling
- Portrait/landscape support

---

## Testing Requirements

1. **Unit Tests**: Game logic, calculations
2. **Integration Tests**: API calls, WebSocket
3. **E2E Tests**: Complete game flows
4. **Fairness Tests**: Verify provably fair algorithms
5. **Load Tests**: Handle 1000+ concurrent players

---

## Security Considerations

1. Server-side validation for all bets
2. Rate limiting on bet placement
3. Encrypted WebSocket connections
4. Anti-cheat mechanisms
5. Session management
6. Balance verification

---

## Next Steps

1. ✅ Create game data structure
2. ✅ Implement tab-based layout
3. ✅ Add game cards with metadata
4. 🔄 Implement individual game mechanics
5. 🔄 Add WebSocket integration
6. 🔄 Implement betting system
7. 🔄 Add fairness verification
8. 🔄 Create admin panel for game management
9. 🔄 Add analytics and tracking
10. 🔄 Performance optimization
