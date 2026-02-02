/**
 * Complete Game File Mapping
 * Maps API gmid values to actual game component files in game-types folder
 */

export const GAME_FILE_MAPPING: Record<string, string> = {
  // Teen Patti Games
  teen20: "TeenPatti20",
  teen20v1: "TeenPatti20",
  teen20b: "Teen20BGame",
  teen20c: "Teen20CGame",
  teen1: "Teen1Game",
  teen120: "Teen120Game",
  teen32: "Teen32Game",
  teen33: "Teen33Game",
  teen3: "Teen3Game",
  teen6: "Teen6Game",
  teen8: "Teen8Game",
  teen9: "Teen9Game",
  teen41: "Teen41Game",
  teen42: "Teen42Game",
  teen62: "TeenPatti1DayGame",
  teenpatti: "TeenpattiGame",
  teenunique: "QueenTeenPattiGame",
  teenmuf2: "Teenmuf2Game",
  patti2: "Patti2Game",

  // Poison Teen Patti
  poison: "PoisonGame",
  poison20: "Poison20Game",

  // Poker Games
  poker20: "Poker20",
  poker: "PokerGame",
  poker6: "Poker6Game",

  // Baccarat Games
  baccarat: "Baccarat",
  btable: "BaccaratTable",
  baccarat2: "Baccarat2Game",
  btable2: "Btable2Game",
  baccaratvariant: "BaccaratVariantGame",

  // Dragon Tiger Games
  dt20: "DragonTiger20",
  dt6: "DragonTiger6",
  dt202: "DT202Game",
  dtl20: "DTL20Game",
  dtl20pro: "DTL20ProGame",
  dragontiger: "DragonTigerGame",
  dragontigervariant: "DragonTigerVariantGame",

  // Andar Bahar Games
  ab20: "AndarBahar20",
  abj: "AndarBaharJ",
  andarbahar: "AndarBaharGame",
  andarbaharvariant: "AndarBaharVariantGame",
  abjgame: "AbjGame",

  // 32 Cards Games
  card32: "Card32J",
  card32eu: "Card32EU",
  card32b: "Card32VariantGame",
  card32c: "Card32VariantGame",

  // Lucky 7 Games
  lucky7: "Lucky7",
  lucky7eu: "Lucky7EU",
  lucky7eu2: "Lucky7EU2Game",
  lucky7european: "Lucky7EuropeanGame",
  lucky7g: "Lucky7GGame",
  lucky5: "Lucky7Game",
  lucky7b: "Lucky7Game",

  // 3 Card Games
  "3cardj": "ThreeCardJ",
  "3cardb": "ThreeCardJudgementGame",
  aaa2: "Aaa2Game",

  // Casino War
  war: "CasinoWar",
  casinowar: "CasinoWarGame",

  // Matka/Worli Games
  worli: "Worli",
  worli3: "Worli3",
  worli2: "WorliVariant2Game",
  worlivariant3: "WorliVariant3Game",
  instantworli: "MatkaGame",
  matka: "MatkaMarketGame",

  // Roulette Games
  ourroullete: "OurRoulette",
  roulette11: "GoldenRouletteGame",
  roulette12: "BeachRouletteGame",
  roulette13: "RouletteGame",
  rouletteu: "UniqueRouletteGame",
  miniroulette: "RouletteGame",

  // Joker Games
  joker20: "Joker20",
  joker1: "Joker120Game",
  joker: "JokerGame",
  jokeroneday: "JokerGame",

  // Race Games
  race20: "Race20",
  race17: "Race17Game",
  race2: "Race2Game",
  raceadvanced: "RaceAdvancedGame",
  race: "RaceGame",

  // Sicbo Games
  sicbo: "Sicbo",
  sicbo2: "Sicbo2",
  sicbovariant: "SicBoVariantGame",

  // Ball By Ball
  ballbyball: "BallByBall",
  ballbyballgame: "BallByBallGame",

  // KBC
  kbc: "KBC",
  kbcgame: "KbcGame",

  // Special Games
  dolidana: "DolidanaGame",
  dolidana2: "Dolidana2Game",
  mogambo: "MogamboGame",
  bollywood: "BollywoodGameSuite",
  bollywood2: "BollywoodGameSuite",

  // Cricket Games
  goalsuperover: "GoalGame",
  superover2: "Superover2Game",
  superover3: "SuperOver3Game",
  cricketline: "CricketLineGame",
  cricketline2: "CricketLine2Game",
  cricketmeter: "CricketMeterGame",
  cricketmeter1: "CricketMeter1Game",
  cricketmatchmeter: "CricketMatchMeterGame",
  cricketv3: "CricketV3Game",
  fantasycricket: "FantasyCricketGame",

  // Football
  footballlive: "FootballLiveGame",
  goal: "GoalGame",

  // Other Games
  notenum: "NotenumGame",
  dum10: "Dum10Game",
  trap20: "Trap20Game",
  trapracing: "TrapRacingGame",
  thetrap: "TheTrapGame",
  lottcard: "LottCardGame",
  lottcard2: "LottCard2Game",
};

/**
 * Get component name for a given gmid
 */
export function getGameComponent(gmid: string): string | null {
  return GAME_FILE_MAPPING[gmid.toLowerCase()] || null;
}

/**
 * Check if a game file exists for given gmid
 */
export function hasGameFile(gmid: string): boolean {
  return gmid.toLowerCase() in GAME_FILE_MAPPING;
}
