import { useNavigate } from "react-router-dom";
import { ChevronRight, Play, Activity } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCasinoGames,
  getImageCandidates,
  inferCategory,
} from "@/services/casino";
import { CasinoGame } from "@/types/casino";
import { Badge } from "@/components/ui/badge";

const GameThumbnail = ({ game }: { game: CasinoGame }) => {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageUrls = useMemo(
    () => getImageCandidates(game.imgpath),
    [game.imgpath],
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      setError(true);
    }
  };

  const imageUrl = imageUrls[currentImageIndex];

  if (error) {
    return (
      <div className="h-[180px] md:h-[220px] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
        <h3 className="text-white text-xs font-bold px-2 text-center uppercase">
          {game.gname}
        </h3>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary text-black rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play fill="currentColor" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[180px] md:h-[220px] relative bg-slate-900">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
          <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={game.gname}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${!isLoaded ? "opacity-0" : "opacity-100"}`}
        onError={handleImageError}
        onLoad={() => setIsLoaded(true)}
      />

      {/* Live Badge */}
      {game.isLive && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-red-600 text-white border-0 h-4 px-1.5 text-[9px] font-black uppercase shadow-lg animate-pulse">
            LIVE
          </Badge>
        </div>
      )}

      {/* Play Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-primary text-black rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
          <Play fill="currentColor" size={24} />
        </div>
      </div>
    </div>
  );
};

export const CasinoShowcase = () => {
  const navigate = useNavigate();

  // Fetch games exactly like Casino Live page
  const { data: games, isLoading } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
    staleTime: 10 * 60 * 1000,
  });

  // Select representative games for the showcase
  const showcaseGames = useMemo(() => {
    if (!games) return [];

    // Filter out some good candidates manually or just take top ones
    // We want a mix of Teen Patti, Roulette, etc.
    const categories = [
      "Teen Patti",
      "Roulette",
      "Dragon Tiger",
      "Andar Bahar",
      "Poker",
      "Baccarat",
      "Lucky 7",
      "32 Cards",
    ];
    const selected: CasinoGame[] = [];
    const usedCategories = new Set();
    const usedNames = new Set();

    // First try to find one good game for each category
    categories.forEach((cat) => {
      const candidate = games.find((g) => {
        const category = inferCategory(g);
        return category.includes(cat) && !usedNames.has(g.gname);
      });
      if (candidate) {
        selected.push(candidate);
        usedCategories.add(cat);
        usedNames.add(candidate.gname);
      }
    });

    // Fill remaining spots with other popular games if needed to reach 8-10 cards
    if (selected.length < 8) {
      games.forEach((g) => {
        if (selected.length < 10 && !usedNames.has(g.gname)) {
          selected.push(g);
          usedNames.add(g.gname);
        }
      });
    }

    return selected;
  }, [games]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white italic">
            CASINO GAMES
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] md:w-[240px] h-[260px] bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white italic">
          CASINO GAMES
        </h2>
        <button
          onClick={() => navigate("/casino-live")}
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          View Lobby
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {showcaseGames.map((game) => (
          <div
            key={game.gmid}
            onClick={() => navigate(`/casino/${game.gmid}`)}
            className="group relative flex-shrink-0 w-[200px] md:w-[240px] bg-[#1e2837] rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all border border-gray-700 shadow-lg"
          >
            <GameThumbnail game={game} />

            {/* Game Info */}
            <div className="p-3 bg-[#1e2837] relative z-10">
              <h3 className="text-white font-bold text-sm md:text-base truncate">
                {game.gname}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {inferCategory(game)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
