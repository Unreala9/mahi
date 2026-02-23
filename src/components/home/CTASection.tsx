import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowRight, Trophy } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-4 bg-[#f0f2f5] relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-[1200px] mx-auto">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a472a] via-[#143d22] to-[#0d2a17] shadow-2xl">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-20 w-[400px] h-[400px] bg-[#2d6a4f] rounded-full blur-[80px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-20 -translate-x-20 w-[300px] h-[300px] bg-[#f28729] rounded-full blur-[100px] opacity-20 pointer-events-none" />

            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 md:p-16 relative z-10">

              {/* Content Side */}
              <div className="text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Trophy className="w-4 h-4 text-[#f28729]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#f28729]">Premium Betting Exchange</span>
                </div>

                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] uppercase tracking-tighter">
                  Ready to <span className="text-[#f28729] relative inline-block">
                    Win Big?
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f28729] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-green-50 max-w-xl font-medium leading-relaxed opacity-90">
                  Join thousands of players and start your winning journey today.
                  Experience the fastest bet settlement and get an exclusive <span className="text-white font-bold bg-[#f28729]/20 px-2 py-0.5 rounded-sm">100% Welcome Bonus</span> on your first deposit!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-14 px-8 text-lg bg-[#f28729] hover:bg-[#e07320] text-white transition-all shadow-lg hover:shadow-[#f28729]/30 hover:-translate-y-1 rounded-sm uppercase tracking-wider font-bold">
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/sports" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-white/30 text-white bg-white/5 backdrop-blur-md hover:bg-white/15 hover:border-white/50 rounded-sm uppercase tracking-wider transition-all hover:-translate-y-1">
                      Explore Markets
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Visual/Feature Side */}
              <div className="hidden lg:flex flex-col justify-center items-end relative h-full">
                <div className="relative w-[320px] h-[340px] bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-2xl p-6 backdrop-blur-md shadow-2xl skew-y-6 rotate-3 hover:rotate-0 hover:skew-y-0 transition-all duration-500 ease-out group">
                  <div className="flex flex-col gap-6 h-full justify-center">
                    {/* Fake Live Match Card */}
                    <div className="bg-white rounded-lg p-4 shadow-xl transform -translate-x-8 group-hover:-translate-x-4 transition-transform duration-500">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>Live</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Cricket</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-gray-800 text-sm mb-1">
                        <span>India</span> <span className="text-[#1a472a]">1.45</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-gray-800 text-sm">
                        <span>Australia</span> <span className="text-red-500">2.80</span>
                      </div>
                    </div>

                    {/* Fake Casino Card */}
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 shadow-xl transform translate-x-4 group-hover:translate-x-2 transition-transform duration-500 delay-75">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-[#f28729] uppercase">Casino</span>
                        <Gamepad2 className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="font-bold text-white text-lg tracking-wide">
                        Roulette Live
                      </div>
                      <div className="text-xs text-indigo-200 mt-1">Over 2,400+ active players</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Payment Methods Footer inside the card */}
            <div className="bg-black/20 border-t border-white/10 p-4 relative z-10 w-full backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 opacity-70">
                <span className="text-sm font-bold tracking-widest text-white/90 uppercase">Safe & Secure Payments</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 hidden md:inline-block"></span>
                <div className="flex gap-8 items-center">
                  <div className="text-sm font-black tracking-wider text-white">VISA</div>
                  <div className="text-sm font-black tracking-wider text-white">MASTERCARD</div>
                  <div className="text-sm font-black tracking-wider text-white">UPI</div>
                  <div className="text-sm font-black tracking-wider text-white">CRYPTO</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
