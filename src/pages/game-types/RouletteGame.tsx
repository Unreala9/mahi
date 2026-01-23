import { GenericCardGame } from "./GenericCardGame";
import { CasinoGame } from "@/types/casino";

interface RouletteGameProps {
  game: CasinoGame;
}

export function RouletteGame({ game }: RouletteGameProps) {
  return <GenericCardGame game={game} />;
}
