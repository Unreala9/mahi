import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";
import { Button } from "@/components/ui/button";
import SportIcon from "@/components/SportIcon";
import type { MatchEvent } from "@/services/diamondApi";
import { useLiveMatchOdds } from "@/hooks/api/useWebSocket";
import {
  Loader2,
  Star,
  Lock,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { BannerCarousel } from "@/components/sportsbook/BannerCarousel";
import { SportsDebug } from "@/components/SportsDebug";

// --- Components ---

const SportsbookBanner = ({ match }: { match?: MatchEvent }) => {
  const bannerData = match
    ? {
        title: match.cname || "Top Market",
        subtitle: match.name,
        date: match.is_live
          ? "LIVE TRADING"
          : new Date(match.start_date || "").toLocaleString(),
        isLive: match.is_live,
      }
    : {
        title: "PREMIUM SPORTS",
        subtitle: "LIVE MARKET EXCHANGE",
        date: "SYSTEM READY",
        isLive: false,
      };

  return (
    <div className="relative w-full h-[180px] md:h-[220px] bg-white overflow-hidden mb-6 border-b border-gray-200 shadow-sm group">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gray-50 bg-[size:30px_30px] opacity-50" />

      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1a472a]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center border-l-4 border-[#1a472a]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[#1a472a] uppercase tracking-widest border border-[#1a472a]/30 px-2 py-0.5 rounded-sm">
            {bannerData.date}
          </span>
          {bannerData.isLive && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter font-display">
          {bannerData.title}
        </h1>
        <div className="text-xl md:text-2xl text-gray-600 font-bold uppercase tracking-widest mt-1 font-display">
          {bannerData.subtitle}
        </div>
      </div>

      {/* Tech visual elements */}
      <div className="absolute bottom-4 right-6 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 bg-primary/50 rounded-full ${i === 4 ? "animate-pulse" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

const SportFilterTabs = ({
  sports,
  activeSport,
  onSelect,
}: {
  sports: { sid: number; name: string }[];
  activeSport: number;
  onSelect: (sid: number) => void;
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
      {sports.slice(0, 15).map((s) => (
        <button
          key={s.sid}
          onClick={() => onSelect(s.sid)}
          className={`group flex flex-col items-center justify-center gap-1 px-5 py-3 border rounded-sm transition-all min-w-[90px] ${
            activeSport === s.sid
              ? "bg-[#1a472a] text-white border-[#1a472a] shadow-md"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a472a] hover:text-[#1a472a]"
          }`}
        >
          <span className="text-2xl filter drop-shadow-sm group-hover:-translate-y-1 transition-transform">
            <SportIcon
              eventId={s.sid}
              size={24}
              className={
                activeSport === s.sid ? "brightness-0 invert" : "brightness-100"
              }
            />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
            {s.name}
          </span>
        </button>
      ))}
    </div>
  );
};

const OddsButton = ({
  runner,
  label,
  isDraw,
}: {
  runner: any;
  label: string;
  isDraw?: boolean;
}) => {
  const getBackPrice = (r: any) => {
    if (!r) return null;

    if (r.back !== undefined && r.back !== null) {
      if (typeof r.back === "object" && r.back.price !== undefined)
        return r.back.price;
      if (typeof r.back === "number" || typeof r.back === "string")
        return r.back;
    }

    if (r.price !== undefined) return r.price;

    if (Array.isArray(r.odds)) {
      const backObj = r.odds.find(
        (o: any) =>
          o.otype === "back" ||
          (o.oname &&
            typeof o.oname === "string" &&
            o.oname.toLowerCase().includes("back")),
      );
      return backObj?.odds;
    }
    return null;
  };

  const backPrice = getBackPrice(runner);

  if (!runner || !backPrice) {
    return (
      <div className="flex-1 bg-gray-100 border border-gray-200 flex flex-col items-center justify-center h-[44px] opacity-70 cursor-not-allowed rounded-sm">
        <Lock size={10} className="text-gray-400 mb-0.5" />
        <span className="text-[8px] text-gray-500 font-bold uppercase">LOCKED</span>
      </div>
    );
  }

  return (
    <div className="flex gap-px h-[44px] w-full bg-white group/odds">
      {/* Back Button */}
      <button className="flex-1 rounded-sm bg-[#72bbef] hover:bg-[#5ca8e0] text-[#1a472a] flex flex-col items-center justify-center transition-all shadow-sm">
        <span className="text-sm font-black font-mono tracking-tighter">
          {backPrice}
        </span>
        <span className="text-[8px] font-bold uppercase opacity-60">Back</span>
      </button>

      {/* Lay Button */}
      <button className="flex-1 rounded-sm bg-[#faa9ba] hover:bg-[#e998a9] text-[#1a472a] flex flex-col items-center justify-center transition-all shadow-sm">
        <span className="text-sm font-black font-mono tracking-tighter">-</span>
        <span className="text-[8px] font-bold uppercase opacity-80">Lay</span>
      </button>
    </div>
  );
};

const MatchRow = ({ match }: { match: MatchEvent }) => {
  const navigate = useNavigate();
  const { data: oddsData } = useLiveMatchOdds(match.gmid, match.sid, true);

  const matchOdds = oddsData?.match_odds || oddsData?.bookmaker || [];
  let runners: any[] = [null, null, null]; // 1, X, 2

  if (matchOdds.length === 2) {
    runners = [matchOdds[0], null, matchOdds[1]];
  } else if (matchOdds.length >= 3) {
    runners = [matchOdds[0], matchOdds[2], matchOdds[1]];
  }

  // Determine active state for highlighting
  const isActive = match.is_live;

  const validDate = match.start_date && !isNaN(new Date(match.start_date).getTime());

  return (
    <div
      onClick={() => navigate(`/match/${match.gmid}/${match.sid}`)}
      className={`
       cursor-pointer relative grid grid-cols-12 gap-0 border-b border-gray-200 transition-colors group
       ${isActive ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}
    `}
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500 animate-pulse" />
      )}

      {/* Time / Status Column */}
      <div className="col-span-3 md:col-span-2 p-3 flex flex-col justify-center border-r border-gray-200 pl-4">
        {match.is_live ? (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
              Live
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900 font-mono">
              {validDate ? new Date(match.start_date!).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }) : "TBA"}
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
              {validDate ? new Date(match.start_date!).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              }) : "Date TBA"}
            </span>
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="col-span-9 md:col-span-5 p-3 flex flex-col justify-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold uppercase tracking-tight ${isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}`}
            >
              {match.name ? match.name.split(" v ")[0] || match.name : "Team 1"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest text-[#f28729]`}
            >
              VS
            </span>
            <span
              className={`text-sm font-bold uppercase tracking-tight ${isActive ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}`}
            >
              {match.name ? match.name.split(" v ")[1] || "Team 2" : "Team 2"}
            </span>
          </div>
        </div>
      </div>

      {/* Odds Columns */}
      <div className="col-span-12 md:col-span-5 p-2 bg-gray-50 flex items-center gap-2 overflow-x-auto border-l border-gray-200">
        <div className="grid grid-cols-3 gap-2 w-full min-w-[280px]">
          <OddsButton runner={runners[0]} label="1" />
          <OddsButton runner={runners[1]} label="X" isDraw />
          <OddsButton runner={runners[2]} label="2" />
        </div>
      </div>
    </div>
  );
};

const LeagueGroup = ({
  leagueName,
  matches,
  defaultOpen = true,
}: {
  leagueName: string;
  matches: MatchEvent[];
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-gray-200 bg-white rounded-sm shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-l-4 border-[#1a472a] border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-4 h-4 text-[#1a472a]" />
          <span className="text-xs font-bold text-gray-900 uppercase tracking-[0.1em] font-display">
            {leagueName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold bg-white px-2 py-1 text-[#1a472a] border border-gray-200 rounded-sm shadow-sm">
            {matches.length} EVENTS
          </span>
          {isOpen ? (
            <ChevronUp size={14} className="text-gray-500" />
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col">
          {matches.map((match) => (
            <MatchRow key={match.gmid} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sportsbook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sportParam = searchParams.get("sport");
  const debugMode = searchParams.get("debug") === "true";
  const [selectedSport, setSelectedSport] = useState<number>(
    sportParam ? parseInt(sportParam) : 4,
  ); // Default Cricket

  console.log(
    "[Sportsbook] Rendering with sport:",
    selectedSport,
    "param:",
    sportParam,
  );

  // Show debug panel if debug=true
  if (debugMode) {
    return <SportsDebug />;
  }

  useEffect(() => {
    if (sportParam) setSelectedSport(parseInt(sportParam));
  }, [sportParam]);

  const handleSportSelect = (sid: number) => {
    setSelectedSport(sid);
    setSearchParams({ sport: sid.toString() });
  };

  const { sports, isConnected } = useLiveSportsData();
  const { matches, liveMatches, isLoading } =
    useLiveSportMatches(selectedSport);

  console.log("[Sportsbook] Data state:", {
    selectedSport,
    sportsCount: sports.length,
    matchesCount: matches.length,
    isLoading,
    isConnected,
  });

  const liveList = matches.filter((m) => m.is_live);
  const upcomingList = matches
    .filter((m) => !m.is_live)
    .sort(
      (a, b) =>
        new Date(a.start_date || 0).getTime() -
        new Date(b.start_date || 0).getTime(),
    );

  // Featured match logic
  const featuredMatch = liveList[0] || upcomingList[0];

  // Grouping logic
  const groupMatches = (list: MatchEvent[]) => {
    const groups: Record<string, MatchEvent[]> = {};
    list.forEach((m) => {
      const league = m.cname || "International";
      if (!groups[league]) groups[league] = [];
      groups[league].push(m);
    });
    return groups;
  };

  const liveGroups = groupMatches(liveList);
  const upcomingGroups = groupMatches(upcomingList);

  return (
    <div className="flex flex-col bg-[#f0f2f5] min-h-screen text-gray-900 -m-4">
      {/* Top Banner Carousel */}
      <BannerCarousel />

      <div className="max-w-[1600px] mx-auto w-full px-4 pb-20">
        {/* Filters */}
        {sports.length > 0 ? (
          <SportFilterTabs
            sports={sports}
            activeSport={selectedSport}
            onSelect={handleSportSelect}
          />
        ) : (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-sm mb-4 shadow-sm">
            <p className="font-bold">⚠️ No sports data available</p>
            <p className="text-sm">
              The sports feed is not loading. Please check your connection.
            </p>
          </div>
        )}

        {/* Live Events Section */}
        <div className="mb-10 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center px-1 mb-4 border-l-4 border-red-500 pl-4 bg-white py-2 shadow-sm border border-gray-200 rounded-r-sm">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest font-display">
              Live Markets
            </h2>
            <span className="ml-4 text-[10px] text-white font-bold uppercase tracking-widest bg-red-500 px-3 py-1 rounded-sm shadow-sm animate-pulse inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              {liveList.length} Active
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center border border-gray-200 border-dashed rounded-sm bg-white shadow-sm">
              <Loader2 className="animate-spin mx-auto text-[#1a472a] w-8 h-8 mb-4" />
              <p className="text-xs text-gray-500 font-bold uppercase">
                Syncing Market Data...
              </p>
            </div>
          ) : liveList.length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(liveGroups).map(([league, list]) => (
                <LeagueGroup key={league} leagueName={league} matches={list} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white border border-gray-200 rounded-sm shadow-sm">
              <div className="flex justify-center mb-4">
                <SportIcon
                  eventId={selectedSport}
                  size={48}
                  className="opacity-20 text-[#1a472a]"
                />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-wider">
                No Live Matches
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                There are currently no live{" "}
                {sports.find((s) => s.sid === selectedSport)?.name || "matches"}{" "}
                markets available.
              </p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-2">
                Check upcoming schedule below or try another sport
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
          <div className="flex items-center px-1 mb-4 border-l-4 border-[#f28729] pl-4 bg-white py-2 shadow-sm border border-gray-200 rounded-r-sm">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest font-display">
              Upcoming Schedule
            </h2>
          </div>

          {upcomingList.length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(upcomingGroups).map(([league, list]) => (
                <LeagueGroup
                  key={league}
                  leagueName={league}
                  matches={list}
                  defaultOpen={true}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white border border-gray-200 rounded-sm shadow-sm">
              <div className="flex justify-center mb-4">
                <SportIcon
                  eventId={selectedSport}
                  size={48}
                  className="opacity-20 text-[#1a472a]"
                />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-wider">
                No Scheduled Matches
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                There are no upcoming{" "}
                {sports.find((s) => s.sid === selectedSport)?.name || "matches"}{" "}
                scheduled at this time.
              </p>
              <p className="text-xs text-gray-500 font-bold uppercase mt-2">
                Try selecting a different sport from the tabs above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sportsbook;
