# Diamond Exchange Betting System Blueprint & Logic

This document combines the technical blueprint for rebuilding the betting engine with specific logic extracted from the source code.

---

# PART 1: SYSTEM BLUEPRINT

## 1. Core Betting Concepts & Mathematics

### A. Match Odds (Back & Lay)
The core of the exchange is the ability to Back (bet on an outcome happening) and Lay (bet against an outcome).

**Definitions:**
- **Stake:** The amount the user risks (for Back bets) or the backer's stake (for Lay bets).
- **Odds:** The decimal price of the market (e.g., 1.5, 2.0, 3.5).
- **Liability:** The amount a Layer risks losing.

#### 1. Back Bet Calculation
*User bets **$1000** on Team A at odds **1.5**.*
- **If Team A Wins:**
  - `Profit = Stake * (Odds - 1)`
  - `Profit = 1000 * (1.5 - 1) = $500`
- **If Team A Loses:**
  - `Loss = Stake = $1000`
- **Exposure (Locked Funds):** `$1000`

#### 2. Lay Bet Calculation
*User bets **AGAINST** Team A at odds **1.5** for a stake of **$1000**.*
- **Liability (Risk):** `(Odds - 1) * Stake`
  - `Risk = (1.5 - 1) * 1000 = $500`
- **If Team A Wins (User Loses):**
  - `Loss = Liability = $500`
- **If Team A Loses (User Wins):**
  - `Profit = Stake = $1000`
- **Exposure (Locked Funds):** `$500` (The Liability)

---

### B. Session / Fancy Betting (Over/Under)
Used for specific events like "Runs in 6 overs".

**Structure:**
- **Headname:** The market name (e.g., "6 Over Runs").
- **No (Lay):** Bet that the score will be **LOWER** than the odds.
- **Yes (Back):** Bet that the score will be **HIGHER** or EQUAL to the odds.

#### Rules
- **Yes Win Condition:** `Actual Score >= Bet Odds`
- **No Win Condition:** `Actual Score < Bet Odds` (or specific market rule)

#### Payout Calculation
- **Fancy Rate/Size:** Often Fancy bets have a specific payout percentage (e.g., 100/100 or 90/100).
- **Profit:** `(Stake * Rate) / 100`

---

## 2. Database Schema Design

To replicate this system, you need the following core collections (tables).

### A. Users (`User`)
Tracks wallet balances and hierarchy.

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique User ID |
| `username` | String | Login ID |
| `password` | String | Hashed Password |
| `balance` | Number | **Deposited Funds** (Static credit given by admin) |
| `profit_loss` | Number | **Running P/L** (Updates with every settled bet) |
| `exposure` | Number | **Locked Funds** (Sum of liability on pending bets) |
| `userType` | Number | Role (1: Admin, ..., 6: User) |
| `parentid` | ObjectId | ID of the agent/upline |
| `partnership_share`| Number | % of profit/loss shared with parent |

### B. User Bets (`Userbet`)
Stores every individual bet placed.

| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | ObjectId | Reference to User |
| `event_id` | Number | Match ID from API |
| `market_id` | String | Market ID (e.g., "1.123456") |
| `bet_type` | String | `back` or `lay` |
| `bet_on` | String | `odds` (Match), `fancy` (Session), `bookmaker` |
| `odds` | Number | The price taken |
| `stake` | Number | The amount placed |
| `status` | String | `pending` -> `completed` |
| `type` | String | `unmatch` (Queue) -> `match` (Active) |
| `exposure` | Number | Amount locked for this bet |
| `team_name` | String | Selection Name (e.g., "India", "Session 6 Over") |

### C. Match Declarations (`Matchdeclare`)
Stores the results for settlement.

| Field | Type | Description |
| :--- | :--- | :--- |
| `event_id` | Number | Match ID |
| `winner` | String | Winning Team Name |
| `market_id` | String | Market settled |
| `result_checked` | Boolean | Processed flag |

---

## 3. Algorithmic Workflows

### A. Bet Placement Engine
**Function:** `placeBet(user, betDetails)`

1.  **Input Validations:**
    - Is market open?
    - Is match active (not suspended)?
    - Is stake within Min/Max limits?

2.  **Financial Validation:**
    - Calculate **New Exposure**:
        - `CurrentExposure = user.exposure`
        - `NewBetExposure = (betType == 'back') ? stake : ((odds - 1) * stake)`
        - `TotalExposure = CurrentExposure + NewBetExposure`
    - Calculate **Available Balance**:
        - `Available = user.balance + user.profit_loss - CurrentExposure`
    - **Check:** `Available >= NewBetExposure`?
        - *No:* Reject Bet ("Insufficient Funds").
        - *Yes:* Proceed.

