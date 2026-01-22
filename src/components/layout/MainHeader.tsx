import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletBalance } from "@/hooks/api/useWallet";

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

  const walletQuery = useWalletBalance({
    enabled: !isDemo && Boolean(session?.user),
    staleTime: 5000,
    refetchOnWindowFocus: false,
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

  const navItems = [
    { label: "HOME", to: "/" },
    { label: "LOTTERY", to: "/games" },
    { label: "CRICKET", to: "/sports?sport=4" },
    { label: "TENNIS", to: "/sports?sport=2" },
    { label: "FOOTBALL", to: "/sports?sport=1" },
    { label: "TABLE TENNIS", to: "/sports?sport=3" },
    { label: "BACCARAT", to: "/casino?cat=baccarat" },
    { label: "32 CARDS", to: "/casino?cat=32-cards" },
    { label: "TEENPATTI", to: "/casino?cat=teenpatti" },
    { label: "POKER", to: "/casino?cat=poker" },
    { label: "LUCKY 7", to: "/casino?cat=lucky-7" },
    { label: "CRASH", to: "/casino?cat=others" },
  ];

  const isActive = (to: string) => {
    const [path] = to.split("?");
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground border-b border-border">
        <div className="h-14 px-3 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden p-1"
              onClick={onToggleSidebar}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src="/mahiex.png" alt="" className="h-7 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              className="hidden sm:inline-flex hover:underline"
              onClick={() => navigate("/terms")}
            >
              Rules
            </button>
            <button
              type="button"
              className="hidden sm:inline-flex hover:underline"
              onClick={() => navigate("/contact")}
            >
              Download Apk
            </button>

            <div className="hidden md:block font-semibold">
              Balance:{" "}
              <span className="font-mono">₹{Number(balance).toLocaleString()}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9 px-3 rounded-none"
                >
                  {userLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-card border-b border-border">
        <div className="h-11 px-3 md:px-6 flex items-center overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={
                  "px-3 py-2 text-xs font-semibold tracking-wide border-b-2 " +
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
