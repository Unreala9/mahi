import { useState, useMemo } from "react";

import { BettingMatchRow } from "@/components/sportsbook/BettingMatchRow";
import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";
import { fetchCasinoGames, getImageCandidates } from "@/services/casino";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  ChevronRight,
  Tv,
  Trophy,
  ChevronDown,
  Lock,
} from "lucide-react";

// --- Sub-components ---

const MarqueeHeader = () => (
  <div className="bg-white text-black py-1.5 px-4 flex items-center gap-2 overflow-hidden text-sm font-bold shadow-sm relative z-10">
    <span className="bg-red-600 text-white text-[10px] px-1.5 rounded animate-pulse">
      NEWS
    </span>
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div className="animate-marquee inline-block">
        SPECIAL FANCY & CUP WINNER BETS STARTED 🦄 OUR EXCLUSIVE PREMIUM MARKET
        IS LIVE NOW! 🏏 IPL 2026 EARLY BETTING OPEN 🏆
      </div>
    </div>
  </div>
);

const MatchChips = ({ matches }: { matches: any[] }) => {
  const popularMatches = matches.slice(0, 8); // Just take first 8 for demo

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 px-1">
      {popularMatches.map((m, idx) => (
        <div
          key={idx}
          className="flex-shrink-0 bg-white hover:bg-gray-50 text-gray-700 text-[11px] px-4 py-2 rounded-full border border-gray-200 cursor-pointer transition-colors whitespace-nowrap shadow-sm font-medium"
        >
          {m.name}
        </div>
      ))}
    </div>
  );
};

const SportTabs = ({
  activeSport,
  onSelect,
}: {
  activeSport: string | number;
  onSelect: (id: string | number) => void;
}) => {
  const sports = [
    { id: "all", name: "All", icon: "🌐" },
    { id: 4, name: "Cricket", icon: "🏏" },
    { id: 1, name: "Football", icon: "⚽" },
    { id: 2, name: "Tennis", icon: "🎾" },
    { id: 7, name: "Kabaddi", icon: "🤼" },
    { id: 75, name: "Basketball", icon: "🏀" },
    { id: 8, name: "Baseball", icon: "⚾" },
    { id: 4339, name: "Greyhound", icon: "🐕" },
    { id: 77, name: "Horse Race", icon: "🐎" },
    { id: 999, name: "Volleyball", icon: "🏐" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2">
      {sports.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onSelect(sport.id)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border shadow-sm ${
            activeSport === sport.id
              ? "bg-[#1a472a] text-white border-[#1a472a]"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>{sport.icon}</span>
          {sport.name}
        </button>
      ))}
    </div>
  );
};

