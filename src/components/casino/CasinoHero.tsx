import { useRef } from "react";
import {
  Copy,
  Target,
  Sparkles,
  ChevronRight,
  Dices,
  Layers,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const CasinoHero = () => {
  const navigate = useNavigate();
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const banners = [
    {
      id: 1,
      title: "LIVE DEALERS",
      subtitle: "REAL TIME ACTION",
      cta: "PLAY LIVE",
      link: "/casino-live",
      gradient: "from-purple-950 via-purple-900 to-[#0a1120]",
      accent: "text-purple-400",
      icon: <Dices className="w-12 h-12 text-purple-500 opacity-50" />,
      bgPattern:
        "bg-[url('/lovable-uploads/9638421c-4395-46aa-8360-153350284000.png')] bg-cover bg-center blend-overlay",
    },
    {
      id: 2,
      title: "SUPER SLOTS",
      subtitle: "JACKPOT LAND",
      cta: "SPIN NOW",
      link: "/casino?cat=slots",
      gradient: "from-amber-950 via-amber-900 to-[#0a1120]",
      accent: "text-amber-400",
      icon: <Sparkles className="w-12 h-12 text-amber-500 opacity-50" />,
      bgPattern:
        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent",
    },
    {
      id: 3,
      title: "INSTANT WINS",
      subtitle: "AVIATOR & MINES",
      cta: "TRY NOW",
      link: "/casino?cat=aviator",
      gradient: "from-blue-950 via-blue-900 to-[#0a1120]",
      accent: "text-blue-400",
      icon: <Zap className="w-12 h-12 text-blue-500 opacity-50" />,
      bgPattern:
        "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent",
    },
  ];

  return (
    <div className="w-full mb-6">
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
            <CarouselItem
              key={banner.id}
              className="pl-4 basis-[95%] md:basis-[45%] lg:basis-[30%]"
            >
              <div
                onClick={() => navigate(banner.link)}
                className={`relative h-[160px] rounded-2xl overflow-hidden p-6 flex flex-col justify-center bg-gradient-to-br ${banner.gradient} border border-white/5 shadow-xl active:scale-[0.98] transition-transform duration-200 cursor-pointer group`}
              >
                {/* Background Accents */}
                <div
                  className={`absolute inset-0 opacity-30 ${banner.bgPattern}`}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />

                {/* Floating Icon */}
                <div className="absolute right-[-10px] top-[-10px] rotate-12 scale-150 blur-[2px] pointer-events-none">
                  {banner.icon}
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded backdrop-blur-md bg-white/5 border border-white/10 ${banner.accent}`}
                    >
                      {banner.subtitle}
                    </span>
                  </div>

                  <h2 className="text-3xl font-black italic uppercase leading-[0.9] text-white drop-shadow-md mb-4">
                    {banner.title}
                  </h2>

                  <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black bg-white px-5 py-2 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
                    {banner.cta} <ChevronRight size={12} strokeWidth={4} />
                  </button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
