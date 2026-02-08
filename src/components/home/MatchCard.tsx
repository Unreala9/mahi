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
      className="group relative bg-[#050b14]/90 backdrop-blur-md rounded-lg overflow-hidden transition-all duration-300 cursor-pointer min-w-[340px] border-l-[3px] border-l-transparent hover:border-l-primary border-t border-r border-b border-white/5 hover:border-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
    >
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Header */}
      <div className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded backdrop-blur">
              <SportsIcon
                sportName={match.sport}
                sportId={match.sportId}
                size={16}
                className="text-primary drop-shadow-[0_0_8px_rgba(255,255,60,0.5)]"
              />
            </div>
            <span className="text-primary font-mono font-bold text-[10px] uppercase tracking-[0.2em]">
              {match.sport}
            </span>
          </div>

          {match.isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-500 text-[10px] font-bold font-mono uppercase tracking-widest animate-pulse">
                LIVE
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 border border-white/10 rounded text-center">
              <span className="text-gray-400 text-[10px] font-mono">
                {match.time}
              </span>
            </div>
          )}
        </div>

        {/* Tournament */}
        <div className="text-gray-500 text-[10px] mb-1 font-mono uppercase tracking-wide truncate">
          {match.tournament}
        </div>

        {/* Match Name */}
        <div className="mb-4">
          {match.team1 && match.team2 ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300">
                <span className="text-white font-display font-bold text-lg leading-none tracking-tight">
                  {match.team1}
                </span>
              </div>
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300 delay-75">
                <span className="text-white font-display font-bold text-lg leading-none tracking-tight">
                  {match.team2}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-white font-display font-bold text-lg leading-tight">
              {match.matchName}
            </div>
          )}
        </div>

        {/* Odds Grid */}
        {match.odds && (
          <div className="grid grid-cols-6 gap-1.5 mt-2">
            {/* Back 1 */}
            <div className="col-span-2">
              <OddsButton type="back" value={match.odds.back1} />
            </div>
            {/* Back X / Draw (if exists) or Spacer */}
            <div className="col-span-2">
              <OddsButton type="back" value={match.odds.backX} label="X" />
            </div>
            {/* Back 2 */}
            <div className="col-span-2">
              <OddsButton type="back" value={match.odds.back2} />
            </div>

            {/* Lay 1 */}
            <div className="col-span-2">
              <OddsButton type="lay" value={match.odds.lay1} />
            </div>
            {/* Lay X */}
            <div className="col-span-2">
              <OddsButton type="lay" value={match.odds.layX} label="X" />
            </div>
            {/* Lay 2 */}
            <div className="col-span-2">
              <OddsButton type="lay" value={match.odds.lay2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OddsButton = ({
  type,
  value,
  label,
}: {
  type: "back" | "lay";
  value?: number;
  label?: string;
}) => {
  if (!value)
    return (
      <div className="h-full min-h-[32px] bg-white/5 rounded-sm w-full opacity-20" />
    );

  const isBack = type === "back";
  // Neon Blue for Back, Neon Pink/Red for Lay
  // Using custom terminal colors
  const bgColor = isBack
    ? "bg-[#00a8e8]/20 hover:bg-[#00a8e8]"
    : "bg-[#ff007f]/20 hover:bg-[#ff007f]";
  const textColor = isBack
    ? "text-[#00a8e8] group-hover/btn:text-white"
    : "text-[#ff007f] group-hover/btn:text-white";
  const borderColor = isBack ? "border-[#00a8e8]/30" : "border-[#ff007f]/30";

  return (
    <button
      className={`group/btn relative w-full h-[36px] flex flex-col items-center justify-center ${bgColor} border ${borderColor} transition-all duration-200 rounded-sm overflow-hidden`}
    >
      <span
        className={`font-mono font-bold text-sm ${textColor} transition-colors z-10`}
      >
        {value}
      </span>
      {/* Corner Accent */}
      <div
        className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${isBack ? "border-cyan-400" : "border-pink-500"} opacity-50`}
      />
    </button>
  );
};
