import { useState, useMemo, useEffect } from "react";
import type { CasinoGame } from "@/types/casino";
import { getImageCandidates } from "@/services/casino";
import { Play, Info } from "lucide-react";

interface CasinoGameCardProps {
  game: CasinoGame;
  onClick: (game: CasinoGame) => void;
  priority?: boolean;
}

export const CasinoGameCard = ({
  game,
  onClick,
  priority = false,
}: CasinoGameCardProps) => {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgIndex, setImgIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Construct candidates including the specific CDN URL that uses gmid
  const candidates = useMemo(() => {
    const list = [
      `https://diamond-api.b-cdn.net/game-image/${game.gmid}/${game.imgpath}`,
      ...getImageCandidates(game.imgpath),
    ];
    return list;
  }, [game.gmid, game.imgpath]);

  useEffect(() => {
    if (candidates && candidates.length > 0) {
      setImgSrc(candidates[0]);
      setImgIndex(0);
      setHasError(false);
    }
  }, [candidates]);

  const handleError = () => {
    const nextIndex = imgIndex + 1;
    if (nextIndex < candidates.length) {
      setImgSrc(candidates[nextIndex]);
      setImgIndex(nextIndex);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className="group relative w-full h-auto bg-white border border-gray-200 transition-all cursor-pointer overflow-hidden rounded shadow-sm hover:shadow-lg hover:-translate-y-1 duration-300"
      onClick={() => onClick(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="w-full h-auto relative overflow-hidden bg-gray-100">
        {/* Main Image - Perfectly Fitted */}
        <img
          src={hasError ? "/placeholder-game.jpg" : imgSrc}
          alt={game.gname}
          className={`relative z-10 w-full h-auto object-cover transition-transform duration-500 ease-out
            ${isHovered ? "scale-105" : "scale-100"}`}
          loading={priority ? "eager" : "lazy"}
          onError={handleError}
        />

        {/* Hover Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 pointer-events-none z-20 ${isHovered ? "opacity-100" : ""}`}
        />
      </div>

      {/* Selection/Active Border Effect */}
      <div
        className={`absolute inset-0 border-2 border-primary/0 rounded-xl transition-all duration-300 pointer-events-none ${isHovered ? "border-primary/50" : ""}`}
      />
    </div>
  );
};
