import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainHeader } from "./MainHeader";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";

export const MainLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active session

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    // Optional: Redirect to auth page or refresh state
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a472a] flex items-center justify-center shadow-[0_0_20px_rgba(26,71,42,0.3)]">
            <span className="text-white font-black text-3xl italic">M</span>
          </div>
          <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1a472a] w-1/2 animate-[loading_2s_ease-in-out_infinite]" />
          </div>
          <span className="text-[#1a472a] font-mono text-xs uppercase tracking-widest animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    // Using h-[125vh] to compensate for body zoom: 0.8 (100 / 0.8 = 125)
    <div className="h-[125vh] bg-[#f0f2f5] text-foreground flex flex-col overflow-hidden font-sans">
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:block shadow-sm z-50">
        <MainHeader
          session={session}
          handleLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Mobile Header - Visible on Mobile */}
      <MobileHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar: Fixed on Desktop, Drawer on Mobile */}
        <div
          className={`
                    fixed md:static inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:flex md:w-64 md:border-r md:border-gray-200 md:flex-col
                `}
        >
          <Sidebar />
          {/* Overlay close button for mobile when sidebar is open */}
          <button
            className="md:hidden absolute top-4 right-4 text-gray-800 hover:text-red-500 bg-white/90 p-2 rounded-full backdrop-blur-sm z-[100] transition-colors border border-gray-200 shadow-sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f0f2f5] relative scroll-smooth pb-32 md:pb-32 w-full">
          <div className="max-w-[1600px] mx-auto w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
