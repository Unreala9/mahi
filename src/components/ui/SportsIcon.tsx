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
const getSportIconClass = (sportName: string, sportId?: number): string => {
  const name = sportName.toLowerCase();

  // Map by sport name to Sidearm icon class
  if (name.includes("cricket")) return "s-icon s-icon-sport-cricket";
  if (name.includes("football") && !name.includes("american"))
    return "s-icon s-icon-sport-soccer";
  if (name.includes("american football")) return "s-icon s-icon-sport-football";
  if (name.includes("soccer")) return "s-icon s-icon-sport-soccer";
  if (name.includes("tennis") && !name.includes("table"))
    return "s-icon s-icon-sport-tennis";
  if (name.includes("table tennis")) return "s-icon s-icon-sport-table-tennis";
  if (name.includes("basketball")) return "s-icon s-icon-sport-basketball";
  if (name.includes("volleyball")) return "s-icon s-icon-sport-volleyball";
  if (name.includes("badminton")) return "s-icon s-icon-sport-badminton";
  if (name.includes("baseball")) return "s-icon s-icon-sport-baseball";
  if (name.includes("hockey")) return "s-icon s-icon-sport-ice-hockey";
  if (name.includes("golf")) return "s-icon s-icon-sport-golf";
  if (name.includes("rugby")) return "s-icon s-icon-sport-rugby";
  if (name.includes("horse")) return "s-icon s-icon-sport-horse-racing";
  if (name.includes("greyhound")) return "s-icon s-icon-sport-greyhound";
  if (
    name.includes("esoccer") ||
    name.includes("e-sports") ||
    name.includes("esports") ||
    name.includes("e games")
  )
    return "s-icon s-icon-sport-esports";
  if (name.includes("boxing")) return "s-icon s-icon-sport-boxing";
  if (name.includes("mma") || name.includes("martial"))
    return "s-icon s-icon-sport-mma";
  if (name.includes("cycling")) return "s-icon s-icon-sport-cycling";
  if (name.includes("darts")) return "s-icon s-icon-sport-darts";
  if (name.includes("snooker")) return "s-icon s-icon-sport-snooker";
  if (name.includes("handball")) return "s-icon s-icon-sport-handball";
  if (name.includes("kabaddi")) return "s-icon s-icon-sport-kabaddi";
  if (name.includes("motorsport") || name.includes("motor"))
    return "s-icon s-icon-sport-motorsport";

  // Default fallback
  return "s-icon s-icon-sport-trophy";
};

/**
 * SportsIcon component - renders sports icons using Sidearm CSS classes
 */
export const SportsIcon = ({
  sportName,
  sportId,
  size = 18,
  className,
}: SportsIconProps) => {
  const iconClass = getSportIconClass(sportName, sportId);

  return (
    <i
      className={cn(iconClass, "inline-block align-middle", className)}
      style={{ fontSize: `${size}px` }}
      aria-label={sportName}
    />
  );
};
