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
  const isDev = import.meta.env.DEV;

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
        <div className="bg-card border-b border-border">
          <div className="flex flex-wrap">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border-r border-border bg-background flex-shrink-0">
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
                className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap border-r border-border transition-colors ${
                  selectedSport === sport.sid
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {sportNames[index] || sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* Competition Filter Indicator */}
        {competitionParam && (
          <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="font-semibold">Competition:</span>
              <span className="text-primary">{competitionParam}</span>
              <span className="text-muted-foreground">({matches.length} matches)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSearchParams({ sport: selectedSport.toString() })
              }
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Filter ×
            </Button>
          </div>
        )}

        {/* Matches Table */}
        <div className="bg-background">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-muted border-b border-border">
            <div className="col-span-6 px-4 py-2.5 text-sm font-semibold text-foreground border-r border-border">
              Game
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-foreground border-r border-border">
              1
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-foreground border-r border-border">
              X
            </div>
            <div className="col-span-2 px-2 py-2.5 text-center text-sm font-semibold text-foreground">
              2
            </div>
          </div>

          {/* Loading State */}
          {isLoading && matches.length === 0 ? (
            <div className="bg-background">
              {Array.from({ length: 5 }).map((_, i) => (
                <MatchRowSkeleton key={i} />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center p-10 space-y-2 bg-background">
              <div className="text-muted-foreground text-lg">No events available</div>
              <div className="text-muted-foreground text-sm">
                {selectedSport === "all"
                  ? "There are no events across all sports at the moment"
                  : "There are no events for this sport at the moment"}
              </div>
              <div className="text-muted-foreground text-xs mt-3">
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
                <div className="flex justify-center py-4 bg-background">
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
        {isDev && (
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
                <div className="bg-card p-3 rounded border border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    Matches (tree endpoint)
                  </div>
                  <pre className="text-[10px] text-muted-foreground overflow-auto max-h-64">
                    {JSON.stringify(matches.slice(0, 5), null, 2)}
                  </pre>
                </div>
                <div className="bg-card p-3 rounded border border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    Match Details (/getDetailsData)
                  </div>
                  <pre className="text-[10px] text-muted-foreground overflow-auto max-h-64">
                    {JSON.stringify(debugDetails ?? {}, null, 2)}
                  </pre>
                </div>
                <div className="bg-card p-3 rounded border border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">
                    Match Odds (/getMatchOdds)
                  </div>
                  <pre className="text-[10px] text-muted-foreground overflow-auto max-h-64">
                    {JSON.stringify(debugOdds ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Sportsbook;