3.  **Execution:**
    - Save `Userbet` with `status: 'pending'`.
    - Update `User.exposure = TotalExposure`.

### B. Match Settlement Engine
**Function:** `settleMatch(eventId, winner)`

1.  **Retrieve Bets:**
    - Fetch all `Userbet` where `event_id == eventId` AND `status == 'pending'`.

2.  **Iterate & Calculate P/L:**
    - For each bet:
        - `WinCondition = (bet.team_name == winner)`
        - **If Back Bet:**
            - Win: `PL = + (Stake * (Odds - 1))`
            - Loss: `PL = - Stake`
        - **If Lay Bet:**
            - Win (Team Loses): `PL = + Stake`
            - Loss (Team Wins): `PL = - ((Odds - 1) * Stake)`

3.  **Transaction & Wallet Update:**
    - Call `updateWallet(user_id, PL)`.
    - Mark bet `status = 'completed'`.

### C. Wallet Update & Partnership Integration
**Function:** `updateWallet(userId, amount)`

*This is a recursive function to handle Agent commissions.*

1.  **Update End User:**
    - Fetch `User`.
    - Update `User.profit_loss += amount`.
    - Update `User.exposure -= bet_exposure` (Release locked funds).

2.  **Distribute to Upline (Recursion):**
    - If `User.parentid` exists:
        - `Share %` = User's partnership config (e.g., 20%).
        - `Parent Amount` = `amount * (100% - Share%)` (Logic varies based on contract).
        - **Log Transaction:** Record entry in `AdminTransaction`.
        - **Repeat:** Call `updateWallet(parentid, Parent Amount)` until Admin is reached.

---

# PART 2: EXTRACTED CODE LOGIC & SNIPPETS

## 1. Bet Placement Logic
**Source:** `user.service.js` -> `createbetuser`

### Flow
1.  **Validation:**
    - Check if Sport is Active.
    - Check Match Suspension (`Suspend` status).
    - Check User Limits (Min/Max Bet for specific sport).
    - Check Bet Locks (Admin or Upline lock).
    - Check Account Status (Active/Inactive).

2.  **Financial Checks:**
    - **Calculate Current Exposure:** Sum of `exposure` for all pending bets.
    - **Calculate Available Balance:** `User.balance + User.profit_loss - Current Exposure`.
    - **Check Balance:** `Available Balance >= Stake` (for Back bets) or Liability (for Lay bets).
    - **Check Market Limits:** Verify stake against specific market limits (Manual Bookmaker, Fancy, etc.).

3.  **Execution:**
    - Create `Userbet` record.
    - Status: `pending`.
    - Type: `unmatch` (initially) or `match` (if matched immediately).
    - Deduct Exposure from Available Limit (logically done by increasing total exposure).

### Code Snippet (Simplified)
```javascript
async function createbetuser(req, res) {
    // 1. Validation
    if (isSuspended) return "Match Suspended";
    if (stake < minLimit || stake > maxLimit) return "Limit Exceed";

    // 2. Exposure & Balance
    let totalPendingExposure = await Userbet.sum('exposure', { status: 'pending' });
    let availableBalance = user.balance + user.profit_loss - totalPendingExposure;

    if (stake > availableBalance) return "Insufficient Balance";

    // 3. Place Bet
    let newBet = new Userbet({
        user_id: currentUser,
        event_id: eventId,
        team_name: teamName,
        bet_type: type, // 'back' or 'lay'
        odds: odds,
        stake: stake,
        status: 'pending'
    });
    await newBet.save();
}
```

## 2. Match Odds Settlement (Back/Lay)
**Source:** `match.service.js` -> `matchResult`

### Logic
1.  **Input:** `Winner Team Name`, `Event ID`.
2.  **Process:**
    - Find all **Matched** & **Pending** bets for the event (`Userbet`).
    - Loop through each bet:
        - **If User Picked Winner (Win Condition):**
            - **Back Bet:** User Wins.
                - `Profit = (Odds - 1) * Stake`
            - **Lay Bet:** User Loses.
                - `Loss = (Odds - 1) * Stake` (Liability)
        - **If User Picked Loser (Loss Condition):**
            - **Back Bet:** User Loses.
                - `Loss = Stake`
            - **Lay Bet:** User Wins.
                - `Profit = Stake`
    - **Update Wallet:** Call `addProfitLossToUser` with the calculated amount.
    - **Update Bet Status:** Set `status = 'completed'`.
    - **Cleanup:** Delete unmatched bets for the event.

