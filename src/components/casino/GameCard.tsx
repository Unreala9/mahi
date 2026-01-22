import { CasinoGame } from "@/types/casino";
import { Card } from "@/components/ui/card";
import { getImageUrlForGame } from "@/services/casino";
import { useMemo, useState, memo } from "react";

interface GameCardProps {
  game: CasinoGame;
  onClick?: () => void;
}

const GameCardComponent = ({ game, onClick }: GameCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageCandidates = useMemo(
    () => getImageUrlForGame(game),
    [game.imgpath, game.cid],
  );
  const imageSrc = imageCandidates[0] || "";

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <Card
      className="group relative aspect-square bg-slate-900 overflow-hidden cursor-pointer border-2 border-white/10 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/20 transition-all duration-200 rounded-sm"
      onClick={onClick}
    >
      {/* Image */}
      {!imageError && imageSrc ? (
        <>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageSrc}
            alt={game.gname}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${!isImageLoaded ? "opacity-0" : "opacity-100"}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <p className="text-xs text-white/60 uppercase font-bold text-center px-2">
            {game.gname}
          </p>
        </div>
      )}

      {/* Name Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-2 py-1.5">
        <p className="text-xs font-bold uppercase text-white truncate">
          {game.gname}
        </p>
      </div>
    </Card>
  );
};

export const GameCard = memo(GameCardComponent);
