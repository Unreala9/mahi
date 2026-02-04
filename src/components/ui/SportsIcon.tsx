import { cn } from "@/lib/utils";

interface SportsIconProps {
  sportName: string;
  sportId?: number;
  size?: number;
  className?: string;
}

/**
 * Maps sport names to emoji/unicode sports symbols
 * Using Unicode sports symbols that work across all browsers
 */
const getSportEmoji = (sportName: string, sportId?: number): string => {
  const name = sportName.toLowerCase();

  // Map by sport name to emoji
  if (name.includes("cricket")) return "🏏";
  if (name.includes("football") && !name.includes("american")) return "⚽";
  if (name.includes("american football")) return "🏈";
  if (name.includes("soccer")) return "⚽";
  if (name.includes("tennis") && !name.includes("table")) return "🎾";
  if (name.includes("table tennis")) return "🏓";
  if (name.includes("basketball")) return "🏀";
  if (name.includes("volleyball")) return "🏐";
  if (name.includes("badminton")) return "🏸";
  if (name.includes("baseball")) return "⚾";
  if (name.includes("hockey")) return "🏒";
  if (name.includes("golf")) return "⛳";
  if (name.includes("rugby")) return "🏉";
  if (name.includes("horse racing") || name.includes("racing")) return "🏇";
  if (name.includes("greyhound")) return "🐕";
  if (
    name.includes("esoccer") ||
    name.includes("e-sports") ||
    name.includes("esports") ||
    name.includes("e games")
  )
    return "🎮";
  if (name.includes("swimming") || name.includes("swim")) return "🏊";
  if (name.includes("boxing")) return "🥊";
  if (name.includes("wrestling")) return "🤼";
  if (name.includes("gymnastics")) return "🤸";
  if (name.includes("softball")) return "🥎";
  if (name.includes("bowling")) return "🎳";
  if (name.includes("cycling")) return "🚴";
  if (name.includes("fencing")) return "🤺";
  if (name.includes("rowing")) return "🚣";
  if (name.includes("sailing")) return "⛵";
  if (name.includes("water polo")) return "🤽";
  if (name.includes("squash")) return "🎾";
  if (name.includes("athletics") || name.includes("track")) return "🏃";
  if (name.includes("chess")) return "♟️";
  if (name.includes("darts")) return "🎯";
  if (name.includes("snooker")) return "🎱";
  if (name.includes("beach volleyball")) return "🏖️";

  // Default fallback
  return "🏆";
};

/**
 * SportsIcon component - renders sports emoji icons
 */
export const SportsIcon = ({
  sportName,
  sportId,
  size = 18,
  className,
}: SportsIconProps) => {
  const emoji = getSportEmoji(sportName, sportId);

  return (
    <span
      className={cn(
        "sports-icon inline-flex items-center justify-center flex-shrink-0",
        className,
      )}
      style={{ fontSize: `${size}px` }}
      role="img"
      aria-label={sportName}
    >
      {emoji}
    </span>
  );
};
