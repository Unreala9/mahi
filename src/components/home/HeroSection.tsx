const HeroSection = () => {
  return (
    <section className="hidden md:flex relative h-full min-h-[300px] md:min-h-[400px] w-full items-center justify-center overflow-hidden bg-[#f8f9fa] rounded-xl shadow-sm border border-gray-100">
      {/* Subtle Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[300px] h-[300px] bg-[#1a472a] rounded-full blur-[100px] opacity-10" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-[300px] h-[300px] bg-[#f28729] rounded-full blur-[100px] opacity-10" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-70" />

      <div className="relative z-10 w-full px-4 py-8 flex flex-col items-center justify-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 transition-transform hover:-translate-y-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f28729] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f28729]"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[#1a472a] uppercase tracking-[0.15em]">
            Premium Betting Platform
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-black uppercase leading-[0.95] tracking-tighter flex flex-col items-center">
          <span className="text-4xl sm:text-5xl md:text-6xl text-[#1a472a] drop-shadow-sm mb-1">
            Future Of
          </span>
          <span className="text-5xl sm:text-6xl md:text-7xl text-[#1a472a] drop-shadow-sm mb-1">
            Online
          </span>
          <span className="text-6xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-[#f28729] to-[#d9771e] drop-shadow-sm filter">
            Betting
          </span>
        </h1>
      </div>
    </section>
  );
};

export default HeroSection;
