import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";
import { Button } from "@/components/ui/button";
import type { MatchEvent } from "@/services/diamondApi";
import { useLiveMatchOdds } from "@/hooks/api/useWebSocket";
import { Loader2, Star, Lock, ChevronDown, ChevronUp } from "lucide-react";

// --- Components ---

const SportsbookBanner = ({ match }: { match?: MatchEvent }) => {
  const bannerData = match
    ? {
        title: match.cname || "Featured Match",
        subtitle: match.name,
        date: match.is_live
          ? "LIVE NOW"
          : new Date(match.start_date || "").toLocaleString(),
        isLive: match.is_live,
      }
    : {
        title: "ICC MEN'S UNDER 19 WORLD CUP",
        subtitle: "AFGHANISTAN UNDER 19 VS INDIA UNDER 19",
        date: "FEBRUARY 04, 2026 | 1:00 PM",
        isLive: false,
      };

  return (
    <div className="relative w-full h-[200px] md:h-[240px] bg-gradient-to-r from-blue-900 to-black overflow-hidden mb-4 rounded-b-xl border-b border-white/10">
      <div
        className="absolute inset-0 opacity-50 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://diamond-api.b-cdn.net/images/cricket-banner.jpg')",
          filter: "grayscale(30%)",
        }}
      />

      <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto px-4 flex flex-col justify-center">
        <h1 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl max-w-2xl leading-tight">
          {bannerData.title}
        </h1>
        <div className="text-xl md:text-2xl text-yellow-400 font-bold mt-1 uppercase drop-shadow-md">
          {bannerData.subtitle}
        </div>
        <div className="mt-3 text-white/90 text-sm font-bold bg-black/50 w-fit px-3 py-1 rounded backdrop-blur-sm flex items-center gap-2">
          {bannerData.isLive && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          {bannerData.date}
        </div>
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
  const icons: Record<string, string> = {
    Cricket: "🏏",
    Soccer: "⚽",
    Football: "⚽",
    Tennis: "🎾",
    Basketball: "🏀",
    Baseball: "⚾",
    Badminton: "🏸",
    "Table Tennis": "🏓",
    "Ice Hockey": "🏒",
    Volleyball: "🏐",
    Snooker: "🎱",
    Darts: "🎯",
    Kabaddi: "🤼",
    Boxing: "🥊",
    MMA: "🥊",
    Default: "🏆",
  };

  return (
    <div className="bg-[#1e2329] p-2 flex gap-2 overflow-x-auto scrollbar-hide mb-4 border-y border-white/5">
      {sports.slice(0, 15).map((s) => (
        <button
          key={s.sid}
          onClick={() => onSelect(s.sid)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap min-w-fit ${
            activeSport === s.sid
              ? "bg-[#6c5dd3] text-white shadow-lg shadow-primary/20"
              : "bg-[#2c323d] text-gray-400 hover:bg-[#353c4a] hover:text-white"
          }`}
        >
          <span>
            {icons[s.name] || icons[s.name.split(" ")[0]] || icons["Default"]}
          </span>
          {s.name}
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

    // 1. Direct property 'back'
    if (r.back !== undefined && r.back !== null) {
      if (typeof r.back === "object" && r.back.price !== undefined) {
        return r.back.price;
      }
      if (typeof r.back === "number" || typeof r.back === "string") {
        return r.back;
      }
    }

    if (r.price !== undefined) return r.price; // Sometimes generic price

    // Array format from API
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
      <div className="bg-[#353c4a]/50 rounded flex items-center justify-center h-[40px] w-full border border-white/5 opacity-50">
        <Lock size={12} className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex gap-1 h-[40px] w-full">
      <button className="flex-1 bg-[#2d36e8] hover:bg-[#3d46f2] text-white rounded-[4px] font-bold text-sm flex items-center justify-center transition-colors shadow-sm">
        {backPrice}
      </button>
      <button className="flex-1 bg-[#fca5a5]/10 hover:bg-[#fca5a5]/20 text-red-300 rounded-[4px] text-xs flex items-center justify-center border border-red-500/10">
        <span className="text-[10px] opacity-70">LAY</span>
      </button>
    </div>
  );
};

const MatchRow = ({ match }: { match: MatchEvent }) => {
  const { data: oddsData } = useLiveMatchOdds(match.gmid, match.sid, true);

  const matchOdds = oddsData?.match_odds || oddsData?.bookmaker || [];
  let runners = [null, null, null]; // 1, X, 2

  if (matchOdds.length === 2) {
    runners = [matchOdds[0], null, matchOdds[1]];
  } else if (matchOdds.length >= 3) {
    runners = [matchOdds[0], matchOdds[2], matchOdds[1]]; // Generally 1, 2, X order or depending on market
  }

  const { time, isToday } = (() => {
    if (!match.start_date) return { time: "TBD", isToday: false };
    const date = new Date(match.start_date);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return {
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      isToday,
    };
  })();

  return (
    <div className="bg-[#15191f] border-b border-white/5 p-3 hover:bg-[#1a1f26] transition-colors group">
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Left: Time */}
        <div className="col-span-3 md:col-span-1 flex flex-col justify-center border-r border-white/5 pr-2">
          {match.is_live ? (
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                LIVE
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-start text-xs text-gray-400">
              {isToday && (
                <span className="font-bold text-white mb-0.5">Today</span>
              )}
              <span>{time}</span>
            </div>
          )}
        </div>

        {/* Middle: Teams */}
        <div className="col-span-9 md:col-span-6 px-3">
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-sm truncate pr-2">
                {match.name.split(" v ")[0] || match.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-sm truncate pr-2 opacity-80">
                {match.name.split(" v ")[1] || "vs"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Odds */}
        <div className="col-span-12 md:col-span-5 flex gap-2 overflow-x-auto pt-2 md:pt-0">
          <div className="grid grid-cols-3 gap-2 w-full min-w-[200px]">
            <OddsButton runner={runners[0]} label="1" />
            <OddsButton runner={runners[1]} label="X" isDraw />
            <OddsButton runner={runners[2]} label="2" />
          </div>
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
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#1e2329] px-4 py-2.5 hover:bg-[#252b33] transition-colors border-l-4 border-[#6c5dd3]"
      >
        <span className="text-sm font-bold text-white uppercase tracking-wide">
          {leagueName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-black/40 px-2 py-0.5 rounded text-gray-400">
            {matches.length}
          </span>
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-white/5">
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
  const [selectedSport, setSelectedSport] = useState<number>(
    sportParam ? parseInt(sportParam) : 4,
  ); // Default Cricket

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

  console.log("DEBUG: Selected Sport:", selectedSport);
  console.log("DEBUG: Total Matches:", matches.length);
  console.log("DEBUG: First 3 Matches:", matches.slice(0, 3));
  console.log("DEBUG: Live Matches Count:", liveMatches.length);

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
    <MainLayout>
      <div className="flex flex-col bg-[#0b0e12] min-h-screen text-white">
        <SportsbookBanner match={featuredMatch} />

        <div className="max-w-[1400px] mx-auto w-full px-0 md:px-4 pb-20">
          <SportFilterTabs
            sports={sports}
            activeSport={selectedSport}
            onSelect={handleSportSelect}
          />

          {/* Live Events Section */}
          <div className="mb-6">
            <div className="flex items-center px-4 py-2 mb-2">
              <h2 className="text-base font-bold text-red-500 flex items-center gap-2 uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Events
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin mx-auto text-primary" />
              </div>
            ) : liveList.length > 0 ? (
              <div className="flex flex-col gap-1">
                {Object.entries(liveGroups).map(([league, list]) => (
                  <LeagueGroup
                    key={league}
                    leagueName={league}
                    matches={list}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm bg-[#11141a] rounded">
                No live events currently available for this sport.
              </div>
            )}
          </div>

          {/* Upcoming Events Section */}
          <div className="mb-6">
            <div className="flex items-center px-4 py-2 mb-2">
              <h2 className="text-base font-bold text-blue-500 flex items-center gap-2 uppercase">
                Upcoming Events
              </h2>
            </div>

            {upcomingList.length > 0 ? (
              <div className="flex flex-col gap-1">
                {Object.entries(upcomingGroups).map(([league, list]) => (
                  <LeagueGroup
                    key={league}
                    leagueName={league}
                    matches={list}
                    defaultOpen={false}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm bg-[#11141a] rounded">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sportsbook;
