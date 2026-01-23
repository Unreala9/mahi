import { GenericCardGame } from "./GenericCardGame";
import { CasinoGame } from "@/types/casino";

interface MogamboGameProps {
  game: CasinoGame;
}

export function MogamboGame({ game }: MogamboGameProps) {
  return <GenericCardGame game={game} />;
}
