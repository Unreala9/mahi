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

      {/* Categories Scroller */}
      {categories.length > 0 && (
        <div className="bg-[#080c14] border-t border-white/5">
          <div className="flex items-center">
            <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 border-r border-white/5 transition-colors">
              <List className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                        relative px-6 py-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border-r border-white/5
                        ${
                          isActive
                            ? "bg-red-500 text-black"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {cat.name}
                        {cat.id === "all" && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-gray-500"}`}
                          >
                            {totalGames}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
