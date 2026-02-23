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
      gradient: "bg-[#1a472a]",
      accent: "text-white bg-[#f28729]",
      icon: <Dices className="w-12 h-12 text-[#1a472a]" />,
      bgPattern:
        "bg-[url('/lovable-uploads/9638421c-4395-46aa-8360-153350284000.png')] bg-cover bg-center blend-overlay opacity-30",
    },
    {
      id: 2,
      title: "SUPER SLOTS",
      subtitle: "JACKPOT LAND",
      cta: "SPIN NOW",
      link: "/casino?cat=slots",
      gradient: "bg-white",
      accent: "text-white bg-[#1a472a]",
      icon: <Sparkles className="w-12 h-12 text-white" />,
      bgPattern:
        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-30",
    },
    {
      id: 3,
      title: "INSTANT WINS",
      subtitle: "AVIATOR & MINES",
      cta: "TRY NOW",
      link: "/casino?cat=aviator",
      gradient: "bg-gray-100",
      accent: "text-white bg-[#f28729]",
      icon: <Zap className="w-12 h-12 text-white" />,
      bgPattern:
        "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-30",
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
                className={`relative h-[160px] rounded overflow-hidden p-6 flex flex-col justify-center ${banner.gradient} border ${banner.gradient === "bg-white" || banner.gradient === "bg-gray-100" ? "border-gray-200" : "border-transparent"} shadow-md active:scale-[0.98] transition-transform duration-200 cursor-pointer group`}
              >
                {/* Background Accents */}
                <div className={`absolute inset-0 ${banner.bgPattern}`} />

                {/* Floating Icon */}
                <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 scale-150 blur-[2px] pointer-events-none">
                  {banner.icon}
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm ${banner.accent}`}
                    >
                      {banner.subtitle}
                    </span>
                  </div>

                  <h2
                    className={`text-3xl font-black italic uppercase leading-[0.9] drop-shadow-sm mb-4 ${banner.gradient === "bg-[#1a472a]" ? "text-white" : "text-[#1a472a]"}`}
                  >
                    {banner.title}
                  </h2>

                  <button
                    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-sm shadow-sm group-hover:scale-105 transition-transform ${banner.gradient === "bg-[#1a472a]" ? "text-[#1a472a] bg-white" : "text-white bg-[#1a472a]"}`}
                  >
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