### Algorithm (Extracted)
```javascript
// Provided: winner (string), eventId
let bets = await Userbet.find({ event_id: eventId, status: 'pending', type: 'match' });

for (let bet of bets) {
    let profitLoss = 0;
    let type = 'profit'; // or 'loss'

    if (bet.team_name == winner) {
        // User BACKED the Winner -> PROFIT
        if (bet.bet_type == 'back') {
            type = 'profit';
            profitLoss = (bet.odds - 1) * bet.stake;
        } 
        // User LAYED the Winner -> LOSS
        else { 
            type = 'loss';
            profitLoss = (bet.odds - 1) * bet.stake;
        }
    } else {
        // User BACKED a Loser -> LOSS
        if (bet.bet_type == 'back') {
            type = 'loss';
            profitLoss = bet.stake;
        } 
        // User LAYED a Loser -> PROFIT
        else {
            type = 'profit';
            profitLoss = bet.stake;
        }
    }

    addProfitLossToUser(bet.user_id, profitLoss, type);
}
```

## 3. Session / Fancy Settlement
**Source:** `match.service.js` -> `FancyResult`

### Logic
1.  **Input:** `Headname` (Session Name), `Score` (Actual Result), `Event ID`.
2.  **Process:**
    - Find all pending Fancy bets for this session.
    - Loop through bets:
        - **Check Win Condition:**
            - **"YES" Bet:** Wins if `Score >= Bet Odds`.
            - **"NO" Bet:** Wins if `Score <= Bet Odds`. (Note: Typically "No" implies under, logic may vary slightly by rule).
        - **Calculate Profit/Loss:**
            - **Win:** `Profit = (BackSize * Stake) / 100` (Payout based on fancy rate).
            - **Loss:** `Loss = Stake`.
    - **Update Wallet:** Call `addProfitLossToUser`.

### Algorithm (Extracted)
```javascript
// Provided: score (int), fancyName (string)
let bets = await Userbet.find({ headname: fancyName, bet_on: 'fancy', status: 'pending' });

for (let bet of bets) {
    let type = 'loss';
    let userPrediction = bet.no; // 'yes' or 'no'
    let targetScore = parseInt(bet.odds);
    let actualScore = parseInt(score);

    // Default to LOSS
    type = 'loss'; 
    
    // Win Logic
    if (userPrediction == 'yes' && actualScore >= targetScore) {
        type = 'profit';
    } 
    else if (userPrediction == 'no' && actualScore <= targetScore) { // Logic derived from code: score <= userOdds
        type = 'profit';
    }

    // Amount Logic
    let amount = bet.stake;
    if (type == 'profit' && userPrediction == 'yes') {
        // Fancy bets often have a rate/size distinct from standard odds
        amount = (bet.back_size * bet.stake) / 100;
    }

    addProfitLossToUser(bet.user_id, amount, type);
}
```

## 4. Wallet & Partnership Logic
**Source:** `match.service.js` -> `addProfitLossToUser`

### Logic
This system uses a **multi-level partnership/agent model**. When a user wins/loses, the P/L is distributed up the chain (User -> Master -> Super Master -> Admin).

1.  **Update User:**
    - If `type == 'profit'`: `User.profit_loss += Amount`.
    - If `type == 'loss'`: `User.profit_loss -= Amount`.
    - Create `Admintransaction` record (Deposit/Withdrawal).

2.  **Update Upline (Recursive):**
    - Retrieve User's `parentid`.
    - Calculate `parentProfitLossPercent` (User's partnership share).
    - If User has `userType == 6` (End User), full amount impacts their P/L.
    - For Agents/Masters, they only take their **percentage share** of the Risk/Reward.
    - **Recursively call** `addProfitLossToUser` for the parent with the remaining amount/share.

### Key Snippet
```javascript
async function addProfitLossToUser(userId, amount, type, percentage = 0) {
    let user = await User.findById(userId);
    
    // Update User Balance
    let adjustAmount = amount;
    if (type == 'loss') adjustAmount = -amount;
    
    // Update DB
    await User.updateOne({ _id: userId }, { $inc: { profit_loss: adjustAmount } });
    await Transaction.create({ ... });

    // Recursive Upline Update
    if (user.parentid) {
        // Calculate parent's share logic (simplified)
        let parentShare = user.partnership_share; // e.g., 20%
        addProfitLossToUser(user.parentid, amount, type, parentShare);
    }
}
```
