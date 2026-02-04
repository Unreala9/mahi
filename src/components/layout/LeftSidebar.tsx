import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Trophy,
  Dribbble,
  Volleyball,
  TableTennis,
  Gamepad2,
  Horse,
  Dog,
  Basketball,
  Dumbbell,
  Target,
  Feather,
  Circle,
  ChevronRight,
  User,
} from "lucide-react";

interface SportItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const sports: SportItem[] = [
  { id: 4, name: "Cricket", icon: <Trophy className="w-4 h-4" />, path: "/sportsbook?sport=4" },
  { id: 1, name: "Football", icon: <Dribbble className="w-4 h-4" />, path: "/sportsbook?sport=1" },
  { id: 2, name: "Tennis", icon: <Circle className="w-4 h-4" />, path: "/sportsbook?sport=2" },
  { id: 3, name: "Kabaddi", icon: <Dumbbell className="w-4 h-4" />, path: "/sportsbook?sport=3" },
  { id: 8, name: "Basketball", icon: <Basketball className="w-4 h-4" />, path: "/sportsbook?sport=8" },
  { id: 11, name: "Baseball", icon: <Circle className="w-4 h-4" />, path: "/sportsbook?sport=11" },
  { id: 12, name: "GreyHound", icon: <Dog className="w-4 h-4" />, path: "/sportsbook?sport=12" },
  { id: 7, name: "Horse Race", icon: <Horse className="w-4 h-4" />, path: "/sportsbook?sport=7" },
  { id: 10, name: "Volleyball", icon: <Volleyball className="w-4 h-4" />, path: "/sportsbook?sport=10" },
  { id: 13, name: "Darts", icon: <Target className="w-4 h-4" />, path: "/sportsbook?sport=13" },
  { id: 5, name: "Futsal", icon: <Dribbble className="w-4 h-4" />, path: "/sportsbook?sport=5" },
  { id: 6, name: "Table Tennis", icon: <TableTennis className="w-4 h-4" />, path: "/sportsbook?sport=6" },
  { id: 9, name: "Binary", icon: <Gamepad2 className="w-4 h-4" />, path: "/sportsbook?sport=9" },
  { id: 14, name: "Politics", icon: <Feather className="w-4 h-4" />, path: "/sportsbook?sport=14" },
];

export const LeftSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-[#0f1419] border-r border-gray-800 transition-all duration-300 z-40 ${
          isCollapsed ? "w-16" : "w-48"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">Demo User</div>
                </div>
              )}
            </div>
          </div>

          {/* Sports Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="space-y-1 px-2">
              {sports.map((sport) => {
                const isActive = location.pathname === sport.path || location.search.includes(`sport=${sport.id}`);

                return (
                  <Link
                    key={sport.id}
                    to={sport.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0">{sport.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium truncate">{sport.name}</span>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-t border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${isCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className={`hidden lg:block flex-shrink-0 ${isCollapsed ? "w-16" : "w-48"}`} />
    </>
  );
};
