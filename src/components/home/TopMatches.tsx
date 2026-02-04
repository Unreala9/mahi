import { useLiveSportsData } from "@/hooks/api/useLiveSportsData";
import { MatchCard } from "./MatchCard";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

export const TopMatches = () => {
  const navigate = useNavigate();
  const { matches, liveMatches, isLoading } = useLiveSportsData();

  // Prioritize live matches, then show upcoming matches
  const displayMatches = useMemo(() => {
    // If we have live matches, show them first
    if (liveMatches.length > 0) {
      return liveMatches.slice(0, 8);
    }

    // Otherwise, show all upcoming matches (sorted by start time)
    const sortedMatches = [...matches].sort((a, b) => {
      const timeA = a.start_date
        ? new Date(a.start_date).getTime()
        : Number.MAX_SAFE_INTEGER;
      const timeB = b.start_date
        ? new Date(b.start_date).getTime()
        : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });

    return sortedMatches.slice(0, 8);
  }, [matches, liveMatches]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white italic">
            TOP MATCHES
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#1e2837] rounded-lg p-4 min-w-[280px] h-[200px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (displayMatches.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white italic">
            TOP MATCHES
          </h2>
        </div>
        <div className="bg-[#1e2837] rounded-lg p-8 text-center">
          <p className="text-gray-400">No matches available at the moment</p>
          <button
            onClick={() => navigate("/sports")}
            className="mt-4 bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            View All Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white italic">
          {liveMatches.length > 0 ? "LIVE MATCHES" : "TOP MATCHES"}
        </h2>
        <button
          onClick={() => navigate("/sports")}
          className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Horizontal Scrollable Match Cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {displayMatches.map((match) => (
          <MatchCard
            key={`${match.gmid}-${match.sid}`}
            match={{
              id: `${match.gmid}/${match.sid}`,
              sport: match.sport_name || "Sport",
              sportId: match.sid,
              tournament: match.cname || "Tournament",
              team1: match.name.split(" v ")[0],
              team2: match.name.split(" v ")[1],
              matchName: match.name,
              isLive: match.is_live || false,
              time: match.start_date
                ? new Date(match.start_date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              odds: {
                back1: 1.85,
                lay1: 1.9,
                back2: 2.1,
                lay2: 2.15,
              },
            }}
          />
        ))}
      </div>
    </div>
  );
};
