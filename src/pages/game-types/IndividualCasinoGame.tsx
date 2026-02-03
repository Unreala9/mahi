/**
 * Individual Casino Game Page
 * Routes to specific game components based on game type
 */

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames } from "@/services/casino";
import type { CasinoGame } from "@/types/casino";
import { MainLayout } from "@/components/layout/MainLayout";

// Import existing game components
import { GenericCardGame } from "./GenericCardGame";
import RouletteGame from "./RouletteGame";
import CricketMeterGame from "./CricketMeterGame";
import QueenTeenPattiGame from "./QueenTeenPattiGame";
import LottCardGame from "./LottCardGame";
import CricketMeter1Game from "./CricketMeter1Game";
import Dum10Game from "./Dum10Game";
import WorliVariant2Game from "./WorliVariant2Game";
import NotenumGame from "./NotenumGame";
import Teen6Game from "./Teen6Game";
import SuperOver3Game from "./SuperOverGame";

// Import new casino games (games 36-40)
import Race2Game from "./Race2Game";
import Aaa2Game from "./Aaa2Game";
import Patti2Game from "./Patti2Game";
import Btable2Game from "./Btable2Game";

// Import new casino games (games 41-45)
import PoisonGame from "./PoisonGame";
import Poison20Game from "./Poison20Game";
import Joker120Game from "./Joker120Game";
import DolidanaGame from "./DolidanaGame";

// Import new casino games (games 46-50)
import Teen20BGame from "./Teen20BGame";
import Teen20CGame from "./Teen20CGame";
import CricketV3Game from "./CricketV3Game";

// Import new casino games (games 51-55)
import Teen1Game from "./Teen1Game";
import Teen3Game from "./Teen3Game";
import Teen9Game from "./Teen9Game";
import Teen8Game from "./Teen8Game";

// Import new casino games (games 56-60)
import Teen32Game from "./Teen32Game";
import Teen33Game from "./Teen33Game";
import Teen41Game from "./Teen41Game";
import Teen42Game from "./Teen42Game";
import Teen120Game from "./Teen120Game";

// Import new casino games (games 61-65)
import DTL20Game from "./DTL20Game";
import DT202Game from "./DT202Game";
import BeachRouletteGame from "./BeachRouletteGame";
import Poker6Game from "./Poker6Game";

// Import new casino games (games 66-70)
import Race17Game from "./Race17Game";
import Lucky7EU2Game from "./Lucky7EU2Game";

// Import new casino games (games 71-75)
import MogamboGame from "./MogamboGame";
import Baccarat2Game from "./Baccarat2Game";
import Superover2Game from "./Superover2Game";

// Import new casino games (games 76-81)
import TeenPatti1DayGame from "./TeenPatti1DayGame";
import Teenmuf2Game from "./Teenmuf2Game";

// Import all universal game templates (these use GenericCardGame)
import {
  Card32Game,
  CrashGame,
  CricketGame,
  KenoGame,
  MinesGame,
  PlinkoGame,
  SlotGame,
  JBEXGame,
  CricketXGame,
  FootballXGame,
  BalloonGame,
  HiLoGame,
  MiniRouletteGame,
  HollXGame,
  RussianKenoGame,
  TowerXGame,
  HelicopterXGame,
  SmashGame,
  HotlineGame,
  Foxy20Game,
  CapparossaGame,
  Diam11Game,
  SnakesLaddersGame,
  ClubRummyGame,
  UDOClassicGame,
  UDOLandsGame,
  ScribeGame,
  DiceGame,
  GoalGame,
  ChickyChoiceGame,
  TappyBirdGame,
  CrashInfinityGame,
  MegaWheelGame,
  CrashExtremeGame,
  AviaBETGame,
  GoldenRouletteGame,
  TornaldoRouletteGame,
  BigHiLoGame,
  Blackjack3HandsGame,
  ColorHuntGame,
  HotCricketGame,
  UDLCricketGame,
  LuckyScratchGame,
  AviationGame,
  HottieCricketCrashGame,
} from "./UniversalGameTemplate";

