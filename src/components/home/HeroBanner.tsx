import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, Play, Star, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

/* Reusable Hero Button with Chamfered Edges */
const HeroButton = ({
  text,
  link,
  color = "primary",
}: {
  text: string;
  link: string;
  color?: "red" | "blue" | "primary";
}) => {
  const navigate = useNavigate();

  const colorStyles = {
    red: "bg-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]",
    blue: "bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]",
    primary:
      "bg-primary hover:shadow-[0_0_20px_rgba(255,255,60,0.4)] text-black",
  };

  return (
    <button
      onClick={() => navigate(link)}
      className={`relative ${colorStyles[color]} text-white font-ui font-bold uppercase tracking-widest px-6 py-2 md:px-8 md:py-3 transition-all duration-200 border-none group overflow-hidden`}
      style={{
        clipPath:
          "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{text}</span>
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
    </button>
  );
};

export const HeroBanner = () => {
  const navigate = useNavigate();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const banners = [
    {
      id: 1,
      title: "500% BONUS",
      subtitle: "WELCOME OFFER",
      description: "Get a massive head start with our premium welcome package.",
      cta: "CLAIM BONUS",
      link: "/wallet?tab=deposit",
      image: "url('/lovable-uploads/25619195-2070-4966-9de9-43c22d5f0857.png')",
      color: "from-blue-950 via-blue-900 to-[#0a1120]",
      accent: "text-blue-400",
      accentBg: "bg-blue-500/20 text-blue-300",
      icon: (
        <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 animate-pulse" />
      ),
    },
    {
      id: 2,
      title: "LIVE CRICKET",
      subtitle: "IN-PLAY BETTING",
      description:
        "Experience the thrill of live betting with instant settlements.",
      cta: "BET NOW",
      link: "/sports/4",
      image: "url('/cricket_battle.9a44e4b8.webp')",
      color: "from-emerald-950 via-emerald-900 to-[#0a1120]",
      accent: "text-emerald-400",
      accentBg: "bg-emerald-500/20 text-emerald-300",
      icon: <Trophy className="w-10 h-10 text-yellow-500" />,
    },
    {
      id: 3,
      title: "LIVE CASINO",
      subtitle: "REAL DEALERS",
      description: "Roulette, Blackjack & Baccarat in HD streaming.",
      cta: "PLAY NOW",
      link: "/casino-live",
      image: "url('/lovable-uploads/9638421c-4395-46aa-8360-153350284000.png')",
      color: "from-purple-950 via-purple-900 to-[#0a1120]",
      accent: "text-purple-400",
      accentBg: "bg-purple-500/20 text-purple-300",
      icon: <Play className="w-10 h-10 text-pink-500 fill-pink-500" />,
    },
    {
      id: 4,
      title: "AFFILIATE",
      subtitle: "PARTNERSHIP",
      description: "Earn daily commissions with our premium tiered system.",
      cta: "JOIN NETWORK",
      link: "/contact",
      image: "",
      color: "from-orange-950 via-orange-900 to-[#0a1120]",
      accent: "text-orange-400",
      accentBg: "bg-orange-500/20 text-orange-300",
      icon: <ArrowRight className="w-10 h-10 text-orange-500" />,
    },
  ];

  return (
    <div className="w-full mb-8 relative z-0">
      {/* --- Mobile View: Carousel --- */}
      <div className="md:hidden -mx-4 px-4 overflow-visible">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {banners.map((banner) => (
              <CarouselItem key={banner.id} className="pl-4 basis-[95%]">
                <div
                  onClick={() => navigate(banner.link)}
                  className={`relative h-[180px] rounded-2xl overflow-hidden p-6 flex flex-col justify-center bg-gradient-to-br ${banner.color} border border-white/10 shadow-2xl active:scale-[0.98] transition-transform duration-200`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

                  {/* Floating Icon */}
                  <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 scale-150 pointer-events-none">
                    {banner.icon}
                  </div>
                  <div className="absolute right-4 top-4 rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] pointer-events-none">
                    {banner.icon}
                  </div>

                  <div className="relative z-10 w-full space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded backdrop-blur-sm ${banner.accentBg}`}
                      >
                        {banner.subtitle}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black italic uppercase leading-[0.9] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {banner.title.split(" ").map((word, i) => (
                        <span
                          key={i}
                          className={
                            i === 0
                              ? "text-white"
                              : "text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
                          }
                        >
                          {word} <br />
                        </span>
                      ))}
                    </h2>

                    <div className="pt-3">
                      <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black bg-white px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {banner.cta} <ChevronRight size={10} strokeWidth={4} />
                      </button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* --- Desktop View: Grid Layout --- */}
      <div className="hidden md:grid grid-cols-12 gap-6 animate-fade-in-up">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Primary Card */}
        <div
          className="col-span-7 relative group cursor-pointer"
          onClick={() => navigate("/wallet?tab=deposit")}
        >
          <div className="card-premium-v2 h-full min-h-[320px] p-10 flex flex-col justify-between overflow-hidden transition-transform hover:scale-[1.01] active:scale-[0.99] duration-300">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-600/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
                  Exclusive Offer
                </span>
              </div>
              <h1 className="text-6xl font-display font-black text-white mb-4 leading-[0.9] tracking-tight drop-shadow-2xl">
                GET{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  500%
                </span>{" "}
                <br />
                <span className="italic">JOINING BONUS</span>
              </h1>
              <p className="text-gray-400 font-mono text-base max-w-md border-l-2 border-red-500/30 pl-4">
                Start your professional betting journey with a high-leverage
                welcome package.
              </p>
            </div>

            <div className="relative z-10 mt-8 pointer-events-none">
              <HeroButton text="DEPOSIT NOW" link="/wallet" color="red" />
            </div>

            {/* Background Elements */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full bg-gradient-to-l from-black/80 to-transparent z-0 pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </div>

        {/* Secondary Card */}
        <div
          className="col-span-5 translate-y-8 relative group cursor-pointer"
          onClick={() => navigate("/contact")}
        >
          <div className="card-premium-v2 h-full min-h-[280px] p-10 flex flex-col justify-between overflow-hidden border-l-[3px] border-l-blue-500 hover:border-l-[#00fff9] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-[0.99]">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
                  Partnership
                </span>
              </div>
              <h2 className="text-4xl font-display font-black text-white mb-4 leading-none uppercase drop-shadow-xl">
                Affiliate <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 italic">
                  Program
                </span>
              </h2>
              <p className="text-gray-400 font-mono text-sm border-l-2 border-blue-500/30 pl-4">
                Earn daily commissions with our premium <br /> tiered
                partnership system.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex justify-end pointer-events-none">
              <HeroButton text="JOIN NETWORK" link="/contact" color="blue" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
