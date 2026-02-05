import { SportsIcon } from "@/components/ui/SportsIcon";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  match: {
    id: string;
    sport: string;
    sportId: number;
    tournament: string;
    team1?: string;
    team2?: string;
    matchName: string;
    isLive: boolean;
    time?: string;
    odds?: {
      back1?: number;
      lay1?: number;
      back2?: number;
      lay2?: number;
      backX?: number;
      layX?: number;
    };
  };
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-[#0b1a32] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer group min-w-[320px] border border-blue-900/30 font-sans"
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SportsIcon
              sportName={match.sport}
              sportId={match.sportId}
              size={24}
              className="text-white drop-shadow-md"
            />
            <span className="text-white font-bold text-sm uppercase tracking-wider drop-shadow-sm">
              {match.sport}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white hover:bg-gray-200 text-black text-[10px] font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm">
              MO
            </button>
            <button className="bg-white hover:bg-gray-200 text-black text-[10px] font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm">
              BM
            </button>
            <button className="bg-white hover:bg-gray-200 text-black text-[10px] font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm">
              F
            </button>
          </div>
        </div>

        {/* Tournament */}
        <div className="text-white/70 text-[11px] mb-1 font-semibold uppercase tracking-wide">
          {match.tournament}
        </div>

        {/* Match Name */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-white font-bold text-base leading-tight">
             {match.team1 && match.team2 ? (
                <span>
                  {match.team1} <span className="text-white/60 mx-1">v</span> {match.team2}
                </span>
             ) : match.matchName}
          </div>
          {match.isLive && (
            <span className="bg-[#ff0000] text-white text-[10px] font-bold px-2 py-[2px] rounded uppercase animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.5)]">
              LIVE
            </span>
          )}
        </div>

        {/* Time */}
        {!match.isLive && match.time && (
          <div className="text-white/60 text-xs font-medium mb-3">
            {match.time}
          </div>
        )}
      </div>

      {/* Odds Grid */}
      {match.odds && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-6 gap-2">

            {/* Locked Placeholders (Left) - Mimicking the layout if needed, or just keeping the grid */}
             <div className="col-span-2 grid grid-cols-2 gap-1 opacity-50">
               {/* Placeholders matching the image style roughly if data missing, but here we just render odds if extending logic */}
            </div>

            {/* Back 1 */}
            <div className="col-span-1">
             {match.odds.back1 ? (
              <div className="bg-[#72bbef] hover:bg-[#5da8dc] text-white rounded-l-2xl rounded-r-none py-2 px-1 text-center transition-colors cursor-pointer h-full flex flex-col justify-center border-r border-white/10">
                <div className="text-lg font-bold leading-none">
                  {match.odds.back1}
                </div>
                 {/* Placeholder for volume if we had it */}
                {/* <div className="text-[9px] opacity-90 mt-[1px]">100k</div> */}
              </div>
             ) : (
                <div className="bg-[#aebccd]/20 rounded-l-2xl h-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
             )}
            </div>

            {/* Lay 1 */}
            <div className="col-span-1">
             {match.odds.lay1 ? (
              <div className="bg-[#faa9ba] hover:bg-[#f88fa5] text-white rounded-r-2xl rounded-l-none py-2 px-1 text-center transition-colors cursor-pointer h-full flex flex-col justify-center">
                <div className="text-lg font-bold leading-none">
                  {match.odds.lay1}
                </div>
              </div>
             ) : (
                 <div className="bg-[#aebccd]/20 rounded-r-2xl h-full flex items-center justify-center mr-1">
                     <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                 </div>
             )}
            </div>

            {/* Back 2 */}
             <div className="col-span-1">
             {match.odds.back2 ? (
              <div className="bg-[#8eceff] hover:bg-[#72bbef] text-white rounded-l-2xl rounded-r-none py-2 px-1 text-center transition-colors cursor-pointer h-full flex flex-col justify-center border-r border-white/10">
                <div className="text-lg font-bold leading-none">
                  {match.odds.back2}
                </div>
              </div>
             ) : (
                <div className="bg-[#aebccd]/20 rounded-l-2xl h-full flex items-center justify-center ml-1">
                    <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
             )}
            </div>

            {/* Lay 2 */}
            <div className="col-span-1">
             {match.odds.lay2 ? (
              <div className="bg-[#ffb7c5] hover:bg-[#faa9ba] text-white rounded-r-2xl rounded-l-none py-2 px-1 text-center transition-colors cursor-pointer h-full flex flex-col justify-center">
                <div className="text-lg font-bold leading-none">
                  {match.odds.lay2}
                </div>
              </div>
             ) : (
                <div className="bg-[#aebccd]/20 rounded-r-2xl h-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
             )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
