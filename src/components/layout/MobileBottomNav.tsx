import {
  Home,
  Trophy,
  Play,
  Wallet,
  Receipt,
  Settings,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, label, icon: Icon, isCustomIcon = false }: any) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        className={`group flex flex-col items-center justify-end h-full pb-2 gap-1.5 flex-1 transition-all duration-300 relative ${
          active ? "text-[#1a472a]" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <div className={`relative transition-all duration-300`}>
          {isCustomIcon ? (
             <div className="w-[22px] h-[22px] rounded-full border-[2.5px] border-current flex items-center justify-center transition-transform duration-300">
               <span className="text-[10px] font-black">C</span>
             </div>
          ) : (
             <Icon size={22} strokeWidth={active ? 2.5 : 2} className="transition-transform duration-300" />
          )}
        </div>
        <span className="text-[9px] font-bold tracking-wide">{label}</span>
        {/* Active Line (optional for other items, but matching the glowing line request) */}
        {active && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-[#1a472a] rounded-b-full shadow-[0_1px_3px_rgba(26,71,42,0.3)]"></div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Navigation Bar */}
      <div className="relative bg-white border-t border-gray-200 px-1 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch justify-between w-full h-[64px] relative z-10">

          <NavItem path="/sports" label="Sports" icon={Trophy} />
          <NavItem path="/in-play" label="In-Play" icon={Play} />
          <NavItem path="/bets" label="Bets" icon={Receipt} />

          {/* Home - Floating Center */}
          <div className="relative group flex-[1.2] flex flex-col items-center justify-end h-full pb-2">
            <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 z-20">
              {/* Outer Cutout Ring Illusion */}
              <button
                onClick={() => navigate("/")}
                className="w-[64px] h-[64px] flex items-center justify-center rounded-full bg-white transition-all duration-300 relative shadow-[0_-3px_12px_rgba(0,0,0,0.08)]"
              >
                {/* Glowing Inner Circle Base Effect behind */}
                {isActive("/") && (
                   <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(26,71,42,0.3)] pointer-events-none" />
                )}
                <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-inner border-[2px] border-white z-10 transition-colors duration-300 ${isActive("/") ? "bg-[#1a472a]" : "bg-[#f28729]"}`}>
                  <Home size={26} className="text-white fill-white drop-shadow-sm" strokeWidth={1.5} />
                </div>
              </button>
            </div>

            <span className={`text-[10px] font-bold tracking-widest ${isActive("/") ? "text-[#1a472a]" : "text-gray-600"} transition-all relative z-10`}>
              HOME
            </span>
            {/* Active Indicator Line below HOME text */}
            {isActive("/") && (
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-[#1a472a] rounded-t-full shadow-[0_-1px_3px_rgba(26,71,42,0.3)]"></div>
            )}
          </div>

          <NavItem path="/casino" label="Casino" icon={null} isCustomIcon={true} />
          <NavItem path="/wallet" label="Wallet" icon={Wallet} />
          <NavItem path="/profile" label="Account" icon={Settings} />

        </div>
      </div>
    </div>
  );
};
