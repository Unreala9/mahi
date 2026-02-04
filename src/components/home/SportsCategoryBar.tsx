import { useState } from "react";
import {
  Trophy,
  Dribbble,
  Circle,
  Dumbbell,
  Basketball,
  Target,
  TableTennis,
  Horse,
  Dog,
  Volleyball,
  Gamepad2,
  Feather,
} from "lucide-react";

interface SportCategory {
  id: number;
  name: string;
  icon: React.ReactNode;
  badge?: number;
}

const sportCategories: SportCategory[] = [
  { id: 4, name: "Cricket", icon: <Trophy className="w-4 h-4" />, badge: 25 },
  {
    id: 1,
    name: "Football",
    icon: <Dribbble className="w-4 h-4" />,
    badge: 18,
  },
  { id: 2, name: "Tennis", icon: <Circle className="w-4 h-4" />, badge: 12 },
  { id: 3, name: "Kabaddi", icon: <Dumbbell className="w-4 h-4" /> },
  { id: 8, name: "Basketball", icon: <Basketball className="w-4 h-4" /> },
  { id: 13, name: "Darts", icon: <Target className="w-4 h-4" /> },
  { id: 6, name: "Table Tennis", icon: <TableTennis className="w-4 h-4" /> },
  { id: 7, name: "Horse Race", icon: <Horse className="w-4 h-4" /> },
  { id: 12, name: "GreyHound", icon: <Dog className="w-4 h-4" /> },
  { id: 10, name: "Volleyball", icon: <Volleyball className="w-4 h-4" /> },
  { id: 9, name: "Binary", icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 14, name: "Politics", icon: <Feather className="w-4 h-4" /> },
];

interface SportsCategoryBarProps {
  selectedSport?: number;
  onSportChange?: (sportId: number) => void;
}

export const SportsCategoryBar = ({
  selectedSport = 4,
  onSportChange,
}: SportsCategoryBarProps) => {
  const [activeSport, setActiveSport] = useState(selectedSport);

  const handleSportClick = (sportId: number) => {
    setActiveSport(sportId);
    onSportChange?.(sportId);
  };

  return (
    <div className="bg-[#1a1f2e] border-b border-gray-800 sticky top-0 z-30">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
          {sportCategories.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSportClick(sport.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeSport === sport.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {sport.icon}
              <span>{sport.name}</span>
              {sport.badge && activeSport === sport.id && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {sport.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
