import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export const PromoSpotlight = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const promos = [
    {
      img: "/images/rolexsb-banner6.webp",
      alt: "Promo 1",
      link: "/sports?sport=4",
    },
    {
      img: "/images/rolexsb-banner10.jpg",
      alt: "Promo 2",
      link: "/casino",
    },
    {
      img: "/images/rolexsb-banner11.webp",
      alt: "Promo 3",
      link: "/sports?sport=1",
    },
    {
      img: "/images/rolexsb-banner12.webp",
      alt: "Promo 4",
      link: "/sports?sport=2",
    },
    {
      img: "/images/rolexsb-banner9.jpg",
      alt: "Promo 5",
      link: "/casino",
    },
  ];

  return (
    <div className="w-full px-4 md:px-0">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-xl md:text-2xl font-black italic uppercase text-[#1a472a]">
          SPOTLIGHT <span className="text-[#f28729]">PROMOS</span>
        </h2>
      </div>

      <div className="overflow-hidden rounded-md shadow-sm" ref={emblaRef}>
        <div className="flex">
          {promos.map((promo, idx) => (
            <div key={idx} className="min-w-0 shrink-0 grow-0 basis-full">
              <Link
                to={promo.link}
                className="group block overflow-hidden shadow hover:shadow-lg transition-all duration-300 relative w-full aspect-[21/6] md:aspect-[5/1]"
              >
                <img
                  src={promo.img}
                  alt={promo.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
