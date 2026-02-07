import { MainLayout } from "@/components/layout/MainLayout";

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
import CasinoGameRouter from "./pages/CasinoGameRouter";

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
import AdminSetup from "./pages/admin/AdminSetup";
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
import TestBetting from "./pages/TestBetting";
import InPlay from "./pages/InPlay";

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
            <Route path="/auth" element={<Auth />} />

            <Route path="/api-test" element={<ApiTest />} />
            <Route path="/test-settlement" element={<TestSettlement />} />
            <Route path="/test-betting" element={<TestBetting />} />

            {/* Main App Layout Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/responsible-gaming"
                element={<ResponsibleGaming />}
              />

              <Route path="/in-play" element={<InPlay />} />
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

              {/* Casino Game Routes - Category-based routing */}
              <Route
                path="/casino/:gmid"
                element={
                  <ProtectedRoute>
                    <CasinoGameRouter />
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
            </Route>

            {/* Admin Login - Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Setup - Public (for initial admin configuration) */}
            <Route path="/admin/setup" element={<AdminSetup />} />

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
