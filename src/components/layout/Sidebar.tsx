import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MatchEvent } from "@/services/diamondApi";
import { useLiveSportsData } from "@/hooks/api/useLiveSportsData";
import { SportsIcon } from "@/components/ui/SportsIcon";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedSports, setExpandedSports] = useState<number[]>([]);
  const [expandedCompetitions, setExpandedCompetitions] = useState<string[]>(
    [],
  );
  const [isAllSportsOpen, setIsAllSportsOpen] = useState(true);

  // Use live sports data hook - only call once
  const sportsData = useLiveSportsData();
  const {
    sports,
    matches: allMatches,
    liveMatches,
    isLoading: loading,
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
      // Fetch profile details including role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // Use role from profiles table (defaults to 'user' in schema)
      const userRole = profileData?.role || "user";

      if (profileData) {
        setProfile({
          ...profileData,
          role: userRole,
        });
        setIsAdmin(userRole === "admin");
      }
    } catch (error) {
      console.error("Error fetching profile/role:", error);
    }
  };

  const othersLinks: Array<{ label: string; path: string }> = [
    { label: "Our Casino", path: "/casino" },
    { label: "Live Casino", path: "/casino-live" },
    { label: "Slot Game", path: "/casino" },
  ];

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

  // Get icon for sport
  const getSportIcon = (sportName: string, sid: number) => {
    return <SportsIcon sportName={sportName} sportId={sid} size={18} />;
  };

  // Static sports list to ensure all basic sports are always visible
  // IDs based on LeftSidebar.tsx and SportsCategoryBar.tsx
  const STATIC_SPORTS = [
    { sid: 4, name: "Cricket" },
    { sid: 1, name: "Football" },
    { sid: 2, name: "Tennis" },
    { sid: 3, name: "Kabaddi" },
    { sid: 8, name: "Basketball" },
    { sid: 11, name: "Baseball" },
    { sid: 12, name: "GreyHound" },
    { sid: 7, name: "Horse Race" },
    { sid: 10, name: "Volleyball" },
    { sid: 13, name: "Darts" },
    { sid: 5, name: "Futsal" },
    { sid: 6, name: "Table Tennis" },
    { sid: 9, name: "Binary" },
    { sid: 14, name: "Politics" },
  ];

  // Sports list with icons - merge static list with live data
  const displaySports = useMemo(() => {
    // Start with static list
    const combined = [...STATIC_SPORTS];

    // Create a set of existing IDs
    const existingIds = new Set(combined.map((s) => s.sid));

    // Add any live sports that aren't in the static list
    if (sports && sports.length > 0) {
      sports.forEach((s) => {
        const sid = Number((s as any).sid);
        if (Number.isFinite(sid) && !existingIds.has(sid)) {
          combined.push({
            sid,
            name: String((s as any).name),
          });
        }
      });
    }

    return combined;
  }, [sports]);

  const SectionHeader = ({
    title,
    open,
    onToggle,
  }: {
    title: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 text-xs font-display font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors group"
    >
      <span className="truncate min-w-0 text-left group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
        {title}
      </span>
      <span
        className={`text-[10px] transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`}
      >
        ▼
      </span>
    </button>
  );

  const RowButton = ({
    label,
    onClick,
    left,
    active,
  }: {
    label: string;
    onClick: () => void;
    left?: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-6 py-3 text-sm font-ui font-medium transition-all duration-200 min-w-0 overflow-hidden outline-none ${
        active
          ? "text-white bg-gradient-to-r from-primary/10 to-transparent"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {/* Active Indicator Strip */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
      )}

      {/* Hover Indicator Strip (Subtle) */}
      {!active && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}

      <div
        className={`flex-shrink-0 transition-transform duration-200 ${active ? "scale-110 text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-gray-500 group-hover:text-white"}`}
      >
        {left}
      </div>

      <span className="truncate min-w-0 tracking-wide">{label}</span>

      {/* Tech decoration on hover */}
      <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );

  const ExpandBox = ({ expanded }: { expanded: boolean }) => (
    <span
      className={`w-4 h-4 rounded-[2px] border flex items-center justify-center flex-shrink-0 text-[10px] transition-colors ${expanded ? "border-primary text-primary bg-primary/10" : "border-gray-600 text-gray-600 group-hover:border-gray-400"}`}
    >
      {expanded ? "-" : "+"}
    </span>
  );

  const sidebarContent = (
    <>
      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        <nav className="pb-8">
          {/* All sports */}
          <SectionHeader
            title="Markets"
            open={isAllSportsOpen}
            onToggle={() => setIsAllSportsOpen((v) => !v)}
          />

          {isAllSportsOpen && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              {displaySports.map((sport) => {
                const isSportExpanded = expandedSports.includes(sport.sid);
                const competitions = getCompetitionsBySport(sport.sid);

                return (
                  <div key={sport.sid}>
                    <RowButton
                      label={sport.name}
                      left={getSportIcon(sport.name, sport.sid)}
                      active={
                        location.pathname.includes(`/sports/${sport.sid}`) &&
                        !isSportExpanded
                      }
                      onClick={() => toggleSport(sport.sid)}
                    />

                    {/* Nested Competitions - Accordion Effect */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isSportExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden bg-[#0a1120]/50 box-inner-shadow">
                        {competitions.length === 0 ? (
                          <div className="px-12 py-3 text-xs font-mono text-gray-600 flex items-center gap-2">
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-primary/70">
                                  Loading markets...
                                </span>
                              </div>
                            ) : (
                              <span className="opacity-50">
                                No active markets
                              </span>
                            )}
                          </div>
                        ) : (
                          competitions.map((comp) => {
                            const isCompExpanded =
                              expandedCompetitions.includes(comp.name);
                            return (
                              <div key={comp.name} className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-9 top-0 bottom-0 w-[1px] bg-white/5"></div>

                                <button
                                  type="button"
                                  onClick={() => toggleCompetition(comp.name)}
                                  className="w-full flex items-center justify-between gap-2 px-6 pl-12 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors group/comp"
                                >
                                  <div className="flex items-center gap-2 truncate min-w-0">
                                    <ExpandBox expanded={isCompExpanded} />
                                    <span className="truncate font-mono tracking-tight group-hover/comp:text-primary transition-colors">
                                      {comp.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-700 bg-white/5 px-1.5 py-0.5 rounded group-hover/comp:bg-primary/20 group-hover/comp:text-primary transition-colors">
                                    {comp.matches.length}
                                  </span>
                                </button>

                                {isCompExpanded && (
                                  <div className="bg-black/20 pb-2">
                                    {comp.matches.map((match) => (
                                      <button
                                        key={match.gmid}
                                        type="button"
                                        onClick={() =>
                                          handleNavigate(
                                            `/match/${match.gmid}/${sport.sid}`,
                                          )
                                        }
                                        className="w-full pl-20 pr-4 py-2 text-xs text-left text-gray-500 hover:text-white hover:bg-primary/10 transition-all font-mono relative group/match"
                                      >
                                        {/* Dot indicator */}
                                        <div className="absolute left-[70px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-700 group-hover/match:bg-primary group-hover/match:shadow-[0_0_5px_rgba(34,211,238,0.8)] transition-all"></div>
                                        <span className="truncate block opacity-80 group-hover/match:opacity-100">
                                          {match.name}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Profile Section - Footer */}
      <div className="border-t border-white/5 p-2 bg-[#03070d]">
        {user ? (
          <RowButton
            label="MY PROFILE"
            left={
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                {profile?.full_name?.[0] || "U"}
              </div>
            }
            onClick={() => handleNavigate("/profile")}
            active={location.pathname === "/profile"}
          />
        ) : (
          <div className="px-4 py-2">
            <button
              onClick={() => handleNavigate("/auth")}
              className="w-full btn-primary-v2 py-2 text-xs uppercase tracking-widest"
            >
              Login / Join
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <aside className="w-full h-full bg-[#050b14] flex flex-col overflow-hidden">
      {sidebarContent}
    </aside>
  );
};
