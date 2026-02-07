import { Menu, User, Wallet, Bell, ChevronDown } from "lucide-react";

export const MobileHeader = ({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) => {
  return (
    <div className="md:hidden bg-[#050b14] sticky top-0 z-40 w-full border-b border-white/5 pb-2">
      {/* Top Bar: Hamburger, Logo, Balance, User */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu */}
        <button onClick={onToggleSidebar} className="text-white p-1">
          <Menu size={24} />
        </button>

        {/* Center: Balance (Badge Style) */}
        <div className="flex items-center gap-2 bg-[#0a1120] border border-white/10 px-3 py-1.5 rounded-full">
          <img src="/chip.png" alt="Chip" className="w-5 h-5 object-contain" />
          <span className="text-yellow-400 font-mono font-bold text-sm">
            ₹ 215,395
          </span>
          <Wallet size={12} className="text-gray-400 ml-1" />
        </div>

        {/* Right: User Profile (Badge) */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0a1120] border border-white/10 px-2 py-1.5 rounded flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-white uppercase truncate max-w-[80px]">
              SHWETCHOUREY3
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Highlights (Optional ticker or quick links) */}
      <div className="bg-yellow-400/10 border-y border-yellow-400/20 py-1.5 px-4 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
          Open & Close Market with Live Dealers • Exclusive 500% Bonus on First
          Deposit • Live Cricket World Cup Odds
        </div>
      </div>
    </div>
  );
};
