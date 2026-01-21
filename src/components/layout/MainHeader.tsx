import { Menu, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface MainHeaderProps {
  session?: any;
  handleLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const MainHeader = ({
  session,
  handleLogout,
  onToggleSidebar,
}: MainHeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 md:h-16 border-b border-border premium-glass-blue px-3 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300 backdrop-saturate-150">
      {/* Left side (Mobile Toggle) */}
      <div className="flex items-center gap-4">
        <div className="md:hidden cursor-pointer p-1" onClick={onToggleSidebar}>
          <Menu className="w-6 h-6 text-foreground" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground hidden md:block">
          Welcome to the Arena
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-6 px-4 border-r border-border">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">
              Live Odds
            </span>
            <span className="text-xs text-green-500 font-mono flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              CONNECTED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Theme Toggle */}
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 md:w-9 md:h-9 p-0 rounded-full hover:bg-muted"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
            <Moon className="absolute h-3.5 w-3.5 md:h-4 md:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            size="sm"
            className="h-8 md:h-9 px-2 md:px-4 text-xs md:text-sm btn-primary-glow rounded-none"
          >
            Deposit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-none border-border hover:bg-muted/50"
          >
            <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
};
