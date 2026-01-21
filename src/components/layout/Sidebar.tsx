import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  Gamepad2,
  Trophy,
  History,
  User,
  FileText,
  Shield,
  Phone,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SportId, MatchEvent } from "@/services/diamondApi";
import { useLiveSportsData } from "@/hooks/api/useLiveSportsData";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSports, setExpandedSports] = useState<number[]>([]);
  const [expandedCompetitions, setExpandedCompetitions] = useState<string[]>(
    [],
  );
  const [isSportsDropdownOpen, setIsSportsDropdownOpen] = useState(false);

  // Use live sports data hook - only call once
  const sportsData = useLiveSportsData();
  const {
    sports,
    matches: allMatches,
    liveMatches,
    isLoading: loading,
    isConnected,
    error,
    lastUpdate,
    refresh,
  } = sportsData;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-expand sport if on sportsbook page - only run once when sports first load
  useEffect(() => {
    if (
      location.pathname === "/sportsbook" &&
      sports.length > 0 &&
      expandedSports.length === 0
    ) {
      // Auto-expand cricket by default
      setExpandedSports([4]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sports.length]); // Only depend on length, not full array

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      if (profileData) {
        setProfile({
          ...profileData,
          role: roleData?.role || "player",
        });
        setIsAdmin(roleData?.role === "admin");
      }
    } catch (error) {
      console.error("Error fetching profile/role:", error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: History, label: "My Bets", path: "/bets" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: Gamepad2, label: "Casino", path: "/casino" },
    { icon: Trophy, label: "Sports", path: "/sports" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Settings, label: "Admin", path: "/admin" });
  }

  const toggleSport = (sportId: number) => {
    setExpandedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId],
    );
  };

  const toggleCompetition = (compName: string) => {
    setExpandedCompetitions((prev) =>
      prev.includes(compName)
        ? prev.filter((name) => name !== compName)
        : [...prev, compName],
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  // Group matches by sport and competition
  const getMatchesBySport = (sportId: number) => {
    return allMatches.filter((match) => match.sid === sportId);
  };

  const getCompetitionsBySport = (sportId: number) => {
    const matches = getMatchesBySport(sportId);
    const grouped: Record<string, MatchEvent[]> = {};

    matches.forEach((match) => {
      const compName = match.cname || "Other";
      if (!grouped[compName]) {
        grouped[compName] = [];
      }
      grouped[compName].push(match);
    });

    return Object.entries(grouped).map(([name, matches]) => ({
      name,
      matches,
    }));
  };

  // Sport names mapping
  const sportNames: Record<number, string> = {
    4: "Cricket",
    1: "Football",
    2: "Tennis",
    3: "Table Tennis",
    5: "Esoccer",
    7: "Horse Racing",
    4339: "Greyhound Racing",
    6: "Basketball",
    8: "Wrestling",
    9: "Volleyball",
    10: "Badminton",
    11: "Snooker",
    12: "Darts",
    13: "Boxing",
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 md:w-64 premium-glass-blue border-r border-border flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <img src="/mahiex.png" alt="" />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-0.5 px-2">
            {/* Regular Nav Items */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 group ${
                    isActive
                      ? "bg-primary text-black sidebar-active-item"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-black"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}

            {/* Sports Section - Always Visible */}
            <div className="mt-4">
              {/* Connection Status & Refresh */}
              <div className="px-4 py-2 flex items-center justify-between border-b border-border/30 mb-2">
                <div className="flex items-center gap-2 text-xs">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground">
                        Live Updates
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-yellow-500" />
                      <span className="text-muted-foreground">Updating...</span>
                    </>
                  )}
                </div>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {loading && sports.length === 0 ? (
                <div className="px-4 py-6 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto" />
                  <div className="text-xs text-muted-foreground">
                    Loading sports...
                  </div>
                </div>
              ) : error ? (
                <div className="px-4 py-3 text-xs space-y-2">
                  <div className="text-red-400 flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={refresh}
                    className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : sports.length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                  No sports available
                </div>
              ) : (
                sports.map((sport) => {
                  const isSportExpanded = expandedSports.includes(sport.sid);
                  const competitions = getCompetitionsBySport(sport.sid);
                  const sportName = sportNames[sport.sid] || sport.name;
                  const sportLiveCount = liveMatches.filter(
                    (m) => m.sid === sport.sid,
                  ).length;

                  return (
                    <div key={sport.sid} className="border-b border-border/30">
                      {/* Sport Header */}
                      <div className="w-full flex items-center justify-between px-6 py-2.5 text-xs font-bold transition-colors hover:bg-muted/30">
                        <button
                          onClick={() => toggleSport(sport.sid)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          {isSportExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                          <span className="text-sm">{sport.icon || "🏆"}</span>
                          <span>{sportName}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          {sportLiveCount > 0 && (
                            <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                              {sportLiveCount} LIVE
                            </span>
                          )}
                          <button
                            onClick={() =>
                              handleNavigate(`/sports?sport=${sport.sid}`)
                            }
                            className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                          >
                            {getMatchesBySport(sport.sid).length}
                          </button>
                        </div>
                      </div>

                      {/* Competitions */}
                      {isSportExpanded && (
                        <div className="bg-background/30">
                          {competitions.length === 0 ? (
                            <div className="px-8 py-2 text-xs text-muted-foreground">
                              No matches available
                            </div>
                          ) : (
                            competitions.map((comp) => {
                              const isCompExpanded =
                                expandedCompetitions.includes(comp.name);

                              return (
                                <div key={comp.name}>
                                  {/* Competition Header */}
                                  <div className="w-full flex items-center justify-between px-8 py-2 text-xs font-medium transition-colors hover:bg-muted/20">
                                    <button
                                      onClick={() =>
                                        toggleCompetition(comp.name)
                                      }
                                      className="flex-1 flex items-center gap-2 text-left"
                                    >
                                      {isCompExpanded ? (
                                        <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3" />
                                      )}
                                      <span className="truncate">
                                        {comp.name}
                                      </span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleNavigate(
                                          `/sports?sport=${sport.sid}&competition=${encodeURIComponent(comp.name)}`,
                                        )
                                      }
                                      className="text-[10px] bg-muted px-1.5 py-0.5 rounded ml-2 hover:bg-muted/70 transition-colors"
                                    >
                                      {comp.matches.length}
                                    </button>
                                  </div>

                                  {/* Matches */}
                                  {isCompExpanded && (
                                    <div className="bg-background/50">
                                      {comp.matches.map((match) => (
                                        <button
                                          key={match.gmid}
                                          onClick={() =>
                                            handleNavigate(
                                              `/match/${match.gmid}/${sport.sid}`,
                                            )
                                          }
                                          className="w-full px-10 py-1.5 text-xs text-left transition-colors hover:bg-muted/20 border-b border-border/20"
                                        >
                                          <div className="flex items-center gap-2">
                                            {match.is_live && (
                                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                                            )}
                                            <span className="truncate text-muted-foreground hover:text-foreground">
                                              {match.name}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="border-t border-border">
          {user ? (
            <div className="p-4">
              <button
                onClick={() => handleNavigate("/profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-150 rounded-lg group ${
                  location.pathname === "/profile"
                    ? "bg-primary text-black"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-semibold truncate">
                    {profile?.full_name || user.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    View Profile
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={() => handleNavigate("/auth")}
                className="w-full px-4 py-2 bg-primary text-black rounded-lg font-semibold text-sm transition-colors hover:bg-primary/90"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
