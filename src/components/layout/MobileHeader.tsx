import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Wallet } from "lucide-react";
import { useWalletBalance } from "@/hooks/api/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { ChipAmount } from "@/components/ui/CasinoChip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export const MobileHeader = ({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isDemo = useMemo(
    () => localStorage.getItem("demo_session") === "true",
    [],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user && !isDemo) {
        setSessionReady(true);
        checkAdmin(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user && !isDemo) {
        setSessionReady(true);
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const checkAdmin = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    setIsAdmin(profileData?.role === "admin");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (isDemo) {
      localStorage.removeItem("demo_session");
      window.dispatchEvent(new Event("storage"));
    }
    navigate("/auth");
  };

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
    ? "DEMO"
    : (session?.user?.email?.split("@")[0] || "USER").toUpperCase();
  const isAuthed = isDemo || Boolean(session?.user);

  return (
    <div className="md:hidden bg-[#1a472a] sticky top-0 z-40 w-full shadow-sm">
      {/* Top Bar: Hamburger, Logo, Balance, User */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleSidebar} className="text-white p-1">
            <Menu size={24} />
          </button>

          <div
            className="text-lg font-bold font-display text-white tracking-tight flex items-center"
            onClick={() => navigate("/")}
          >
            <img src="./images/logo1.png" alt="Logo" className="h-8 w-auto" />
          </div>
        </div>

        {isAuthed ? (
          <>
            <div className="flex items-center gap-2">
              {/* Center: Balance */}
              <div
                className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-2 py-1 rounded cursor-pointer"
                onClick={() => navigate("/wallet")}
              >
                <span className="text-white font-mono font-bold text-xs">
                  <ChipAmount amount={balance} size="sm" />
                </span>
                <Wallet size={12} className="text-white/70 ml-0.5" />
              </div>

              {/* Right: User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="bg-white/10 border border-white/20 px-2 py-1 rounded flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-[10px] font-bold text-white uppercase truncate max-w-[60px]">
                        {userLabel}
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 bg-white border border-gray-200 text-gray-800 rounded shadow-lg p-0 z-50"
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
                  <div className="p-1 pb-1.5">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded hover:bg-gray-100 focus:bg-gray-100 text-gray-600 text-xs font-medium py-2 cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 text-[10px] px-3 font-bold uppercase tracking-wider bg-[#f28729] text-white hover:bg-[#d6711c] border-none"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="h-7 text-[10px] px-3 font-bold uppercase tracking-wider bg-white text-[#1a472a] hover:bg-gray-100 border-none"
              onClick={() => navigate("/auth?mode=signup")}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Marquee Ticker */}
      <div className="bg-gradient-to-r from-[#00b4db] to-[#0083b0] py-1 px-4 overflow-hidden h-6 flex items-center">
        <div className="whitespace-nowrap animate-marquee text-[10px] font-medium text-white tracking-wide">
          Welcome to Rana365 - The Next Generation Sports Betting & Casino
          Exchange! Bet on your favorite sports and play live casino games here.
        </div>
      </div>
    </div>
  );
};
