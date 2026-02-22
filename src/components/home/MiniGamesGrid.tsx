import { Link } from "react-router-dom";

export const MiniGamesGrid = () => {
  const games = [
    {
      img: "/images/imgi_84_aviator.c945eef2.gif",
      alt: "Aviator",
      name: "Aviator",
      link: "/casino",
    },
    {
      img: "/images/imgi_87_color-pridiction.79d759ce.gif",
      alt: "Color Prediction",
      name: "Color Prediction",
      link: "/casino",
    },
    {
      img: "/images/imgi_85_mines.51d0b312.gif",
      alt: "Mines",
      name: "Mines",
      link: "/casino",
    },
    {
      img: "/images/imgi_86_fungames.2c3754ec.gif",
      alt: "Fun Games",
      name: "Fun Games",
      link: "/casino",
    },
  ];

  return (
    <div className="w-full mt-8 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
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

      <div className="grid  grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {games.map((game, idx) => (
          <Link
            key={idx}
            to={game.link}
            className="group relative overflow-hidden rounded-md shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
          >
            <div className="aspect-rectangle p-2">
              <img
                src={game.img}
                alt={game.alt}
                className="w-full h-full object-contain rounded"
              />
            </div>

            <div className="py-2 px-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                {game.name}
              </span>
              <span className="text-[9px] bg-[#0066cc] text-white px-1.5 py-0.5 rounded font-bold">
                HOT
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
