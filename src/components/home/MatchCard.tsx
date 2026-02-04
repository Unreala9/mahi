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
      className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/20 transition-all cursor-pointer group min-w-[320px] border border-blue-900/30"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SportsIcon
              sportName={match.sport}
              sportId={match.sportId}
              size={20}
            />
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              {match.sport}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors">
              MO
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full transition-colors">
              BM
            </button>
          </div>
        </div>

        {/* Tournament */}
        <div className="text-white/80 text-xs mb-2 font-medium">
          {match.tournament}
        </div>

        {/* Match Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-white font-bold text-base leading-tight flex-1">
            {match.matchName}
          </div>
          {match.isLive && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase animate-pulse">
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
        <div className="px-4 pb-4">
          <div className="grid grid-cols-6 gap-2">
            {/* Back 1 */}
            {match.odds.back1 && (
              <div className="bg-[#72bbef] hover:bg-[#5da8dc] text-white rounded-lg py-3 px-2 text-center transition-colors cursor-pointer">
                <div className="text-lg font-bold leading-none">
                  {match.odds.back1}
                </div>
                <div className="text-[9px] opacity-80 mt-1">Back</div>
              </div>
            )}
            {/* Lay 1 */}
            {match.odds.lay1 && (
              <div className="bg-[#faa9ba] hover:bg-[#f88fa5] text-white rounded-lg py-3 px-2 text-center transition-colors cursor-pointer">
                <div className="text-lg font-bold leading-none">
                  {match.odds.lay1}
                </div>
                <div className="text-[9px] opacity-80 mt-1">Lay</div>
              </div>
            )}
            {/* Suspended/Locked */}
            <div className="bg-white/10 rounded-lg py-3 px-2 flex items-center justify-center opacity-50">
              <svg
                className="w-4 h-4 text-white/60"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="bg-white/10 rounded-lg py-3 px-2 flex items-center justify-center opacity-50">
              <svg
                className="w-4 h-4 text-white/60"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {/* Back 2 */}
            {match.odds.back2 && (
              <div className="bg-[#72bbef] hover:bg-[#5da8dc] text-white rounded-lg py-3 px-2 text-center transition-colors cursor-pointer">
                <div className="text-lg font-bold leading-none">
                  {match.odds.back2}
                </div>
                <div className="text-[9px] opacity-80 mt-1">Back</div>
              </div>
            )}
            {/* Lay 2 */}
            {match.odds.lay2 && (
              <div className="bg-[#faa9ba] hover:bg-[#f88fa5] text-white rounded-lg py-3 px-2 text-center transition-colors cursor-pointer">
                <div className="text-lg font-bold leading-none">
                  {match.odds.lay2}
                </div>
                <div className="text-[9px] opacity-80 mt-1">Lay</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
