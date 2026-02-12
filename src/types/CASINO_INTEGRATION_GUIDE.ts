/**
 * Batch Update Script for All Casino Game Pages
 *
 * This script provides a template for updating all casino game pages
 * with the universal hook and betting panel integration.
 *
 * USAGE INSTRUCTIONS:
 * ===================
 *
 * For each game page in src/pages/game-types/:
 *
 * 1. Import the hook and component:
 *    ```tsx
 *    import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
 *    import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";
 *    ```
 *
 * 2. Replace local state with the hook:
 *    ```tsx
 *    const {
 *      gameData,
 *      result,
 *      isConnected,
 *      markets,
 *      roundId,
 *      cards,
 *      placeBet,
 *      placedBets,
 *      clearBets,
 *      totalStake,
 *      potentialWin,
 *      isSuspended,
 *    } = useUniversalCasinoGame({
 *      gameType: "YOUR_GAME_TYPE", // e.g., "dt20", "ab20", "teen20"
 *      gameName: "YOUR_GAME_NAME", // e.g., "Dragon Tiger 20"
 *    });
 *    ```
 *
 * 3. Add the betting panel to your UI:
 *    ```tsx
 *    {markets.length > 0 && (
 *      <CasinoBettingPanel
 *        markets={markets}
 *        onPlaceBet={placeBet}
 *        placedBets={placedBets}
 *        totalStake={totalStake}
 *        potentialWin={potentialWin}
 *        onClearBets={clearBets}
 *        isSuspended={isSuspended}
 *        roundId={roundId}
 *      />
 *    )}
 *    ```
 *
 * 4. Display live odds from API:
 *    ```tsx
 *    const market = markets.find(m => m.nat.toLowerCase().includes("dragon"));
 *    const odds = market ? (market.b / 100).toFixed(2) : "0.00";
 *    ```
 *
 * 5. Show connection status:
 *    ```tsx
 *    {isConnected ? (
 *      <Badge className="bg-green-600">Live</Badge>
 *    ) : (
 *      <Badge variant="secondary">Connecting...</Badge>
 *    )}
 *    ```
 *
 * 6. Display last result:
 *    ```tsx
 *    {result && (
 *      <Card>
 *        <h3>Last Result</h3>
 *        <p>Round: {result.mid}</p>
 *        <p>Winner: {result.win}</p>
 *      </Card>
 *    )}
 *    ```
 *
 * GAME TYPE MAPPING:
 * ==================
 * Use these game type codes for the gameType parameter:
 *
 * - Andar Bahar: "ab20", "ab3", "ab4", "abj"
 * - Dragon Tiger: "dt20", "dt6", "dt202", "dtl20"
 * - Teen Patti: "teen20", "teen1", "teen2", "teen3", "teen6", "teen8", "teen9",
 *               "teen32", "teen33", "teen41", "teen42", "teen120", "teenmuf2", "teen1day"
 * - Lucky 7: "lucky7", "lucky7eu", "lucky7eu2", "lucky15"
 * - Poker: "poker20", "poker6"
 * - Baccarat: "baccarat", "baccarat2"
 * - Roulette: "roulette", "ourRoulette", "goldenRoulette", "beachRoulette"
 * - Card 32: "card32eu", "card32j"
 * - Race: "race2", "race17", "race20"
 * - Cricket: "cricket20", "cricketv3", "cricketmeter", "cricketmeter1", "ballbyball", "superover", "superover2"
 * - Others: "sicbo", "sicbo2", "worli", "worli3", "kbc", "casinowar", "poison", "poison20",
 *           "btable2", "dolidana", "dum10", "goal", "joker1", "joker20", "lottcard",
 *           "mogambo", "notenum", "patti2", "queenteenpatti", "aaa", "aaa2"
 *
 * BENEFITS:
 * =========
 * ✅ Live API odds data
 * ✅ Real-time round updates
 * ✅ Automatic bet placement
 * ✅ Wallet integration
 * ✅ Result tracking
 * ✅ Auto-settlement
 * ✅ Consistent UI across all games
 * ✅ Reduced code duplication
 *
 * EXAMPLE IMPLEMENTATIONS:
 * ========================
 * See the following files for complete examples:
 * - src/pages/game-types/AndarBahar20.tsx
 */

export const GAME_TYPE_CODES = {
  // Andar Bahar variants
  andarBahar20: "ab20",
  andarBahar3: "ab3",
  andarBahar4: "ab4",
  andarBaharJ: "abj",

  // Dragon Tiger variants
  dragonTiger20: "dt20",
  dragonTiger6: "dt6",
  dt202: "dt202",
  dtl20: "dtl20",

  // Teen Patti variants
  teenPatti20: "teen20",
  teen1: "teen1",
  teen120: "teen120",
  teen20B: "teen20",
  teen20C: "teen20",
  teen2: "patti2",
  teen3: "teen3",
  teen32: "teen32",
  teen33: "teen33",
  teen41: "teen41",
  teen42: "teen42",
  teen6: "teen6",
  teen8: "teen8",
  teen9: "teen9",
  teenmuf2: "teenmuf2",
  teenPatti1Day: "teen1day",
  queenTeenPatti: "queenteenpatti",
  threeCardJ: "3cardj",

  // Lucky 7 variants
  lucky7: "lucky7",
  lucky7EU: "lucky7eu",
  lucky7EU2: "lucky7eu2",
  lucky15: "lucky15",

  // Poker variants
  poker20: "poker20",
  poker6: "poker6",

  // Baccarat variants
  baccarat: "baccarat",
  baccarat2: "baccarat2",
  baccaratTable: "baccarat",

  // Roulette variants
  roulette: "roulette",
  ourRoulette: "ourRoulette",
  goldenRoulette: "goldenRoulette",
  beachRoulette: "beachRoulette",

  // Card 32
  card32EU: "card32eu",
  card32J: "card32j",

  // Race
  race2: "race2",
  race17: "race17",
  race20: "race20",

  // Cricket
  cricket20: "cricket20",
  cricketV3: "cricketv3",
  cricketMeter: "cricketmeter",
  cricketMeter1: "cricketmeter1",
  ballByBall: "ballbyball",
  superOver: "superover",
  superOver2: "superover2",

  // Sicbo
  sicbo: "sicbo",
  sicbo2: "sicbo2",

  // Worli
  worli: "worli",
  worli3: "worli3",
  worliVariant2: "worli2",

  // Others
  kbc: "kbc",
  casinoWar: "casinowar",
  poison: "poison",
  poison20: "poison20",
  btable2: "btable2",
  dolidana: "dolidana",
  dum10: "dum10",
  goal: "goal",
  joker1: "joker1",
  joker120: "joker120",
  joker20: "joker20",
  lottCard: "lottcard",
  mogambo: "mogambo",
  notenum: "notenum",
  aaa2: "aaa2",
} as const;

export type GameTypeCode =
  (typeof GAME_TYPE_CODES)[keyof typeof GAME_TYPE_CODES];

/**
 * Template component showing how to integrate the universal hook
 */
/*
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";
import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";
import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";

export default function YourCasinoGame() {
  const navigate = useNavigate();

  // Initialize the universal hook
  const {
    gameData,
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
  } = useUniversalCasinoGame({
    gameType: "YOUR_GAME_CODE", // e.g., "dt20"
    gameName: "Your Game Name", // e.g., "Dragon Tiger 20"
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
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
              <h1 className="text-2xl font-bold text-white">Your Game Name</h1>
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

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

            <div className="lg:col-span-3">
              {/* Your game-specific UI here *\/}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
*/
