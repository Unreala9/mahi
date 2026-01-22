import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCasinoGames } from "@/services/casino";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { UnifiedCasinoGame } from "./game-types/UnifiedCasinoGame";

export default function CasinoGame() {
  const { gmid } = useParams<{ gmid: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
  });

  const game = (data ?? []).find((g) => g.gmid === gmid);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !game) {
    return (
      <MainLayout>
        <Card className="p-8">
          <p className="text-center text-destructive">
            Failed to load game or game not found.
          </p>
        </Card>
      </MainLayout>
    );
  }

  return <UnifiedCasinoGame game={game} />;
}
