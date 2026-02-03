/**
 * Casino Games Integration Helper
 *
 * Quick copy-paste templates for updating casino game pages
 */

// =============================================================================
// STEP 1: Add these imports at the top of your game file
// =============================================================================

/*
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";
import { TrendingUp } from "lucide-react";
*/

// =============================================================================
// STEP 2: Replace your component's local state with this hook
// =============================================================================

/*
export default function YourGameComponent() {
  const navigate = useNavigate();

  // ✅ ADD THIS: Live API integration
  const {
    gameData,        // Raw game data from API
    result,          // Last round result
    isConnected,     // Connection status
    markets,         // All available betting markets with live odds
    roundId,         // Current round ID
    cards,           // Card data (if available)
    placeBet,        // Function to place bets
    placedBets,      // Map of currently placed bets
    clearBets,       // Function to clear all bets
    totalStake,      // Total amount staked
    potentialWin,    // Potential winnings
    isSuspended,     // Whether betting is suspended
    getMarket,       // Helper to get a specific market by name
  } = useUniversalCasinoGame({
    gameType: "YOUR_GAME_CODE",  // See game codes below
    gameName: "Your Game Name",
  });

  // Your existing state can remain...
  const [countdown, setCountdown] = useState(20);
  // ... etc
*/

// =============================================================================
// STEP 3: Add betting panel to your UI (usually in a sidebar)
// =============================================================================

/*
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
</div>
*/

// =============================================================================
// STEP 4: Display live odds in your UI
// =============================================================================

/*
// Get a specific market by name
const dragonMarket = markets.find(m => m.nat.toLowerCase().includes("dragon"));
const tigerMarket = markets.find(m => m.nat.toLowerCase().includes("tiger"));

// Or use the helper function
const dragonMarket = getMarket("Dragon");

// Display odds
const odds = dragonMarket ? (dragonMarket.b / 100).toFixed(2) : "0.00";

<Badge className="bg-blue-600">
  {odds}x
</Badge>

// Show if market is suspended
{dragonMarket?.gstatus === "SUSPENDED" && (
  <Badge variant="destructive">Suspended</Badge>
)}
*/

// =============================================================================
// STEP 5: Show connection status
// =============================================================================

/*
{isConnected ? (
  <Badge className="bg-green-600 animate-pulse">
    <Clock className="w-3 h-3 mr-1" />
    Live
  </Badge>
) : (
  <Badge variant="secondary">Connecting...</Badge>
)}
*/

// =============================================================================
// STEP 6: Display last result
// =============================================================================

/*
{result && (
  <Card className="bg-gray-800/50 border-yellow-600/20 p-4">
    <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
      <TrendingUp className="w-4 h-4 mr-2" />
      Last Result
    </h3>
    <div className="space-y-2">
      <div>
        <p className="text-xs text-gray-400">Round</p>
        <p className="text-sm font-mono text-white">{result.mid}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400">Winner</p>
        <Badge className="bg-green-600 mt-1">{result.win}</Badge>
      </div>
    </div>
  </Card>
)}
*/

// =============================================================================
// STEP 7: Show round ID in header
// =============================================================================

/*
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
*/

// =============================================================================
// GAME TYPE CODES - Use these for the gameType parameter
// =============================================================================

export const GAME_CODES = {
  // Andar Bahar
  AndarBahar20: "ab20",
  AndarBahar3: "ab3",
  AndarBahar4: "ab4",
  AndarBaharJ: "abj",

  // Dragon Tiger
  DragonTiger20: "dt20",
  DragonTiger6: "dt6",
  DT202: "dt202",
  DTL20: "dtl20",

  // Teen Patti
  TeenPatti20: "teen20",
  Teen1: "teen1",
  Teen120: "teen120",
  Teen20B: "teen20b",
  Teen20C: "teen20c",
  Teen2: "patti2",
  Teen3: "teen3",
  Teen32: "teen32",
  Teen33: "teen33",
  Teen41: "teen41",
  Teen42: "teen42",
  Teen6: "teen6",
  Teen8: "teen8",
  Teen9: "teen9",
  Teenmuf2: "teenmuf2",
  TeenPatti1Day: "teen1day",
  QueenTeenPatti: "queenteenpatti",
  ThreeCardJ: "3cardj",

  // Lucky 7
  Lucky7: "lucky7",
  Lucky7EU: "lucky7eu",
  Lucky7EU2: "lucky7eu2",
  Lucky15: "lucky15",

  // Poker
  Poker20: "poker20",
  Poker6: "poker6",
  Poker: "poker",

  // Baccarat
  Baccarat: "baccarat",
  Baccarat2: "baccarat2",
  BaccaratTable: "baccarat",

  // Roulette
  Roulette: "roulette",
  OurRoulette: "ouRoulette",
  GoldenRoulette: "goldenRoulette",
  BeachRoulette: "beachRoulette",

  // Card 32
  Card32EU: "card32eu",
  Card32J: "card32j",

  // Race
  Race2: "race2",
  Race17: "race17",
  Race20: "race20",

  // Cricket
  CricketMatch20: "cricket20",
  CricketV3: "cricketv3",
  CricketMeter: "cricketmeter",
  CricketMeter1: "cricketmeter1",
  BallByBall: "ballbyball",
  SuperOver: "superover",
  Superover2: "superover2",

  // Sicbo
  Sicbo: "sicbo",
  Sicbo2: "sicbo2",

  // Worli
  Worli: "worli",
  Worli3: "worli3",
  WorliVariant2: "worli2",

  // Others
  KBC: "kbc",
  CasinoWar: "casinowar",
  Poison: "poison",
  Poison20: "poison20",
  Btable2: "btable2",
  Dolidana: "dolidana",
  Dum10: "dum10",
  Goal: "goal",
  Joker120: "joker120",
  Joker20: "joker20",
  LottCard: "lottcard",
  Mogambo: "mogambo",
  Notenum: "notenum",
  Aaa2: "aaa2",
};

