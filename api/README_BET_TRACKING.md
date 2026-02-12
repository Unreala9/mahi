# Bet Tracking & Result Flow - API Documentation

## JSON Structure Understanding

### Market Types aur unka ID Mapping

#### 1️⃣ MATCH_ODDS / Bookmaker (Main Markets)

```json
{
  "gmid": 856162940,           // ✅ event_id
  "mid": 6273906464321,        // ✅ market_id
  "mname": "MATCH_ODDS",       // ✅ market_name
  "section": [
    {
      "sid": 50050,            // ✅ selection_id (team/runner)
      "nat": "South Africa W", // selection name
      "odds": [...]            // back/lay prices
    }
  ]
}
```

**Mapping:**

- `event_id` = `gmid`
- `market_id` = `mid`
- `market_name` = `mname`
- `selection_id` = `section.sid`

---

#### 2️⃣ FANCY Markets (Normal / Over By Over / etc.)

```json
{
  "gmid": 856162940,           // ✅ event_id
  "mid": 140153994319,         // parent fancy group id
  "mname": "Normal",           // fancy type
  "section": [
    {
      "sid": 11,               // ✅ market_id (har fancy line ka apna)
      "nat": "10 over runs PAK W(SA W vs PAK W)adv", // ✅ market_name
      "odds": [...]            // back/lay prices
    }
  ]
}
```

**Mapping:**

- `event_id` = `gmid`
- `market_id` = `section.sid` ⚠️ (NOT mid!)
- `market_name` = `section.nat`

---

## API Endpoints Flow

### 1. Bet Track Karna (`/placed_bets`)

#### Example A: MATCH_ODDS Track

```bash
curl 'http://130.250.191.174:3009/placed_bets?key=mahi4449839dbabkadbakwq1qqd' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "event_id": 856162940,
    "event_name": "SA W vs PAK W",
    "market_id": 6273906464321,
    "market_name": "MATCH_ODDS",
    "market_type": "MATCH_ODDS"
  }'
```

#### Example B: FANCY Track

```bash
curl 'http://130.250.191.174:3009/placed_bets?key=mahi4449839dbabkadbakwq1qqd' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "event_id": 856162940,
    "event_name": "SA W vs PAK W",
    "market_id": 11,
    "market_name": "10 over runs PAK W(SA W vs PAK W)adv",
    "market_type": "FANCY"
  }'
```

---

### 2. Result Lana (`/get-result`)

**Same identifiers use karo jo placed_bets mein bheje the!**

#### MATCH_ODDS Result:

```bash
curl 'http://130.250.191.174:3009/get-result?key=mahi4449839dbabkadbakwq1qqd' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "event_id": 856162940,
    "event_name": "SA W vs PAK W",
    "market_id": 6273906464321,
    "market_name": "MATCH_ODDS"
  }'
```

#### FANCY Result:

```bash
curl 'http://130.250.191.174:3009/get-result?key=mahi4449839dbabkadbakwq1qqd' \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "event_id": 856162940,
    "event_name": "SA W vs PAK W",
    "market_id": 11,
    "market_name": "10 over runs PAK W(SA W vs PAK W)adv"
  }'
```

**Expected Behavior:**

- ✅ Match complete/settle hone ke baad result aayega
- ⏳ Live mein "pending / not declared / suspended" response milega

---

### 3. Placed Bets List (`/get_placed_bets`)

```bash
curl 'http://130.250.191.174:3009/get_placed_bets?event_id=856162940&key=mahi4449839dbabkadbakwq1qqd'
```

Is response se verify karo ki kaunse markets track ho rahe hain.

---

## ⚠️ Common Mistakes & Solutions

| ❌ Mistake                                           | ✅ Solution                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| MATCH_ODDS mein `section.sid` ko market_id bhej diya | `mid` use karo                                                |
| Fancy mein `mid` ko market_id bhej diya              | `section.sid` use karo                                        |
| market_name mein case/spaces mismatch                | Exact match karo (JSON se copy karo)                          |
| SUSPENDED market ko track kar rahe ho                | Sirf `status: "OPEN"` aur `gstatus: "ACTIVE"` ko track karo   |
| Result nahi aa raha                                  | Match complete hone ka wait karo, live mein result nahi milta |

---

## 🔍 Quick Reference Table

| Market Type | event_id | market_id     | market_name   | market_type  |
| ----------- | -------- | ------------- | ------------- | ------------ |
| MATCH_ODDS  | `gmid`   | `mid`         | `mname`       | "MATCH_ODDS" |
| Bookmaker   | `gmid`   | `mid`         | `mname`       | "MATCH_ODDS" |
| Fancy       | `gmid`   | `section.sid` | `section.nat` | "FANCY"      |
| Tied Match  | `gmid`   | `mid`         | `mname`       | "MATCH_ODDS" |

---

## 📝 Notes

1. **Bet Placement vs Tracking:**
   - `/placed_bets` endpoint "mark as tracked" jaisa kaam kar raha hai
   - Actual stake/odds/side fields visible nahi hain is endpoint mein

2. **Market Status Check:**
   - Hamesha `status: "OPEN"` check karo
   - Selection level pe `gstatus: "ACTIVE"` verify karo

3. **Result Timing:**
   - Live match mein result API se nahi milega
   - Match complete/declared hone ke baad hi proper result aayega
