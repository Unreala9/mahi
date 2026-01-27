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
import { DragonTigerGame } from "./DragonTigerGame";
import { TeenpattiGame } from "./TeenpattiGame";
import { AndarBaharGame } from "./AndarBaharGame";
import { BaccaratGame } from "./BaccaratGame";
import { Lucky7Game } from "./Lucky7Game";
import { PokerGame } from "./PokerGame";
import { RouletteGame } from "./RouletteGame";
import { MatkaGame } from "./MatkaGame";
import { MogamboGame } from "./MogamboGame";
import { GenericCardGame } from "./GenericCardGame";

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
    return <DragonTigerGame game={game} />;
  }

  // Teen Patti games
  if (gmidLower.startsWith("teen")) {
    return <TeenpattiGame game={game} />;
  }

  // Andar Bahar
  if (gmidLower.startsWith("ab")) {
    return <AndarBaharGame game={game} />;
  }

  // Baccarat
  if (gmidLower.includes("baccarat")) {
    return <BaccaratGame game={game} />;
  }

  // Lucky 7
  if (gmidLower.includes("lucky7")) {
    return <Lucky7Game game={game} />;
  }

  // 32 Cards
  if (gmidLower.includes("card32")) {
    return <Card32Game game={game} />;
  }

  // Crash games
  if (gmidLower === "aaa" || gmidLower === "bollywood") {
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

  // Cricket
  if (gmidLower.includes("cricket")) {
    return <CricketGame game={game} />;
  }

  // Keno
  if (gmidLower.includes("keno")) {
    return <KenoGame game={game} />;
  }

  // Matka/Worli
  if (gmidLower.includes("worli")) {
    return <MatkaGame game={game} />;
  }

  // Mines
  if (gmidLower === "trap" || gmidLower === "mines") {
    return <MinesGame game={game} />;
  }

  // Mogambo/Dolidana/Cards Meter
  if (gmidLower === "mogambo" || gmidLower === "dolidana") {
    return <MogamboGame game={game} />;
  }

  if (
    gmidLower.startsWith("c") &&
    (gmidLower.includes("meter") || gmidLower.includes("match"))
  ) {
    return <MogamboGame game={game} />;
  }

  // Plinko
  if (gmidLower === "balls") {
    return <PlinkoGame game={game} />;
  }

  // Poker
  if (gmidLower.includes("poker")) {
    return <PokerGame game={game} />;
  }

  // Roulette
  if (gmidLower.includes("roulette") || gmidLower === "btable") {
    return <RouletteGame game={game} />;
  }

  // Slot/Race games
  if (gmidLower.includes("race") || gmidLower.includes("superover")) {
    return <SlotGame game={game} />;
  }

  // Default fallback
  return <GenericCardGame game={game} />;
}

export default IndividualCasinoGame;
