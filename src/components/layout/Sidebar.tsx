import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MatchEvent, SportId, diamondApi } from "@/services/diamondApi";
import { useLiveSportsData } from "@/hooks/api/useLiveSportsData";
import SportIcon from "@/components/SportIcon";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
  const { matches: allMatches, liveMatches, isLoading: loading } = sportsData;

  const [allSportsList, setAllSportsList] = useState<SportId[]>([]);
  const [isSportsLoading, setIsSportsLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await diamondApi.getAllSportIds();
        // Filter for active sports and sort by OID
        // Display ALL active sports as requested (ignoring tab flag for the full list)
        const filtered = data
          .filter((s) => s.active !== false)
          .sort((a, b) => (a.oid || 999) - (b.oid || 999));
        setAllSportsList(filtered);
      } catch (e) {
        console.error("Failed to fetch sports list", e);
      } finally {
        setIsSportsLoading(false);
      }
    };
    fetchSports();
  }, []);

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
      location.pathname === "/sports" &&
      allSportsList.length > 0 &&
      expandedSports.length === 0
    ) {
      // Auto-expand cricket (id 4) by default if present
      const cricket = allSportsList.find(
        (s) => s.name === "Cricket" || s.sid === 4,
      );
      if (cricket) {
        setExpandedSports([cricket.sid]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSportsList.length]); // Only depend on length, not full array

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

  // Get icon for sport - using new SVG icons
  const getSportIcon = (sportName: string, sid: number) => {
    return <SportIcon eventId={sid} size={18} />;
  };

  // Use the fetched sports list directly
  const displaySports = allSportsList;

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
      className="w-full flex items-center justify-between px-6 py-4 text-xs font-display font-bold uppercase tracking-[0.1em] text-[#1a472a] hover:text-[#2d6a4f] transition-colors group"
    >
      <span className="truncate min-w-0 text-left transition-all">{title}</span>
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
          ? "text-white bg-[#1a472a]"
          : "text-gray-700 hover:text-[#1a472a] hover:bg-green-50"
      }`}
    >
      {/* Active Indicator Strip */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#f28729]"></div>
      )}

      {/* Hover Indicator Strip */}
      {!active && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#1a472a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}

      <div
        className={`flex-shrink-0 transition-transform duration-200 ${active ? "scale-110 text-white" : "text-gray-500 group-hover:text-[#1a472a]"}`}
      >
        {left}
      </div>

      <span className="truncate min-w-0 tracking-wide">{label}</span>
    </button>
  );

  const ExpandBox = ({ expanded }: { expanded: boolean }) => (
    <span
      className={`w-4 h-4 rounded-[2px] border flex items-center justify-center flex-shrink-0 text-[10px] transition-colors ${expanded ? "border-[#1a472a] text-[#1a472a] bg-green-50" : "border-gray-300 text-gray-500 group-hover:border-gray-400"}`}
    >
      {expanded ? "-" : "+"}
    </span>
  );

  const sidebarContent = (
    <>
      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
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
                        location.pathname === "/sports" &&
                        searchParams.get("sport") === String(sport.sid) &&
                        !isSportExpanded
                      }
                      onClick={() => toggleSport(sport.sid)}
                    />

                    {/* Nested Competitions - Accordion Effect */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isSportExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden bg-gray-50 border-y border-gray-100">
                        {competitions.length === 0 ? (
                          <div className="px-12 py-3 text-xs font-mono text-gray-500 flex items-center gap-2">
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1a472a] animate-pulse"></div>
                                <span className="text-gray-500">
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
                                <div className="absolute left-9 top-0 bottom-0 w-[1px] bg-gray-200"></div>

                                <button
                                  type="button"
                                  onClick={() => toggleCompetition(comp.name)}
                                  className="w-full flex items-center justify-between gap-2 px-6 pl-12 py-2.5 text-xs text-gray-600 hover:text-[#1a472a] hover:bg-green-50 transition-colors group/comp"
                                >
                                  <div className="flex items-center gap-2 truncate min-w-0">
                                    <ExpandBox expanded={isCompExpanded} />
                                    <span className="truncate font-mono tracking-tight group-hover/comp:text-[#1a472a] transition-colors">
                                      {comp.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded group-hover/comp:bg-green-100 group-hover/comp:text-[#1a472a] transition-colors">
                                    {comp.matches.length}
                                  </span>
                                </button>

                                {isCompExpanded && (
                                  <div className="bg-white pb-2">
                                    {comp.matches.map((match) => (
                                      <button
                                        key={match.gmid}
                                        type="button"
                                        onClick={() =>
                                          handleNavigate(
                                            `/match/${match.gmid}/${sport.sid}`,
                                          )
                                        }
                                        className="w-full pl-20 pr-4 py-2 text-xs text-left text-gray-600 hover:text-[#1a472a] hover:bg-green-50 transition-all font-mono relative group/match"
                                      >
                                        {/* Dot indicator */}
                                        <div className="absolute left-[70px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/match:bg-[#f28729] transition-all"></div>
                                        <span className="truncate block opacity-90 group-hover/match:opacity-100">
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
      <div className="border-t border-gray-200 p-2 bg-gray-50">
        {user ? (
          <RowButton
            label="MY PROFILE"
            left={
              <div className="w-5 h-5 rounded-full bg-[#1a472a] flex items-center justify-center text-[10px] text-white font-bold">
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
              className="w-full btn-primary-v2 py-2 text-xs uppercase tracking-widest rounded shadow"
            >
              Login / Join
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <aside className="w-full h-full bg-white flex flex-col overflow-hidden">
      {sidebarContent}
    </aside>
  );
};
