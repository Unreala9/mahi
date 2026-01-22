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

  const variantClasses = {
    primary: "border-primary/30",
    success: "border-primary/30",
    danger: "border-destructive/30",
    warning: "border-primary/30",
    secondary: "border-border",
  };

  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={cn(
        "relative overflow-hidden",
        "px-3 py-3 border bg-background text-foreground",
        "transition-colors",
        "hover:bg-muted",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
    >
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide truncate">
            {market.nat}
          </div>
          <div className="text-[11px] text-muted-foreground">
            ₹{market.min} - ₹{market.max.toLocaleString()}
          </div>
        </div>
        <div className="text-lg font-semibold font-mono tabular-nums">
          {odds.toFixed(2)}
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