const InPlayMatchRow = ({ match }: { match: any }) => {
  const hasOdds = !!match.start_date && Math.random() > 0.3; // 70% chance to show odds
  const isCricket = match.sid === 4 || match.sid === "4"; // Determine if Draw (X) is missing

  // Random odds generator for demo purposes
  const generateOdds = () => {
    return {
      back: (Math.random() * 3 + 1.2).toFixed(2),
      backSize: Math.floor(Math.random() * 1000 + 100).toString(),
      lay: (Math.random() * 3 + 1.3).toFixed(2),
      laySize: Math.floor(Math.random() * 100 + 10).toString(),
    };
  };

  const odds1 = hasOdds ? generateOdds() : null;
  const oddsX = hasOdds && !isCricket ? generateOdds() : null;
  const odds2 = hasOdds ? generateOdds() : null;

  return (
    <div className="grid grid-cols-12 items-center border-b border-gray-200 py-2 hover:bg-gray-50 transition-colors group cursor-pointer bg-white">
      {/* Match Info Column */}
      <div className="col-span-12 md:col-span-7 flex justify-between items-center px-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="text-[13px] text-gray-900 font-bold truncate mb-0.5">
            {match.name || "Match Name"}
          </div>
          <div className="text-[11px] text-gray-500 truncate font-mono">
            {match.cname || "Tournament"} /{" "}
            {match.start_date
              ? new Date(match.start_date).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Time TBD"}
          </div>
        </div>
        <div className="flex gap-2 items-center text-gray-400 flex-shrink-0">
          <span className="text-[11px] font-bold">f</span>
          <span className="text-[11px] font-bold">BM</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Odds Columns */}
      <div className="hidden md:grid col-span-5 grid-cols-3 gap-1 px-4">
        {/* Column 1 */}
        <div className="flex justify-center items-center gap-0.5">
          {hasOdds ? (
            <>
              <div className="flex-1 bg-[#72bbef] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {odds1?.back}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {odds1?.backSize}
                </span>
              </div>
              <div className="flex-1 bg-[#faa9ba] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {odds1?.lay}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {odds1?.laySize}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-full">
                <Lock size={12} className="text-gray-400" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-full">
                <Lock size={12} className="text-gray-400" />
              </div>
            </>
          )}
        </div>

        {/* Column X */}
        <div className="flex justify-center items-center gap-0.5">
          {hasOdds && !isCricket ? (
            <>
              <div className="flex-1 bg-[#72bbef] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {oddsX?.back}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {oddsX?.backSize}
                </span>
              </div>
              <div className="flex-1 bg-[#faa9ba] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {oddsX?.lay}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {oddsX?.laySize}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-[34px]">
                <span className="text-gray-400 text-sm font-black">-</span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-[34px]">
                <span className="text-gray-400 text-sm font-black">-</span>
              </div>
            </>
          )}
        </div>

        {/* Column 2 */}
        <div className="flex justify-center items-center gap-0.5">
          {hasOdds ? (
            <>
              <div className="flex-1 bg-[#72bbef] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {odds2?.back}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {odds2?.backSize}
                </span>
              </div>
              <div className="flex-1 bg-[#faa9ba] rounded-[3px] py-1 px-1 text-center flex flex-col justify-center items-center h-[34px]">
                <span className="text-[14px] font-bold text-gray-900 leading-none">
                  {odds2?.lay}
                </span>
                <span className="text-[10px] text-gray-800 leading-none mt-0.5">
                  {odds2?.laySize}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-full">
                <Lock size={12} className="text-gray-400" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-[3px] py-2 flex justify-center items-center h-full">
                <Lock size={12} className="text-gray-400" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TrendingSidebar = () => {
  const navigate = useNavigate();
  const { data: games } = useQuery({
    queryKey: ["trending-games"],
    queryFn: fetchCasinoGames,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Pick specific games or first 8
  const displayGames = useMemo(() => {
    if (!games) return [];
    return games.slice(0, 10);
  }, [games]);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 h-fit shadow-md">
      <div className="bg-gray-50 p-3 text-sm font-bold flex justify-between items-center border-b border-gray-200">
        <span className="text-[#1a472a] font-black">Trending Games</span>
        <button
          onClick={() => navigate("/casino-live")}
          className="text-[#1a472a] opacity-80 text-xs flex items-center hover:opacity-100 transition-opacity"
        >
          See more <ChevronRight size={12} />
        </button>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        {displayGames.map((game) => {
          const img = getImageCandidates(game.imgpath)[0];
          return (
            <div
              key={game.gmid}
              className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#1a472a] shadow-sm"
              onClick={() => navigate(`/casino/${game.gmid}`)}
            >
              <img
                src={img}
                alt={game.gname}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1.5">
                <span className="text-[10px] font-bold text-white shadow-sm leading-tight line-clamp-2">
                  {game.gname}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Page Component ---

const InPlay = () => {
  const [activeSport, setActiveSport] = useState<string | number>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { sports } = useLiveSportsData();
  const targetSid = activeSport === "all" ? 4 : (activeSport as number);
  const { liveMatches, matches: allMatches } = useLiveSportMatches(targetSid);

  const displayMatches = useMemo(() => {
    let list = liveMatches.length > 0 ? liveMatches : allMatches; // Fallback to all matches if no live

    if (searchQuery) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [liveMatches, allMatches, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Marquee */}
      <MarqueeHeader />

      <div className="max-w-[1600px] mx-auto px-2 md:px-4 py-4 md:py-6">
        {/* Search */}
        <div className="relative mb-4 shadow-sm">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search events"
            className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-12 pr-10 text-sm text-gray-900 focus:outline-none focus:border-[#1a472a] focus:ring-1 focus:ring-[#1a472a] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Match Chips */}
        <MatchChips matches={displayMatches} />

        {/* Sport Filter Tabs */}
        <SportTabs activeSport={activeSport} onSelect={setActiveSport} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 pt-2">
          {/* Match List Column */}
          <div className="col-span-12 lg:col-span-9 space-y-[1px]">
            {/* Header for List */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-t-lg border border-gray-200 border-b-0 shadow-sm">
              <div className="flex items-center gap-2 text-gray-900 font-bold uppercase text-[13px] tracking-wide">
                <Trophy className="text-[#1a472a] opacity-90 w-5 h-5 fill-[#1a472a]" />
                {activeSport === "all"
                  ? "IN-PLAY MATCHES"
                  : sports
                      .find((s) => s.sid === activeSport)
                      ?.name?.toUpperCase() || "MATCHES"}
              </div>
              <div className="hidden md:grid grid-cols-3 gap-0 w-[420px] text-center text-[11px] text-gray-500 font-bold uppercase tracking-widest pr-4">
                <div>1</div>
                <div>X</div>
                <div>2</div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-[1px] bg-gray-200 rounded-b-lg overflow-hidden border border-gray-200 shadow-sm">
              {displayMatches.length > 0 ? (
                displayMatches.map((match) => (
                  <InPlayMatchRow key={match.gmid} match={match} />
                ))
              ) : (
                <div className="p-8 text-center bg-white text-gray-500 border-b border-gray-200">
                  No in-Play matches available for this category right now.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-3">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InPlay;
