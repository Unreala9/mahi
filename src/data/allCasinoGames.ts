/**
 * Complete Casino Games Catalog
 * All 81+ games with metadata for Diamond API integration
 */

export interface CompleteCasinoGame {
  id: number;
  slug: string;
  name: string;
  apiType: string; // Maps to Diamond API game type
  category:
    | "teen-patti"
    | "dragon-tiger"
    | "poker"
    | "baccarat"
    | "roulette"
    | "andar-bahar"
    | "32-cards"
    | "lucky-7"
    | "casino-war"
    | "3-card"
    | "number-games"
    | "cricket"
    | "racing"
    | "football"
    | "dice"
    | "other";
  description: string;
  features: string[];
  minBet?: number;
  maxBet?: number;
  isLive?: boolean;
  isPremium?: boolean;
  isVIP?: boolean;
}

export const ALL_CASINO_GAMES: CompleteCasinoGame[] = [
  // Teen Patti Games (1-26)
  {
    id: 1,
    slug: "teen20",
    name: "Teen Patti 20",
    apiType: "teen20",
    category: "teen-patti",
    description:
      "High-speed real-money Teen Patti table with 5-6 players, oval table layout with avatars, chip stacks, and fast 10-15 second countdown timer per decision",
    features: [
      "Top-view oval table",
      "5-6 player seats",
      "Avatar & chip display",
      "Decision buttons: pack/chaal/side-show/show",
      "Bet slider for quick chaal",
      "Dark felt with gold & neon green",
      "10-15s countdown timer",
      "Hand-ranking panel",
      "Hand-history strip",
      "Mobile-optimized large tappable buttons"
    ],
    isLive: true,
  },
  {
    id: 2,
    slug: "teen1",
    name: "Teen Patti 1",
    apiType: "teen1",
    category: "teen-patti",
    description:
      "Foundational Teen Patti for beginners with standard casual play",
    features: [
      "Beginner-friendly",
      "3-5 players",
      "Tutorial tooltips",
      "Simple UI",
    ],
  },
  {
    id: 3,
    slug: "teen3",
    name: "Teen Patti 3",
    apiType: "teen3",
    category: "teen-patti",
    description:
      "Enhanced Teen Patti with player statistics and win rate analytics",
    features: [
      "Statistics panel",
      "Win rate tracking",
      "Odds calculator",
      "Analytics",
    ],
  },
  {
    id: 4,
    slug: "teen6",
    name: "Teen Patti 6",
    apiType: "teen6",
    category: "teen-patti",
    description: "6-player premium rapid-paced game with specialized rules",
    features: ["6 players", "Rapid pace", "Premium feel", "Live tracker"],
  },
  {
    id: 5,
    slug: "teen8",
    name: "Teen Patti 8",
    apiType: "teen8",
    category: "teen-patti",
    description: "8-player cash game with fast, aggressive play",
    features: ["8 players", "Fast action", "Chip leaders board", "High stakes"],
  },
  {
    id: 6,
    slug: "teen9",
    name: "Teen Patti 9",
    apiType: "teen9",
    category: "teen-patti",
    description: "Maximum 9-player tables with compact visual design",
    features: [
      "9 players max",
      "Compact design",
      "Seat status legend",
      "Action history",
    ],
  },
  {
    id: 7,
    slug: "teen32",
    name: "Teen Patti 32",
    apiType: "teen32",
    category: "teen-patti",
    description:
      "High-stakes, large buy-in tables with enhanced dealer controls",
    features: [
      "High stakes",
      "VIP tracking",
      "Rake display",
      "Professional UI",
    ],
    isVIP: true,
  },
  {
    id: 8,
    slug: "teen33",
    name: "Teen Patti 33",
    apiType: "teen33",
    category: "teen-patti",
    description: "Fast-action tournament-format Teen Patti game",
    features: ["Tournament mode", "Blind levels", "Chip leader", "Rapid play"],
  },
  {
    id: 9,
    slug: "teen41",
    name: "Teen Patti 41",
    apiType: "teen41",
    category: "teen-patti",
    description: "Premium side-bet and exotic rules gameplay",
    features: ["Side bets", "Pair Plus", "Multiple bet types", "High payouts"],
    isPremium: true,
  },
  {
    id: 10,
    slug: "teen42",
    name: "Teen Patti 42",
    apiType: "teen42",
    category: "teen-patti",
    description: "Casual, social gaming with player interaction and chat",
    features: [
      "Live chat",
      "Emoji reactions",
      "Social features",
      "Leaderboard",
    ],
  },
  {
    id: 11,
    slug: "teen120",
    name: "Teen Patti 120",
    apiType: "teen120",
    category: "teen-patti",
    description: "Ultra-fast unlimited-stakes game with maximum customization",
    features: [
      "Unlimited stakes",
      "Custom rules",
      "5-8 sec decisions",
      "No limits",
    ],
    isPremium: true,
  },
  {
    id: 12,
    slug: "queen",
    name: "Queen Top Open",
    apiType: "queen",
    category: "teen-patti",
    description: "Premium Queen-themed Teen Patti with royal aesthetics",
    features: [
      "Premium theme",
      "High stakes",
      "Top open variant",
      "Royal design",
    ],
    isPremium: true,
  },
  {
    id: 13,
    slug: "poison",
    name: "Poison Teen Patti",
    apiType: "poison",
    category: "teen-patti",
    description: "Dark, edgy Teen Patti with dangerous/risky theme",
    features: [
      "Risky theme",
      "Poison pot",
      "High multipliers",
      "Dark aesthetic",
    ],
  },
  {
    id: 14,
    slug: "poison20",
    name: "Poison 20",
    apiType: "poison20",
    category: "teen-patti",
    description: "High-speed Poison variant with rapid-fire rounds",
    features: [
      "Ultra-fast",
      "7-10 sec decisions",
      "Multiplier tracker",
      "Aggressive betting",
    ],
  },
  {
    id: 15,
    slug: "mogambo",
    name: "Mogambo",
    apiType: "mogambo",
    category: "teen-patti",
    description: "Villain-themed Teen Patti inspired by Bollywood antagonists",
    features: [
      "Villain theme",
      "Wickedness index",
      "Intimidating design",
      "Hall of Infamy",
    ],
  },
  {
    id: 16,
    slug: "teenpatti1day",
    name: "Teen Patti VIP 1 Day",
    apiType: "teenpatti1day",
    category: "teen-patti",
    description: "Exclusive time-limited high-roller VIP experience",
    features: [
      "VIP exclusive",
      "Time-limited",
      "Bonus multipliers",
      "Daily leaderboard",
    ],
    isVIP: true,
  },
  {
    id: 17,
    slug: "teenmuf",
    name: "Muflis Teen Patti",
    apiType: "teenmuf",
    category: "teen-patti",
    description: "Reverse-ranking Teen Patti where lowest hand wins",
    features: [
      "Reverse rankings",
      "Inverted rules",
      "Unique strategy",
      "Multiplier bonuses",
    ],
  },
  {
    id: 18,
    slug: "teenmuf2",
    name: "Muflis Max",
    apiType: "teenmuf2",
    category: "teen-patti",
    description: "Enhanced Muflis variant with advanced multiplier systems",
    features: [
      "Advanced Muflis",
      "Multiplier tracking",
      "Hand strength meter",
      "Rule tooltips",
    ],
  },
  {
    id: 19,
    slug: "patti2",
    name: "2 Cards Teen Patti",
    apiType: "patti2",
    category: "teen-patti",
    description: "Simplified Teen Patti using only 2 cards",
    features: [
      "2-card variant",
      "Simplified rules",
      "Quick rounds",
      "Beginner-friendly",
    ],
  },
  {
    id: 20,
    slug: "trio",
    name: "Trio",
    apiType: "trio",
    category: "teen-patti",
    description: "3-card simplified Teen Patti variant",
    features: [
      "3-card format",
      "Streamlined play",
      "Fast decisions",
      "Clean UI",
    ],
  },

  // Dragon Tiger Games (21-27)
  {
    id: 21,
    slug: "dt20",
    name: "Dragon Tiger 20",
    apiType: "dt20",
    category: "dragon-tiger",
    description: "Fast-paced Dragon vs Tiger with bold split-screen layout optimized for quick real-money rounds with oversized card reveals",
    features: [
      "Bold split-screen: Dragon left, Tiger right",
      "Large clearly tappable bet zones",
      "Optional Tie & suited side bets",
      "Distinct colors & odds labels",
      "Big countdown timer",
      "Two oversized card reveal areas",
      "Smooth flip animations",
      "Chips bar & quick-actions",
      "Clear bets/repeat/double buttons",
      "Concise bet slip summary",
      "Contrasting colors: red Dragon, blue Tiger",
      "Dark background",
      "Vertical history column (D/T/Tie icons)",
      "Portrait mobile optimized",
    ],
    isLive: true,
  },
  {
    id: 22,
    slug: "dt6",
    name: "Dragon Tiger 6",
    apiType: "dt6",
    category: "dragon-tiger",
    description: "Compact ultra-fast variant optimized for portrait mobile",
    features: [
      "Ultra-fast",
      "Mobile optimized",
      "One-handed betting",
      "Bold design",
    ],
  },
  {
    id: 23,
    slug: "dt1",
    name: "Dragon Tiger 1",
    apiType: "dt1",
    category: "dragon-tiger",
    description: "Standard Dragon Tiger with classic gameplay",
    features: [
      "Classic variant",
      "Standard rules",
      "Clear odds",
      "Simple betting",
    ],
  },
  {
    id: 24,
    slug: "dt202",
    name: "Dragon Tiger 202",
    apiType: "dt202",
    category: "dragon-tiger",
    description: "Premium feature-rich version with advanced betting options",
    features: [
      "Multi-level markets",
      "Smart odds",
      "Roadmap panel",
      "Advanced analytics",
    ],
    isPremium: true,
  },
  {
    id: 25,
    slug: "dtl20",
    name: "Dragon Tiger Low",
    apiType: "dtl20",
    category: "dragon-tiger",
    description: "Low card variant focusing on Ace through 5",
    features: [
      "Low card focus",
      "Special payouts",
      "Low card bonus",
      "Frequency tracker",
    ],
  },
  {
    id: 26,
    slug: "dtlavanced",
    name: "DTL Advanced",
    apiType: "dtlavanced",
    category: "dragon-tiger",
    description: "Advanced DTL with analytics and predictive features",
    features: [
      "Analytics dashboard",
      "AI predictions",
      "Heatmaps",
      "Shoe penetration",
    ],
    isPremium: true,
  },
  {
    id: 27,
    slug: "dtl20pro",
    name: "DTL 20 Pro",
    apiType: "dtl20pro",
    category: "dragon-tiger",
    description: "Professional DTL with advanced analytics dashboard",
    features: [
      "Pro analytics",
      "Confidence engine",
      "Trend analysis",
      "Custom odds",
    ],
    isPremium: true,
  },

  // Poker Games (28-30)
  {
    id: 28,
    slug: "poker20",
    name: "Texas Hold'em Poker 20",
    apiType: "poker20",
    category: "poker",
    description: "Modern Texas Hold'em optimized for cash games",
    features: [
      "Up to 9 players",
      "Community cards",
      "Side pots",
      "Timer rings",
    ],
    isLive: true,
  },
  {
    id: 29,
    slug: "poker6",
    name: "Poker 6",
    apiType: "poker6",
    category: "poker",
    description: "6-player Texas Hold'em for fast compact cash game play",
    features: ["6-max format", "Fast play", "Strategy tips", "Compact design"],
  },
  {
    id: 30,
    slug: "poker",
    name: "Poker Classic",
    apiType: "poker",
    category: "poker",
    description: "Standard poker with classic rules and gameplay",
    features: [
      "Classic rules",
      "Standard betting",
      "Hand rankings",
      "Clean interface",
    ],
  },

  // Baccarat Games (31-36)
  {
    id: 31,
    slug: "baccarat",
    name: "Baccarat",
    apiType: "baccarat",
    category: "baccarat",
    description: "Elegant Baccarat with Player, Banker, Tie betting",
    features: ["Player/Banker/Tie", "Side bets", "Roadmap", "Shoe indicator"],
    isLive: true,
  },
  {
    id: 32,
    slug: "baccarat2",
    name: "Baccarat 2",
    apiType: "baccarat2",
    category: "baccarat",
    description:
      "Enhanced Baccarat with streamlined UX and interactive features",
    features: [
      "Smart odds",
      "Player history",
      "Animated reveals",
      "Professional UI",
    ],
  },
  {
    id: 33,
    slug: "btable",
    name: "Baccarat Table",
    apiType: "btable",
    category: "baccarat",
    description: "Compact Baccarat for multi-tabling on desktop and mobile",
    features: [
      "Multi-table support",
      "Minimal design",
      "Flat UI",
      "Expandable roadmaps",
    ],
  },
  {
    id: 34,
    slug: "btable2",
    name: "Baccarat Table 2",
    apiType: "btable2",
    category: "baccarat",
    description: "Premium high-stakes Baccarat variant with VIP features",
    features: [
      "VIP table",
      "Advanced roadmaps",
      "Lucky Six",
      "Commission calculator",
    ],
    isVIP: true,
  },
  {
    id: 35,
    slug: "baccarat29",
    name: "Baccarat 29",
    apiType: "baccarat29",
    category: "baccarat",
    description: "Premium Baccarat positioned as high-stakes VIP version",
    features: [
      "High stakes",
      "Luxury theme",
      "Full roadmaps",
      "Premium side bets",
    ],
    isVIP: true,
    isPremium: true,
  },

  // Roulette Games (37-40)
  {
    id: 36,
    slug: "ourroullete",
    name: "Our Roulette",
    apiType: "ourroullete",
    category: "roulette",
    description: "Modern European Roulette with split-screen 3D wheel and high-contrast betting table grid showing all inside and outside bets",
    features: [
      "3D-rendered roulette wheel with spin animation",
      "High-contrast betting table grid",
      "Inside bets: Straight/Split/Street/Corner/Line",
      "Outside bets: Red/Black, Odd/Even, 1-18, 19-36, Dozens, Columns",
      "Chip selection bar at bottom",
      "Clear/undo/rebet/double buttons",
      "Large Place Bet/Spin area",
      "History strip: last 20 winning numbers",
      "Hot/cold indicators",
      "Red/Black & Odd/Even percentages",
      "Sleek dark theme with neon accents",
      "Subtle glow around active bet areas",
      "Round countdown bar at top",
      "Bet summary panel: total stake & potential win",
      "Desktop & mobile readable",
    ],
    isLive: true,
  },
  {
    id: 37,
    slug: "uniqueroulette",
    name: "Unique Roulette",
    apiType: "uniqueroulette",
    category: "roulette",
    description:
      "Modified Roulette with special bonus features and progressive jackpots",
    features: [
      "Progressive jackpot",
      "Bonus features",
      "Streak bonuses",
      "Probability heatmap",
    ],
    isPremium: true,
  },
  {
    id: 38,
    slug: "goldenroulette",
    name: "Golden Roulette",
    apiType: "goldenroulette",
    category: "roulette",
    description: "Premium luxury Roulette with elegant gold theme",
    features: ["Luxury theme", "3D rendering", "VIP limits", "Golden accents"],
    isPremium: true,
  },

  // Andar Bahar Games (39-40)
  {
    id: 39,
    slug: "ab20",
    name: "Andar Bahar 20",
    apiType: "ab20",
    category: "andar-bahar",
    description: "Andar Bahar game with central Joker card focus, two large betting areas, and vertical card timeline showing alternating deal",
    features: [
      "Central Joker card at top-middle",
      "Two large betting areas: Andar (left) & Bahar (right)",
      "Vertical list/two columns of dealt cards",
      "Alternating Andar/Bahar visual timeline",
      "Chip selector at bottom",
      "Total bet amount display",
      "Main controls: place bet/clear/repeat",
      "Single ergonomic bar",
      "Dark table background",
      "Rich blue/green tones",
      "Bright highlight colors on winning side",
      "Compact history panel (A/B results)",
      "Number of cards dealt indicator",
      "Visible round countdown timer",
      "Large finger-friendly text & chips",
    ],
    isLive: true,
  },
  {
    id: 40,
    slug: "abj",
    name: "Andar Bahar Joker",
    apiType: "abj",
    category: "andar-bahar",
    description: "Premium Andar Bahar with enhanced Joker mechanics",
    features: [
      "Joker multipliers",
      "Animated effects",
      "Multiplier tracker",
      "Premium theme",
    ],
    isPremium: true,
  },

  // 32 Cards Games (41-42)
  {
    id: 41,
    slug: "card32eu",
    name: "32 Cards EU",
    apiType: "card32eu",
    category: "32-cards",
    description: "Clean and colorful 32 Cards game with four big betting panels showing card groups, labels, odds, and pool totals",
    features: [
      "Four big betting panels in a row (2x2 on mobile)",
      "Card group/number set representation",
      "Clearly displayed labels",
      "Odds display",
      "Total pool amounts",
      "My stake indicator",
      "Large single-card reveal area",
      "Smooth slide/flip animation",
      "Drawn card each round",
      "Chip chooser at bottom",
      "Bet controls: clear/repeat/double",
      "Concise bet slip summary",
      "Total stake & possible win",
      "Dark background",
      "Distinct vivid color per panel",
      "Quick group recognition",
      "Slim history bar: last 10 results",
      "Drawn card & winning panel display",
      "Round countdown timer at top",
      "Fast minimal-click repeat betting",
    ],
  },
  {
    id: 42,
    slug: "card32",
    name: "32 Cards",
    apiType: "card32",
    category: "32-cards",
    description:
      "Straightforward 32 Cards focusing on legibility and fast repeat betting",
    features: ["4 large tiles", "Fast repeat", "Color-coded", "Clean design"],
  },

  // Lucky 7 Games (43-46)
  {
    id: 43,
    slug: "lucky7",
    name: "Lucky 7",
    apiType: "lucky7",
    category: "lucky-7",
    description: "Fast card-based prediction game with Below/Exactly/Above 7",
    features: ["Below/7/Above", "Card flip", "High contrast", "Neon theme"],
  },
  {
    id: 44,
    slug: "lucky7eu",
    name: "Lucky 7 European",
    apiType: "lucky7eu",
    category: "lucky-7",
    description:
      "European-themed Lucky 7 with side bets and premium aesthetics",
    features: [
      "European theme",
      "Side bets",
      "Gold accents",
      "Fractional odds",
    ],
    isPremium: true,
  },
  {
    id: 45,
    slug: "lucky7eu2",
    name: "Lucky 7 European 2",
    apiType: "lucky7eu2",
    category: "lucky-7",
    description: "Enhanced European Lucky 7 with exclusive tier bets",
    features: [
      "European tiers",
      "Suited bonus",
      "Marble background",
      "Sophisticated UI",
    ],
    isPremium: true,
  },
  {
    id: 46,
    slug: "lucky7g",
    name: "Lucky 7 Beach",
    apiType: "lucky7g",
    category: "lucky-7",
    description: "Beach-themed Lucky 7 with tropical vacation aesthetics",
    features: [
      "Beach theme",
      "Tropical colors",
      "Surfboard tiles",
      "Ambient sounds",
    ],
  },

  // 3 Card & Casino War (47-48)
  {
    id: 47,
    slug: "3cardj",
    name: "3 Card Judgement",
    apiType: "3cardj",
    category: "3-card",
    description: "3 Card game with Hand A vs Hand B betting",
    features: ["Hand A/B/Tie", "3-card flip", "Hand rankings", "History strip"],
  },
  {
    id: 48,
    slug: "war",
    name: "Casino War",
    apiType: "war",
    category: "casino-war",
    description: "Simple Casino War with Player vs Dealer card battle",
    features: [
      "Player vs Dealer",
      "War/Surrender/Tie",
      "Dramatic highlights",
      "History bar",
    ],
  },

  // Joker Games (49-51)
  {
    id: 49,
    slug: "joker20",
    name: "Joker 20",
    apiType: "joker20",
    category: "other",
    description: "Themed card game with strong Joker/clown identity",
    features: [
      "Joker theme",
      "Playful design",
      "Purple/green colors",
      "Animated flourishes",
    ],
  },
  {
    id: 50,
    slug: "joker120",
    name: "Unlimited Joker 20",
    apiType: "joker120",
    category: "other",
    description: "Unlimited Joker Teen Patti with wild card mechanics",
    features: [
      "Wild Jokers",
      "Dynamic rankings",
      "Festive theme",
      "Joker zone",
    ],
  },
  {
    id: 51,
    slug: "joker1",
    name: "Joker 1",
    apiType: "joker1",
    category: "other",
    description: "Standard Joker game with special card mechanics",
    features: [
      "Joker mechanics",
      "Special rules",
      "Color-coded",
      "Hand modifiers",
    ],
  },

  // Number/Lottery Games (52-60)
  {
    id: 52,
    slug: "kbc",
    name: "KBC",
    apiType: "kbc",
    category: "number-games",
    description: "Quiz/number-style betting inspired by TV game show",
    features: [
      "Game show theme",
      "4-6 options",
      "Spotlight effects",
      "Digital clock",
    ],
  },
  {
    id: 53,
    slug: "notenum",
    name: "Notenum",
    apiType: "notenum",
    category: "number-games",
    description:
      "Number lottery where players predict or select numbers for draw",
    features: [
      "Number grid",
      "Toggleable tiles",
      "Frequency analysis",
      "Hot/cold numbers",
    ],
  },
  {
    id: 54,
    slug: "lottcard",
    name: "Lottcard",
    apiType: "lottcard",
    category: "number-games",
    description: "Card-based lottery hybrid with grid of card panels",
    features: ["Card grid", "Lottery draw", "Card flip", "Tier display"],
  },
  {
    id: 55,
    slug: "lottcard2",
    name: "Lottcard 2",
    apiType: "lottcard2",
    category: "number-games",
    description:
      "Advanced lottery card with multiple simultaneous draws and jackpot tiers",
    features: [
      "Multi-tier",
      "Mega jackpot",
      "Color-coded tiers",
      "Jackpot tracker",
    ],
    isPremium: true,
  },
  {
    id: 56,
    slug: "worli",
    name: "Worli",
    apiType: "worli",
    category: "number-games",
    description: "Number-based betting like fast lottery/panel game",
    features: [
      "Number grid",
      "Quick selection",
      "Draw timer",
      "Frequency heatmap",
    ],
  },
  {
    id: 57,
    slug: "worli2",
    name: "Worli 2",
    apiType: "worli2",
    category: "number-games",
    description: "Streamlined Worli with rapid-betting focus",
    features: [
      "Number grid",
      "Quick repeat",
      "Color-coded panels",
      "Pattern spotting",
    ],
  },
  {
    id: 58,
    slug: "worli3",
    name: "Worli 3",
    apiType: "worli3",
    category: "number-games",
    description:
      "Advanced Worli supporting multiple bet types and combinations",
    features: [
      "Combination bets",
      "Quick-select shortcuts",
      "Frequency analytics",
      "Heatmap",
    ],
  },
  {
    id: 59,
    slug: "matkamarket",
    name: "Matka Market",
    apiType: "matkamarket",
    category: "number-games",
    description: "Matka betting with Open and Close market times",
    features: [
      "Open/Close markets",
      "Number grid",
      "Market timer",
      "Historical data",
    ],
  },
  {
    id: 60,
    slug: "matka",
    name: "Matka",
    apiType: "matka",
    category: "number-games",
    description: "Traditional Matka number betting game",
    features: [
      "Number selection",
      "Jodi/Patti bets",
      "Live draws",
      "Pattern charts",
    ],
  },

  // Dice Games (61-62)
  {
    id: 61,
    slug: "sicbo",
    name: "Sicbo",
    apiType: "sicbo",
    category: "dice",
    description: "3-Dice Sic Bo with organized betting grid",
    features: ["3 dice", "Small/Big bets", "Totals 4-17", "Gold accents"],
  },
  {
    id: 62,
    slug: "sicbo2",
    name: "Sicbo 2",
    apiType: "sicbo2",
    category: "dice",
    description: "Faster-paced Sic Bo variant with streamlined layout",
    features: [
      "Streamlined grid",
      "Popular bets",
      "Neon highlights",
      "Sound feedback",
    ],
  },

  // Cricket Games (63-70)
  {
    id: 63,
    slug: "cmatch20",
    name: "Cricket Match 20",
    apiType: "cmatch20",
    category: "cricket",
    description: "Fantasy cricket betting with ball-by-ball micro-markets",
    features: [
      "Ball markets",
      "Player stats",
      "Partnership bets",
      "Live countdown",
    ],
  },
  {
    id: 64,
    slug: "cmeter",
    name: "Cricket Meter",
    apiType: "cmeter",
    category: "cricket",
    description: "Live cricket metric betting with real-time gauge",
    features: ["Live meter", "Over/Under", "Real-time updates", "Match stats"],
  },
  {
    id: 65,
    slug: "cmeter1",
    name: "Cricket Meter 1",
    apiType: "cmeter1",
    category: "cricket",
    description: "Ultra-granular single-ball betting with visual meter",
    features: [
      "Ball-by-ball",
      "Visual meter",
      "Outcome icons",
      "Tight countdown",
    ],
  },
  {
    id: 66,
    slug: "cricketv3",
    name: "Cricket V3",
    apiType: "cricketv3",
    category: "cricket",
    description:
      "Comprehensive ball-by-ball and live match prediction platform",
    features: [
      "Field visualization",
      "Multiple markets",
      "Live odds",
      "Commentary feed",
    ],
  },
  {
    id: 67,
    slug: "cricketline",
    name: "Cricket Line",
    apiType: "cricketline",
    category: "cricket",
    description: "Cricket line/ladder betting for exact match outcomes",
    features: [
      "Run ladder",
      "Wicket bands",
      "Probability chart",
      "Similar match analyzer",
    ],
  },
  {
    id: 68,
    slug: "cricketline2",
    name: "Cricket Line 2",
    apiType: "cricketline2",
    category: "cricket",
    description:
      "Advanced cricket ladder with real-time probability adjustments",
    features: [
      "Probability heatmap",
      "Live odds",
      "Trend analyzer",
      "Player props",
    ],
  },
  {
    id: 69,
    slug: "superover3",
    name: "Super Over 3",
    apiType: "superover3",
    category: "cricket",
    description: "Super Over cricket betting for climactic T20 format",
    features: [
      "Super Over markets",
      "Probability meter",
      "Ball tracker",
      "Live commentary",
    ],
  },
  {
    id: 70,
    slug: "superover2",
    name: "Super Over 2",
    apiType: "superover2",
    category: "cricket",
    description:
      "Extended Super Over with enhanced market depth and live analytics",
    features: [
      "Deep markets",
      "Live analytics",
      "Outcome meter",
      "Historical analyzer",
    ],
  },
  {
    id: 71,
    slug: "ballbyball",
    name: "Ball by Ball",
    apiType: "ballbyball",
    category: "cricket",
    description:
      "Live cricket micro-betting interface for single ball outcomes",
    features: [
      "Ball-by-ball markets",
      "Field graphic",
      "Ball timer",
      "Pattern icons",
    ],
  },

  // Racing Games (72-78)
  {
    id: 72,
    slug: "race20",
    name: "Race 20",
    apiType: "race20",
    category: "racing",
    description: "Virtual race betting with 4-8 runners and quick markets",
    features: [
      "Track visualization",
      "Win/Place/Top3",
      "Live odds",
      "Countdown timer",
    ],
  },
  {
    id: 73,
    slug: "race17",
    name: "Race 17",
    apiType: "race17",
    category: "racing",
    description: "Ultra-rapid 17-second virtual racing rounds",
    features: [
      "17-second rounds",
      "5-8 horses",
      "Compact tiles",
      "Quick results",
    ],
  },
  {
    id: 74,
    slug: "race2",
    name: "Race 2",
    apiType: "race2",
    category: "racing",
    description: "Traditional horse/motor racing with horizontal track",
    features: [
      "Track visualization",
      "Exotic bets",
      "Live odds ticker",
      "Results history",
    ],
  },
  {
    id: 75,
    slug: "raceadvanced",
    name: "Race Advanced",
    apiType: "raceadvanced",
    category: "racing",
    description: "Professional virtual racing with detailed analytics",
    features: ["Pro tools", "Form guides", "ROI calculation", "Race analysis"],
    isPremium: true,
  },
  {
    id: 76,
    slug: "trap",
    name: "Trap",
    apiType: "trap",
    category: "racing",
    description: "Virtual greyhound trap racing interface",
    features: [
      "Greyhound racing",
      "Win/Exacta/Trifecta",
      "Runner colors",
      "Results history",
    ],
  },
  {
    id: 77,
    slug: "trap20",
    name: "Trap 20",
    apiType: "trap20",
    category: "racing",
    description: "Simplified trap/greyhound racing micro-betting",
    features: [
      "4-6 runners",
      "Quick markets",
      "Live odds board",
      "Race countdown",
    ],
  },
  {
    id: 78,
    slug: "thetrap",
    name: "The Trap",
    apiType: "thetrap",
    category: "racing",
    description: "Gamified trap experience with maze/skill elements",
    features: ["Trap maze", "Speed bets", "Neon accents", "Animated effects"],
  },
  {
    id: 79,
    slug: "aaa",
    name: "AAA",
    apiType: "aaa",
    category: "racing",
    description: "Virtual sports trap betting interface",
    features: ["Simple track", "4-6 dogs", "Win/Place/Exacta", "Live odds"],
  },
  {
    id: 80,
    slug: "aaa2",
    name: "AAA2",
    apiType: "aaa2",
    category: "racing",
    description: "Multi-sport virtual props suite",
    features: [
      "Multi-sport",
      "Virtual games grid",
      "Featured section",
      "Results section",
    ],
  },

  // Football Games (81-83)
  {
    id: 81,
    slug: "goal",
    name: "Goal",
    apiType: "goal",
    category: "football",
    description: "Virtual football/soccer live match micro-betting",
    features: [
      "Live match",
      "Goal markets",
      "Field visualization",
      "Commentary feed",
    ],
  },
  {
    id: 82,
    slug: "footballlive",
    name: "Football Live",
    apiType: "footballlive",
    category: "football",
    description:
      "Comprehensive football live betting with extensive prop markets",
    features: [
      "Extensive markets",
      "Live stats",
      "Player heatmaps",
      "Momentum indicators",
    ],
  },
  {
    id: 83,
    slug: "soccerpro",
    name: "Soccer Pro",
    apiType: "soccerpro",
    category: "football",
    description:
      "Professional soccer betting interface with advanced analytics",
    features: [
      "Pro analytics",
      "Multiple markets",
      "Live odds",
      "Match analysis",
    ],
    isPremium: true,
  },

  // Other/Special Games (84-88)
  {
    id: 84,
    slug: "dolidana",
    name: "Dolidana",
    apiType: "dolidana",
    category: "other",
    description:
      "Festival-themed game combining Holi visuals with prediction mechanics",
    features: [
      "Holi theme",
      "Color prediction",
      "Festive animations",
      "Vibrant UI",
    ],
  },
  {
    id: 85,
    slug: "dolidana2",
    name: "Dolidana 2",
    apiType: "dolidana2",
    category: "other",
    description:
      "Advanced Dolidana with deeper gameplay and multiplier systems",
    features: [
      "Multiplier festival",
      "Color combos",
      "Festival leaderboard",
      "Celebration effects",
    ],
  },
  {
    id: 86,
    slug: "bollywood",
    name: "Bollywood",
    apiType: "bollywood",
    category: "other",
    description: "Bollywood-themed casino game suite hub",
    features: [
      "Celebrity themes",
      "Bollywood styling",
      "Multiple games",
      "Film-reel animations",
    ],
  },
  {
    id: 87,
    slug: "dum10",
    name: "Dum 10",
    apiType: "dum10",
    category: "other",
    description: "Multi-player virtual 10-player game with fast action",
    features: [
      "10 players",
      "Circular table",
      "Real-time actions",
      "Side pots tracker",
    ],
  },
  {
    id: 88,
    slug: "vippatti1day",
    name: "VIP Patti 1 Day",
    apiType: "vippatti1day",
    category: "teen-patti",
    description: "VIP/Premium Teen Patti with exclusive time-limited access",
    features: [
      "VIP exclusive",
      "Time-limited",
      "Premium rewards",
      "VIP status panel",
    ],
    isVIP: true,
  },
];

