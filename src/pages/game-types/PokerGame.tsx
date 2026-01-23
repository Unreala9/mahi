import { GenericCardGame } from "./GenericCardGame";
import { CasinoGame } from "@/types/casino";

interface PokerGameProps {
  game: CasinoGame;
}

export function PokerGame({ game }: PokerGameProps) {
  return <GenericCardGame game={game} />;
}
