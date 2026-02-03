#!/usr/bin/env node
/**
 * Add CasinoBettingPanel to all game pages
 * This script will add the betting panel component to games that have the hook
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gamesDir = path.join(__dirname, "..", "src", "pages", "game-types");

const gamesToUpdate = [
  "AndarBahar3Game.tsx",
  "AndarBahar4Game.tsx",
  "AndarBaharJ.tsx",
  "Baccarat.tsx",
  "BaccaratTable.tsx",
  "BallByBall.tsx",
  "Card32EU.tsx",
  "Card32J.tsx",
  "CasinoWar.tsx",
  "CricketMatch20Game.tsx",
  "DragonTiger6.tsx",
  "Joker20.tsx",
  "KBC.tsx",
  "Lucky7.tsx",
  "Lucky7EU.tsx",
  "OurRoulette.tsx",
  "Poker20.tsx",
  "Race20.tsx",
  "Sicbo.tsx",
  "Sicbo2.tsx",
  "TeenPatti20.tsx",
  "ThreeCardJ.tsx",
  "Worli.tsx",
  "Worli3.tsx",
  "Baccarat2Game.tsx",
];

function addBettingPanelUI(filePath, fileName) {
  let content = fs.readFileSync(filePath, "utf8");

  // Check if already has betting panel
  if (content.includes("CasinoBettingPanel")) {
    console.log(`✓ ${fileName} - Already has betting panel`);
    return false;
  }

  // Check if has the hook
  if (!content.includes("useUniversalCasinoGame")) {
    console.log(`⚠️  ${fileName} - Missing useUniversalCasinoGame hook`);
    return false;
  }

  // Find the main container/layout section and add betting panel
  // Look for the pattern: <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  // or similar grid layout and add the betting panel in the first column

  // Pattern 1: Look for existing grid layout with lg:col-span
  const gridPattern = /<div[^>]*grid[^>]*grid-cols-1[^>]*lg:col-span-\d[^>]*>/;
  const match = content.match(gridPattern);

  if (match) {
    // Find the end of this div and add betting panel after opening
    const gridStart = content.indexOf(match[0]);
    const nextDivEnd = content.indexOf("</div>", gridStart + 500);

    if (nextDivEnd !== -1) {
      // Check if it's a sidebar column (look for lg:col-span-1 or similar small span)
      if (match[0].includes("col-span-1")) {
        // This is likely a sidebar - add betting panel here
        const insertPos = gridStart + match[0].length;

        const bettingPanelCode = `
            {/* Live Betting Panel */}
            {markets.length > 0 && (
              <CasinoBettingPanel
                markets={markets}
                onPlaceBet={placeBet}
                placedBets={placedBets}
                totalStake={totalStake}
                potentialWin={potentialWin}
                onClearBets={clearBets}
                isSuspended={isSuspended}
                roundId={roundId}
              />
            )}
          `;

        content =
          content.substring(0, insertPos) +
          bettingPanelCode +
          content.substring(insertPos);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ ${fileName} - Betting panel added`);
        return true;
      }
    }
  }

  // Pattern 2: Look for MainLayout and add betting panel after it
  const mainLayoutPattern = /<MainLayout>/;
  if (mainLayoutPattern.test(content)) {
    const mainLayoutPos = content.indexOf("<MainLayout>");
    const containerStart = content.indexOf("<div", mainLayoutPos);
    const containerEnd = content.indexOf(">", containerStart);

    if (containerEnd !== -1) {
      // Add a comment at the beginning for manual review
      const comment = `\n      {/* ✅ ADD BETTING PANEL HERE */}\n      {markets.length > 0 && (\n        <CasinoBettingPanel\n          markets={markets}\n          onPlaceBet={placeBet}\n          placedBets={placedBets}\n          totalStake={totalStake}\n          potentialWin={potentialWin}\n          onClearBets={clearBets}\n          isSuspended={isSuspended}\n          roundId={roundId}\n        />\n      )}\n    `;

      console.log(`⚠️  ${fileName} - Manual review needed (template marked)`);
      return false;
    }
  }

  console.log(
    `⚠️  ${fileName} - Could not find insertion point for betting panel`,
  );
  return false;
}

console.log("\n==============================================");
console.log("🎯 Add Betting Panel to Casino Games");
console.log("==============================================\n");

let updated = 0;
let skipped = 0;
let errors = 0;

gamesToUpdate.forEach((fileName) => {
  const filePath = path.join(gamesDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} - File not found`);
    errors++;
    return;
  }

  try {
    if (addBettingPanelUI(filePath, fileName)) {
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
console.log(`📁 Total: ${gamesToUpdate.length} files`);
console.log("==============================================\n");

console.log("Next steps:");
console.log("1. Review files marked for manual integration");
console.log("2. Test betting panel functionality");
console.log("3. Verify odds updates in real-time");
console.log("4. Check wallet integration\n");
