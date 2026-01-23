import { GenericCardGame } from "./GenericCardGame";
import { CasinoGame } from "@/types/casino";

interface MatkaGameProps {
  game: CasinoGame;
}

export function MatkaGame({ game }: MatkaGameProps) {
  return <GenericCardGame game={game} />;
}
