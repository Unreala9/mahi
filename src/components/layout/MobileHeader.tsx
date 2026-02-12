
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
    <div className="md:hidden bg-[#050b14] sticky top-0 z-40 w-full border-b border-white/5 pb-2">
      {/* Top Bar: Hamburger, Logo, Balance, User */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu */}
        <button onClick={onToggleSidebar} className="text-white p-1">
          <Menu size={24} />
        </button>

        {isAuthed ? (
          <>
            {/* Center: Balance (Badge Style) */}
            <div
              className="flex items-center gap-2 bg-[#0a1120] border border-white/10 px-3 py-1.5 rounded-full cursor-pointer"
              onClick={() => navigate("/wallet")}
            >
              <span className="text-primary font-mono font-bold text-xs">
                <ChipAmount amount={balance} size="sm" />
              </span>
              <Wallet size={12} className="text-gray-400 ml-1" />
            </div>

            {/* Right: User Profile (Badge with Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="bg-[#0a1120] border border-white/10 px-2 py-1.5 rounded flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-white uppercase truncate max-w-[60px]">
                      {userLabel}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 bg-[#0a1120] border-white/10 text-gray-300 rounded-none p-0 backdrop-blur-xl z-50"
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
                    onClick={handleLogout}
                    className="rounded-none focus:bg-red-500/10 focus:text-red-500 text-gray-500 text-[10px] font-bold uppercase tracking-wide py-2 cursor-pointer justify-center"
                  >
                    Terminate Session
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-[10px] font-bold uppercase tracking-wider bg-primary text-black hover:bg-white"
              onClick={() => navigate("/auth")}
            >
              Login / Join
            </Button>
          </div>
        )}
      </div>

      {/* Secondary Bar: Highlights (Optional ticker or quick links) */}
      <div className="bg-yellow-400/10 border-y border-yellow-400/20 py-1.5 px-4 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
          Open & Close Market with Live Dealers • Exclusive 500% Bonus on First
          Deposit • Live Cricket World Cup Odds
        </div>
      </div>
    </div>
  );
};
