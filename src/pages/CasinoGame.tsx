import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames } from "@/services/casino";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import type { CasinoGame } from "@/types/casino";

// Import game type components
import { MogamboGame } from "./game-types/MogamboGame";
import { TeenpattiGame } from "./game-types/TeenpattiGame";
import { DragonTigerGame } from "./game-types/DragonTigerGame";
import { AndarBaharGame } from "./game-types/AndarBaharGame";
import { RouletteGame } from "./game-types/RouletteGame";
import { PokerGame } from "./game-types/PokerGame";
import { BaccaratGame } from "./game-types/BaccaratGame";
import { MatkaGame } from "./game-types/MatkaGame";
import { Card32Game } from "./game-types/Card32Game";
import { Lucky7Game } from "./game-types/Lucky7Game";
import { CricketGame } from "./game-types/CricketGame";
import { GenericCardGame } from "./game-types/GenericCardGame";
import { CrashGame } from "./game-types/CrashGame";
import { PlinkoGame } from "./game-types/PlinkoGame";
import { MinesGame } from "./game-types/MinesGame";
import { SlotGame } from "./game-types/SlotGame";
import { KenoGame } from "./game-types/KenoGame";

// Determine game type from game name and ID
function getGameType(game: CasinoGame): string {
  const name = game.gname.toLowerCase();
  const gmid = game.gmid.toLowerCase();

  console.log(
    `[Game Type Detection] Game: "${game.gname}", gmid: "${game.gmid}"`,
  );

  // Crash games (Airplane, Cricket, Football, Tower, Helicopter, etc.)
  if (
    name.includes("crash") ||
    name.includes("aviator") ||
    name.includes("jbex") ||
    name.includes("cricket x") ||
    name.includes("football x") ||
    name.includes("tower x") ||
    name.includes("helicopter") ||
    name.includes("smash") ||
    name.includes("aviastar") ||
    name.includes("aviabet") ||
    name.includes("fury flight") ||
    name.includes("dedy") ||
    name.includes("orizon") ||
    name.includes("mayan fly") ||
    name.includes("skydot") ||
    name.includes("avionix") ||
    name.includes("capparossa")
  ) {
    console.log(`  -> Detected as: crash`);
    return "crash";
  }

  // Plinko games
  if (name.includes("plinko") || name.includes("balloon")) {
    return "plinko";
  }

  // Mining games (Mines)
  if (name.includes("mines") || name.includes("mine")) {
    return "mines";
  }

  // Slot games
  if (
    name.includes("slot") ||
    name.includes("hollx") ||
    name.includes("foxy") ||
    name.includes("bonanza") ||
    name.includes("futurian") ||
    name.includes("wilds") ||
    (name.includes("aviastar") && name.includes("slot"))
  ) {
    return "slot";
  }

  // Keno/Lottery games
  if (name.includes("keno")) {
    return "keno";
  }

  // Mogambo type games
  if (name.includes("mogambo") || gmid.includes("mogambo")) {
    return "mogambo";
  }

  // Teenpatti variants (including Joker games)
  if (
    name.includes("teenpatti") ||
    name.includes("teen patti") ||
    gmid.includes("teen") ||
    name.includes("3 card") ||
    name.includes("joker") ||
    name.includes("poison") ||
    (name.includes("20-20") &&
      !name.includes("dragon") &&
      !name.includes("poker") &&
      !name.includes("dtl"))
  ) {
    console.log(`  -> Detected as: teenpatti`);
    return "teenpatti";
  }

  // Dragon Tiger
  if (
    (name.includes("dragon") && name.includes("tiger")) ||
    gmid.includes("dt") ||
    name.includes("d t l") ||
    name.includes("dtl")
  ) {
    return "dragon-tiger";
  }

  // Andar Bahar
  if (
    (name.includes("andar") && name.includes("bahar")) ||
    name.includes("andar bahar") ||
    gmid.includes("ab")
  ) {
    return "andar-bahar";
  }

  // Roulette
  if (name.includes("roulette")) {
    return "roulette";
  }

  // Poker
  if (name.includes("poker")) {
    return "poker";
  }

  // Baccarat
  if (name.includes("baccarat")) {
    return "baccarat";
  }

  // Matka/Worli
  if (name.includes("matka") || name.includes("worli")) {
    return "matka";
  }

  // 32 Cards
  if (name.includes("32 card")) {
    return "card32";
  }

  // Lucky 7 and Lucky games
  if (
    name.includes("lucky 7") ||
    name.includes("lucky7") ||
    name.includes("lucky 15") ||
    name.includes("lucky 6")
  ) {
    return "lucky7";
  }

  // Cricket/Sports themed (Super Over, Ball by Ball, Goal, Mini Superover)
  if (
    name.includes("cricket") ||
    name.includes("super over") ||
    name.includes("ball by ball") ||
    name.includes("superover") ||
    name.includes("goal") ||
    name.includes("mini superover") ||
    gmid.includes("cricket")
  ) {
    return "cricket";
  }

  // Default generic card game
  console.log(`  -> Detected as: generic (fallback)`);
  return "generic";
}

export default function CasinoGame() {
  const { gmid } = useParams<{ gmid: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
  });

  const game: CasinoGame | undefined = (data ?? []).find(
    (g) => g.gmid === gmid,
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !game) {
    return (
      <MainLayout>
        <Card className="p-8">
          <p className="text-center text-destructive">
            Failed to load game or game not found.
          </p>
        </Card>
      </MainLayout>
    );
  }

  // Determine game type and render appropriate component
  const gameType = getGameType(game);

  // Render the appropriate game component
  switch (gameType) {
    case "crash":
      return <CrashGame game={game} />;
    case "plinko":
      return <PlinkoGame game={game} />;
    case "mines":
      return <MinesGame game={game} />;
    case "slot":
      return <SlotGame game={game} />;
    case "keno":
      return <KenoGame game={game} />;
    case "mogambo":
      return <MogamboGame game={game} />;
    case "teenpatti":
      return <TeenpattiGame game={game} />;
    case "dragon-tiger":
      return <DragonTigerGame game={game} />;
    case "andar-bahar":
      return <AndarBaharGame game={game} />;
    case "roulette":
      return <RouletteGame game={game} />;
    case "poker":
      return <PokerGame game={game} />;
    case "baccarat":
      return <BaccaratGame game={game} />;
    case "matka":
      return <MatkaGame game={game} />;
    case "card32":
      return <Card32Game game={game} />;
    case "lucky7":
      return <Lucky7Game game={game} />;
    case "cricket":
      return <CricketGame game={game} />;
    default:
      return <GenericCardGame game={game} />;
  }
}
