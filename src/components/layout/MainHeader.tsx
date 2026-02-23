import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Wallet,
  Bell,
  Search,
  Terminal,
  Download,
  FileText,
  Smartphone,
} from "lucide-react";
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
    : session?.user?.email?.split("@")[0] || "ACCOUNT";

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

  // Primary navigation for Header bottom bar
  const navItems = [
    { label: "IN-PLAY", to: "/in-play" },
    { label: "SPORTSBOOK", to: "/sports" },
    { label: "MY BETS", to: "/bets" },
    { label: "LIVE CASINO", to: "/casino-live" },
    { label: "CASINO GAMES", to: "/casino" },
  ];

  const marqueeText =
    "Welcome to Rana365 - The Next Generation Sports Betting & Casino Exchange! Bet on your favorite sports and play live casino games here.";

  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full font-sans shadow-sm">
      {/* Top bar (Dark Green) */}
      <div className="bg-[#1a472a] relative overflow-hidden">
        <div className="h-[72px] px-4 md:px-6 flex items-center justify-between gap-4 relative z-10 mx-auto max-w-[1600px]">
          <div className="flex items-center gap-6 min-w-0">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center h-full py-1">
                <img
                  src="./images/logo1.png"
                  alt="Mahi Exchange"
                  className="h-15 md:h-24 w-auto object-contain drop-shadow-sm"
                />
              </div>
            </Link>

            {/* Search Bar - hidden on small screens */}
            <div className="hidden lg:flex items-center bg-white/10 rounded-full px-3 py-1.5 w-64 border border-white/20 focus-within:border-white/50 focus-within:bg-white/15 transition-all">
              <Search className="h-4 w-4 text-white/70" />
              <input
                type="text"
                placeholder="Search Events..."
                className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm flex-shrink-0">
            {/* Utility Links */}
            <div className="hidden lg:flex items-center gap-4 mr-4 text-[13px] font-medium text-white/80">
              <Link
                to="/rules"
                className="hover:text-white transition-colors flex items-center gap-1 group"
              >
                <FileText className="h-3.5 w-3.5" />
                Rules
              </Link>
              <span className="w-px h-3 bg-white/20"></span>
              <button className="hover:text-white transition-colors flex items-center gap-1 group">
                <Smartphone className="h-3.5 w-3.5" />
                Download App
              </button>
            </div>

            {isAuthed ? (
              <>
                {/* Balance Display */}
                <div className="flex items-center bg-white/10 rounded overflow-hidden border border-white/20 h-9">
                  <div className="px-3 h-full flex flex-col justify-center border-r border-white/20">
                    <span className="text-[10px] text-white/70 font-medium leading-none mb-0.5">
                      Credit
                    </span>
                    <span className="font-mono text-white font-bold text-xs leading-none">
                      <ChipAmount amount={Number(balance)} size="sm" />
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-full w-9 px-0 text-white hover:bg-white/20 rounded-none"
                    onClick={() => navigate("/wallet")}
                    aria-label="Wallet"
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 px-3 bg-white/10 border-white/20 text-white hover:bg-white/20 border-0 hover:text-white font-medium rounded"
                    >
                      {userLabel}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-56 bg-white border border-gray-200 text-gray-800 rounded shadow-lg p-0"
                  >
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 rounded-t">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">
                        {userLabel.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {session?.user?.email || "Demo User"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ID: {session?.user?.id?.substring(0, 8) || "demo"}
                        </span>
                      </div>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem
                        onClick={() => navigate("/wallet")}
                        className="rounded hover:bg-gray-100 focus:bg-gray-100 text-xs font-medium py-2 cursor-pointer"
                      >
                        Account Statement
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/bets")}
                        className="rounded hover:bg-gray-100 focus:bg-gray-100 text-xs font-medium py-2 cursor-pointer"
                      >
                        Current Bets
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="rounded hover:bg-gray-100 focus:bg-gray-100 text-xs font-medium py-2 cursor-pointer"
                      >
                        Settings
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="rounded hover:bg-red-50 focus:bg-red-50 text-red-600 text-xs font-bold py-2 cursor-pointer border-t border-gray-100 mt-1"
                        >
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="p-1">
                      <DropdownMenuItem
                        onClick={async () => {
                          await handleLogout?.();
                        }}
                        className="rounded hover:bg-gray-100 focus:bg-gray-100 text-gray-600 text-xs font-medium py-2 cursor-pointer"
                      >
                        Logout
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  className="h-9 px-5 bg-[#f28729] hover:bg-[#d6711c] text-white font-bold text-sm tracking-wide rounded-sm border-none shadow-sm"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button
                  className="h-9 px-5 bg-white hover:bg-gray-100 text-[#1a472a] font-bold text-sm tracking-wide rounded-sm border border-gray-300 shadow-sm"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Light/White background as per Rana365 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 md:px-6 flex items-center justify-center lg:justify-start overflow-x-auto scrollbar-hide max-w-[1600px] mx-auto">
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`
                    py-3 text-[13px] font-bold uppercase transition-colors relative whitespace-nowrap
                    ${active ? "text-[#1a472a]" : "text-gray-600 hover:text-[#1a472a]"}
                  `}
                >
                  {item.label}
                  {/* Active Indicator - Bullet or Dot like Rana365 */}
                  {active && (
                    <div className="absolute top-1/2 -left-3 w-1.5 h-1.5 bg-[#f28729] rounded-full transform -translate-y-1/2"></div>
                  )}
                  {/* Active Bottom Border Line */}
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a472a] rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Marquee Bar - Teal/Gradient */}
      <div className="bg-gradient-to-r from-[#00b4db] to-[#0083b0] text-white overflow-hidden h-7 flex items-center shadow-inner">
        <div className="w-full overflow-hidden text-[12px] h-full flex items-center">
          <div className="animate-marquee pl-[100%] whitespace-nowrap flex items-center">
            <span className="font-medium flex items-center mx-4 gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {marqueeText}
            </span>
            <span className="font-medium flex items-center mx-4 gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {marqueeText}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
