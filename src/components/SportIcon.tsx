import React, { useState } from "react";
import { getSportIcon } from "../utils/sportIcons";

interface SportIconProps {
  eventId: number;
  size?: number;
  className?: string;
}

// Sport emoji fallbacks if SVG fails to load
const SPORT_EMOJI: Record<number, string> = {
  1: "⚽", // Football
  2: "🎾", // Tennis
  4: "🏏", // Cricket
  5: "⛳", // Golf
  6: "🥊", // Boxing
  8: "🏓", // Table Tennis
  10: "🏇", // Horse Racing
  15: "🏀", // Basketball
  18: "🏐", // Volleyball
  19: "🏒", // Ice Hockey
  22: "🏸", // Badminton
  58: "🏈", // American Football
  59: "🎱", // Snooker
  57: "🎯", // Darts
};

/**
 * SportIcon component - displays the appropriate SVG icon for a given sport event ID
 * Falls back to emoji if SVG fails to load
 *
 * @example
 * <SportIcon eventId={4} size={24} /> // Cricket icon
 * <SportIcon eventId={1} size={32} /> // Football icon
 */
export const SportIcon: React.FC<SportIconProps> = ({
  eventId,
  size = 24,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const iconPath = getSportIcon(eventId);
  const fallbackEmoji = SPORT_EMOJI[eventId] || "🏆";

  // If image failed to load, show emoji
  if (imageError) {
    return (
      <span
        className={`sport-icon-emoji ${className}`}
        style={{
          fontSize: `${size}px`,
          display: "inline-block",
          verticalAlign: "middle",
          lineHeight: 1,
        }}
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, verticalAlign: "middle" }}
    >
      {!imageError && (
        <span
          className="absolute inset-0 bg-current transition-colors duration-200"
          style={{
            WebkitMaskImage: `url(${iconPath})`,
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: `url(${iconPath})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      )}
      <img
        src={iconPath}
        alt={`Sport ${eventId} icon`}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        onError={() => {
          console.warn(
            `Failed to load sport icon for eventId ${eventId}, using emoji fallback`,
          );
          setImageError(true);
        }}
        loading="lazy"
      />
    </div>
  );
};

export default SportIcon;
