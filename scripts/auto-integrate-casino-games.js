#!/usr/bin/env node
/**
 * Automated Casino Games Integration Script
 * Updates all casino game files with universal hook
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Game type mapping
const GAME_TYPE_MAP = {
  "Aaa2Game.tsx": { code: "aaa2", name: "AAA 2" },
  "AndarBahar20.tsx": { code: "ab20", name: "Andar Bahar 20" },
  "AndarBahar3Game.tsx": { code: "ab3", name: "Andar Bahar 3" },
  "AndarBahar4Game.tsx": { code: "ab4", name: "Andar Bahar 4" },
  "AndarBaharJ.tsx": { code: "abj", name: "Andar Bahar J" },
  "Baccarat.tsx": { code: "baccarat", name: "Baccarat" },
  "Baccarat2Game.tsx": { code: "baccarat2", name: "Baccarat 2" },
  "BaccaratTable.tsx": { code: "baccarat", name: "Baccarat Table" },
  "BallByBall.tsx": { code: "ballbyball", name: "Ball By Ball" },
  "BeachRouletteGame.tsx": { code: "beachRoulette", name: "Beach Roulette" },
  "Btable2Game.tsx": { code: "btable2", name: "B-Table 2" },
  "Card32EU.tsx": { code: "card32eu", name: "Card 32 EU" },
  "Card32J.tsx": { code: "card32j", name: "Card 32 J" },
  "CasinoWar.tsx": { code: "casinowar", name: "Casino War" },
  "CricketMatch20Game.tsx": { code: "cricket20", name: "Cricket Match 20" },
  "CricketMeter1Game.tsx": { code: "cricketmeter1", name: "Cricket Meter 1" },
  "CricketMeterGame.tsx": { code: "cricketmeter", name: "Cricket Meter" },
  "CricketV3Game.tsx": { code: "cricketv3", name: "Cricket V3" },
  "DolidanaGame.tsx": { code: "dolidana", name: "Dolidana" },
  "DragonTiger20.tsx": { code: "dt20", name: "Dragon Tiger 20" },
  "DragonTiger6.tsx": { code: "dt6", name: "Dragon Tiger 6" },
  "DT202Game.tsx": { code: "dt202", name: "DT 202" },
  "DTL20Game.tsx": { code: "dtl20", name: "DTL 20" },
  "Dum10Game.tsx": { code: "dum10", name: "Dum 10" },
  "GoalGame.tsx": { code: "goal", name: "Goal" },
  "GoldenRouletteGame.tsx": { code: "goldenRoulette", name: "Golden Roulette" },
  "Joker120Game.tsx": { code: "joker120", name: "Joker 120" },
  "Joker20.tsx": { code: "joker20", name: "Joker 20" },
  "KBC.tsx": { code: "kbc", name: "KBC" },
  "LottCardGame.tsx": { code: "lottcard", name: "Lott Card" },
  "Lucky15Game.tsx": { code: "lucky15", name: "Lucky 15" },
  "Lucky7.tsx": { code: "lucky7", name: "Lucky 7" },
  "Lucky7EU.tsx": { code: "lucky7eu", name: "Lucky 7 EU" },
  "Lucky7EU2Game.tsx": { code: "lucky7eu2", name: "Lucky 7 EU2" },
  "MogamboGame.tsx": { code: "mogambo", name: "Mogambo" },
  "NotenumGame.tsx": { code: "notenum", name: "Notenum" },
  "OurRoulette.tsx": { code: "ourRoulette", name: "Our Roulette" },
  "Patti2Game.tsx": { code: "patti2", name: "Patti 2" },
  "Poison20Game.tsx": { code: "poison20", name: "Poison 20" },
  "PoisonGame.tsx": { code: "poison", name: "Poison" },
  "Poker20.tsx": { code: "poker20", name: "Poker 20" },
  "Poker6Game.tsx": { code: "poker6", name: "Poker 6" },
  "PokerGame.tsx": { code: "poker", name: "Poker" },
  "QueenTeenPattiGame.tsx": {
    code: "queenteenpatti",
    name: "Queen Teen Patti",
  },
  "Race17Game.tsx": { code: "race17", name: "Race 17" },
  "Race20.tsx": { code: "race20", name: "Race 20" },
  "Race2Game.tsx": { code: "race2", name: "Race 2" },
  "RouletteGame.tsx": { code: "roulette", name: "Roulette" },
  "Sicbo.tsx": { code: "sicbo", name: "Sicbo" },
  "Sicbo2.tsx": { code: "sicbo2", name: "Sicbo 2" },
  "Superover2Game.tsx": { code: "superover2", name: "Super Over 2" },
  "SuperOverGame.tsx": { code: "superover", name: "Super Over" },
  "Teen120Game.tsx": { code: "teen120", name: "Teen 120" },
  "Teen1Game.tsx": { code: "teen1", name: "Teen 1" },
  "Teen20BGame.tsx": { code: "teen20", name: "Teen 20B" },
  "Teen20CGame.tsx": { code: "teen20", name: "Teen 20C" },
  "Teen32Game.tsx": { code: "teen32", name: "Teen 32" },
  "Teen33Game.tsx": { code: "teen33", name: "Teen 33" },
  "Teen3Game.tsx": { code: "teen3", name: "Teen 3" },
  "Teen41Game.tsx": { code: "teen41", name: "Teen 41" },
  "Teen42Game.tsx": { code: "teen42", name: "Teen 42" },
  "Teen6Game.tsx": { code: "teen6", name: "Teen 6" },
  "Teen8Game.tsx": { code: "teen8", name: "Teen 8" },
  "Teen9Game.tsx": { code: "teen9", name: "Teen 9" },
  "Teenmuf2Game.tsx": { code: "teenmuf2", name: "Teen Muf 2" },
  "TeenPatti1DayGame.tsx": { code: "teen1day", name: "Teen Patti 1 Day" },
  "TeenPatti20.tsx": { code: "teen20", name: "Teen Patti 20" },
  "ThreeCardJ.tsx": { code: "3cardj", name: "Three Card J" },
  "Worli.tsx": { code: "worli", name: "Worli" },
  "Worli3.tsx": { code: "worli3", name: "Worli 3" },
  "WorliVariant2Game.tsx": { code: "worli2", name: "Worli Variant 2" },
};

const IMPORTS_TO_ADD = [
  'import { useUniversalCasinoGame } from "@/hooks/useUniversalCasinoGame";',
  'import { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";',
];

const gamesDir = path.join(__dirname, "..", "src", "pages", "game-types");

function addHookToFile(filePath, fileName) {
  const gameInfo = GAME_TYPE_MAP[fileName];
  if (!gameInfo) {
    console.log(`⚠️  ${fileName} - No game type mapping found`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Check if already has the hook
  if (content.includes("useUniversalCasinoGame")) {
    console.log(`✓ ${fileName} - Already integrated`);
    return false;
  }

  // Add imports after the last import statement
  const lastImportIndex = content.lastIndexOf("import ");
  const endOfLastImport = content.indexOf(";", lastImportIndex) + 1;
  const beforeImports = content.substring(0, endOfLastImport);
  const afterImports = content.substring(endOfLastImport);

  // Check if TrendingUp is already imported
  if (!content.includes("TrendingUp")) {
    content = content.replace(/from "lucide-react";/, (match, offset) => {
      const importLine = content.substring(
        content.lastIndexOf("import", offset),
        offset + match.length,
      );
      if (importLine.includes("{") && importLine.includes("}")) {
        return importLine
          .replace("}", ", TrendingUp }")
          .substring(importLine.indexOf("from"));
      }
      return match;
    });
  }

  const newImports = IMPORTS_TO_ADD.join("\n");
  content = beforeImports + "\n" + newImports + afterImports;

  // Add hook after function declaration
  const hookCode = `
  // ✅ LIVE API INTEGRATION
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
    gameType: "${gameInfo.code}",
    gameName: "${gameInfo.name}",
  });
`;

  // Find the export default function and add hook after navigate
  const functionMatch = content.match(/export default function.*?\{/);
  if (functionMatch) {
    const functionStart = functionMatch.index + functionMatch[0].length;
    const navigateMatch = content
      .substring(functionStart)
      .match(/const navigate = useNavigate\(\);/);

    if (navigateMatch) {
      const insertPos =
        functionStart + navigateMatch.index + navigateMatch[0].length;
      content =
        content.substring(0, insertPos) +
        hookCode +
        content.substring(insertPos);

      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ ${fileName} - Updated successfully`);
      return true;
    }
  }

  console.log(`⚠️  ${fileName} - Could not find insertion point`);
  return false;
}

// Main execution
console.log("\n==============================================");
console.log("🎰 Casino Games Auto-Integration Script");
console.log("==============================================\n");

const files = fs
  .readdirSync(gamesDir)
  .filter(
    (f) =>
      f.endsWith(".tsx") &&
      ![
        "GameCard.tsx",
        "GenericCardGame.tsx",
        "IndividualCasinoGame.tsx",
        "LiveCasinoGrid.tsx",
        "UniversalGameTemplate.tsx",
      ].includes(f),
  );

let updated = 0;
let skipped = 0;
let errors = 0;

files.forEach((fileName) => {
  const filePath = path.join(gamesDir, fileName);
  try {
    if (addHookToFile(filePath, fileName)) {
      updated++;
    } else {
      skipped++;
    }
  } catch (error) {
    console.log(`❌ ${fileName} - Error: ${error.message}`);
    errors++;
  }
});

console.log("\n==============================================");
console.log("📊 Summary:");
console.log(`✅ Updated: ${updated} files`);
console.log(`⏭️  Skipped: ${skipped} files`);
console.log(`❌ Errors: ${errors} files`);
console.log(`📁 Total: ${files.length} files`);
console.log("==============================================\n");

console.log("Next steps:");
console.log("1. Review the changes in each file");
console.log("2. Add <CasinoBettingPanel /> to game UI");
console.log("3. Test each game for API connectivity");
console.log("4. Replace hardcoded odds with live data from markets\n");
