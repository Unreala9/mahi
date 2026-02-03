# PowerShell Script to Bulk Update All Casino Game Pages
# This script adds the universal casino hook to all game pages

$gamesDir = "src\pages\game-types"
$gameFiles = Get-ChildItem -Path $gamesDir -Filter "*.tsx" | Where-Object {
    $_.Name -notmatch "(GameCard|GenericCardGame|IndividualCasinoGame|LiveCasinoGrid|UniversalGameTemplate)"
}

# Game type mapping
$gameTypeMap = @{
    "AndarBahar20.tsx" = "ab20"
    "AndarBahar3Game.tsx" = "ab3"
    "AndarBahar4Game.tsx" = "ab4"
    "AndarBaharJ.tsx" = "abj"
    "DragonTiger20.tsx" = "dt20"
    "DragonTiger6.tsx" = "dt6"
    "DT202Game.tsx" = "dt202"
    "DTL20Game.tsx" = "dtl20"
    "TeenPatti20.tsx" = "teen20"
    "Teen1Game.tsx" = "teen1"
    "Teen120Game.tsx" = "teen120"
    "Teen20BGame.tsx" = "teen20"
    "Teen20CGame.tsx" = "teen20"
    "Patti2Game.tsx" = "patti2"
    "Teen3Game.tsx" = "teen3"
    "Teen32Game.tsx" = "teen32"
    "Teen33Game.tsx" = "teen33"
    "Teen41Game.tsx" = "teen41"
    "Teen42Game.tsx" = "teen42"
    "Teen6Game.tsx" = "teen6"
    "Teen8Game.tsx" = "teen8"
    "Teen9Game.tsx" = "teen9"
    "Teenmuf2Game.tsx" = "teenmuf2"
    "TeenPatti1DayGame.tsx" = "teen1day"
    "QueenTeenPattiGame.tsx" = "queenteenpatti"
    "ThreeCardJ.tsx" = "3cardj"
    "Lucky7.tsx" = "lucky7"
    "Lucky7EU.tsx" = "lucky7eu"
    "Lucky7EU2Game.tsx" = "lucky7eu2"
    "Lucky15Game.tsx" = "lucky15"
    "Poker20.tsx" = "poker20"
    "Poker6Game.tsx" = "poker6"
    "PokerGame.tsx" = "poker"
    "Baccarat.tsx" = "baccarat"
    "Baccarat2Game.tsx" = "baccarat2"
    "BaccaratTable.tsx" = "baccarat"
    "RouletteGame.tsx" = "roulette"
    "OurRoulette.tsx" = "ourRoulette"
    "GoldenRouletteGame.tsx" = "goldenRoulette"
    "BeachRouletteGame.tsx" = "beachRoulette"
    "Card32EU.tsx" = "card32eu"
    "Card32J.tsx" = "card32j"
    "Race2Game.tsx" = "race2"
    "Race17Game.tsx" = "race17"
    "Race20.tsx" = "race20"
    "CricketMatch20Game.tsx" = "cricket20"
    "CricketV3Game.tsx" = "cricketv3"
    "CricketMeterGame.tsx" = "cricketmeter"
    "CricketMeter1Game.tsx" = "cricketmeter1"
    "BallByBall.tsx" = "ballbyball"
    "SuperOverGame.tsx" = "superover"
    "Superover2Game.tsx" = "superover2"
    "Sicbo.tsx" = "sicbo"
    "Sicbo2.tsx" = "sicbo2"
    "Worli.tsx" = "worli"
    "Worli3.tsx" = "worli3"
    "WorliVariant2Game.tsx" = "worli2"
    "KBC.tsx" = "kbc"
    "CasinoWar.tsx" = "casinowar"
    "PoisonGame.tsx" = "poison"
    "Poison20Game.tsx" = "poison20"
    "Btable2Game.tsx" = "btable2"
    "DolidanaGame.tsx" = "dolidana"
    "Dum10Game.tsx" = "dum10"
    "GoalGame.tsx" = "goal"
    "Joker120Game.tsx" = "joker120"
    "Joker20.tsx" = "joker20"
    "LottCardGame.tsx" = "lottcard"
    "MogamboGame.tsx" = "mogambo"
    "NotenumGame.tsx" = "notenum"
    "Aaa2Game.tsx" = "aaa2"
}

$totalFiles = $gameFiles.Count
$updatedCount = 0

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Casino Games Bulk Update Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total game files to update: $totalFiles`n" -ForegroundColor Yellow

foreach ($file in $gameFiles) {
    $fileName = $file.Name
    $gameType = $gameTypeMap[$fileName]

    if (-not $gameType) {
        Write-Host "[SKIP] $fileName - No game type mapping" -ForegroundColor Gray
        continue
    }

    $gameName = $fileName -replace "Game\.tsx|\.tsx", "" -replace "([a-z])([A-Z])", '$1 $2'

    Write-Host "[UPDATE] $fileName -> gameType: $gameType" -ForegroundColor Green

    $filePath = Join-Path $gamesDir $fileName
    $content = Get-Content $filePath -Raw

    # Check if already updated
    if ($content -match "useUniversalCasinoGame") {
        Write-Host "  ✓ Already updated" -ForegroundColor DarkGreen
        continue
    }

    # Add imports if not present
    if ($content -notmatch "useUniversalCasinoGame") {
        $content = $content -replace "(import.*lucide-react.*)", "`$1`nimport { useUniversalCasinoGame } from `"@/hooks/useUniversalCasinoGame`";"
    }

    if ($content -notmatch "CasinoBettingPanel") {
        $content = $content -replace "(import { useUniversalCasinoGame.*)", "`$1`nimport { CasinoBettingPanel } from `"@/components/casino/CasinoBettingPanel`";"
    }

    # Add comment about integration
    $hookCode = @"
  // ✅ INTEGRATED: Live API data, odds, and betting
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
    gameType: "$gameType",
    gameName: "$gameName",
  });

"@

    # Try to insert hook after first function declaration
    if ($content -match "export default function.*\{") {
        $content = $content -replace "(export default function[^{]*\{)(\s*const navigate)", "`$1`n$hookCode`$2"

        # Save the file
        Set-Content -Path $filePath -Value $content -NoNewline
        $updatedCount++
        Write-Host "  ✓ Updated successfully" -ForegroundColor DarkGreen
    } else {
        Write-Host "  ✗ Could not find insertion point" -ForegroundColor Red
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Updated: $updatedCount / $totalFiles files" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add CasinoBettingPanel component to each game's UI" -ForegroundColor White
Write-Host "2. Replace hardcoded odds with live data from markets" -ForegroundColor White
Write-Host "3. Test betting functionality" -ForegroundColor White
Write-Host "4. Verify API connections" -ForegroundColor White
Write-Host "`nSee CASINO_INTEGRATION_GUIDE.ts for detailed instructions" -ForegroundColor Yellow
