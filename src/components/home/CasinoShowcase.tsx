import { useNavigate } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames, getImageCandidates } from "@/services/casino";
import { CasinoGame } from "@/types/casino";

const ReflectiveGameCard = ({
  game,
  onClick,
}: {
  game: CasinoGame;
  onClick: () => void;
}) => {
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

  return (
    <div
      className="group relative flex-shrink-0 w-[200px] md:w-[240px] cursor-pointer perspective-1000"
      onClick={onClick}
    >
      <div className="relative w-full h-auto bg-white overflow-hidden border border-gray-200 group-hover:border-[#1a472a] group-hover:shadow-md rounded-xl transition-all duration-300 z-20">
        {/* Blurred Background for Fill */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125"
          style={{
            backgroundImage: `url(${error ? "/placeholder-game.jpg" : imageUrl})`,
          }}
        />

        {/* Main Image */}
        <img
          src={error ? "/placeholder-game.jpg" : imageUrl}
          alt={game.gname}
          className={`relative z-10 w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 ${!isLoaded ? "opacity-0" : "opacity-100"}`}
          onError={handleImageError}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
};

export const CasinoShowcase = () => {
  const navigate = useNavigate();

  const { data: games, isLoading } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
    staleTime: 10 * 60 * 1000,
  });

  // Select top live games manually or by criteria to match the "Live Casino" vibe
  const showcaseGames = useMemo(() => {
    if (!games) return [];
    // Prioritize known live categories/providers
    return games
      .filter(
        (g) =>
          g.gname.toLowerCase().includes("teen") ||
          g.gname.toLowerCase().includes("roulette") ||
          g.gname.toLowerCase().includes("dragon") ||
          g.gname.toLowerCase().includes("poker"),
      )
      .slice(0, 10);
  }, [games]);

  if (isLoading) {
    return (
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1.5 bg-[#1a472a] animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-[200px] h-[280px] bg-gray-200 animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-20 relative z-10 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1.5 bg-[#1a472a]"></div>
          <h2 className="text-2xl md:text-3xl font-display font-black text-gray-900 uppercase tracking-widest italic">
            LIVE <span className="text-[#1a472a]">CASINO</span>
          </h2>
        </div>

        <button
          onClick={() => navigate("/casino-live")}
          className="group flex items-center gap-2 text-[#1a472a] hover:bg-green-50 transition-colors text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest border border-gray-200 bg-white shadow-sm px-4 py-2 rounded"
        >
          VIEW ALL
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      {/* Horizontal Scroll Container with visible overflow for reflections */}
      <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 pt-2">
          {showcaseGames.map((game) => (
            <ReflectiveGameCard
              key={game.gmid}
              game={game}
              onClick={() => navigate(`/casino/${game.gmid}`)}
            />
          ))}
        </div>

        {/* Fade Masks for Scroll */}
        <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-[#f0f2f5] to-transparent pointer-events-none md:hidden" />
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#f0f2f5] to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  );
};
