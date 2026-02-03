import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCasinoWebSocket } from "@/hooks/api/useCasinoWebSocket";
import type { CasinoGame } from "@/types/casino";

interface GenericCardGameProps {
  game: CasinoGame;
}

export const GenericCardGame: React.FC<GenericCardGameProps> = ({ game }) => {
  const gmid = (game?.gmid || "unknown").toLowerCase();
  const { gameData, resultData } = useCasinoWebSocket(gmid);

  if (!gameData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
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
