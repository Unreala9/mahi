import { useState } from "react";
import {
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
  {
    id: 4,
    name: "Cricket",
    icon: <i className="s-icon s-icon-sport-cricket text-lg" />,
    badge: 25,
  },
  {
    id: 1,
    name: "Football",
    icon: <i className="s-icon s-icon-sport-soccer text-lg" />,
    badge: 18,
  },
  {
    id: 2,
    name: "Tennis",
    icon: <i className="s-icon s-icon-sport-tennis text-lg" />,
    badge: 12,
  },
  {
    id: 3,
    name: "Kabaddi",
    icon: <i className="s-icon s-icon-sport-kabaddi text-lg" />,
  },
  {
    id: 8,
    name: "Basketball",
    icon: <i className="s-icon s-icon-sport-basketball text-lg" />,
  },
  {
    id: 13,
    name: "Darts",
    icon: <i className="s-icon s-icon-sport-darts text-lg" />,
  },
  {
    id: 6,
    name: "Table Tennis",
    icon: <i className="s-icon s-icon-sport-table-tennis text-lg" />,
  },
  {
    id: 7,
    name: "Horse Race",
    icon: <i className="s-icon s-icon-sport-horse-racing text-lg" />,
  },
  {
    id: 12,
    name: "GreyHound",
    icon: <i className="s-icon s-icon-sport-greyhound text-lg" />,
  },
  {
    id: 10,
    name: "Volleyball",
    icon: <i className="s-icon s-icon-sport-volleyball text-lg" />,
  },
  { id: 9, name: "Binary", icon: <Gamepad2 className="w-4 h-4 ml-1" /> },
  { id: 14, name: "Politics", icon: <Feather className="w-4 h-4 ml-1" /> },
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
