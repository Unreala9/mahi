import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, Wallet, Zap, ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse-slow delay-2000 mix-blend-screen" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default shadow-[0_0_20px_rgba(0,0,0,0.2)] group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              Next-Gen Gaming Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
            <span className="text-white drop-shadow-xl">Future of</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-gradient-x glow-text-cyan">
              Online Betting
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Experience the thrill of the{" "}
            <span className="text-white font-medium">Metaverse Casino</span>.
            Instant payouts, provably fair gaming, and VIP rewards in a fully
            immersive neon universe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,255,255,0.3)] rounded-xl border border-white/20">
                <Zap className="w-5 h-5 mr-2 fill-black" />
                Start Winning Now
              </Button>
            </Link>
            <Link to="/games" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300 backdrop-blur-md rounded-xl"
              >
                Explore Games
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Trophy,
                label: "Premium Games",
                value: "500+",
                color: "text-accent",
                glow: "glow-text-magenta",
              },
              {
                icon: Wallet,
                label: "Daily Payouts",
                value: "₹1Cr+",
                color: "text-success",
                glow: "glow-text-green",
              },
              {
                icon: Gamepad2,
                label: "Active Players",
                value: "50K+",
                color: "text-secondary",
                glow: "glow-text-purple",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="glass-panel p-8 rounded-2xl group hover:-translate-y-2 transition-all duration-500 hover:bg-white/10"
              >
                <stat.icon
                  className={`w-10 h-10 ${stat.color} mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                />
                <div
                  className={`font-display text-4xl font-bold text-white mb-2 ${stat.glow}`}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
