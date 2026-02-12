import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  User,
  Loader2,
} from "lucide-react";
import { diamondApi, SportId } from "@/services/diamondApi";
import { SportsIcon } from "@/components/ui/SportsIcon";

export const LeftSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sportsList, setSportsList] = useState<SportId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const allSports = await diamondApi.getAllSportIds();

        // Filter and sort per requirement:
        // 1. Must be active
        // 2. Must have tab == true (visible in sidebar)
        // 3. Sort by order ID (oid)
        const filtered = allSports
          .filter(s => s.active !== false && s.tab !== false)
          .sort((a, b) => (a.oid || 999) - (b.oid || 999));

        setSportsList(filtered);
      } catch (error) {
        console.error("Failed to fetch sports list", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, []);

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
                  <div className="text-sm font-semibold text-white truncate">
                    Demo User
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sports Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="space-y-1 px-2">
              {isLoading ? (
                 <div className="flex justify-center p-4">
                   <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                 </div>
              ) : (
                sportsList.map((sport) => {
                  const isActive =
                    location.pathname === "/sportsbook" &&
                    location.search.includes(`sport=${sport.sid}`);

                  return (
                    <Link
                      key={sport.sid}
                      to={`/sportsbook?sport=${sport.sid}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span className="flex-shrink-0">
                        <SportsIcon sportName={sport.name} size={16} />
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium truncate">
                            {sport.name}
                          </span>
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </nav>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-t border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
            />
          </button>
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div
        className={`hidden lg:block flex-shrink-0 ${isCollapsed ? "w-16" : "w-48"}`}
      />
    </>
  );
};
