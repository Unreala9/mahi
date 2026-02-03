import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { diamondWS } from "@/services/websocket";
import { settlementMonitor } from "@/services/autoSettlementService";
import { resultWebSocket } from "@/services/resultWebSocket";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Sportsbook from "./pages/Sportsbook";
import CasinoLive from "./pages/CasinoLive";
import Casino from "./pages/Casino";
import CasinoGame from "./pages/CasinoGame";
import TeenPatti20 from "./pages/game-types/TeenPatti20";
import OurRoulette from "./pages/game-types/OurRoulette";
import DragonTiger20 from "./pages/game-types/DragonTiger20";
import AndarBahar20 from "./pages/game-types/AndarBahar20";
import Card32EU from "./pages/game-types/Card32EU";
import Baccarat from "./pages/game-types/Baccarat";
import Poker20 from "./pages/game-types/Poker20";
import Lucky7 from "./pages/game-types/Lucky7";
import Worli from "./pages/game-types/Worli";
import BallByBall from "./pages/game-types/BallByBall";
import ThreeCardJ from "./pages/game-types/ThreeCardJ";
import CasinoWar from "./pages/game-types/CasinoWar";
import DragonTiger6 from "./pages/game-types/DragonTiger6";
import AndarBaharJ from "./pages/game-types/AndarBaharJ";
import Card32J from "./pages/game-types/Card32J";
import BaccaratTable from "./pages/game-types/BaccaratTable";
import Lucky7EU from "./pages/game-types/Lucky7EU";
import Race20 from "./pages/game-types/Race20";
import Joker20 from "./pages/game-types/Joker20";
import KBC from "./pages/game-types/KBC";
import Sicbo from "./pages/game-types/Sicbo";
import Sicbo2 from "./pages/game-types/Sicbo2";
import Worli3 from "./pages/game-types/Worli3";

// Additional Game Imports
import Aaa2Game from "./pages/game-types/Aaa2Game";
import AndarBahar3Game from "./pages/game-types/AndarBahar3Game";
import AndarBahar4Game from "./pages/game-types/AndarBahar4Game";
import Baccarat2Game from "./pages/game-types/Baccarat2Game";
import CricketMatch20Game from "./pages/game-types/CricketMatch20Game";
import BeachRouletteGame from "./pages/game-types/BeachRouletteGame";
import Btable2Game from "./pages/game-types/Btable2Game";
import CricketMeter1Game from "./pages/game-types/CricketMeter1Game";
import CricketMeterGame from "./pages/game-types/CricketMeterGame";
import CricketV3Game from "./pages/game-types/CricketV3Game";
import DolidanaGame from "./pages/game-types/DolidanaGame";
import DT202Game from "./pages/game-types/DT202Game";
import DTL20Game from "./pages/game-types/DTL20Game";
import Dum10Game from "./pages/game-types/Dum10Game";
import GoalGame from "./pages/game-types/GoalGame";
import GoldenRouletteGame from "./pages/game-types/GoldenRouletteGame";
import Joker120Game from "./pages/game-types/Joker120Game";
import LottCardGame from "./pages/game-types/LottCardGame";
import Lucky7EU2Game from "./pages/game-types/Lucky7EU2Game";
import Lucky15Game from "./pages/game-types/Lucky15Game";
import MogamboGame from "./pages/game-types/MogamboGame";
import NotenumGame from "./pages/game-types/NotenumGame";
import Patti2Game from "./pages/game-types/Patti2Game";
import Poison20Game from "./pages/game-types/Poison20Game";
import PoisonGame from "./pages/game-types/PoisonGame";
import Poker6Game from "./pages/game-types/Poker6Game";
import PokerGame from "./pages/game-types/PokerGame";
import QueenTeenPattiGame from "./pages/game-types/QueenTeenPattiGame";
import Race17Game from "./pages/game-types/Race17Game";
import Race2Game from "./pages/game-types/Race2Game";
import RouletteGame from "./pages/game-types/RouletteGame";
import Superover2Game from "./pages/game-types/Superover2Game";
import SuperOverGame from "./pages/game-types/SuperOverGame";
import Teen120Game from "./pages/game-types/Teen120Game";
import Teen1Game from "./pages/game-types/Teen1Game";
import Teen20BGame from "./pages/game-types/Teen20BGame";
import Teen20CGame from "./pages/game-types/Teen20CGame";
import Teen32Game from "./pages/game-types/Teen32Game";
import Teen33Game from "./pages/game-types/Teen33Game";
import Teen3Game from "./pages/game-types/Teen3Game";
import Teen41Game from "./pages/game-types/Teen41Game";
import Teen42Game from "./pages/game-types/Teen42Game";
import Teen6Game from "./pages/game-types/Teen6Game";
import Teen8Game from "./pages/game-types/Teen8Game";
import Teen9Game from "./pages/game-types/Teen9Game";
import Teenmuf2Game from "./pages/game-types/Teenmuf2Game";
import TeenPatti1DayGame from "./pages/game-types/TeenPatti1DayGame";
import { IndividualCasinoGame } from "./pages/game-types/IndividualCasinoGame";
import WorliVariant2Game from "./pages/game-types/WorliVariant2Game";

