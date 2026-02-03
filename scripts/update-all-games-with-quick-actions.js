#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gamesDir = path.join(__dirname, "../src/pages/game-types");

const GAME_TYPE_MAPPING = {
  "Aaa2Game.tsx": "aaa2",
  "AndarBahar20.tsx": "ab20",
  "AndarBahar3Game.tsx": "ab3",
  "AndarBahar4Game.tsx": "ab4",
  "AndarBaharJ.tsx": "abj",
  "Baccarat.tsx": "bac",
  "Baccarat2Game.tsx": "bac2",
  "BaccaratTable.tsx": "bactbl",
  "BallByBall.tsx": "bbb",
  "BeachRouletteGame.tsx": "br",
  "Btable2Game.tsx": "bt2",
  "Card32EU.tsx": "c32eu",
  "Card32J.tsx": "c32j",
  "CasinoWar.tsx": "cwar",
  "CricketMatch20Game.tsx": "cm20",
  "DragonTiger20.tsx": "dt20",
  "DragonTiger6.tsx": "dt6",
  "Joker20.tsx": "jkr20",
  "KBC.tsx": "kbc",
  "Lucky7.tsx": "l7",
  "Lucky7EU.tsx": "l7eu",
  "OurRoulette.tsx": "or",
  "Race20.tsx": "r20",
  "Sicbo.tsx": "sb",
  "Sicbo2.tsx": "sb2",
  "TeenPatti20.tsx": "tp20",
  "ThreeCardJackpot.tsx": "tcj",
  "Worli.tsx": "worli",
  "Worli3.tsx": "worli3",
};

const GAME_DISPLAY_NAMES = {
  "Aaa2Game.tsx": "AAA 2",
  "AndarBahar20.tsx": "Andar Bahar 20",
  "AndarBahar3Game.tsx": "Andar Bahar 3",
  "AndarBahar4Game.tsx": "Andar Bahar 4",
  "AndarBaharJ.tsx": "Andar Bahar J",
  "Baccarat.tsx": "Baccarat",
  "Baccarat2Game.tsx": "Baccarat 2",
  "BaccaratTable.tsx": "Baccarat Table",
  "BallByBall.tsx": "Ball By Ball",
  "BeachRouletteGame.tsx": "Beach Roulette",
  "Btable2Game.tsx": "B Table 2",
  "Card32EU.tsx": "Card 32 EU",
  "Card32J.tsx": "Card 32 J",
  "CasinoWar.tsx": "Casino War",
  "CricketMatch20Game.tsx": "Cricket Match 20",
  "DragonTiger20.tsx": "Dragon Tiger 20",
  "DragonTiger6.tsx": "Dragon Tiger 6",
  "Joker20.tsx": "Joker 20",
  "KBC.tsx": "KBC",
  "Lucky7.tsx": "Lucky 7",
  "Lucky7EU.tsx": "Lucky 7 EU",
  "OurRoulette.tsx": "Our Roulette",
  "Race20.tsx": "Race 20",
  "Sicbo.tsx": "Sicbo",
  "Sicbo2.tsx": "Sicbo 2",
  "TeenPatti20.tsx": "Teen Patti 20",
  "ThreeCardJackpot.tsx": "Three Card Jackpot",
  "Worli.tsx": "Worli",
  "Worli3.tsx": "Worli 3",
};

let successCount = 0;
let skipCount = 0;
let errorCount = 0;
let results = [];

console.log("\n🎰 Casino Quick Actions Auto-Update Script");
console.log("==========================================\n");