// =============================================================================
// COMPLETE EXAMPLE - Dragon Tiger 20
// =============================================================================

/*
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

export default function DragonTiger20() {
  const navigate = useNavigate();

  // ✅ Live API integration
  const {
    result,
    isConnected,
    markets,
    roundId,
    placeBet,
    placedBets,
    clearBets,
    totalStake,
    potentialWin,
    isSuspended,
    getMarket,
  } = useUniversalCasinoGame({
    gameType: "dt20",
    gameName: "Dragon Tiger 20",
  });

  const [countdown, setCountdown] = useState(20);

  // Get specific markets
  const dragonMarket = getMarket("Dragon");
  const tigerMarket = getMarket("Tiger");
  const tieMarket = getMarket("Tie");

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        {/* Header with connection status *\/}
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
                <h1 className="text-2xl font-bold text-white">Dragon Tiger 20</h1>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 font-bold">{countdown}s</span>
                  {roundId && <Badge variant="outline">Round: {roundId}</Badge>}
                </div>
              </div>
              {isConnected ? (
                <Badge className="bg-green-600 animate-pulse">Live</Badge>
              ) : (
                <Badge variant="secondary">Connecting...</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Betting Panel *\/}
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

              {/* Last Result *\/}
              {result && (
                <Card className="bg-gray-800/50 border-yellow-600/20 p-4 mt-4">
                  <h3 className="text-yellow-400 font-bold mb-3">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Last Result
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Round</p>
                      <p className="text-sm font-mono text-white">{result.mid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Winner</p>
                      <Badge className="bg-green-600 mt-1">{result.win}</Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Game Area *\/}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Dragon *\/}
                <Card className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-600/50 p-6">
                  <h2 className="text-3xl font-bold text-red-500 mb-2">DRAGON</h2>
                  <Badge className="bg-red-600">
                    {dragonMarket ? (dragonMarket.b / 100).toFixed(2) : "0.00"}x
                  </Badge>
                  {dragonMarket?.gstatus === "SUSPENDED" && (
                    <Badge variant="destructive" className="ml-2">Suspended</Badge>
                  )}
                </Card>

                {/* Tiger *\/}
                <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-600/50 p-6">
                  <h2 className="text-3xl font-bold text-blue-500 mb-2">TIGER</h2>
                  <Badge className="bg-blue-600">
                    {tigerMarket ? (tigerMarket.b / 100).toFixed(2) : "0.00"}x
                  </Badge>
                  {tigerMarket?.gstatus === "SUSPENDED" && (
                    <Badge variant="destructive" className="ml-2">Suspended</Badge>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
*/

// =============================================================================
// BENEFITS OF THIS INTEGRATION
// =============================================================================

/*
✅ Live API Data: Real-time game data from Diamond API
✅ Live Odds: Auto-updating odds for all markets
✅ Betting Logic: Built-in bet placement with validation
✅ Wallet Integration: Automatic wallet deduction/addition
✅ Result Tracking: Live result updates
✅ Auto-Settlement: Automatic bet settlement on results
✅ Consistent UI: Reusable betting panel
✅ Connection Status: Real-time connection monitoring
✅ Round Tracking: Current round ID display
✅ Error Handling: Built-in error management
✅ Type Safety: Full TypeScript support
*/
