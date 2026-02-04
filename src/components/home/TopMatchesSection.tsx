import { MatchCard } from "./MatchCard";
import { ArrowRight } from "lucide-react";

interface TopMatchesSectionProps {
  matches?: any[];
}

export const TopMatchesSection = ({ matches = [] }: TopMatchesSectionProps) => {
  // Mock data for demonstration
  const mockMatches = [
    {
      id: "1",
      sport: "TENNIS",
      sportId: 2,
      tournament: "ATP Montpellier 2026",
      team1: "Roger V Fils",
      team2: "",
      matchName: "Roger V Fils",
      isLive: true,
      odds: { back1: 1.46, lay2: 1.59 },
    },
    {
      id: "2",
      sport: "TENNIS",
      sportId: 2,
      tournament: "WTA Ostrava 2026",
      team1: "C Moquily",
      team2: "V Martinova",
      matchName: "C Moquily V Martinova",
      isLive: true,
      odds: { back1: 2.2, lay2: 2.48 },
    },
    {
      id: "3",
      sport: "FOOTBALL",
      sportId: 1,
      tournament: "English Football League Cup",
      team1: "Arsenal",
      team2: "V Chelsea",
      matchName: "Arsenal V Chelsea",
      isLive: true,
      time: "Today 01:30 AM",
      odds: { back1: 2.68, lay2: 3.2 },
    },
    {
      id: "4",
      sport: "FOOTBALL",
      sportId: 1,
      tournament: "Germany Bundesliga",
      team1: "Leverkusen",
      team2: "V St Pauli",
      matchName: "Leverkusen V St Pauli",
      isLive: false,
      time: "Today 01:15 AM",
      odds: { back1: 1.92, lay2: 2.1 },
    },
  ];

  const displayMatches = matches.length > 0 ? matches : mockMatches;

  return (
    <div className="p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">
          Top Matches
        </h2>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 group">
          See more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
