import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  logo?: string;
}

interface ProvidersRowProps {
  providers?: Provider[];
  onProviderClick?: (providerId: string) => void;
}

export const ProvidersRow = ({ providers = [], onProviderClick }: ProvidersRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock providers if none provided
  const mockProviders: Provider[] = [
    { id: "1", name: "Dragon Tiger" },
    { id: "2", name: "Aviator" },
    { id: "3", name: "Mines" },
    { id: "4", name: "Color Game" },
    { id: "5", name: "Color Prediction" },
    { id: "6", name: "Chicken Game" },
    { id: "7", name: "Andar Bahar" },
    { id: "8", name: "Teenpatti" },
    { id: "9", name: "Lottery" },
    { id: "10", name: "Live Poker" },
    { id: "11", name: "Crash Games" },
    { id: "12", name: "Scratch Cards" },
  ];

  const displayProviders = providers.length > 0 ? providers : mockProviders;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="p-4 bg-[#0f1419]">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">Game Providers</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Providers Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth"
      >
        <div className="flex gap-3 pb-2">
          {displayProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => onProviderClick?.(provider.id)}
              className="flex-shrink-0 px-6 py-3 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium transition-all whitespace-nowrap border border-gray-700 hover:border-transparent"
            >
              {provider.logo ? (
                <img src={provider.logo} alt={provider.name} className="h-6" />
              ) : (
                provider.name
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
