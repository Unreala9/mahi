import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useMemo } from "react";
import { BettingMatchRow } from "@/components/sportsbook/BettingMatchRow";
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useLiveSportsData, useLiveSportMatches } from "@/hooks/api/useLiveSportsData";
import { MatchRowSkeleton } from "@/components/ui/skeleton";
import type { MatchEvent } from "@/services/diamondApi";

const Index = () => {
  const [selectedSport, setSelectedSport] = useState<number | "all">(4);

  // Use live sports data (same as Sportsbook)
  const { sports, isLoading: loadingSports, isConnected } = useLiveSportsData();
  const { 
    matches: rawMatches, 
    liveMatches,
    isLoading: loadingMatches,
    lastUpdate 
  } = useLiveSportMatches(selectedSport);

  // Determine which matches to show and sort them
  const matches = useMemo(() => {
    // Sort: LIVE matches first, then by start time (earliest first)
    return [...rawMatches].sort((a, b) => {
      // Live matches always come first
      if (a.is_live && !b.is_live) return -1;
      if (!a.is_live && b.is_live) return 1;
      
      // If both live or both not live, sort by start time
      const timeA = a.start_date ? new Date(a.start_date).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.start_date ? new Date(b.start_date).getTime() : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [rawMatches]);
  
  const isLoading = loadingSports || loadingMatches;

  // Group matches by competition
  const competitions = useMemo(() => {
    const grouped: Record<string, MatchEvent[]> = {};
    
    matches.forEach((match) => {
      const compName = match.cname || "Other";
      if (!grouped[compName]) {
        grouped[compName] = [];
      }
      grouped[compName].push(match);
    });

    return Object.entries(grouped).map(([name, matches]) => ({
      name,
      matches,
    }));
  }, [matches]);

  // Sport names mapping
  const sportNames = [
    "Cricket", "Football", "Tennis", "Table Tennis", "Esoccer", 
    "Horse Racing", "Greyhound Racing", "Basketball", "Wrestling", 
    "Volleyball", "Badminton", "Snooker", "Darts", "Boxing"
  ];

  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Sport Tabs */}
        <div className="bg-[#e5e7eb] border-b-2 border-gray-300">
          <div className="flex overflow-x-auto scrollbar-hide">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-300 bg-white">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-700 hidden sm:inline">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                  <span className="text-xs font-medium text-yellow-700 hidden sm:inline">
                    Updating
                  </span>
                </>
              )}
              {liveMatches.length > 0 && (
                <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {liveMatches.length}
                </span>
              )}
            </div>

            {sports.slice(0, 14).map((sport, index) => (
              <button
                key={sport.sid}
                onClick={() => setSelectedSport(sport.sid)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-r border-gray-300 transition-colors ${
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

        {/* Matches Table */}
        <div className="bg-[#1a1a1a]">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_repeat(3,120px)] bg-[#2d3a48] border-b border-gray-700">
            <div className="px-4 py-2 text-sm font-semibold text-white border-r border-gray-700">Game</div>
            <div className="px-2 py-2 text-center text-sm font-semibold text-white border-r border-gray-700">1</div>
            <div className="px-2 py-2 text-center text-sm font-semibold text-white border-r border-gray-700">X</div>
            <div className="px-2 py-2 text-center text-sm font-semibold text-white">2</div>
          </div>

          {/* Loading State */}
          {isLoading && matches.length === 0 ? (
            <div className="bg-[#1a1a1a]">
              {Array.from({ length: 5 }).map((_, i) => (
                <MatchRowSkeleton key={i} />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center p-16 space-y-3 bg-[#1a1a1a]">
              <div className="text-gray-400 text-lg">No events available</div>
              <div className="text-gray-500 text-sm">
                {selectedSport === "all" 
                  ? "There are no events across all sports at the moment" 
                  : "There are no events for this sport at the moment"}
              </div>
              <div className="text-gray-600 text-xs mt-4">
                {lastUpdate > 0 && `Last updated: ${new Date(lastUpdate).toLocaleTimeString()}`}
              </div>
            </div>
          ) : (
            <div>
              {competitions.map((comp) => (
                <div key={comp.name}>
                  {/* Competition Header */}
                  <div className="bg-[#2d3a48] px-4 py-2 text-sm font-bold text-white border-b border-gray-700">
                    {comp.name} ({comp.matches.length})
                  </div>
                  {/* Competition Matches */}
                  {comp.matches.map((match: MatchEvent, index: number) => (
                    <BettingMatchRow key={`${match.gmid}-${match.sid}-${index}`} match={match} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
