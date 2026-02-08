import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";
import { Button } from "@/components/ui/button";
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
    <div className="relative w-full h-[180px] md:h-[220px] bg-[#050b14] overflow-hidden mb-6 border-b border-white/5 group">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:30px_30px]" />

      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center border-l border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-primary uppercase tracking-widest border border-primary/30 px-2 py-0.5">
            {bannerData.date}
          </span>
          {bannerData.isLive && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter font-display">
          {bannerData.title}
        </h1>
        <div className="text-xl md:text-2xl text-gray-400 font-bold uppercase tracking-widest mt-1 font-display">
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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
      {sports.slice(0, 15).map((s) => (
        <button
          key={s.sid}
          onClick={() => onSelect(s.sid)}
          className={`group flex flex-col items-center justify-center gap-1 px-5 py-3 border transition-all min-w-[90px] ${
            activeSport === s.sid
              ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              : "bg-[#0a1120] text-gray-500 border-white/5 hover:border-white/20 hover:text-white"
          }`}
        >
          <span className="text-xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
            {icons[s.name] || icons["Default"]}
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
      <div className="flex-1 bg-[#0a1120] border border-white/5 flex flex-col items-center justify-center h-[44px] opacity-50 cursor-not-allowed">
        <Lock size={10} className="text-gray-600 mb-0.5" />
        <span className="text-[8px] text-gray-600 font-mono">LOCKED</span>
      </div>
    );
  }

  return (
    <div className="flex gap-px h-[44px] w-full bg-[#0a1120] group/odds">
      {/* Back Button */}
      <button className="flex-1 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 flex flex-col items-center justify-center transition-all">
        <span className="text-sm font-black font-mono tracking-tighter">
          {backPrice}
        </span>
        <span className="text-[8px] font-bold uppercase opacity-60">Back</span>
      </button>

      {/* Lay Button */}
      <button className="flex-1 bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/30 flex flex-col items-center justify-center transition-all">
        <span className="text-sm font-black font-mono tracking-tighter">-</span>
        <span className="text-[8px] font-bold uppercase opacity-60">Lay</span>
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
    runners = [matchOdds[0], matchOdds[2], matchOdds[1]];
  }

  // Determine active state for highlighting
  const isActive = match.is_live;

  return (
    <div
      className={`
       relative grid grid-cols-12 gap-0 border-b border-white/5 transition-colors group
       ${isActive ? "bg-[#0a1120] hover:bg-[#0f1729]" : "bg-transparent hover:bg-white/5"}
    `}
    >
      {/* Active Indicator Strip */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary animate-pulse" />
      )}

      {/* Time / Status Column */}
      <div className="col-span-3 md:col-span-2 p-3 flex flex-col justify-center border-r border-white/5">
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
            <span className="text-xs font-bold text-white font-mono">
              {new Date(match.start_date || "").toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
              {new Date(match.start_date || "").toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="col-span-9 md:col-span-5 p-3 flex flex-col justify-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold uppercase tracking-tight ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}
            >
              {match.name.split(" v ")[0]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium uppercase tracking-widest text-gray-500`}
            >
              VS
            </span>
            <span
              className={`text-sm font-bold uppercase tracking-tight ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}
            >
              {match.name.split(" v ")[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Odds Columns */}
      <div className="col-span-12 md:col-span-5 p-2 bg-[#050b14]/50 flex items-center gap-2 overflow-x-auto">
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
    <div className="mb-4 border border-white/5 bg-[#080c14]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0f1621] hover:bg-[#151d2b] transition-colors border-l-2 border-primary"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-white uppercase tracking-[0.15em] font-display">
            {leagueName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono bg-black/40 px-2 py-1 text-gray-400 border border-white/5">
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
    <div className="flex flex-col bg-[#050b14] min-h-screen text-white -m-4">
      {/* Top Banner */}
      <SportsbookBanner match={featuredMatch} />

      <div className="max-w-[1600px] mx-auto w-full px-4 pb-20">
        {/* Filters */}
        <SportFilterTabs
          sports={sports}
          activeSport={selectedSport}
          onSelect={handleSportSelect}
        />

        {/* Live Events Section */}
        <div className="mb-10 animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center px-1 mb-4 border-l-4 border-red-500 pl-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest font-display">
              Live Markets
            </h2>
            <span className="ml-4 text-[10px] text-red-500 font-bold uppercase tracking-widest border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
              {liveList.length} Active
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center border border-white/5 border-dashed rounded bg-[#0a1120]">
              <Loader2 className="animate-spin mx-auto text-primary w-8 h-8 mb-4" />
              <p className="text-xs text-gray-500 font-mono uppercase">
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
            <div className="p-12 text-center text-gray-500 text-xs font-mono uppercase bg-[#0a1120] border border-white/5">
              No active live markets. Check upcoming schedule.
            </div>
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
          <div className="flex items-center px-1 mb-4 border-l-4 border-blue-500 pl-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest font-display">
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
            <div className="p-12 text-center text-gray-500 text-xs font-mono uppercase bg-[#0a1120] border border-white/5">
              No scheduled events found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sportsbook;
