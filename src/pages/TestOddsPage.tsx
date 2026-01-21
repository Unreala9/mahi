import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useSportIds, useMatchesBySport, useMatchOdds, useMatchDetails } from "@/hooks/api/useDiamond";
import { diamondApi, type MatchEvent } from "@/services/diamondApi";

type Odds = { otype?: string; oname?: string; odds?: number; size?: number };
type Section = { sid: number; nat?: string; odds?: Odds[] };

export default function TestOddsPage() {
  const { data: sports, isLoading: sportsLoading } = useSportIds();
  const [selectedSport, setSelectedSport] = useState<number>(4); // Cricket
  
  const { data: matches = [], isLoading: matchesLoading } = useMatchesBySport(selectedSport);
  const [selectedMatch, setSelectedMatch] = useState<MatchEvent | null>(null);
  
  const gmid = selectedMatch?.gmid ?? null;
  const sid = selectedMatch?.sid ?? null;
  
  const { data: details, isLoading: detailsLoading } = useMatchDetails(gmid, sid);
  const { data: odds, isLoading: oddsLoading } = useMatchOdds(gmid, sid);
  
  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-white">Test Odds Data (HTTP Only)</h1>
        
        {/* Sports */}
        <div className="bg-[#0f172a] border border-[#1f2a44] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-3">1. Sports</h2>
          {sportsLoading ? (
            <div className="text-gray-400">Loading sports...</div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {(sports || []).map((sport) => (
                <button
                  key={sport.sid}
                  onClick={() => setSelectedSport(sport.sid)}
                  className={`px-3 py-1 rounded text-sm ${selectedSport === sport.sid ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  {sport.icon} {sport.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Matches */}
        <div className="bg-[#0f172a] border border-[#1f2a44] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-3">2. Matches ({matches.length})</h2>
          {matchesLoading ? (
            <div className="text-gray-400">Loading matches...</div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {matches.slice(0, 10).map((match) => (
                <button
                  key={match.gmid}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full text-left p-3 rounded border ${selectedMatch?.gmid === match.gmid ? 'bg-[#13203a] border-blue-600' : 'bg-[#0b1220] border-[#1f2a44]'}`}
                >
                  <div className="text-sm text-white">{match.name}</div>
                  <div className="text-xs text-gray-400">{match.cname}</div>
                  <div className="text-xs text-gray-500">gmid: {match.gmid}, sid: {match.sid}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Match Details */}
        {selectedMatch && (
          <>
            <div className="bg-[#0f172a] border border-[#1f2a44] p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-3">3. Match Details</h2>
              {detailsLoading ? (
                <div className="text-gray-400">Loading details...</div>
              ) : details ? (
                <div className="space-y-2 text-sm">
                  <div className="text-white">Name: {details.name}</div>
                  <div className="text-gray-300">Start: {details.start_date}</div>
                  <div className="text-gray-300">Live: {details.is_live ? 'Yes' : 'No'}</div>
                  {details.teams && (
                    <div className="text-gray-300">
                      Teams: {details.teams.home} vs {details.teams.away}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400">No details available</div>
              )}
            </div>
            
            <div className="bg-[#0f172a] border border-[#1f2a44] p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-3">4. Odds Data</h2>
              {oddsLoading ? (
                <div className="text-gray-400">Loading odds...</div>
              ) : odds ? (
                <div className="space-y-4">
                  {/* Match Odds */}
                  <div>
                    <div className="text-sm font-semibold text-blue-400 mb-2">
                      Match Odds ({(odds.match_odds || []).length} runners)
                    </div>
                    {(odds.match_odds || []).length > 0 ? (
                      <div className="space-y-2">
                        {(odds.match_odds as Section[]).map((runner) => (
                          <div key={runner.sid} className="bg-[#0b1220] p-2 rounded border border-[#1f2a44]">
                            <div className="text-xs text-white mb-1">{runner.nat}</div>
                            <div className="text-xs text-gray-400">
                              Odds: {runner.odds?.length || 0} prices
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No match odds</div>
                    )}
                  </div>
                  
                  {/* Bookmaker */}
                  <div>
                    <div className="text-sm font-semibold text-green-400 mb-2">
                      Bookmaker ({(odds.bookmaker || []).length} runners)
                    </div>
                    {(odds.bookmaker || []).length > 0 ? (
                      <div className="text-xs text-gray-400">
                        {(odds.bookmaker as Section[]).map((r) => r.nat).join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No bookmaker odds</div>
                    )}
                  </div>
                  
                  {/* Fancy */}
                  <div>
                    <div className="text-sm font-semibold text-purple-400 mb-2">
                      Fancy ({(odds.fancy || []).length} markets)
                    </div>
                    {(odds.fancy || []).length > 0 ? (
                      <div className="text-xs text-gray-400">
                        First 5: {(odds.fancy as Section[]).slice(0, 5).map((r) => r.nat).join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No fancy markets</div>
                    )}
                  </div>
                  
                  {/* Raw JSON preview */}
                  <details className="mt-4">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                      Show raw JSON
                    </summary>
                    <pre className="mt-2 text-xs bg-black/50 p-3 rounded overflow-auto max-h-[300px]">
                      {JSON.stringify(odds, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-400">No odds available</div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
