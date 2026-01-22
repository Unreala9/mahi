export const CASINO_CATEGORIES = [
  { id: "all", name: "All Casino" },
  { id: "roulette", name: "Roulette" },
  { id: "teenpatti", name: "Teenpatti" },
  { id: "poker", name: "Poker" },
  { id: "baccarat", name: "Baccarat" },
  { id: "dragon-tiger", name: "Dragon Tiger" },
  { id: "32-cards", name: "32 Cards" },
  { id: "andar-bahar", name: "Andar Bahar" },
  { id: "lucky-7", name: "Lucky 7" },
  { id: "3-card", name: "3 Card Judgement" },
  { id: "casino-war", name: "Casino War" },
  { id: "matka", name: "Matka" },
  { id: "cricket", name: "Cricket" },
  { id: "others", name: "Others" },
] as const;

export type CasinoCategoryId = (typeof CASINO_CATEGORIES)[number]["id"];
