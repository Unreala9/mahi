import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { BettingMatchRow } from "@/components/sportsbook/BettingMatchRow";
import { Loader2, RefreshCw, Wifi } from "lucide-react";
import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";
import { MatchRowSkeleton } from "@/components/ui/skeleton";
import { useMatchDetails, useMatchOdds } from "@/hooks/api/useDiamond";
import { Button } from "@/components/ui/button";
import type { MatchEvent } from "@/services/diamondApi";

const Sportsbook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sportParam = searchParams.get("sport");
  const competitionParam = searchParams.get("competition");

  const [selectedSport, setSelectedSport] = useState<number | "all">(
    sportParam ? parseInt(sportParam) : 4,
  );
  const [showDebug, setShowDebug] = useState(false);

  // Update selectedSport when URL params change
  useEffect(() => {
    if (sportParam) {
      setSelectedSport(parseInt(sportParam));
    }
  }, [sportParam]);

  // Use live sports data
  const { sports, isLoading: loadingSports, isConnected } = useLiveSportsData();
  const {
    matches: rawMatches,
    liveMatches,
    isLoading: loadingMatches,
    lastUpdate,
  } = useLiveSportMatches(selectedSport);

  // Determine which matches to show and sort them
  const matches = useMemo(() => {
    let filtered = [...rawMatches];

    // Filter by competition if specified
    if (competitionParam) {
      filtered = filtered.filter((m) => m.cname === competitionParam);
    }

    // Sort: LIVE matches first, then by start time (earliest first)
    return filtered.sort((a, b) => {
      // Live matches always come first
      if (a.is_live && !b.is_live) return -1;
      if (!a.is_live && b.is_live) return 1;

      // If both live or both not live, sort by start time
      const timeA = a.start_date
        ? new Date(a.start_date).getTime()
        : Number.MAX_SAFE_INTEGER;
      const timeB = b.start_date
        ? new Date(b.start_date).getTime()
        : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [rawMatches, competitionParam]);

  const isLoading = loadingSports || loadingMatches;
  const [visibleCount, setVisibleCount] = useState(30);

  // Sport names mapping
  const sportNames = [
    "Cricket",
    "Football",
    "Tennis",
    "Table Tennis",
    "Esoccer",
    "Horse Racing",
    "Greyhound Racing",
    "Basketball",
    "Wrestling",
    "Volleyball",
    "Badminton",
    "Snooker",
    "Darts",
    "Boxing",
  ];

  // Debug data for API panel
  const debugMatch: MatchEvent | undefined = matches[0];
  const { data: debugDetails } = useMatchDetails(
    debugMatch?.gmid ?? null,
    debugMatch?.sid ?? null,
  );
  const { data: debugOdds } = useMatchOdds(
    debugMatch?.gmid ?? null,
    debugMatch?.sid ?? null,
  );

  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Sport Tabs */}
        <div className="bg-[#e5e7eb] border-b-2 border-gray-300">
          <div className="flex overflow-x-auto scrollbar-hide">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-r border-gray-300 bg-white flex-shrink-0">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                  <span className="text-[10px] md:text-xs font-medium text-green-700 hidden sm:inline">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 animate-spin" />
                  <span className="text-[10px] md:text-xs font-medium text-yellow-700 hidden sm:inline">
                    Updating
                  </span>
                </>
              )}
              {liveMatches.length > 0 && (
                <span className="bg-green-500 text-white text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-bold">
                  {liveMatches.length}
                </span>
              )}
            </div>

            {sports.slice(0, 14).map((sport, index) => (
              <button
                key={sport.sid}
                onClick={() => {
                  setSelectedSport(sport.sid);
                  setSearchParams({ sport: sport.sid.toString() });
                }}
                className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap border-r border-gray-300 transition-colors flex-shrink-0 ${
                  selectedSport === sport.sid
                    ? "bg-[#4a5568] text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sportNames[index] || sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* Competition Filter Indicator */}
        {competitionParam && (
          <div className="bg-[#2d3a48] px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2 text-sm text-white">
              <span className="font-semibold">Competition:</span>
              <span className="text-primary">{competitionParam}</span>
              <span className="text-gray-400">({matches.length} matches)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSearchParams({ sport: selectedSport.toString() })
              }
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear Filter ×
            </Button>
          </div>
        )}

        {/* Matches Table */}
        <div className="bg-black">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-[#374151] border-b-2 border-gray-600">
            <div className="col-span-6 px-4 py-2.5 text-sm font-semibold text-white border-r border-gray-600">
              Game
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-white border-r border-gray-600">
              1
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-white border-r border-gray-600">
              X
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-white">
              2
            </div>
          </div>

          {/* Loading State */}
          {isLoading && matches.length === 0 ? (
            <div className="bg-black">
              {Array.from({ length: 5 }).map((_, i) => (
                <MatchRowSkeleton key={i} />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center p-16 space-y-3 bg-black">
              <div className="text-gray-400 text-lg">No events available</div>
              <div className="text-gray-500 text-sm">
                {selectedSport === "all"
                  ? "There are no events across all sports at the moment"
                  : "There are no events for this sport at the moment"}
              </div>
              <div className="text-gray-600 text-xs mt-4">
                {lastUpdate > 0 &&
                  `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
              </div>
            </div>
          ) : (
            <div>
              {matches
                .slice(0, visibleCount)
                .map((match: MatchEvent, index: number) => (
                  <BettingMatchRow
                    key={`${match.gmid}-${match.sid}-${index}`}
                    match={match}
                  />
                ))}
              {matches.length > visibleCount && (
                <div className="flex justify-center py-4 bg-black">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + 30)}
                    className="text-xs"
                  >
                    Load more ({matches.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API Debug Panel */}
        <div className="mt-4 px-4">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => setShowDebug((s) => !s)}
          >
            {showDebug ? "Hide" : "Show"} API Debug Data
          </Button>
          {showDebug && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                <div className="text-xs font-semibold text-gray-300 mb-2">
                  Matches (tree endpoint)
                </div>
                <pre className="text-[10px] text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(matches.slice(0, 5), null, 2)}
                </pre>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                <div className="text-xs font-semibold text-gray-300 mb-2">
                  Match Details (/getDetailsData)
                </div>
                <pre className="text-[10px] text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(debugDetails ?? {}, null, 2)}
                </pre>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded border border-gray-700">
                <div className="text-xs font-semibold text-gray-300 mb-2">
                  Match Odds (/getPriveteData)
                </div>
                <pre className="text-[10px] text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(debugOdds ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Sportsbook;
