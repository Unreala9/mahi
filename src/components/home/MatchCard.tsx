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
      className="group bg-white rounded-lg overflow-hidden transition-all duration-300 cursor-pointer min-w-[340px] border border-gray-200 hover:border-[#1a472a] hover:shadow-md"
    >
      {/* Header */}
      <div className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-50 rounded">
              <SportsIcon
                sportName={match.sport}
                sportId={match.sportId}
                size={16}
                className="text-[#1a472a]"
              />
            </div>
            <span className="text-[#1a472a] font-bold text-[10px] uppercase tracking-wider">
              {match.sport}
            </span>
          </div>

          {match.isLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                LIVE
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 border border-gray-200 rounded text-center">
              <span className="text-gray-500 text-[10px] font-mono">
                {match.time}
              </span>
            </div>
          )}
        </div>

        {/* Tournament */}
        <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wide truncate font-medium">
          {match.tournament}
        </div>

        {/* Match Name */}
        <div className="mb-4">
          {match.team1 && match.team2 ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300">
                <span className="text-gray-800 font-bold text-lg leading-none tracking-tight">
                  {match.team1}
                </span>
              </div>
              <div className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300 delay-75">
                <span className="text-gray-800 font-bold text-lg leading-none tracking-tight">
                  {match.team2}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 font-bold text-lg leading-tight">
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
    return <div className="h-full min-h-[36px] bg-gray-100 rounded w-full" />;

  const isBack = type === "back";
  const btnClass = isBack ? "odds-btn-back" : "odds-btn-lay";

  return (
    <button
      className={`relative w-full h-[36px] flex flex-col items-center justify-center ${btnClass}`}
    >
      <span className="font-bold text-sm leading-none">{value}</span>
      {label && (
        <span className="text-[10px] text-gray-700 leading-none mt-0.5 font-medium">
          {label}
        </span>
      )}
    </button>
  );
};


