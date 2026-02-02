import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TARGET_GAMES = [
  "worli3",
  "teen62",
  "dolidana",
  "roulette12",
  "roulette13",
  "roulette11",
  "ourroullete",
];

export function DebugCasino() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const checkGames = async () => {
    setLoading(true);
    const newResults: Record<string, any> = {};

    const API_HOST = import.meta.env.VITE_DIAMOND_API_HOST || "/api/diamond";
    const API_KEY =
      import.meta.env.VITE_DIAMOND_API_KEY || "mahi4449839dbabkadbakwq1qqd";

    // Construct base URL similar to casinoWebSocket service
    const API_PROTOCOL = import.meta.env.VITE_DIAMOND_API_PROTOCOL || "";
    const BASE_URL = API_HOST.startsWith("/")
      ? API_HOST
      : API_PROTOCOL
        ? `${API_PROTOCOL}://${API_HOST}`
        : `http://${API_HOST}`;

    for (const gmid of TARGET_GAMES) {
      try {
        const url = `${BASE_URL}/casinoDetail?gmid=${gmid}&key=${API_KEY}`;
        newResults[gmid] = { url, status: "Fetching..." };

        const res = await fetch(url);
        const json = await res.json();

        newResults[gmid] = {
          url,
          status: res.status,
          success: json.success,
          data: json.data,
          raw: json,
        };
      } catch (err: any) {
        newResults[gmid] = {
          status: "Error",
          message: err.message,
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <Card className="p-4 m-4 bg-slate-900 border-red-500 border-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-red-500 font-bold text-xl">
          DEBUG MODE: Missing Games
        </h3>
        <Button onClick={checkGames} disabled={loading}>
          {loading ? "Checking..." : "Check API for Missing Games"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {TARGET_GAMES.map((gmid) => (
          <div
            key={gmid}
            className="bg-black/50 p-2 rounded text-xs font-mono overflow-auto max-h-40"
          >
            <div className="font-bold text-yellow-400 mb-1">GAME: {gmid}</div>
            {results[gmid] ? (
              <pre className="whitespace-pre-wrap text-white">
                {JSON.stringify(results[gmid], null, 2)}
              </pre>
            ) : (
              <span className="text-gray-500">Waiting to check...</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