import Wallet from "./pages/Wallet";
import Bets from "./pages/Bets";
import Profile from "./pages/Profile";
import DiamondMatch from "./pages/DiamondMatch";
import ApiTest from "./pages/ApiTest";

import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";

import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminBets from "./pages/admin/AdminBets";
import AdminGames from "./pages/admin/AdminGames";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TestSettlement from "./pages/TestSettlement";

const queryClient = new QueryClient();

const App = () => {
  // Initialize WebSocket polling service on app start
  useEffect(() => {
    let isActive = true;

    const initWebSocket = () => {
      if (isActive) {
        console.log("[App] Starting Diamond WebSocket polling service...");
        diamondWS.connect();
      }
    };

    // Small delay to prevent immediate reconnection
    const timer = setTimeout(initWebSocket, 500);

    return () => {
      isActive = false;
      clearTimeout(timer);
      console.log("[App] Disconnecting Diamond WebSocket polling service...");
      diamondWS.disconnect();
    };
  }, []); // Empty dependency array - only run once

  // Initialize automatic bet settlement monitor
  useEffect(() => {
    console.log("[App] Starting bet settlement monitor...");
    settlementMonitor.start(3600); // Check every hour for very old bets

    return () => {
      console.log("[App] Stopping bet settlement monitor...");
      settlementMonitor.stop();
    };
  }, []);

  // Initialize result WebSocket for real-time settlements
  useEffect(() => {
    console.log("[App] Starting result WebSocket...");
    resultWebSocket.start();

    return () => {
      console.log("[App] Stopping result WebSocket...");
      resultWebSocket.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/responsible-gaming" element={<ResponsibleGaming />} />
            <Route path="/api-test" element={<ApiTest />} />
            <Route path="/test-settlement" element={<TestSettlement />} />

            {/* Redirect old dashboard to sports */}
            <Route
              path="/dashboard"
              element={<Navigate to="/sports" replace />}
            />
            <Route
              path="/sports"
              element={
                <ProtectedRoute>
                  <Sportsbook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:gmid/:sid"
              element={
                <ProtectedRoute>
                  <DiamondMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:gmid"
              element={
                <ProtectedRoute>
                  <DiamondMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino-live"
              element={
                <ProtectedRoute>
                  <CasinoLive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino"
              element={
                <ProtectedRoute>
                  <Casino />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino-lobby"
              element={<Navigate to="/casino" replace />}
            />
            {/* Specific Casino Game Pages */}
            <Route
              path="/casino/teen20"
              element={
                <ProtectedRoute>
                  <TeenPatti20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/ourroullete"
              element={
                <ProtectedRoute>
                  <OurRoulette />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/dt20"
              element={
                <ProtectedRoute>
                  <DragonTiger20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/ab20"
              element={
                <ProtectedRoute>
                  <AndarBahar20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/card32eu"
              element={
                <ProtectedRoute>
                  <Card32EU />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/baccarat"
              element={
                <ProtectedRoute>
                  <Baccarat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/poker20"
              element={
                <ProtectedRoute>
                  <Poker20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/lucky7"
              element={
                <ProtectedRoute>
                  <Lucky7 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/worli"
              element={
                <ProtectedRoute>
                  <Worli />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/ballbyball"
              element={
                <ProtectedRoute>
                  <BallByBall />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/cmatch20"
              element={
                <ProtectedRoute>
                  <CricketMatch20Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/3cardj"
              element={
                <ProtectedRoute>
                  <ThreeCardJ />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/war"
              element={
                <ProtectedRoute>
                  <CasinoWar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/dt6"
              element={
                <ProtectedRoute>
                  <DragonTiger6 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/abj"
              element={
                <ProtectedRoute>
                  <AndarBaharJ />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/card32"
              element={
                <ProtectedRoute>
                  <Card32J />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/btable"
              element={
                <ProtectedRoute>
                  <BaccaratTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/lucky7eu"
              element={
                <ProtectedRoute>
                  <Lucky7EU />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/race20"
              element={
                <ProtectedRoute>
                  <Race20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/joker20"
              element={
                <ProtectedRoute>
                  <Joker20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/kbc"
              element={
                <ProtectedRoute>
                  <KBC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/sicbo"
              element={
                <ProtectedRoute>
                  <Sicbo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/sicbo2"
              element={
                <ProtectedRoute>
                  <Sicbo2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/worli3"
              element={
                <ProtectedRoute>
                  <Worli3 />
                </ProtectedRoute>
              }
            />

            {/* Additional Teen Patti Routes */}
            <Route
              path="/casino/teen1"
              element={
                <ProtectedRoute>
                  <Teen1Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen120"
              element={
                <ProtectedRoute>
                  <Teen120Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen20b"
              element={
                <ProtectedRoute>
                  <Teen20BGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen20c"
              element={
                <ProtectedRoute>
                  <Teen20CGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen32"
              element={
                <ProtectedRoute>
                  <Teen32Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen33"
              element={
                <ProtectedRoute>
                  <Teen33Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen3"
              element={
                <ProtectedRoute>
                  <Teen3Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen6"
              element={
                <ProtectedRoute>
                  <Teen6Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen8"
              element={
                <ProtectedRoute>
                  <Teen8Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen9"
              element={
                <ProtectedRoute>
                  <Teen9Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen41"
              element={
                <ProtectedRoute>
                  <Teen41Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen42"
              element={
                <ProtectedRoute>
                  <Teen42Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen62"
              element={
                <ProtectedRoute>
                  <TeenPatti1DayGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen"
              element={
                <ProtectedRoute>
                  <TeenPatti1DayGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teen20v1"
              element={
                <ProtectedRoute>
                  <TeenPatti20 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teenmuf"
              element={
                <ProtectedRoute>
                  <Teenmuf2Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/teenunique"
              element={
                <ProtectedRoute>
                  <QueenTeenPattiGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/patti2"
              element={
                <ProtectedRoute>
                  <Patti2Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/trio"
              element={
                <ProtectedRoute>
                  <Patti2Game />
                </ProtectedRoute>
              }
            />

            {/* Poison Teen Patti Routes */}
            <Route
              path="/casino/poison"
              element={
                <ProtectedRoute>
                  <PoisonGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/poison20"
              element={
                <ProtectedRoute>
                  <Poison20Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Poker Routes */}
            <Route
              path="/casino/poker"
              element={
                <ProtectedRoute>
                  <PokerGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/poker6"
              element={
                <ProtectedRoute>
                  <Poker6Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Baccarat Routes */}
            <Route
              path="/casino/baccarat2"
              element={
                <ProtectedRoute>
                  <Baccarat2Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/btable2"
              element={
                <ProtectedRoute>
                  <Btable2Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Dragon Tiger Routes */}
            <Route
              path="/casino/dt202"
              element={
                <ProtectedRoute>
                  <DT202Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/dtl20"
              element={
                <ProtectedRoute>
                  <DTL20Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Andar Bahar Routes */}
            <Route
              path="/casino/ab4"
              element={
                <ProtectedRoute>
                  <AndarBahar4Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/ab3"
              element={
                <ProtectedRoute>
                  <AndarBahar3Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Lucky 7 Routes */}
            <Route
              path="/casino/lucky7eu2"
              element={
                <ProtectedRoute>
                  <Lucky7EU2Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/lucky15"
              element={
                <ProtectedRoute>
                  <Lucky15Game />
                </ProtectedRoute>
              }
            />

            {/* Additional 3 Card Routes */}
            <Route
              path="/casino/aaa2"
              element={
                <ProtectedRoute>
                  <Aaa2Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Worli/Matka Routes */}
            <Route
              path="/casino/worli2"
              element={
                <ProtectedRoute>
                  <WorliVariant2Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Roulette Routes */}
            <Route
              path="/casino/roulette11"
              element={
                <ProtectedRoute>
                  <GoldenRouletteGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/roulette12"
              element={
                <ProtectedRoute>
                  <BeachRouletteGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/roulette13"
              element={
                <ProtectedRoute>
                  <RouletteGame />
                </ProtectedRoute>
              }
            />

            {/* Additional Joker Routes */}
            <Route
              path="/casino/joker1"
              element={
                <ProtectedRoute>
                  <Joker120Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/joker120"
              element={
                <ProtectedRoute>
                  <Joker120Game />
                </ProtectedRoute>
              }
            />

            {/* Additional Race Routes */}
            <Route
              path="/casino/race17"
              element={
                <ProtectedRoute>
                  <Race17Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/race2"
              element={
                <ProtectedRoute>
                  <Race2Game />
                </ProtectedRoute>
              }
            />

            {/* Special Game Routes */}
            <Route
              path="/casino/dolidana"
              element={
                <ProtectedRoute>
                  <DolidanaGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/mogambo"
              element={
                <ProtectedRoute>
                  <MogamboGame />
                </ProtectedRoute>
              }
            />

            {/* Cricket Game Routes */}
            <Route
              path="/casino/goal"
              element={
                <ProtectedRoute>
                  <GoalGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/superover2"
              element={
                <ProtectedRoute>
                  <Superover2Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/superover"
              element={
                <ProtectedRoute>
                  <SuperOverGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/cricketmeter"
              element={
                <ProtectedRoute>
                  <CricketMeterGame game={{} as any} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/cricketmeter1"
              element={
                <ProtectedRoute>
                  <CricketMeter1Game game={{} as any} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/cricketv3"
              element={
                <ProtectedRoute>
                  <CricketV3Game />
                </ProtectedRoute>
              }
            />

            {/* Other Game Routes */}
            <Route
              path="/casino/notenum"
              element={
                <ProtectedRoute>
                  <NotenumGame />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/dum10"
              element={
                <ProtectedRoute>
                  <Dum10Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casino/lottcard"
              element={
                <ProtectedRoute>
                  <LottCardGame />
                </ProtectedRoute>
              }
            />

            <Route
              path="/casino-old/:gmid"
              element={
                <ProtectedRoute>
                  <CasinoGame />
                </ProtectedRoute>
              }
            />

            {/* Generic casino route: catch any /casino/:gmid not explicitly listed above */}
            <Route
              path="/casino/:gmid"
              element={
                <ProtectedRoute>
                  <IndividualCasinoGame />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bets"
              element={
                <ProtectedRoute>
                  <Bets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Login - Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="bets" element={<AdminBets />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
