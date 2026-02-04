import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Wallet } from "lucide-react";
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
    ? "Demo"
    : session?.user?.email?.split("@")[0] || "Account";

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
    { label: "LIVE CASINO", to: "/casino-live" },
    { label: "SLOT GAME", to: "/casino" },
  ];

  const marqueeText =
    "NEWLY LAUNCHED CASINO GAME *MATKA MARKET* EVERY HOUR OPEN & CLOSE MARKET WITH LIVE DEALER";

  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground border-b border-border">
        <div className="h-14 px-3 md:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden p-1"
              onClick={onToggleSidebar}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm flex-shrink-0">
            <div className="hidden sm:flex items-center gap-4">
              <button
                type="button"
                className="hover:underline"
                onClick={() => navigate("/terms")}
              >
                Rules
              </button>
              <button
                type="button"
                className="hover:underline"
                onClick={() => navigate("/contact")}
              >
                Download Apk
              </button>
            </div>

            <div className="flex items-center gap-2 whitespace-nowrap font-semibold">
              <span>
                Balance:{" "}
                <span className="font-mono">
                  <ChipAmount amount={Number(balance)} size="sm" />
                </span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-2"
                onClick={() => navigate("/wallet")}
                aria-label="Wallet"
              >
                <Wallet className="h-4 w-4" />
              </Button>
            </div>

            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-9 px-3">
                    {userLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  portalled={false}
                  className="w-56"
                >
                  <DropdownMenuItem onClick={() => navigate("/wallet")}>
                    Account Statement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bets")}>
                    Current Bet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/casino-live")}>
                    Casino Results
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Set Button Values
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await handleLogout?.();
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-3"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Header marquee (loop) */}
      <div className="bg-secondary text-secondary-foreground border-b border-border">
        <div className="h-7 px-3 md:px-6 flex items-center overflow-hidden">
          <div className="flex w-max whitespace-nowrap animate-marquee">
            <div className="flex items-center gap-10 text-[11px] font-semibold italic uppercase tracking-wide">
              <span>{marqueeText}</span>
              <span aria-hidden="true">{marqueeText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-card border-b border-border">
        <div className="px-3 md:px-6 py-2 flex items-center">
          <div className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={
                  "px-2 py-1 text-[11px] font-semibold tracking-wide border-b-2 " +
                  (isActive(item.to)
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
