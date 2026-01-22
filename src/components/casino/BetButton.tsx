import { cn } from "@/lib/utils";

interface BetMarket {
  sid: number;
  nat: string;
  b: number;
  bs: number;
  sr: number;
  gstatus: "ACTIVE" | "SUSPENDED";
  min: number;
  max: number;
  subtype: string;
  etype: string;
}

interface BetButtonProps {
  market: BetMarket;
  onClick?: () => void;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  className?: string;
}

export function BetButton({
  market,
  onClick,
  variant = "primary",
  className,
}: BetButtonProps) {
  const isActive = market.gstatus === "ACTIVE";
  const odds = market.b || 0;

  // Color variants
  const variantClasses = {
    primary: "from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600",
    success: "from-green-500 via-green-600 to-green-700 hover:from-green-600",
    danger: "from-red-500 via-red-600 to-red-700 hover:from-red-600",
    warning:
      "from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600",
    secondary: "from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={cn(
        "relative overflow-hidden rounded-lg",
        "px-4 py-6 transition-all duration-200",
        "transform hover:scale-105 active:scale-95",
        "shadow-lg hover:shadow-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        isActive && "animate-pulse-subtle",
        className,
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          variantClasses[variant],
          !isActive && "grayscale",
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Market name */}
        <div className="text-sm font-semibold text-white/90 uppercase tracking-wide">
          {market.nat}
        </div>

        {/* Odds display */}
        <div className="text-3xl font-bold text-white font-mono">
          {odds.toFixed(2)}
        </div>

        {/* Min/Max */}
        <div className="text-xs text-white/70">
          ₹{market.min} - ₹{market.max.toLocaleString()}
        </div>
      </div>

      {/* Suspended overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <span className="text-white text-sm font-bold px-3 py-1 bg-red-600 rounded-full">
            SUSPENDED
          </span>
        </div>
      )}

      {/* Pulse effect when active */}
      {isActive && (
        <div className="absolute inset-0 bg-white/10 animate-ping opacity-20" />
      )}
    </button>
  );
}

interface BetButtonGridProps {
  markets: BetMarket[];
  onBet?: (market: BetMarket) => void;
  columns?: 2 | 3 | 4;
}

export function BetButtonGrid({
  markets,
  onBet,
  columns = 3,
}: BetButtonGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns])}>
      {markets.map((market) => (
        <BetButton
          key={market.sid}
          market={market}
          onClick={() => onBet?.(market)}
        />
      ))}
    </div>
  );
}
