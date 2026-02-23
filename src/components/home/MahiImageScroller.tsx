import { useNavigate } from "react-router-dom";

export const MahiImageScroller = () => {
  const navigate = useNavigate();

  const mahiImages = [
    "/images/mahi1.png",
    "/images/mahi2.png",
    "/images/mahi3.png",
    "/images/mahi4.png",
    "/images/mahi5.png",
    "/images/mahi6.png",
    "/images/mahi7.png",
    "/images/mahi8.png",
    "/images/mahi9.png",
    "/images/mahi10.png",
    "/images/mahi11.png",
    "/images/mahi12.png",
  ];

  // Double the items for a seamless continuous marquee
  const loopedItems = [...mahiImages, ...mahiImages];

  return (
    <div className="w-full mb-2 mt-4 relative z-10 px-0 md:px-0">
      <div className="flex items-center justify-between px-4 md:px-0 mb-2">

      </div>

      <style>{`
        @keyframes mahi-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.375rem)); } /* -50% to shift one full original list set, factoring in half of the 0.75rem (gap-3) */
        }
        .animate-mahi-scroll {
          animation: mahi-scroll 40s linear infinite;
        }
        .scroll-container:hover .animate-mahi-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div className="overflow-hidden scroll-container px-2 md:px-0 relative">
        <div className="flex gap-1 w-max animate-mahi-scroll ">
          {loopedItems.map((src, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[140px] md:w-[220px] shadow-sm hover:shadow-md transition-shadow duration-300 rounded cursor-pointer overflow-hidden group relative bg-white border border-gray-100"
              onClick={() => navigate("/casino")}
            >
              <div className="relative aspect-[3/3] flex items-center justify-center p-2">
                <img
                  src={src}
                  alt={`Mahi Favorite ${idx + 1}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Edge Fades for scroll affordance */}
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#f0f2f5] to-transparent pointer-events-none md:hidden" />
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#f0f2f5] to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  );
};

export default MahiImageScroller;
