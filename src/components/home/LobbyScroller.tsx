import { useNavigate } from "react-router-dom";
import { Gamepad2, Trophy, Diamond, Fish, MonitorPlay, Club, Spade, Flame, Gift, Star, DollarSign, Swords, Zap, Heart, Sprout, Crown, Shuffle } from "lucide-react";

export const LobbyScroller = () => {
  const navigate = useNavigate();

  const lobbyItems = [
    { src: "/images/imgi_181_promotionBanner-DsJ3B3xu.webp", title: "PROMOTIONS", icon: Gift, link: "/promotions" },
    { src: "/images/imgi_178_LIMBO-1766070421382.webp", title: "LIMBO EXTREME", icon: Flame, link: "/casino" },
    { src: "/images/imgi_176_Casino-1766067481768.jpg", title: "CASINO ROYALE", icon: Crown, link: "/casino" },
    { src: "/images/imgi_175_Aura-1766067418600.jpg", title: "AURA GAMING", icon: Star, link: "/casino" },
    { src: "/images/imgi_174_Aviator-1766070541485.jpg", title: "AVIATOR WIN", icon: Trophy, link: "/casino" },
    { src: "/images/imgi_173_Evolution-1766067973985.jpg", title: "EVOLUTION LIVE", icon: Zap, link: "/casino-live" },
    { src: "/images/imgi_115_neo_lobby.webp", title: "NEO LOBBY", icon: Gamepad2, link: "/casino" },
    { src: "/images/imgi_114_win_live_lobby.webp", title: "WIN LIVE CAISNO", icon: Diamond, link: "/casino-live" },
    { src: "/images/imgi_113_pltl_live_lobby.webp", title: "PLATINUM LIVE", icon: Sprout, link: "/casino-live" },
    { src: "/images/imgi_112_jili_lobby.webp", title: "JILI FAST SLOTS", icon: Shuffle, link: "/casino" },
    { src: "/images/imgi_111_asg_lobby.webp", title: "ASG JACKPOT", icon: DollarSign, link: "/casino" },
    { src: "/images/imgi_110_kingmidas_lobby.webp", title: "KING MIDAS", icon: Crown, link: "/casino" },
    { src: "/images/imgi_109_bbl_bombaylivelobby.webp", title: "BOMBAY LIVE", icon: Heart, link: "/casino-live" },
    { src: "/images/imgi_108_SEXYBCRT-LOBBY.webp", title: "SEXY BACCARAT", icon: Swords, link: "/casino-live" },
    { src: "/images/imgi_107_vivo_lobby.webp", title: "VIVO GAMING", icon: Star, link: "/casino" },
    { src: "/images/imgi_106_marbles_lobby.webp", title: "MARBLES CRASH", icon: Zap, link: "/casino" },
    { src: "/images/imgi_105_ezg_lobby.webp", title: "EZG ARCADE", icon: Gamepad2, link: "/casino" },
    { src: "/images/imgi_104_aura-lobby.webp", title: "AURA LOBBY", icon: Flame, link: "/casino" },
    { src: "/images/imgi_103_MAC88-LOBBY.webp", title: "MAC88 EXTREME", icon: Spade, link: "/casino" },
    { src: "/images/imgi_100_more_slots_lobby.webp", title: "MEGA SLOTS", icon: MonitorPlay, link: "/casino" },
    { src: "/images/imgi_98_fishing-games-bg.47768876.webp", title: "FISHING GAMES", icon: Fish, link: "/casino" },
    { src: "/images/imgi_96_slot-games-bg.e8f5c193.webp", title: "SLOT GAMES", icon: Gamepad2, link: "/casino" },
    { src: "/images/imgi_93_e-cricket-bg.4e6e7bfa.webp", title: "E-CRICKET", icon: MonitorPlay, link: "/sports?sport=4" },
    { src: "/images/imgi_90_live-casinos-bg.7bea6587.webp", title: "LIVE CASINOS", icon: Diamond, link: "/casino-live" },
    { src: "/images/imgi_92_default.webp", title: "PREMIUM GAMES", icon: Club, link: "/casino" },
    { src: "/images/imgi_88_sportsbook-bg.5772b654.webp", title: "SPORTSBOOK", icon: Trophy, link: "/sports" },
    { src: "/images/imgi_83_card-games-bg.f4b1322f.webp", title: "CARD GAMES", icon: Spade, link: "/casino-live" }
  ];

  // Double the items for a seamless continuous marquee
  const loopedItems = [...lobbyItems, ...lobbyItems];

  return (
    <div className="w-full mb-4 relative z-10 px-0 md:px-0">
      <style>{`
        @keyframes lobby-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.375rem)); } /* -50% to shift one full original list set, factoring in half of the 0.75rem (gap-3) */
        }
        .animate-lobby-scroll {
          animation: lobby-scroll 60s linear infinite;
        }
        .scroll-container:hover .animate-lobby-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div className="overflow-hidden scroll-container px-4 md:px-0">
        <div className="flex gap-3 w-max animate-lobby-scroll py-2">
          {loopedItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex-shrink-0 w-[240px] md:w-[400px] shadow-sm hover:shadow-md transition-shadow duration-300 rounded cursor-pointer overflow-hidden group relative"
                onClick={() => navigate(item.link || "/casino")}
              >
                <div className="relative aspect-[16/4] md:aspect-[16/4]">
                  <img
                    src={item.src}
                    alt={item.title || `Lobby ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />

                  {/* Overlay for all images */}
                  {item.title && (
                    <div className="absolute inset-0 flex items-center justify-start bg-gradient-to-r from-black/80 via-black/40 to-transparent pl-8 md:pl-12 p-4">
                       <div className="flex items-center gap-3">
                         {Icon && <Icon className="text-white drop-shadow-md opacity-90" size={24} />}
                         <h3 className="text-white font-black italic uppercase tracking-wider text-xl md:text-2xl drop-shadow-md">
                           {item.title}
                         </h3>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge Fades for scroll affordance */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none md:hidden" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
      {/* Promotional Banner */}
      <div
        className="relative w-full rounded-xl overflow-hidden mt-2 cursor-pointer group shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        onClick={() => navigate('/wallet')}
      >
        <img
          src="/images/imgi_181_promotionBanner-DsJ3B3xu.webp"
          alt="Promotions"
          className="w-full h-[100px] md:h-[140px] object-cover object-right md:object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/90 via-orange-900/60 to-transparent flex items-center">
          <div className="px-6 md:px-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-white/90 mb-1">
              <Gift className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest drop-shadow-sm">Special Offers</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white italic tracking-tight drop-shadow-lg uppercase">
              <a href="/wallet">Promotions</a>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
