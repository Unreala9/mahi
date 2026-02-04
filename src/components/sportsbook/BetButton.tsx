import { useState } from "react";
import { useBetPlacement } from "@/hooks/useBetPlacement";
import { Loader2 } from "lucide-react";

interface BetButtonProps {
  apiEventId: string;
  gameName: string;
  marketId: string;
  marketName: string;
  selection: string;
  selectionId?: string;
  odds: number;
  betType: "BACK" | "LAY";
  stake?: number;
  className?: string;
  disabled?: boolean;
}

export const BetButton = ({
  apiEventId,
  gameName,
  marketId,
  marketName,
  selection,
  selectionId,
  odds,
  betType,
  stake = 100,
  className = "",
  disabled = false,
}: BetButtonProps) => {
  const { placeBet, isPlacing } = useBetPlacement();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row expansion

    if (disabled || !odds || odds <= 0) return;

    await placeBet({
      apiEventId,
      gameName,
      marketId,
      marketName,
      selection,
      selectionId,
      odds,
      stake,
      betType,
    });
  };

  const isDisabled = disabled || !odds || odds <= 0 || isPlacing;

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDisabled}
      className={`
        ${className}
        ${betType === "BACK" ? "odds-btn-back" : "odds-btn-lay"}
        relative transition-all
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
        ${isHovered && !isDisabled ? "ring-2 ring-white/30" : ""}
      `}
    >
      {isPlacing ? (
        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
      ) : (
        <div className="text-xs font-bold">
          {odds > 0 ? odds.toFixed(2) : "-"}
        </div>
      )}
    </button>
  );
};
