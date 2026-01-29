import { cn } from "@/lib/utils";

interface CasinoChipProps {
  amount?: number | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const CasinoChip = ({
  amount,
  size = "md",
  className,
}: CasinoChipProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <img
      src="/chip.png"
      alt="Casino Chip"
      className={cn(
        "inline-block object-contain align-middle",
        sizeClasses[size],
        className
      )}
    />
  );
};

interface ChipAmountProps {
  amount: number | string;
  size?: "sm" | "md" | "lg";
  showChip?: boolean;
  className?: string;
}

export const ChipAmount = ({
  amount,
  size = "md",
  showChip = true,
  className,
}: ChipAmountProps) => {
  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const chipSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  };

  const formattedAmount = typeof amount === "number" 
    ? amount.toLocaleString() 
    : amount;

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-bold align-middle", textSizes[size], className)}>
      {showChip && <CasinoChip size={chipSizes[size]} />}
      {formattedAmount}
    </span>
  );
};
