import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MatchEvent } from "@/services/diamondApi";
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
  const [isRacingOpen, setIsRacingOpen] = useState(true);
  const [isOthersOpen, setIsOthersOpen] = useState(true);
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

  const othersLinks: Array<{ label: string; path: string }> = [
    { label: "Our Casino", path: "/casino" },
    { label: "Our VIP Casino", path: "/casino" },
    { label: "Our Premium Casino", path: "/casino" },
    { label: "Our Virtual", path: "/games" },
    { label: "Tembo", path: "/casino" },
    { label: "Live Casino", path: "/casino-live" },
    { label: "Slot Game", path: "/casino" },
    { label: "Fantasy Game", path: "/games" },
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

  // Static sport list (no emojis/icons)
  const displaySports = [
    { sid: 4, name: "Cricket" },
    { sid: 1, name: "Football" },
    { sid: 2, name: "Tennis" },
    { sid: 3, name: "Table Tennis" },
    { sid: 10, name: "Badminton" },
    { sid: 5, name: "Esoccer" },
    { sid: 6, name: "Basketball" },
    { sid: 9, name: "Volleyball" },
    { sid: 11, name: "Snooker" },
    { sid: 7, name: "Horse Racing" },
    { sid: 4339, name: "Greyhound Racing" },
  ];

  const racingLinks: Array<{ label: string; sid: number }> = [
    { label: "Horse Racing", sid: 7 },
    { label: "Greyhound Racing", sid: 4339 },
  ];

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
      className="w-full flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground font-semibold text-sm border-b border-border"
    >
      <span>{title}</span>
      <span className="text-xs">{open ? "▴" : "▾"}</span>
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
        "w-full flex items-center gap-2 px-3 py-2 text-sm border-b border-border text-foreground " +
        (active ? "bg-muted" : "bg-muted/60 hover:bg-muted")
      }
    >
      {left}
      <span className="truncate">{label}</span>
    </button>
  );

  const ExpandBox = ({ expanded }: { expanded: boolean }) => (
    <span className="w-4 h-4 border border-border bg-background text-[12px] leading-none flex items-center justify-center flex-shrink-0">
      {expanded ? "-" : "+"}
    </span>
  );

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
        className={`fixed left-0 top-0 h-screen w-72 md:w-64 bg-background border-r border-border flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <img src="/mahiex.png" alt="" />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav>
            {/* Racing */}
            <SectionHeader
              title="Racing Sports"
              open={isRacingOpen}
              onToggle={() => setIsRacingOpen((v) => !v)}
            />
            {isRacingOpen && (
              <div>
                {racingLinks.map((r) => (
                  <RowButton
                    key={r.sid}
                    label={r.label}
                    onClick={() => handleNavigate(`/sports?sport=${r.sid}`)}
                  />
                ))}
              </div>
            )}

            {/* Others */}
            <SectionHeader
              title="Others"
              open={isOthersOpen}
              onToggle={() => setIsOthersOpen((v) => !v)}
            />
            {isOthersOpen && (
              <div>
                {othersLinks.map((item) => (
                  <RowButton
                    key={item.label}
                    label={item.label}
                    onClick={() => handleNavigate(item.path)}
                    active={location.pathname === item.path}
                  />
                ))}
                <RowButton
                  label="My Bets"
                  onClick={() => handleNavigate("/bets")}
                  active={location.pathname === "/bets"}
                />
                <RowButton
                  label="Wallet"
                  onClick={() => handleNavigate("/wallet")}
                  active={location.pathname === "/wallet"}
                />
                {isAdmin && (
                  <RowButton
                    label="Admin"
                    onClick={() => handleNavigate("/admin")}
                    active={location.pathname.startsWith("/admin")}
                  />
                )}
              </div>
            )}

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
                        left={<ExpandBox expanded={isSportExpanded} />}
                        onClick={() => toggleSport(sport.sid)}
                      />

                      {isSportExpanded && (
                        <div className="bg-background">
                          {competitions.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
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
                                    className="w-full flex items-center justify-between gap-2 px-7 py-2 text-xs bg-muted/40 hover:bg-muted border-b border-border"
                                  >
                                    <span className="truncate">
                                      {isCompExpanded ? "-" : "+"} {comp.name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
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
                                          className="w-full px-10 py-2 text-xs text-left bg-background hover:bg-muted border-b border-border"
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
          ) : (
            <div>
              <RowButton
                label="Sign In"
                onClick={() => handleNavigate("/auth")}
                active={location.pathname === "/auth"}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
