import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import type { CasinoGame } from "@/types/casino";
import { useNavigate } from "react-router-dom";

interface GenericCardGameProps {
  game: CasinoGame;
}

export const GenericCardGame: React.FC<GenericCardGameProps> = ({ game }) => {
  const gmid = (game?.gmid || "unknown").toLowerCase();
  const { gameData, resultData, error } = useCasinoWebSocket(gmid);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const navigate = useNavigate();

  // Set timeout for loading state - if no data after 10 seconds, show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameData) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [gameData]);

  // Show loading state for first 10 seconds
  if (!gameData && !loadingTimeout && !error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            Loading {game?.gname || "game"}...
          </p>
        </div>
      </MainLayout>
    );
  }

  // Show error if timeout or API error
  if (loadingTimeout || error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4 p-8">
          <h2 className="text-2xl font-bold text-destructive">
            Game Unavailable
          </h2>
          <p className="text-muted-foreground text-center">
            {error ||
              "Unable to load game data. The game might be temporarily offline."}
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/casino")}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Back to Casino
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">
          {gameData?.gname || game?.gname || gmid}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Round: {gameData?.mid || "-"}
        </p>
        <div className="bg-card p-4 rounded shadow">
          <p className="text-sm">
            This is a generic fallback view for simple card/slot-style games.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Live results:{" "}
            {Array.isArray(resultData?.res)
              ? resultData.res.slice(-10).join(", ")
              : "-"}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
