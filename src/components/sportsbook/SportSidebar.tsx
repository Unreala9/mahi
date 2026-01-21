import { Sport } from "@/services/sportbex";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SportSidebarProps {
  sports: Sport[];
  selectedSportId: string;
  onSelectSport: (id: string) => void;
}

export const SportSidebar = ({
  sports,
  selectedSportId,
  onSelectSport,
}: SportSidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col h-full fixed left-0 top-0 pt-16 z-30">
        <div className="p-4">
          <h2 className="text-sidebar-foreground font-display font-bold px-2 mb-2 text-sm uppercase tracking-wider opacity-70">
            Sports
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              <button
                onClick={() => onSelectSport("all")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  selectedSportId === "all"
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span>🏠</span>
                  <span>All Sports</span>
                </div>
              </button>
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => onSelectSport(sport.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    selectedSportId === sport.id
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{sport.icon}</span>
                    <span>{sport.name}</span>
                  </div>
                  {sport.count && (
                    <span className="text-xs text-muted-foreground bg-black/20 px-1.5 py-0.5 rounded">
                      {sport.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Horizontal Bar */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
         <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex p-2 gap-2">
              <button
                onClick={() => onSelectSport("all")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                  selectedSportId === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:bg-accent"
                )}
              >
                <span>🏠</span>
                <span>All</span>
              </button>
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => onSelectSport(sport.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    selectedSportId === sport.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border hover:bg-accent"
                  )}
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
         </ScrollArea>
      </div>
    </>
  );
};
