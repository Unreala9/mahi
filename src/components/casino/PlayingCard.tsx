import { cn } from "@/lib/utils";

interface PlayingCardProps {
  card: string; // Format: "9SS" = 9 of Spades, "KHH" = King of Hearts
  className?: string;
  flipped?: boolean;
}

export function PlayingCard({
  card,
  className,
  flipped = false,
}: PlayingCardProps) {
  // Parse card string
  const parseCard = (cardStr: string) => {
    if (!cardStr || cardStr.length < 3)
      return { rank: "?", suit: { symbol: "?", color: "text-gray-600" } };

    // Extract rank (all except last 2 chars)
    const rank = cardStr.slice(0, -2);
    // Extract suit (last 2 chars)
    const suitCode = cardStr.slice(-2);

    // Map suit codes
    const suitMap: Record<string, { symbol: string; color: string }> = {
      HH: { symbol: "♥", color: "text-red-600" }, // Hearts
      DD: { symbol: "♦", color: "text-red-600" }, // Diamonds
      CC: { symbol: "♣", color: "text-black" }, // Clubs
      SS: { symbol: "♠", color: "text-black" }, // Spades
    };

    const suit: { symbol: string; color: string } = suitMap[suitCode] || {
      symbol: "?",
      color: "text-gray-600",
    };

    return { rank, suit };
  };

  const { rank, suit } = parseCard(card);

  if (flipped) {
    return (
      <div
        className={cn(
          "relative bg-gradient-to-br from-blue-500 to-blue-700",
          "rounded-lg border-2 border-white shadow-lg",
          "flex items-center justify-center",
          "w-16 h-24",
          className,
        )}
      >
        <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded" />
        <div className="text-white text-2xl font-bold">🂠</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative bg-white rounded-lg border-2 border-gray-300 shadow-lg",
        "w-16 h-24 p-2",
        "transition-transform hover:scale-105",
        className,
      )}
    >
      {/* Top rank and suit */}
      <div className="absolute top-1 left-1 flex flex-col items-center">
        <span className={cn("text-xl font-bold leading-none", suit.color)}>
          {rank}
        </span>
        <span className={cn("text-2xl leading-none", suit.color)}>
          {suit.symbol}
        </span>
      </div>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-5xl", suit.color)}>{suit.symbol}</span>
      </div>

      {/* Bottom rank and suit (rotated) */}
      <div className="absolute bottom-1 right-1 flex flex-col-reverse items-center rotate-180">
        <span className={cn("text-xl font-bold leading-none", suit.color)}>
          {rank}
        </span>
        <span className={cn("text-2xl leading-none", suit.color)}>
          {suit.symbol}
        </span>
      </div>
    </div>
  );
}

interface CardHandProps {
  cards: string[]; // Array of card strings like ["9SS", "KHH", "ADD"]
  label?: string;
  className?: string;
}

export function CardHand({ cards, label, className }: CardHandProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {label && (
        <h3 className="text-white font-bold text-sm uppercase tracking-wide">
          {label}
        </h3>
      )}
      <div className="flex gap-2">
        {cards.map((card, idx) => (
          <PlayingCard
            key={`${card}-${idx}`}
            card={card}
            className="transform hover:translate-y-[-4px] transition-transform"
          />
        ))}
      </div>
    </div>
  );
}

interface CardPlaceholderProps {
  className?: string;
  label?: string;
}

export function CardPlaceholder({ className, label }: CardPlaceholderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {label && (
        <span className="text-white text-sm font-medium uppercase">
          {label}
        </span>
      )}
      <div className="w-16 h-24 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center">
        <div className="w-12 h-20 border border-dashed border-slate-500 rounded" />
      </div>
    </div>
  );
}