export const GAME_CATEGORIES = [
  { id: "all", name: "All Games", icon: "🎮" },
  { id: "teen-patti", name: "Teen Patti", icon: "🃏" },
  { id: "dragon-tiger", name: "Dragon Tiger", icon: "🐉" },
  { id: "poker", name: "Poker", icon: "♠️" },
  { id: "baccarat", name: "Baccarat", icon: "💎" },
  { id: "roulette", name: "Roulette", icon: "🎡" },
  { id: "andar-bahar", name: "Andar Bahar", icon: "🎴" },
  { id: "32-cards", name: "32 Cards", icon: "🂡" },
  { id: "lucky-7", name: "Lucky 7", icon: "🍀" },
  { id: "casino-war", name: "Casino War", icon: "⚔️" },
  { id: "3-card", name: "3 Card", icon: "🃏" },
  { id: "number-games", name: "Number Games", icon: "🔢" },
  { id: "cricket", name: "Cricket", icon: "🏏" },
  { id: "racing", name: "Racing", icon: "🏇" },
  { id: "football", name: "Football", icon: "⚽" },
  { id: "dice", name: "Dice", icon: "🎲" },
  { id: "other", name: "Other", icon: "🎯" },
] as const;

// Helper function to get games by category
export const getGamesByCategory = (category: string) => {
  if (category === "all") return ALL_CASINO_GAMES;
  return ALL_CASINO_GAMES.filter((game) => game.category === category);
};

// Helper function to get game by slug
export const getGameBySlug = (slug: string) => {
  return ALL_CASINO_GAMES.find((game) => game.slug === slug);
};

// Helper function to get VIP games
export const getVIPGames = () => {
  return ALL_CASINO_GAMES.filter((game) => game.isVIP);
};

// Helper function to get Premium games
export const getPremiumGames = () => {
  return ALL_CASINO_GAMES.filter((game) => game.isPremium);
};

// Helper function to get Live games
export const getLiveGames = () => {
  return ALL_CASINO_GAMES.filter((game) => game.isLive);
};
