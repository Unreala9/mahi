/**
 * Casino Game Router
 * Routes casino games to appropriate category page based on gmid
 */

import { useParams } from "react-router-dom";
import TeenPattiGames from "./game-categories/TeenPattiGames";
import DragonTigerGames from "./game-categories/DragonTigerGames";
import AndarBaharGames from "./game-categories/AndarBaharGames";
import OtherCasinoGames from "./game-categories/OtherCasinoGames";

// Game category mappings
const TEENPATTI_GAMES = [
  "teen",
  "teen3",
  "teen6",
  "teen8",
  "teen9",
  "teen20",
  "teen20b",
  "teen20c",
  "teen20v1",
  "teen32",
  "teen33",
  "teen41",
  "teen42",
  "teen62",
  "teen120",
  "teen1",
  "poison",
  "poison20",
  "joker",
  "joker1",
  "joker20",
  "joker120",
  "patti2",
  "teenunique",
  "teenmuf",
  "teensin",
];

const DRAGON_TIGER_GAMES = ["dt20", "dt6", "dt202", "dtl20"];

const ANDAR_BAHAR_GAMES = ["ab20", "abj", "ab3", "ab4"];

// Everything else goes to OtherCasinoGames
// Including: poker, baccarat, card32, lucky7, aaa (roulette), worli, sicbo, etc.

export default function CasinoGameRouter() {
  const { gmid } = useParams<{ gmid: string }>();

  if (!gmid) {
    return <OtherCasinoGames />;
  }

  const normalizedGmid = gmid.toLowerCase();

  // Route to appropriate category page
  if (TEENPATTI_GAMES.includes(normalizedGmid)) {
    return <TeenPattiGames />;
  }

  if (DRAGON_TIGER_GAMES.includes(normalizedGmid)) {
    return <DragonTigerGames />;
  }

  if (ANDAR_BAHAR_GAMES.includes(normalizedGmid)) {
    return <AndarBaharGames />;
  }

  // Default to OtherCasinoGames for everything else
  return <OtherCasinoGames />;
}
