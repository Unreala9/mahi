import { cn } from "@/lib/utils";

interface BettingChipProps {
  amount: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BettingChip({
  amount,
  selected = false,
  onClick,
  className,
}: BettingChipProps) {
  // Format amount for display
  const formatAmount = (amt: number): string => {
    if (amt >= 100000) return `₹${amt / 100000}L`;
    if (amt >= 1000) return `₹${amt / 1000}K`;
    return `₹${amt}`;
  };

  // Assign colors based on amount
  const getChipColor = (amt: number): string => {
    if (amt >= 100000) return "from-purple-500 via-purple-600 to-purple-700";
    if (amt >= 10000) return "from-yellow-500 via-yellow-600 to-yellow-700";
    if (amt >= 5000) return "from-red-500 via-red-600 to-red-700";
    if (amt >= 1000) return "from-green-500 via-green-600 to-green-700";
    if (amt >= 500) return "from-blue-500 via-blue-600 to-blue-700";
    return "from-gray-400 via-gray-500 to-gray-600";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-14 h-14 rounded-full flex items-center justify-center",
        "transition-all duration-200 transform hover:scale-110",
        "shadow-lg hover:shadow-xl",
        selected && "ring-4 ring-white ring-opacity-80 scale-110",
        className,
      )}
    >
      {/* Chip outer ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br",
          getChipColor(amount),
          "border-4 border-white/30",
        )}
      />

      {/* Inner circle with dashed border */}
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/40" />

      {/* Amount text */}
      <span className="relative z-10 text-white font-bold text-xs drop-shadow-md">
        {formatAmount(amount)}
      </span>
    </button>
  );
}

interface BettingChipSelectorProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  amounts?: number[];
}

export function BettingChipSelector({
  selectedAmount,
  onAmountChange,
  amounts = [100, 500, 1000, 5000, 10000, 100000],
}: BettingChipSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-center">
      {amounts.map((amount) => (
        <BettingChip
          key={amount}
          amount={amount}
          selected={selectedAmount === amount}
          onClick={() => onAmountChange(amount)}
        />
      ))}
    </div>
  );
}
