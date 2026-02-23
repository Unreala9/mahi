import { Link } from "react-router-dom";

export const MiniGamesGrid = () => {
  const games = [
    {
      img: "/images/imgi_8_Marble race.gif",
      alt: "Marble Race",
      name: "Marble Race",
      link: "/casino",
    },
    {
      img: "/images/imgi_9_Aviator.gif",
      alt: "Aviator",
      name: "Aviator",
      link: "/casino",
    },
    {
      img: "/images/imgi_10_Colour.gif",
      alt: "Colour",
      name: "Colour",
      link: "/casino",
    },
    {
      img: "/images/imgi_11_Mines.gif",
      alt: "Mines",
      name: "Mines",
      link: "/casino",
    },
    {
      img: "/images/imgi_12_Luckky lace.gif",
      alt: "Luckky lace",
      name: "Luckky lace",
      link: "/casino",
    },
    {
      img: "/images/imgi_13_Prediction.gif",
      alt: "Prediction",
      name: "Prediction",
      link: "/casino",
    },
  ];

  // Double the items for a seamless continuous marquee
  const loopedItems = [...games, ...games];

  return (
    <div className="w-full pb-2 px-0 md:px-0 relative">
      <div className="flex items-center justify-between py-2 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-black italic uppercase text-[#0066cc]">
          TRENDING <span className="text-[#f28729]">MINI GAMES</span>
        </h2>
        <Link
          to="/casino"
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#0066cc]"
        >
          Play All
        </Link>
      </div>

      <style>{`
        @keyframes mini-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.375rem)); }
        }
        .animate-mini-scroll {
          animation: mini-scroll 20s linear infinite;
        }
        .scroll-container:hover .animate-mini-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div className="overflow-hidden scroll-container px-4 md:px-0 relative">
        <div className="flex gap-3 w-max animate-mini-scroll ">
          {loopedItems.map((game, idx) => (
            <Link
              key={idx}
              to={game.link}
              className="group relative overflow-hidden rounded-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex-shrink-0 w-[210px] md:w-[250px]"
            >
              <div className="aspect-rectangle  flex items-center justify-center">
                <img
                  src={game.img}
                  alt={game.alt}
                  className="w-full h-full object-contain rounded"
                />
              </div>


            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};
