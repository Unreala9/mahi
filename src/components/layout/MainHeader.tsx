import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Wallet, Bell, Search, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { ChipAmount } from "@/components/ui/CasinoChip";

function getDemoBalanceFromStorage(): number {
  try {
    const raw = localStorage.getItem("mahiexchange_demo_store");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const balance = Number(parsed?.balance ?? 0);
    return Number.isFinite(balance) ? balance : 0;
  } catch {
    return 0;
  }
}

interface MainHeaderProps {
  session?: any;
  handleLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const MainHeader = ({
  session,
  handleLogout,
  onToggleSidebar,
}: MainHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDemo = useMemo(
    () => localStorage.getItem("demo_session") === "true",
    [],
  );

  // Track if session is fully ready with valid token
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (isDemo || !session?.user) {
      setSessionReady(false);
      return;
    }

    // Verify session has valid access token before enabling queries
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSessionReady(Boolean(currentSession?.access_token));
    };

    checkSession();
  }, [session?.user, isDemo]);

  const walletQuery = useWalletBalance({
    enabled: !isDemo && sessionReady && Boolean(session?.user),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const [demoBalance, setDemoBalance] = useState<number>(() =>
    isDemo ? getDemoBalanceFromStorage() : 0,
  );

  useEffect(() => {
    if (!isDemo) return;

    const handler = () => setDemoBalance(getDemoBalanceFromStorage());
    window.addEventListener("demo-store-updated", handler);
    return () => window.removeEventListener("demo-store-updated", handler);
  }, [isDemo]);

  const balance = isDemo ? demoBalance : (walletQuery.data ?? 0);
  const userLabel = isDemo
    ? "DEMO_USER"
    : (session?.user?.email?.split("@")[0] || "ACCOUNT").toUpperCase();

  const isAuthed = isDemo || Boolean(session?.user);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!session?.user || isDemo) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      setIsAdmin(profileData?.role === "admin");
    };

    checkAdmin();
  }, [session?.user, isDemo]);

  const navItems = [
    { label: "HOME", to: "/" },
    { label: "IN-PLAY", to: "/in-play" },
    { label: "SPORTSBOOK", to: "/sports" },
    { label: "OUR CASINO", to: "/casino" },
    { label: "MY BETS", to: "/bets" },
  ];

  const marqueeText =
    "NEWLY LAUNCHED CASINO GAME *MATKA MARKET* EVERY HOUR OPEN & CLOSE MARKET WITH LIVE DEALER /// LATEST ODDS UPDATED /// ";

  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full font-sans">
      {/* Top bar */}
      <div className="bg-[#050b14] border-b border-white/5 relative overflow-hidden">
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />

        <div className="h-20 px-4 md:px-6 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            {/* New Branding for Mobile/Header */}
            <div className="flex items-center gap-2">
              <img
                src="/mahiexchange.png"
                alt="MahiExchange"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm flex-shrink-0">
            {/* Utility Links */}
            <div className="hidden lg:flex items-center gap-6 mr-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <button className="hover:text-primary transition-colors flex items-center gap-1 group">
                <span className="w-1 h-1 bg-gray-600 group-hover:bg-primary rounded-full transition-colors" />{" "}
                Rules
              </button>
              <button className="hover:text-primary transition-colors flex items-center gap-1 group">
                <span className="w-1 h-1 bg-gray-600 group-hover:bg-primary rounded-full transition-colors" />{" "}
                Download App
              </button>
            </div>

            {/* Balance Display - Terminal Style */}
            <div className="flex items-center gap-px bg-[#0a1120] border border-white/10 h-10 group hover:border-primary/50 transition-colors">
              <div className="px-3 h-full flex flex-col justify-center border-r border-white/5">
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">
                  Total Balance
                </span>
                <span className="font-mono text-primary font-bold text-sm leading-none tracking-tight">
                  <ChipAmount amount={Number(balance)} size="sm" />
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-full w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-none"
                onClick={() => navigate("/wallet")}
                aria-label="Wallet"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            </div>

            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-4 bg-[#0a1120] border-white/10 text-white hover:bg-white/5 hover:text-primary hover:border-primary/50 text-[10px] font-bold uppercase tracking-wider rounded-none gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {userLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-64 bg-[#0a1120] border-white/10 text-gray-300 rounded-none p-0 backdrop-blur-xl"
                >
                  <div className="p-3 border-b border-white/5 bg-black/20">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">
                      Logged In As
                    </p>
                    <p className="font-mono text-white text-xs truncate">
                      {session?.user?.email || "Demo User"}
                    </p>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem
                      onClick={() => navigate("/wallet")}
                      className="rounded-none focus:bg-white/5 focus:text-primary text-[11px] font-bold uppercase tracking-wide py-2.5 cursor-pointer"
                    >
                      Account Statement
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/bets")}
                      className="rounded-none focus:bg-white/5 focus:text-primary text-[11px] font-bold uppercase tracking-wide py-2.5 cursor-pointer"
                    >
                      Current Bets
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/casino-live")}
                      className="rounded-none focus:bg-white/5 focus:text-primary text-[11px] font-bold uppercase tracking-wide py-2.5 cursor-pointer"
                    >
                      Casino Results
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="rounded-none focus:bg-white/5 focus:text-primary text-[11px] font-bold uppercase tracking-wide py-2.5 cursor-pointer"
                    >
                      Settings
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="rounded-none focus:bg-white/5 focus:text-red-400 text-red-500 text-[11px] font-bold uppercase tracking-wide py-2.5 cursor-pointer"
                      >
                        Admin Control Panel
                      </DropdownMenuItem>
                    )}
                  </div>
                  <div className="h-px bg-white/5 my-1" />
                  <div className="p-1 pb-1.5">
                    <DropdownMenuItem
                      onClick={async () => {
                        await handleLogout?.();
                      }}
                      className="rounded-none focus:bg-red-500/10 focus:text-red-500 text-gray-500 text-[10px] font-bold uppercase tracking-wide py-2 cursor-pointer justify-center"
                    >
                      Terminate Session
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="h-10 px-6 bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-white hover:scale-105 transition-all rounded-none"
                onClick={() => navigate("/auth")}
              >
                Access Terminal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Marquee Bar - Terminal Tape Style */}
      <div className="bg-primary text-black border-b border-primary/50 relative overflow-hidden h-8 flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary to-transparent z-10" />

        <div className="w-full overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-4">
              {marqueeText}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-4">
              {marqueeText}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-4">
              {marqueeText}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#050b14] border-b border-white/5">
        <div className="px-4 md:px-6 flex items-center justify-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center">
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`
                    px-6 py-3 text-[10px] font-bold tracking-[0.15em] relative group transition-colors min-w-max
                    ${active ? "text-white" : "text-gray-500 hover:text-gray-300"}
                  `}
                >
                  {item.label}
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                  )}
                  {/* Hover Indicator */}
                  {!active && (
                    <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