export function IndividualCasinoGame() {
  const params = useParams<{ gameType?: string; gmid?: string }>();

  // Support both routes: /casino/:gmid and /game/:gameType
  const gameIdentifier = params.gmid || params.gameType;

  // Fetch all casino games from API
  const {
    data: apiGames,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
    staleTime: 10 * 60 * 1000,
  });

  // Find game from API data
  const apiGame = Array.isArray(apiGames)
    ? apiGames.find((g) => g.gmid === gameIdentifier)
    : undefined;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 p-8">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            Error Loading Game
          </h2>
          <p className="text-muted-foreground">
            Failed to load game data. Please try again.
          </p>
        </div>
      </MainLayout>
    );
  }

  // If game not found in API, show error
  if (!gameIdentifier || !apiGame) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 p-8">
          <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
          <p className="text-muted-foreground">
            The game "{gameIdentifier}" is not available.
          </p>
        </div>
      </MainLayout>
    );
  }

  // Create game object from API data
  const game: CasinoGame = apiGame;

  // Get gmid for routing logic
  const gmidLower = apiGame.gmid.toLowerCase();

  // Dragon Tiger games
  if (gmidLower.startsWith("dt")) {
    return <GenericCardGame game={game} />;
  }

  // Teen Patti games
  if (gmidLower.startsWith("teen")) {
    return <GenericCardGame game={game} />;
  }

  // Andar Bahar
  if (gmidLower.startsWith("ab")) {
    return <GenericCardGame game={game} />;
  }

  // Baccarat
  if (gmidLower.includes("baccarat")) {
    return <GenericCardGame game={game} />;
  }

  // Lucky 7
  if (gmidLower.includes("lucky7")) {
    return <GenericCardGame game={game} />;
  }

  // 32 Cards
  if (gmidLower.includes("card32")) {
    return <Card32Game game={game} />;
  }

  // Crash games
  if (gmidLower === "aaa") {
    return <CrashGame game={game} />;
  }

  // New crash games
  if (gmidLower === "jbex") {
    return <JBEXGame game={game} />;
  }

  if (gmidLower === "cricketx") {
    return <CricketXGame game={game} />;
  }

  if (gmidLower === "footballx") {
    return <FootballXGame game={game} />;
  }

  if (gmidLower === "balloon" || gmidLower === "plinkox") {
    return <BalloonGame game={game} />;
  }

  if (gmidLower === "hilo") {
    return <HiLoGame game={game} />;
  }

  if (gmidLower === "miniroulette") {
    return <MiniRouletteGame game={game} />;
  }

  if (gmidLower === "hollx") {
    return <HollXGame game={game} />;
  }

  if (gmidLower === "russiankeno") {
    return <RussianKenoGame game={game} />;
  }

  if (gmidLower === "frenchkeno") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "aviastar") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "bookoffuturian") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "wildsandgods") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "crashduelx") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "bonus4bonanza") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "towerx") {
    return <TowerXGame game={game} />;
  }

  if (gmidLower === "helicopterx") {
    return <HelicopterXGame game={game} />;
  }

  if (gmidLower === "smash") {
    return <SmashGame game={game} />;
  }

  if (gmidLower === "hotline") {
    return <HotlineGame game={game} />;
  }

  if (gmidLower === "foxy20") {
    return <Foxy20Game game={game} />;
  }

  if (gmidLower === "capparossa") {
    return <CapparossaGame game={game} />;
  }

  if (gmidLower === "diam11") {
    return <Diam11Game game={game} />;
  }

  if (gmidLower === "playerbattle") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "snakesladders") {
    return <SnakesLaddersGame game={game} />;
  }

  if (gmidLower === "clubrummy") {
    return <ClubRummyGame game={game} />;
  }

  if (gmidLower === "udoclassic") {
    return <UDOClassicGame game={game} />;
  }

  if (gmidLower === "udolands") {
    return <UDOLandsGame game={game} />;
  }

  if (gmidLower === "scribe") {
    return <ScribeGame game={game} />;
  }

  if (gmidLower === "dice") {
    return <DiceGame game={game} />;
  }

  if (gmidLower === "goal") {
    return <GoalGame game={game} />;
  }

  if (gmidLower === "chickychoice") {
    return <ChickyChoiceGame game={game} />;
  }

  if (gmidLower === "tappybird") {
    return <TappyBirdGame game={game} />;
  }

  if (gmidLower === "crashinfinity") {
    return <CrashInfinityGame game={game} />;
  }

  if (gmidLower === "megawheel") {
    return <MegaWheelGame game={game} />;
  }

  if (gmidLower === "crashextreme") {
    return <CrashExtremeGame game={game} />;
  }

  if (gmidLower === "aviabet") {
    return <AviaBETGame game={game} />;
  }

  // Classic Roulette explicit mappings (common keys used in UI)
  if (
    gmidLower === "roulette" ||
    gmidLower === "roulette1" ||
    gmidLower === "roulette11" ||
    gmidLower === "roulette12" ||
    gmidLower === "roulette13" ||
    gmidLower === "ourroulette" ||
    gmidLower === "ourroullete"
  ) {
    return <RouletteGame game={game} />;
  }

  if (gmidLower === "goldenroulette") {
    return <GoldenRouletteGame game={game} />;
  }

  if (gmidLower === "tornaldoroulette") {
    return <TornaldoRouletteGame game={game} />;
  }

  if (gmidLower === "bighilo") {
    return <BigHiLoGame game={game} />;
  }

  if (gmidLower === "blackjack3hands") {
    return <Blackjack3HandsGame game={game} />;
  }

  if (gmidLower === "colorhunt") {
    return <ColorHuntGame game={game} />;
  }

  if (gmidLower === "hotcricket") {
    return <HotCricketGame game={game} />;
  }

  if (gmidLower === "udlcricket") {
    return <UDLCricketGame game={game} />;
  }

  if (gmidLower === "luckyscratch") {
    return <LuckyScratchGame game={game} />;
  }

  if (gmidLower === "aviation") {
    return <AviationGame game={game} />;
  }

  if (gmidLower === "hottiecricketcrash") {
    return <HottieCricketCrashGame game={game} />;
  }

  // New Game Variants
  if (gmidLower === "3cardj") {
    return <GenericCardGame game={game} />;
  }

  // Dragon Tiger variants
  if (gmidLower === "dt20") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "war") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "dt6") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "abj") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "card32") {
    return <GenericCardGame game={game} />;
  }

  // Cricket
  if (gmidLower.includes("ballbyball") || gmidLower.includes("ball-by-ball")) {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower.includes("cricket")) {
    return <CricketGame game={game} />;
  }

  // Keno
  if (gmidLower.includes("keno")) {
    return <KenoGame game={game} />;
  }

  // NEW CASINO GAMES (Games 21-30)
  // Sic Bo games
  if (gmidLower === "sicbo") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "sicbo2") {
    return <GenericCardGame game={game} />;
  }

  // Cricket fantasy/meter games
  if (gmidLower === "cmatch20") {
    return <GenericCardGame game={game} />;
  }

  if (gmidLower === "cmeter") {
    return <CricketMeterGame game={game} />;
  }

  if (gmidLower === "cmeter1") {
    return <CricketMeter1Game game={game} />;
  }

  // Trap racing
  if (gmidLower === "trap") {
    return <GenericCardGame game={game} />;
  }

  // Queen Teen Patti
  if (gmidLower === "queen") {
    return <QueenTeenPattiGame game={game} />;
  }

  // Bollywood game suite
  if (gmidLower === "bollywood") {
    return <GenericCardGame game={game} />;
  }

  // Lottery card game
  if (gmidLower === "lottcard") {
    return <LottCardGame game={game} />;
  }

  // 10-player virtual game
  if (gmidLower === "dum10") {
    return <Dum10Game game={game} />;
  }

  // NEW GAMES 31-35
  // Worli variants
  if (gmidLower === "worli2") {
    return <WorliVariant2Game game={game} />;
  }

  if (gmidLower === "worli3") {
    return <GenericCardGame game={game} />;
  }

  // Number lottery
  if (gmidLower === "notenum") {
    return <NotenumGame game={game} />;
  }

  // 6-player Teen Patti
  if (gmidLower === "teen6") {
    return <Teen6Game game={game} />;
  }

  // Super Over cricket
  if (gmidLower === "superover3") {
    return <SuperOver3Game game={game} />;
  }

  // Trap20/AAA - Game 36 (Virtual Greyhound Racing)
  if (gmidLower === "trap20" || gmidLower === "aaa" || gmidLower === "trap") {
    return <GenericCardGame game={game} />;
  }

  // Race2 - Game 37 (Virtual Horse/Motor Racing)
  if (gmidLower === "race2") {
    return <Race2Game game={game} />;
  }

  // AAA2 - Game 38 (Multi-Sport Virtual Props)
  if (gmidLower === "aaa2") {
    return <Aaa2Game game={game} />;
  }

  // Patti2/Trio - Game 39 (2-Card Teen Patti)
  if (gmidLower === "patti2" || gmidLower === "trio") {
    return <Patti2Game game={game} />;
  }

  // Btable2/Baccarat29 - Game 40 (Premium Baccarat)
  if (gmidLower === "btable2" || gmidLower === "baccarat29") {
    return <Btable2Game game={game} />;
  }

  // TheTrap - Game 41 (Gamified Trap Racing)
  if (gmidLower === "thetrap") {
    return <GenericCardGame game={game} />;
  }

  // Poison - Game 42 (Dark Teen Patti Variant)
  if (gmidLower === "poison") {
    return <PoisonGame game={game} />;
  }

  // Poison20 - Game 43 (High-Speed Poison Teen Patti)
  if (gmidLower === "poison20") {
    return <Poison20Game game={game} />;
  }

  // Joker120/Joker1/Joker20 - Game 44 (Unlimited Joker Teen Patti)
  if (
    gmidLower === "joker120" ||
    gmidLower === "joker1" ||
    gmidLower === "joker20"
  ) {
    return <Joker120Game game={game} />;
  }

  // Dolidana - Game 45 (Festival-themed Color Prediction)
  if (gmidLower === "dolidana") {
    return <DolidanaGame game={game} />;
  }

  // Game 46: Cricket Match Meter - cmatch20
  if (gmidLower === "cmatch20") {
    return <GenericCardGame game={game} />;
  }

  // Game 47: Teen Patti 20B - teen20b
  if (gmidLower === "teen20b") {
    return <Teen20BGame game={game} />;
  }

  // Game 48: Teen Patti 20C - teen20c
  if (gmidLower === "teen20c") {
    return <Teen20CGame game={game} />;
  }

  // Game 49: Cricket V3 - cricketv3
  if (gmidLower === "cricketv3") {
    return <CricketV3Game game={game} />;
  }

  // Game 50: Golden Roulette - goldenroulette (or goldrroulette, goldroulette)
  if (
    gmidLower === "goldenroulette" ||
    gmidLower === "goldrroulette" ||
    gmidLower === "goldroulette"
  ) {
    return <GoldenRouletteGame game={game} />;
  }

  // Game 51: Teen Patti 1 - teen1 (Beginner-friendly Teen Patti)
  if (gmidLower === "teen1") {
    return <Teen1Game game={game} />;
  }

  // Game 52: Teen Patti 3 - teen3 (Enhanced Teen Patti with analytics)
  if (gmidLower === "teen3") {
    return <Teen3Game game={game} />;
  }

  // Game 53: Teen Patti 9 - teen9 (9-player maximum capacity)
  if (gmidLower === "teen9") {
    return <Teen9Game game={game} />;
  }

  // Game 54: Teen Patti 8 - teen8 (8-player fast aggressive)
  if (gmidLower === "teen8") {
    return <Teen8Game game={game} />;
  }

  // Game 55: Beach Lucky 7 - lucky7g, lucky7-g (Beach-themed Lucky 7)
  if (gmidLower === "lucky7g" || gmidLower === "lucky7-g") {
    return <GenericCardGame game={game} />;
  }

  // Game: Beach Roulette - beachroulette (seaside themed roulette)
  if (gmidLower === "beachroulette") {
    return <BeachRouletteGame game={game} />;
  }

  // Game 56: Teen Patti 32 - teen32 (High-stakes with VIP tracking)
  if (gmidLower === "teen32") {
    return <Teen32Game game={game} />;
  }

  // Game 57: Teen Patti 33 - teen33 (Tournament fast-action)
  if (gmidLower === "teen33") {
    return <Teen33Game game={game} />;
  }

  // Game 58: Teen Patti 41 - teen41 (Premium side-bets)
  if (gmidLower === "teen41") {
    return <Teen41Game game={game} />;
  }

  // Game 59: Teen Patti 42 - teen42 (Social casual gaming)
  if (gmidLower === "teen42") {
    return <Teen42Game game={game} />;
  }

  // Game 60: Teen Patti 120 - teen120 (Ultra-fast unlimited)
  if (gmidLower === "teen120") {
    return <Teen120Game game={game} />;
  }

  // Game 61: Dragon Tiger Low - dtl20 (Low card focus)
  if (gmidLower === "dtl20") {
    return <DTL20Game game={game} />;
  }

  // Game 62: Dragon Tiger 202 - dt202 (Premium multi-tier)
  if (gmidLower === "dt202") {
    return <DT202Game game={game} />;
  }

  // Game 63: Unique Roulette - uniqueroulette (Progressive jackpot)
  if (gmidLower === "uniqueroulette") {
    return <GenericCardGame game={game} />;
  }

  // Game 64: Poker 6 - poker6 (6-max Texas Hold'em)
  if (gmidLower === "poker6") {
    return <Poker6Game game={game} />;
  }

  // Game 65: Andar Bahar Joker - abj (Joker multiplier variant)
  if (gmidLower === "abj") {
    return <GenericCardGame game={game} />;
  }

  // Game 66: Goal - goal (Virtual football betting)
  if (gmidLower === "goal") {
    return <GoalGame game={game} />;
  }

  // Game 67: Cricket Line - cricketline (Cricket ladder betting)
  if (gmidLower === "cricketline") {
    return <GenericCardGame game={game} />;
  }

  // Game 68: Race 17 - race17 (17-second horse racing)
  if (gmidLower === "race17") {
    return <Race17Game game={game} />;
  }

  // Game 69: Lucky 7 European 2 - lucky7eu2 (Premium European Lucky 7)
  if (gmidLower === "lucky7eu2") {
    return <Lucky7EU2Game game={game} />;
  }

  // Game 70: DTL20 Pro - dtl20pro, dtlavanced (Advanced Dragon Tiger Low)
  if (gmidLower === "dtl20pro" || gmidLower === "dtlavanced") {
    return <GenericCardGame game={game} />;
  }

  // Game 71: Mogambo - mogambo (Villain-themed Teen Patti)
  if (gmidLower === "mogambo") {
    return <MogamboGame game={game} />;
  }

  // Game 72: Baccarat 2 - baccarat2 (Enhanced Baccarat)
  if (gmidLower === "baccarat2") {
    return <Baccarat2Game game={game} />;
  }

  // Game 73: Dolidana 2 - dolidana2 (Festival variant)
  if (gmidLower === "dolidana2") {
    return <GenericCardGame game={game} />;
  }

  // Game 74: Lottery Card 2 - lottcard2 (Multi-tier lottery)
  if (gmidLower === "lottcard2") {
    return <GenericCardGame game={game} />;
  }

  // Game 75: Superover 2 - superover2 (Extended Super Over)
  if (gmidLower === "superover2") {
    return <Superover2Game game={game} />;
  }

  // Game 76: Teen Patti 1 Day - teenpatti1day / vippatti1day (VIP High Roller Event)
  if (gmidLower === "teenpatti1day" || gmidLower === "vippatti1day") {
    return <TeenPatti1DayGame game={game} />;
  }

  // Game 77: Matka Market - matkamarket (Open/Close market betting)
  if (gmidLower === "matkamarket" || gmidLower === "matka-market") {
    return <GenericCardGame game={game} />;
  }

  // Game 78: Teenmuf 2 - teenmuf2 / muflismax (Reverse-ranking Teen Patti)
  if (gmidLower === "teenmuf2" || gmidLower === "muflismax") {
    return <Teenmuf2Game game={game} />;
  }

  // Game 79: Race Advanced - race-pro / raceadvanced (Professional horse racing)
  if (gmidLower === "race-pro" || gmidLower === "raceadvanced") {
    return <GenericCardGame game={game} />;
  }

  // Game 80: Cricket Line 2 - cricketline2 / cricketladder (Advanced cricket prediction ladder)
  if (gmidLower === "cricketline2" || gmidLower === "cricketladder") {
    return <GenericCardGame game={game} />;
  }

  // Game 81: Football Live - footballlive / soccerpro (Live soccer betting)
  if (gmidLower === "footballlive" || gmidLower === "soccerpro") {
    return <GenericCardGame game={game} />;
  }

  // Matka/Worli
  if (gmidLower.includes("worli") || gmidLower.includes("matka")) {
    return <GenericCardGame game={game} />;
  }

  // Mines
  if (gmidLower === "mines") {
    return <MinesGame game={game} />;
  }

  // Dolidana (original)
  if (gmidLower === "dolidana") {
    return <DolidanaGame game={game} />;
  }

  // Cricket Match Meter
  if (
    gmidLower.startsWith("c") &&
    (gmidLower.includes("meter") || gmidLower.includes("match"))
  ) {
    return <GenericCardGame game={game} />;
  }

  // Plinko
  if (gmidLower === "balls") {
    return <PlinkoGame game={game} />;
  }

  // Poker
  if (gmidLower.includes("poker")) {
    return <PokerGame game={game} />;
  }

  // Baccarat Variant (btable)
  if (gmidLower === "btable") {
    return <BaccaratVariantGame game={game} />;
  }

  // Roulette
  if (gmidLower.includes("roulette")) {
    return <RouletteGame game={game} />;
  }

  // Slot/Race games
  if (gmidLower.includes("superover")) {
    return <SlotGame game={game} />;
  }

  // Race Game (race20)
  if (gmidLower === "race20" || gmidLower.includes("race")) {
    return <RaceGame game={game} />;
  }

  // Lucky 7 European (lucky7eu)
  if (gmidLower === "lucky7eu") {
    return <Lucky7EuropeanGame game={game} />;
  }

  // Joker Game (joker20)
  if (gmidLower === "joker20") {
    return <JokerGame game={game} />;
  }

  // KBC Game (kbc)
  if (gmidLower === "kbc") {
    return <KbcGame game={game} />;
  }

  // Default fallback
  return <GenericCardGame game={game} />;
}

export default IndividualCasinoGame;
