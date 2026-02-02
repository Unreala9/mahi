import { CasinoGame } from "@/types/casino";
import { MainLayout } from "@/components/layout/MainLayout";

interface MogamboGameProps {
  game?: CasinoGame;
}

export default function MogamboGame({ game }: MogamboGameProps) {
  const gameId = game?.gmid || "mogambo";
  const gameName = game?.gname || "Mogambo";

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{gameName}</h1>
          <p className="text-muted-foreground">Game ID: {gameId}</p>
          <p className="text-sm text-muted-foreground mt-4">Coming Soon</p>
        </div>
      </div>
    </MainLayout>
  );
}
