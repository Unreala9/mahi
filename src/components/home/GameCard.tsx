import { Play } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    thumbnail: string;
    provider?: string;
    isLive?: boolean;
  };
  onClick?: () => void;
}

export const GameCard = ({ game, onClick }: GameCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] bg-gray-900">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/300x400/1a1f2e/white?text=" +
              encodeURIComponent(game.title);
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Live Badge */}
        {game.isLive && (
          <div className="absolute top-2 left-2">
            <span className="live-badge text-xs px-2 py-1">LIVE</span>
          </div>
        )}

        {/* Provider Badge */}
        {game.provider && (
          <div className="absolute top-2 right-2">
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-medium">
              {game.provider}
            </span>
          </div>
        )}
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <h3 className="text-white text-sm font-bold line-clamp-2">
          {game.title}
        </h3>
      </div>
    </div>
  );
};
