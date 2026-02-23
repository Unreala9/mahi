import { Link } from "react-router-dom";
import { SportIcon } from "@/components/SportIcon";

export const VisualSportsGrid = () => {
  const sports = [
    {
      name: "Cricket",
      eventId: 4,
      img: "/images/imgi_71_cricket-bg.3f90a749.webp",
      link: "/sports?sport=4",
    },
    {
      name: "Soccer",
      eventId: 1,
      img: "/images/imgi_73_soccer-bg.0aa30909.webp",
      link: "/sports?sport=1",
    },
    {
      name: "Tennis",
      eventId: 2,
      img: "/images/imgi_75_tennis-bg.50a4d8b6.webp",
      link: "/sports?sport=2",
    },
    {
      name: "Virtuals",
      eventId: 0,
      img: "/images/imgi_77_virtual-sports-bg.fa88cdc3.webp",
      link: "/sports",
    },
    {
      name: "E-Cricket",
      eventId: 4,
      img: "/images/imgi_93_e-cricket-bg.4e6e7bfa.webp",
      link: "/sports",
    },
    {
      name: "FIFA Cup",
      eventId: 1,
      img: "/images/imgi_80_fifa-cup-winner-bg.c7e07223.webp",
      link: "/sports",
    },
    {
      name: "Winner Cup",
      eventId: 1,
      img: "/images/imgi_81_winner-cup-bg.bbbe5ea5.webp",
      link: "/sports",
    },
    {
      name: "Sportsbook",
      eventId: 1,
      img: "/images/imgi_88_sportsbook-bg.5772b654.webp",
      link: "/sports",
    },
  ];

  return (
    <div className="w-full mt-2 px-0">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-xl md:text-2xl font-black italic uppercase text-[#1a472a]">
          SPORTS & <span className="text-[#f28729]">VIRTUALS</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {sports.map((sport, idx) => (
          <Link
            key={idx}
            to={sport.link}
            className="group relative overflow-hidden rounded-md shadow-sm border border-gray-200 aspect-[4/2] flex items-end justify-start p-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute inset-0 w-full h-full">
              <img
                src={sport.img}
                alt={sport.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-2">
              {sport.eventId > 0 && (
                <div className="text-white group-hover:text-[#f28729] transition-colors p-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                  <SportIcon eventId={sport.eventId} size={16} />
                </div>
              )}
              <h3 className="text-white font-bold tracking-wider uppercase text-xs md:text-sm group-hover:text-[#f28729] transition-colors">
                {sport.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