try {
  const files = fs
    .readdirSync(gamesDir)
    .filter((f) => f.endsWith(".tsx"))
    .sort();

  console.log(`📁 Found ${files.length} game files\n`);

  files.forEach((file) => {
    try {
      const filePath = path.join(gamesDir, file);
      let content = fs.readFileSync(filePath, "utf-8");

      // Skip AndarBahar20 - already done
      if (file === "AndarBahar20.tsx") {
        results.push({
          file,
          status: "ALREADY_UPDATED",
          reason: "Already has betting panel UI",
        });
        skipCount++;
        return;
      }

      // Check if already has useUniversalCasinoGame hook
      if (!content.includes("useUniversalCasinoGame")) {
        results.push({
          file,
          status: "SKIP",
          reason: "No useUniversalCasinoGame hook found",
        });
        skipCount++;
        return;
      }

      // Check if already has CasinoBettingPanel
      if (content.includes("CasinoBettingPanel")) {
        results.push({
          file,
          status: "ALREADY_UPDATED",
          reason: "Already has CasinoBettingPanel",
        });
        skipCount++;
        return;
      }

      // Import CasinoBettingPanel if not present
      if (!content.includes('from "@/components/casino/CasinoBettingPanel"')) {
        const importSection = content.match(
          /import.*from ["']@\/components\/casino\/[^"']*["'];?/,
        );
        if (!importSection) {
          // Add to existing imports section
          content = content.replace(
            /import { [^}]+ } from ["']@\/components\/ui\/badge["'];?/,
            '$&\nimport { CasinoBettingPanel } from "@/components/casino/CasinoBettingPanel";',
          );
        }
      }

      // Add gameType to useUniversalCasinoGame hook if missing
      if (!content.includes("gameType:")) {
        const gameType = GAME_TYPE_MAPPING[file] || file.replace(".tsx", "");
        const gameName = GAME_DISPLAY_NAMES[file] || file.replace(".tsx", "");

        content = content.replace(
          /useUniversalCasinoGame\(\s*{\s*}/,
          `useUniversalCasinoGame({
    gameType: "${gameType}",
    gameName: "${gameName}",
  })`,
        );
      }

      fs.writeFileSync(filePath, content, "utf-8");
      results.push({ file, status: "SUCCESS", reason: "Added betting panel" });
      successCount++;
    } catch (err) {
      results.push({
        file,
        status: "ERROR",
        reason: err.message,
      });
      errorCount++;
    }
  });

  // Print results
  console.log("📊 Results Summary:");
  console.log(`✅ Updated: ${successCount} files`);
  console.log(`⏭️  Skipped: ${skipCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`📁 Total: ${files.length} files\n`);

  // Detailed results
  console.log("📝 Detailed Results:");
  console.log("==================\n");

  const successResults = results.filter((r) => r.status === "SUCCESS");
  const skipResults = results.filter((r) => r.status !== "SUCCESS");

  if (successResults.length > 0) {
    console.log("✅ Successfully Updated:");
    successResults.forEach((r) => {
      console.log(`  ✓ ${r.file}`);
    });
    console.log();
  }

  if (skipResults.length > 0) {
    console.log("⏭️  Skipped/Errors:");
    skipResults.slice(0, 10).forEach((r) => {
      console.log(`  • ${r.file} (${r.reason})`);
    });
    if (skipResults.length > 10) {
      console.log(`  ... and ${skipResults.length - 10} more\n`);
    }
  }

  // Save detailed report
  const reportPath = path.join(__dirname, "../QUICK_ACTIONS_UPDATE_REPORT.md");
  const reportContent = `# Quick Actions Update Report

Generated: ${new Date().toISOString()}

## Summary
- ✅ Successfully Updated: ${successCount}
- ⏭️ Skipped: ${skipCount}
- ❌ Errors: ${errorCount}
- Total: ${files.length}

## Successfully Updated Files
${successResults.map((r) => `- ${r.file}`).join("\n")}

## Skipped/Error Files
${skipResults.map((r) => `- ${r.file}: ${r.reason}`).join("\n")}

## Next Steps
1. All updated games now have useUniversalCasinoGame hook
2. Betting panel component ready to add to game layouts
3. For games without hook: See CASINO_INTEGRATION_GUIDE.ts
4. Run manual updates as needed for remaining games

## Testing Checklist
- [ ] Betting panel appears on game screen
- [ ] Quick action buttons work (Repeat, Half, Double, Min, Max)
- [ ] Live odds display correctly
- [ ] Bets place successfully
- [ ] Connection status shows correctly
- [ ] Last result displays
`;

  fs.writeFileSync(reportPath, reportContent, "utf-8");
  console.log(`📋 Detailed report saved to: QUICK_ACTIONS_UPDATE_REPORT.md\n`);
} catch (error) {
  console.error("❌ Error during update:", error.message);
  process.exit(1);
}

console.log("✨ Update process completed!\n");
