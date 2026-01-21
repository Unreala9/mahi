import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCasinoGames, inferCategory } from "@/services/casino";
import { getImageCandidates } from "@/services/casino";
import { useMemo, useState } from "react";
import type { CasinoGame } from "@/types/casino";

export default function CasinoGame() {
  const { gmid } = useParams<{ gmid: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["casino-games"],
    queryFn: fetchCasinoGames,
  });

  const game: CasinoGame | undefined = (data ?? []).find((g) => g.gmid === gmid);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
        <h2 className="text-lg font-black uppercase tracking-wider">Game Details</h2>
        <Link to="/casino">
          <Button variant="outline" className="rounded-none text-xs uppercase">Back to Casino</Button>
        </Link>
      </div>

      {isLoading && (
        <Card className="p-6 rounded-none">
          <p className="text-sm text-muted-foreground">Loading game…</p>
        </Card>
      )}
      {isError && (
        <Card className="p-6 rounded-none">
          <p className="text-sm text-destructive">Failed to load game.</p>
        </Card>
      )}

      {!isLoading && !isError && !game && (
        <Card className="p-6 rounded-none">
          <p className="text-sm">Game not found.</p>
        </Card>
      )}

      {!isLoading && !isError && game && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 rounded-none md:col-span-2">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">{game.gname}</h3>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="rounded-none">{inferCategory(game)}</Badge>
              <Badge variant="outline" className="rounded-none">{game.gmid}</Badge>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">CID: {game.cid} • GID: {game.gid} • SRNO: {game.srno}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Tab: {game.tabno} • Frame: {game.isframe} • TID: {game.tid}</p>

            <div className="mt-6 border border-border p-0 bg-black">
              <ImageBanner imgpath={game.imgpath} alt={game.gname} />
            </div>
          </Card>

          <Card className="p-6 rounded-none">
            <div className="aspect-video bg-card border border-border flex items-center justify-center">
              <p className="text-xs text-muted-foreground uppercase">Table ID: {game.gmid}</p>
            </div>
            <Button className="w-full mt-4 rounded-none text-xs uppercase">Play</Button>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}

function ImageBanner({ imgpath, alt }: { imgpath: string; alt: string }) {
  const sources = useMemo(() => getImageCandidates(imgpath), [imgpath]);
  const [idx, setIdx] = useState(0);
  const src = sources[idx] || "";
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-[280px] object-cover"
      onError={(e) => {
        const next = idx + 1;
        if (next < sources.length) {
          setIdx(next);
        } else {
          (e.target as HTMLImageElement).style.display = "none";
        }
      }}
    />
  );
}