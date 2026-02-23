import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export const HeroBanner = () => {
  const navigate = useNavigate();

  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const mobileImages = [
    "/images/home1.png",
    "/images/home2.png",
    "/images/home3.png",
    "/images/home4.png",
    "/images/home5.png",
    "/images/home6.png",
  ];

  return (
    <div className="w-full mb-8 relative z-0">
      {/* Outer container must hide overflow to prevent horizontal scrollbar */}
      <div className="overflow-hidden w-full md:w-[50vw] rounded-md" ref={emblaRef}>
        {/* Negative left margin matches slide padding */}
        <div className="flex -ml-3 md:-ml-0">
          {mobileImages.map((src, idx) => (
            <div
              key={idx}
              className="min-w-0 shrink-0 grow-0 basis-[92%] md:basis-full pl-3 md:pl-0"
            >
              <div
                onClick={() => navigate("/sports?sport=4")}
                className="relative cursor-pointer rounded overflow-hidden aspect-[15/10] md:aspect-[3/2] lg:aspect-[6/4] shadow-sm hover:shadow-lg transition-transform duration-300"
              >
                <img
                  src={src}
                  alt={`Banner ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
