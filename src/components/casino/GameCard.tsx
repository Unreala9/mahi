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
      className="group relative aspect-square overflow-hidden cursor-pointer border border-border hover:bg-muted transition-colors"
      onClick={onClick}
    >
      {/* Image */}
      {!imageError && imageSrc ? (
        <>
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <img
            src={imageSrc}
            alt={game.gname}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${!isImageLoaded ? "opacity-0" : "opacity-100"}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-xs text-muted-foreground font-semibold text-center px-2">
            {game.gname}
          </p>
        </div>
      )}

      {/* Name Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur px-2 py-1">
        <p className="text-xs font-semibold text-foreground truncate">
          {game.gname}
        </p>
      </div>
    </Card>
  );
};

export const GameCard = memo(GameCardComponent);
