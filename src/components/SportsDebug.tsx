import { useSearchParams } from "react-router-dom";
import {
  useLiveSportsData,
  useLiveSportMatches,
} from "@/hooks/api/useLiveSportsData";

export const SportsDebug = () => {
  const [searchParams] = useSearchParams();
  const sportParam = searchParams.get("sport");
  const selectedSport = sportParam ? parseInt(sportParam) : 4;

  const { sports, isConnected, isLoading: globalLoading } = useLiveSportsData();
  const { matches, liveMatches, isLoading } =
    useLiveSportMatches(selectedSport);

  return (
    <div className="p-4 bg-gray-900 text-white font-mono text-sm">
      <h2 className="text-xl font-bold mb-4">Sports Debug Info</h2>

      <div className="mb-4">
        <h3 className="font-bold text-green-400">Current State:</h3>
        <p>Selected Sport ID: {selectedSport}</p>
        <p>Is Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
        <p>Global Loading: {globalLoading ? "⏳ Yes" : "✅ Done"}</p>
        <p>Sport Loading: {isLoading ? "⏳ Yes" : "✅ Done"}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-blue-400">
          Available Sports ({sports.length}):
        </h3>
        <div className="max-h-40 overflow-y-auto">
          {sports.map((sport) => (
            <div
              key={sport.sid}
              className={sport.sid === selectedSport ? "text-yellow-400" : ""}
            >
              ID: {sport.sid} - {sport.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-purple-400">
          Matches for Sport {selectedSport} ({matches.length} total,{" "}
          {liveMatches.length} live):
        </h3>
        <div className="max-h-60 overflow-y-auto">
          {matches.length === 0 ? (
            <p className="text-red-400">
              ⚠️ No matches found for this sport ID
            </p>
          ) : (
            matches.slice(0, 10).map((match) => (
              <div
                key={match.gmid}
                className="mb-2 border-l-2 border-gray-700 pl-2"
              >
                <p className="text-yellow-300">{match.name}</p>
                <p className="text-xs text-gray-400">
                  League: {match.cname} | Live:{" "}
                  {match.is_live ? "🔴 Yes" : "⚪ No"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
