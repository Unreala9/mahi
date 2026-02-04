import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MatchEvent } from "@/services/diamondApi";
import { useLiveSportsData } from "@/hooks/api/useLiveSportsData";
import { SportsIcon } from "@/components/ui/SportsIcon";

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
    const existingIds = new Set(combined.map(s => s.sid));

    // Add any live sports that aren't in the static list
    if (sports && sports.length > 0) {
      sports.forEach(s => {
        const sid = Number((s as any).sid);
        if (Number.isFinite(sid) && !existingIds.has(sid)) {
          combined.push({
             sid,
             name: String((s as any).name)
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
      className="w-full flex items-center justify-between px-3 py-2.5 bg-primary text-primary-foreground font-semibold text-base border-b border-border"
    >
      <span className="truncate min-w-0 text-left">{title}</span>
      <span className="text-sm flex-shrink-0">{open ? "▴" : "▾"}</span>
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
      className={
        "w-full flex items-center gap-2.5 px-3 py-2.5 text-base border-b border-border text-foreground min-w-0 overflow-hidden " +
        (active ? "bg-muted" : "bg-muted/60 hover:bg-muted")
      }
    >
      {left}
      <span className="truncate min-w-0">{label}</span>
    </button>
  );

  const ExpandBox = ({ expanded }: { expanded: boolean }) => (
    <span className="w-5 h-5 border border-border bg-background text-sm leading-none flex items-center justify-center flex-shrink-0">
      {expanded ? "-" : "+"}
    </span>
  );

  return (
    <>
      {/* Desktop Sidebar (no internal scroll; grows with content) */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col overflow-x-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border flex-shrink-0">
          <img src="/mahiex.png" alt="" />
        </div>

        {/* Navigation */}
        <div className="flex-1 min-h-0">
          <nav>
            {/* All sports */}
            <SectionHeader
              title="All Sports"
              open={isAllSportsOpen}
              onToggle={() => setIsAllSportsOpen((v) => !v)}
            />
            {isAllSportsOpen && (
              <div>
                {displaySports.map((sport) => {
                  const isSportExpanded = expandedSports.includes(sport.sid);
                  const competitions = getCompetitionsBySport(sport.sid);

                  return (
                    <div key={sport.sid}>
                      <RowButton
                        label={sport.name}
                        left={
                          <div className="flex items-center gap-2">
                            <ExpandBox expanded={isSportExpanded} />
                            {getSportIcon(sport.name, sport.sid)}
                          </div>
                        }
                        onClick={() => toggleSport(sport.sid)}
                      />

                      {isSportExpanded && (
                        <div className="bg-background">
                          {competitions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
                              {loading ? "Loading…" : "No matches"}
                            </div>
                          ) : (
                            competitions.map((comp) => {
                              const isCompExpanded =
                                expandedCompetitions.includes(comp.name);
                              return (
                                <div key={comp.name}>
                                  <button
                                    type="button"
                                    onClick={() => toggleCompetition(comp.name)}
                                    className="w-full flex items-center justify-between gap-2 px-7 py-2 text-sm bg-muted/40 hover:bg-muted border-b border-border"
                                  >
                                    <span className="truncate">
                                      {isCompExpanded ? "-" : "+"} {comp.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {comp.matches.length}
                                    </span>
                                  </button>

                                  {isCompExpanded && (
                                    <div>
                                      {comp.matches.map((match) => (
                                        <button
                                          key={match.gmid}
                                          type="button"
                                          onClick={() =>
                                            handleNavigate(
                                              `/match/${match.gmid}/${sport.sid}`,
                                            )
                                          }
                                          className="w-full px-10 py-2 text-sm text-left bg-background hover:bg-muted border-b border-border"
                                        >
                                          <span className="truncate">
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Profile Section */}
        <div className="border-t border-border">
          {user ? (
            <div>
              <RowButton
                label="Profile"
                onClick={() => handleNavigate("/profile")}
                active={location.pathname === "/profile"}
              />
            </div>
          ) : null}
        </div>
      </aside>

      {/* Mobile Sidebar (overlay scrolls; sidebar grows with content) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto"
          onClick={onClose}
        >
          <aside
            className="w-64 bg-background border-r border-border flex flex-col overflow-x-hidden animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-border flex-shrink-0">
              <img src="/mahiex.png" alt="" />
            </div>

            {/* Navigation */}
            <div className="flex-1 min-h-0">
              <nav>
                {/* All sports */}
                <SectionHeader
                  title="All Sports"
                  open={isAllSportsOpen}
                  onToggle={() => setIsAllSportsOpen((v) => !v)}
                />
                {isAllSportsOpen && (
                  <div>
                    {displaySports.map((sport) => {
                      const isSportExpanded = expandedSports.includes(
                        sport.sid,
                      );
                      const competitions = getCompetitionsBySport(sport.sid);

                      return (
                        <div key={sport.sid}>
                          <RowButton
                            label={sport.name}
                            left={
                              <div className="flex items-center gap-2">
                                <ExpandBox expanded={isSportExpanded} />
                                {getSportIcon(sport.name, sport.sid)}
                              </div>
                            }
                            onClick={() => toggleSport(sport.sid)}
                          />

                          {isSportExpanded && (
                            <div className="bg-background">
                              {competitions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border">
                                  {loading ? "Loading…" : "No matches"}
                                </div>
                              ) : (
                                competitions.map((comp) => {
                                  const isCompExpanded =
                                    expandedCompetitions.includes(comp.name);
                                  return (
                                    <div key={comp.name}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleCompetition(comp.name)
                                        }
                                        className="w-full flex items-center justify-between gap-2 px-7 py-2 text-sm bg-muted/40 hover:bg-muted border-b border-border min-w-0 overflow-hidden"
                                      >
                                        <span className="truncate min-w-0 flex-1 text-left">
                                          {isCompExpanded ? "-" : "+"}{" "}
                                          {comp.name}
                                          <s-icon name="icon-sport-alpine"></s-icon>
                                        </span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                          {comp.matches.length}
                                        </span>
                                      </button>

                                      {isCompExpanded && (
                                        <div>
                                          {comp.matches.map((match) => (
                                            <button
                                              key={match.gmid}
                                              type="button"
                                              onClick={() =>
                                                handleNavigate(
                                                  `/match/${match.gmid}/${sport.sid}`,
                                                )
                                              }
                                              className="w-full px-10 py-2 text-sm text-left bg-background hover:bg-muted border-b border-border min-w-0 overflow-hidden"
                                            >
                                              <span className="truncate min-w-0 block">
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </nav>
            </div>

            {/* Profile Section */}
            <div className="border-t border-border">
              {user ? (
                <div>
                  <RowButton
                    label="Profile"
                    onClick={() => handleNavigate("/profile")}
                    active={location.pathname === "/profile"}
                  />
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
