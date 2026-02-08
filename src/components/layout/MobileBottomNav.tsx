import { Home, Trophy, Play, Info, Settings, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient Fade Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* Navigation Bar */}
      <div className="relative bg-[#0a1120]/80 backdrop-blur-xl border-t border-white/10 px-6 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between max-w-sm mx-auto relative z-10">
          {/* Sportsbook */}
          <button
            onClick={() => navigate("/sportsbook")}
            className={`group flex flex-col items-center gap-1 w-12 transition-all duration-300 ${isActive("/sportsbook") ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div
              className={`relative p-2 rounded-xl transition-all duration-300 ${isActive("/sportsbook") ? "bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""}`}
            >
              <Trophy
                size={20}
                strokeWidth={isActive("/sportsbook") ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive("/sportsbook") ? "scale-110" : "group-hover:scale-110"}`}
              />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Sports</span>
          </button>

          {/* In-Play */}
          <button
            onClick={() => navigate("/in-play")}
            className={`group flex flex-col items-center gap-1 w-12 transition-all duration-300 ${isActive("/in-play") ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div
              className={`relative p-2 rounded-xl transition-all duration-300 ${isActive("/in-play") ? "bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""}`}
            >
              <Play
                size={20}
                strokeWidth={isActive("/in-play") ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive("/in-play") ? "scale-110" : "group-hover:scale-110"}`}
              />
            </div>
            <span className="text-[10px] font-bold tracking-wide">In-Play</span>
          </button>

          {/* Home - Reactor Switch Button */}
          <div className="relative -top-8 group">
            <button
              onClick={() => navigate("/")}
              className="relative w-16 h-16 flex items-center justify-center transition-all duration-300"
            >
              {/* Outer Glow Ring - Spins slow */}
              <div
                className={`absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500/50 border-b-blue-500/10 ${isActive("/") ? "animate-[spin_3s_linear_infinite]" : ""}`}
              />

              {/* Inner Pulsing Core Container */}
              <div
                className={`absolute inset-1 rounded-full bg-[#0a1120] flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 overflow-hidden group-active:scale-95 transition-transform ${isActive("/") ? "border-blue-500/50" : ""}`}
              >
                {/* Active Background Effect */}
                {isActive("/") && (
                  <>
                    <div className="absolute inset-0 bg-blue-600/20 animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.8)_0%,transparent_70%)] opacity-20" />
                  </>
                )}

                {/* Icon */}
                <div className="relative z-20">
                  <Home
                    size={24}
                    className={`transition-all duration-300 ${isActive("/") ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "text-gray-400 group-hover:text-white"}`}
                    fill={isActive("/") ? "currentColor" : "none"}
                  />
                </div>

                {/* Tech Decoration */}
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500/50" />
              </div>
            </button>
            <span
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest ${isActive("/") ? "text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "text-gray-600"} transition-all scale-75 md:scale-100`}
            >
              HOME
            </span>

            {/* Active Indicator Line */}
            {isActive("/") && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
            )}
          </div>

          {/* Casino */}
          <button
            onClick={() => navigate("/casino")}
            className={`group flex flex-col items-center gap-1 w-12 transition-all duration-300 ${isActive("/casino") ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div
              className={`relative p-2 rounded-xl transition-all duration-300 ${isActive("/casino") ? "bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""}`}
            >
              <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center transition-transform duration-300 group-hover:rotate-180">
                <span className="text-[10px] font-black">C</span>
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-wide">Casino</span>
          </button>

          {/* Account */}
          <button
            onClick={() => navigate("/profile")}
            className={`group flex flex-col items-center gap-1 w-12 transition-all duration-300 ${isActive("/profile") ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            <div
              className={`relative p-2 rounded-xl transition-all duration-300 ${isActive("/profile") ? "bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : ""}`}
            >
              <Settings
                size={20}
                strokeWidth={isActive("/profile") ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive("/profile") ? "scale-110 rotate-90" : "group-hover:rotate-90"}`}
              />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
