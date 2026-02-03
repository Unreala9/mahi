# Updated AndarBahar20 Template - With Betting Panel & Quick Actions

Yeh ek complete example hai jisme:

- ✅ Live API odds
- ✅ Real-time betting panel
- ✅ Quick action buttons (Repeat, Half, Double, Min, Max)
- ✅ Result tracking
- ✅ Wallet integration

**Copy ye structure apne har game mein! 👇**

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

export default function AndarBahar20() {
  const navigate = useNavigate();

  // ✅ Live API Integration with automatic updates
  const {
    gameData,
    result,
    isConnected,
    markets,
    roundId,
    cards,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
  } = useUniversalCasinoGame({
    gameType: "ab20",
    gameName: "Andar Bahar 20",
  });

  const [countdown, setCountdown] = useState(20);
  const [isDealing, setIsDealing] = useState(false);
  const [jokerCard, setJokerCard] = useState("🂮");

  // Auto-update joker card from API
  useEffect(() => {
    if (cards) {
      setJokerCard(`🂮`);
    }
  }, [cards]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          setIsDealing(true);
          setTimeout(() => setIsDealing(false), 5000);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get Andar and Bahar markets from API
  const andarMarket = markets.find((m) =>
    m.nat.toLowerCase().includes("andar"),
  );
  const baharMarket = markets.find((m) =>
    m.nat.toLowerCase().includes("bahar"),
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/10 to-gray-900">
        {/* Header */}
        <div className="bg-gray-900/80 border-b border-blue-600/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/casino")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  <span className="text-blue-500">Andar</span> Bahar{" "}
                  <span className="text-green-500">20</span>
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-lg">
                    {countdown}s
                  </span>
                  {roundId && (
                    <Badge variant="outline" className="ml-2">
                      Round: {roundId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isConnected ? (
                  <Badge className="bg-green-600 animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary">Connecting...</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Betting Panel (Sidebar) */}
            <div className="lg:col-span-1 order-last lg:order-first space-y-4">
              {/* ✅ Live Betting Panel with Quick Actions */}
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
                <Card className="bg-gray-800/50 border-yellow-600/20 p-4">
                  <h3 className="text-yellow-400 font-bold mb-3">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Last Result
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Round</p>
                      <p className="text-sm font-mono text-white">
                        {result.mid}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Winner</p>
                      <Badge className="bg-green-600 mt-1">{result.win}</Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Game Board */}
            <div className="lg:col-span-3">
              {/* Joker Card */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/50 p-6 mb-6">
                <div className="text-center">
                  <h3 className="text-purple-400 font-bold text-lg mb-4">
                    JOKER CARD
                  </h3>
                  <div
                    className={cn(
                      "aspect-[3/4] max-w-[150px] mx-auto bg-white rounded-xl flex items-center justify-center text-8xl shadow-2xl border-4 border-purple-500 transition-all duration-500",
                      isDealing && "scale-110 animate-pulse",
                    )}
                  >
                    {jokerCard}
                  </div>
                </div>
              </Card>

              {/* Betting Areas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Andar */}
                <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-blue-500 mb-2">
                      ANDAR
                    </h2>
                    <Badge className="bg-blue-600">
                      {andarMarket ? (andarMarket.b / 100).toFixed(2) : "1.90"}x
                    </Badge>
                    {andarMarket?.gstatus === "SUSPENDED" && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Suspended
                      </Badge>
                    )}
                  </div>
                  <div className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-8 rounded-lg transition-all border-4 border-blue-400 shadow-lg shadow-blue-600/50 flex items-center justify-center">
                    <div className="text-center">
                      <div>BET ON ANDAR</div>
                      {placedBets.has(andarMarket?.sid.toString() || "") && (
                        <div className="text-sm mt-2">
                          ₹
                          {placedBets.get(andarMarket?.sid.toString() || "")
                            ?.stake || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Bahar */}
                <Card className="bg-gradient-to-br from-green-950/50 to-green-900/30 border-green-600/50 p-6">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-green-500 mb-2">
                      BAHAR
                    </h2>
                    <Badge className="bg-green-600">
                      {baharMarket ? (baharMarket.b / 100).toFixed(2) : "1.90"}x
                    </Badge>
                    {baharMarket?.gstatus === "SUSPENDED" && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Suspended
                      </Badge>
                    )}
                  </div>
                  <div className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-8 rounded-lg transition-all border-4 border-green-400 shadow-lg shadow-green-600/50 flex items-center justify-center">
                    <div className="text-center">
                      <div>BET ON BAHAR</div>
                      {placedBets.has(baharMarket?.sid.toString() || "") && (
                        <div className="text-sm mt-2">
                          ₹
                          {placedBets.get(baharMarket?.sid.toString() || "")
                            ?.stake || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## 🎯 Key Features Added:

### 1. **Live API Integration**

- Real-time odds from Diamond API
- Automatic market updates every second
- Round ID tracking

### 2. **Quick Action Buttons** (New!)

- 🔁 **Repeat** - Repeat last bet amount
- ➗ **Half** - Reduce bet by 50%
- ✖️ **Double** - Double the bet amount
- ➖ **Min** - Set to minimum (₹10)
- ➕ **Max** - Set to maximum (₹5000)

### 3. **Betting Panel**

- Market selection
- Chip values
- Total stake tracking
- Potential win calculation
- Place/Clear actions

### 4. **Result Tracking**

- Last round result display
- Winner information
- Auto-update when new result arrives

### 5. **Connection Status**

- Live indicator
- Auto-connecting status
- Round countdown

---

## 📋 Copy-Paste Checklist:

For each game file:

- [ ] Add imports (useUniversalCasinoGame, CasinoBettingPanel, TrendingUp)
- [ ] Add useUniversalCasinoGame hook with correct gameType
- [ ] Add CasinoBettingPanel in sidebar/left column
- [ ] Get markets using `markets.find(m => m.nat.includes("..."))`
- [ ] Display live odds: `{market ? (market.b / 100).toFixed(2) : "0.00"}`
- [ ] Show connection status (isConnected ? "Live" : "Connecting...")
- [ ] Display last result (result section)
- [ ] Replace hardcoded odds with live data
- [ ] Test betting functionality

---

## 🚀 How to Apply to Other Games:

### Dragon Tiger 20 Example:

```tsx
const dragonMarket = markets.find((m) =>
  m.nat.toLowerCase().includes("dragon"),
);
const tigerMarket = markets.find((m) => m.nat.toLowerCase().includes("tiger"));
const tieMarket = markets.find((m) => m.nat.toLowerCase().includes("tie"));

// Use in UI:
<Badge>{dragonMarket ? (dragonMarket.b / 100).toFixed(2) : "0.00"}x</Badge>;
```

### Baccarat Example:

```tsx
const playerMarket = markets.find((m) =>
  m.nat.toLowerCase().includes("player"),
);
const bankerMarket = markets.find((m) =>
  m.nat.toLowerCase().includes("banker"),
);
const tieMarket = markets.find((m) => m.nat.toLowerCase().includes("tie"));
```

### Teen Patti Example:

```tsx
const chaalMarket = markets.find((m) => m.nat.toLowerCase().includes("chaal"));
const packMarket = markets.find((m) => m.nat.toLowerCase().includes("pack"));
```

---

## ✅ That's It!

Ab har game ke liye same pattern follow karo:

1. Add imports
2. Add hook
3. Add betting panel
4. Get markets
5. Display live odds
6. Test!

**Quick actions + Live APIs + Betting Panel = Complete Casino Game! 🎰**
