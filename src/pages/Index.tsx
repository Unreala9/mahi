import { HeroBanner } from "@/components/home/HeroBanner";
import { TopMatches } from "@/components/home/TopMatches";
import { CasinoShowcase } from "@/components/home/CasinoShowcase";
import { FooterSection } from "@/components/home/FooterSection";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="w-full pb-20 md:pb-0">
      {/* Mobile Action Buttons (Deposit/Withdraw) */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4 md:hidden">
        <Link
          to="/wallet?tab=deposit"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black uppercase italic tracking-wider py-3 rounded-lg shadow-lg active:scale-95 transition-all skew-x-[-10deg]"
        >
          <div className="skew-x-[10deg] flex items-center gap-2">
            <ArrowDownCircle size={20} className="animate-bounce" />
            <span>DEPOSIT</span>
          </div>
        </Link>
        <Link
          to="/wallet?tab=withdraw"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-black uppercase italic tracking-wider py-3 rounded-lg shadow-lg active:scale-95 transition-all skew-x-[-10deg]"
        >
          <div className="skew-x-[10deg] flex items-center gap-2">
            <ArrowUpCircle size={20} />
            <span>WITHDRAW</span>
          </div>
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-0 md:px-6 space-y-2 md:space-y-6">
        {/* Hero Promotional Banners */}
        <HeroBanner />

        {/* Cricket Battle Promotional Banner */}
        <div className="px-4 md:px-0">
          <Link
            to="/sports/4"
            className="block w-full overflow-hidden rounded-xl border border-white/10 shadow-lg active:scale-[0.98] transition-transform"
          >
            <img
              src="/images/cricket_battle.9a44e4b8.webp"
              alt="Cricket Battle"
              className="w-full h-auto object-cover min-h-[120px]"
            />
          </Link>
        </div>

        {/* Top Live Matches from All Sports */}
        <TopMatches />

        {/* Mobile: New Launch / Mini Games Sections (Placeholder for now) */}
        {/* Mobile: New Launch / Mini Games Sections */}
        <div className="md:hidden space-y-8 mt-4">
          {/* New Launch - Horizontal Scroll */}
          <div className="pl-4">
            <div className="flex items-center justify-between pr-4 mb-3">
              <h3 className="text-white font-display font-black italic text-lg tracking-wider">
                NEW LAUNCH
              </h3>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                View All
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 pr-4 snap-x scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-w-[120px] aspect-[3/4] bg-[#0a1120] rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group snap-start shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10 animate-pulse">
                    NEW
                  </div>
                  <span className="text-xs font-black text-white z-10 mt-auto mb-4 uppercase italic">
                    Game {i}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Games Banner */}
          <div className="px-4">
            <div className="relative h-24 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/20 overflow-hidden flex items-center justify-between px-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black italic text-white leading-none">
                  MINI
                  <br />
                  <span className="text-blue-400">GAMES</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                  Quick play, instant wins
                </span>
              </div>
              <div className="relative z-10">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg">
                  Play Now
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Casino Games Showcase */}
        <CasinoShowcase />

        {/* Footer Section */}
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
