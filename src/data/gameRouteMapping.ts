/**
 * Game Route Mapping
 * Maps API gmid values to internal game types and components
 */

export const GAME_ROUTE_MAPPING: Record<
  string,
  { gameType: string; displayName: string }
> = {
  // Teen Patti Games
  teen20: { gameType: "teen20", displayName: "20-20 Teen Patti" },
  teen20v1: { gameType: "teen20", displayName: "20-20 Teen Patti VIP1" },
  teen62: { gameType: "teen20", displayName: "V VIP Teenpatti 1-day" },
  poison: { gameType: "teen20", displayName: "Teenpatti Poison One Day" },
  poison20: { gameType: "teen20", displayName: "Teenpatti Poison 20-20" },
  teenunique: { gameType: "teen20", displayName: "Unique Teenpatti" },
  joker20: { gameType: "joker20", displayName: "Unlimited Joker 20-20" },
  jokeroneday: { gameType: "joker20", displayName: "Unlimited Joker One Day" },

  // Poker Games
  poker20: { gameType: "poker20", displayName: "Poker 20-20" },
  poker: { gameType: "poker20", displayName: "Poker" },

  // Baccarat Games
  baccarat: { gameType: "baccarat", displayName: "Baccarat" },
  btable: { gameType: "baccarat", displayName: "Baccarat Table" },
  baccarat2: { gameType: "baccarat", displayName: "Baccarat 2" },

  // Dragon Tiger Games
  dt20: { gameType: "dt20", displayName: "Dragon Tiger 20-20" },
  dt6: { gameType: "dt6", displayName: "Dragon Tiger 6" },
  dt202: { gameType: "dt20", displayName: "Dragon Tiger 2020 2" },

  // Andar Bahar Games
  ab20: { gameType: "ab20", displayName: "Andar Bahar 20-20" },
  abj: { gameType: "abj", displayName: "Andar Bahar J" },
  ab2: { gameType: "ab20", displayName: "Andar Bahar 2" },

  // 32 Cards Games
  card32: { gameType: "card32", displayName: "32 Cards J" },
  card32eu: { gameType: "card32eu", displayName: "32 Cards EU" },
  card32b: { gameType: "card32", displayName: "32 Cards B" },
  card32c: { gameType: "card32", displayName: "32 Cards C" },

  // Lucky 7 Games
  lucky7: { gameType: "lucky7", displayName: "Lucky 7" },
  lucky7eu: { gameType: "lucky7eu", displayName: "Lucky 7 EU" },
  lucky5: { gameType: "lucky7", displayName: "Lucky 6" },
  lucky7b: { gameType: "lucky7", displayName: "Lucky 7 B" },

  // 3 Card Games
  "3cardj": { gameType: "3cardj", displayName: "3 Card Judgement" },
  "3cardb": { gameType: "3cardj", displayName: "3 Card B" },

  // Casino War
  war: { gameType: "war", displayName: "Casino War" },

  // Matka/Worli Games
  worli: { gameType: "worli", displayName: "Worli" },
  worli3: { gameType: "worli", displayName: "Matka" },
  worli2: { gameType: "worli", displayName: "Worli 2" },

  // Roulette Games
  ourroullete: { gameType: "ourroullete", displayName: "Our Roulette" },
  roulette11: { gameType: "ourroullete", displayName: "Golden Roulette" },
  roulette12: { gameType: "ourroullete", displayName: "Beach Roulette" },
  roulette13: { gameType: "ourroullete", displayName: "Roulette" },
  rouletteu: { gameType: "ourroullete", displayName: "Unique Roulette" },
  miniroulette: { gameType: "ourroullete", displayName: "Mini Roulette" },

  // Other Games
  ballbyball: { gameType: "ballbyball", displayName: "Ball By Ball" },
  race20: { gameType: "race20", displayName: "Race 20" },
  kbc: { gameType: "kbc", displayName: "KBC" },
  sicbo: { gameType: "sicbo", displayName: "Sicbo" },
  sicbo2: { gameType: "sicbo2", displayName: "Sicbo 2" },

  // Special Games
  dolidana: { gameType: "teen20", displayName: "Dolidana" },
  mogambo: { gameType: "teen20", displayName: "Mogambo" },
  bollywood: { gameType: "teen20", displayName: "Bollywood" },
  bollywood2: { gameType: "teen20", displayName: "Bollywood 2" },
  goalsuperover: { gameType: "ballbyball", displayName: "Goal Super Over" },
  instantworli: { gameType: "worli", displayName: "Instant Worli" },
};

/**
 * Get game type for a given gmid
 */
export function getGameType(gmid: string): string {
  const mapping = GAME_ROUTE_MAPPING[gmid.toLowerCase()];
  return mapping?.gameType || gmid; // Fallback to gmid itself
}

/**
 * Get display name for a given gmid
 */
export function getGameDisplayName(gmid: string): string {
  const mapping = GAME_ROUTE_MAPPING[gmid.toLowerCase()];
  return mapping?.displayName || gmid;
}

/**
 * Check if a game has a custom page/component
 */
export function hasCustomPage(gmid: string): boolean {
  const specificPages = [
    "teen20",
    "teen1",
    "teen120",
    "teen20b",
    "teen20c",
    "teen32",
    "teen33",
    "teen3",
    "teen6",
    "teen8",
    "teen9",
    "teen41",
    "teen42",
    "teen62",
    "teen20v1",
    "teenpatti",
    "teenmuf2",
    "teenunique",
    "patti2",
    "poison",
    "poison20",
    "poker20",
    "poker",
    "poker6",
    "baccarat",
    "baccarat2",
    "btable",
    "btable2",
    "baccaratgame",
    "baccaratvariant",
    "dt20",
    "dt202",
    "dtl20",
    "dtl20pro",
    "dragontiger",
    "dragontigervariant",
    "dt6",
    "ab20",
    "andarbahar",
    "andarbaharvariant",
    "abj",
    "abjgame",
    "card32",
    "card32eu",
    "card32b",
    "card32c",
    "card32variant",
    "lucky7",
    "lucky7eu",
    "lucky7eu2",
    "lucky7european",
    "lucky7g",
    "lucky5",
    "lucky7b",
    "lucky7game",
    "3cardj",
    "3cardb",
    "aaa2",
    "war",
    "casinowar",
    "worli",
    "worli2",
    "worli3",
    "worlivariant3",
    "instantworli",
    "matka",
    "ourroullete",
    "roulette11",
    "roulette12",
    "roulette13",
    "rouletteu",
    "miniroulette",
    "roulette",
    "joker20",
    "joker1",
    "joker",
    "jokeroneday",
    "race20",
    "race17",
    "race2",
    "raceadvanced",
    "race",
    "sicbo",
    "sicbo2",
    "sicbovariant",
    "sicbogame",
    "ballbyball",
    "ballbyballgame",
    "kbc",
    "kbcgame",
    "dolidana",
    "dolidana2",
    "mogambo",
    "bollywood",
    "bollywood2",
    "goalsuperover",
    "goal",
    "superover2",
    "superover3",
    "cricketline",
    "cricketline2",
    "cricketmeter",
    "cricketmeter1",
    "cricketmatchmeter",
    "cricketv3",
    "fantasycricket",
    "footballlive",
    "notenum",
    "dum10",
    "trap20",
    "trapracing",
    "thetrap",
    "lottcard",
    "lottcard2",
  ];

  const gameType = getGameType(gmid);
  return specificPages.includes(gameType);
}
