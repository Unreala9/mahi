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
          <h2 className="text-xl md:text-2xl font-bold text-[#1a472a] italic">
            TOP MATCHES
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg p-4 min-w-[280px] h-[200px] animate-pulse"
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
          <h2 className="text-xl md:text-2xl font-bold text-[#1a472a] italic">
            TOP MATCHES
          </h2>
        </div>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
          <p className="text-gray-500">No matches available at the moment</p>
          <button
            onClick={() => navigate("/sports")}
            className="mt-4 bg-[#1a472a] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#2d6a4f] transition-colors"
          >
            View All Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-in-up delay-200">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#1a472a]"></div>
          <h2 className="text-2xl font-display font-black text-gray-800 uppercase tracking-wider">
            {liveMatches.length > 0 ? (
              <>
                LIVE{" "}
                <span className="text-red-600">
                  MATCHES
                </span>
              </>
            ) : (
              <>
                TOP{" "}
                <span className="text-[#1a472a]">
                  MATCHES
                </span>
              </>
            )}
          </h2>
        </div>
        <button
          onClick={() => navigate("/sports")}
          className="flex items-center gap-2 text-[#1a472a] hover:bg-green-50 transition-colors text-xs font-mono font-bold uppercase tracking-widest border border-gray-200 bg-white shadow-sm px-4 py-1.5 rounded"
        >
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Scrollable Match Cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {displayMatches.map((match) => (
          <MatchCard
            key={`${match.gmid}-${match.sid}`}
            match={{
              id: `${match.gmid}/${match.sid}`,
              sport: match.sname || "Sport",
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
