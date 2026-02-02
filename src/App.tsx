import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { diamondWS } from "@/services/websocket";

// Lazy load page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Sportsbook = lazy(() => import("./pages/Sportsbook"));
const CasinoLive = lazy(() => import("./pages/CasinoLive"));
const Casino = lazy(() => import("./pages/Casino"));
const CasinoGame = lazy(() => import("./pages/CasinoGame"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Bets = lazy(() => import("./pages/Bets"));
const Profile = lazy(() => import("./pages/Profile"));
const DiamondMatch = lazy(() => import("./pages/DiamondMatch"));
const ApiTest = lazy(() => import("./pages/ApiTest"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ResponsibleGaming = lazy(() => import("./pages/ResponsibleGaming"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminBets = lazy(() => import("./pages/admin/AdminBets"));
const AdminGames = lazy(() => import("./pages/admin/AdminGames"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminWithdrawals = lazy(() => import("./pages/admin/AdminWithdrawals"));
const NotFound = lazy(() => import("./pages/NotFound"));

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#020817]">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-t-yellow-500 rounded-full animate-spin"></div>
    </div>
  </div>
);

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/responsible-gaming"
                element={<ResponsibleGaming />}
              />
              <Route path="/api-test" element={<ApiTest />} />

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
                path="/casino/:gmid"
                element={
                  <ProtectedRoute>
                    <CasinoGame />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
