import { Search, X, Grid, List, MonitorPlay, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CasinoToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  categories: { id: string; name: string; icon: React.ReactNode }[];
  totalGames: number;
}

export const CasinoToolbar = ({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  totalGames,
}: CasinoToolbarProps) => {
  return (
    <div className="sticky top-0 z-30 bg-[#050b14]/95 backdrop-blur-md border-b border-white/5 mb-6 shadow-2xl transition-all duration-300">
      <div className="p-4 md:px-6">
        {/* Search Input - Minimalist */}
        <div className="relative w-full group transition-all duration-300">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find game..."
            className="pl-10 bg-white/5 border-transparent text-white placeholder:text-gray-600 rounded-xl h-12 font-medium text-sm focus:border-primary/20 focus:bg-white/10 focus:ring-0 transition-all shadow-inner w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
