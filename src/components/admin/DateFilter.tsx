import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  onFilterChange?: (filter: string, startDate?: Date, endDate?: Date) => void;
}

const DateFilter = ({ onFilterChange }: DateFilterProps) => {
  const [activeFilter, setActiveFilter] = useState("today");
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "lastMonth", label: "Last Month" },
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    setShowCustom(false);
    onFilterChange?.(filterId);
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      onFilterChange?.("custom", new Date(startDate), new Date(endDate));
    }
  };

  return (
    <div className="bg-[#131824] rounded-xl p-6 border border-white/5">
      <h3 className="text-white font-semibold mb-4">Show info</h3>
      
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeFilter === filter.id
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            {filter.label}
          </button>
        ))}

        <span className="text-gray-500 mx-2">or</span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0A0E1A] rounded-lg px-3 py-2 border border-white/10">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-white text-sm border-none outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0A0E1A] rounded-lg px-3 py-2 border border-white/10">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-white text-sm border-none outline-none"
            />
          </div>

          <button
            onClick={handleCustomDateApply}
            disabled={!startDate || !endDate}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              startDate && endDate
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            )}
          >
            Show
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
