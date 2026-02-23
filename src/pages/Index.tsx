import { HeroBanner } from "@/components/home/HeroBanner";
import { TopMatches } from "@/components/home/TopMatches";
import { CasinoShowcase } from "@/components/home/CasinoShowcase";
import { FooterSection } from "@/components/home/FooterSection";
import { PromoSpotlight } from "@/components/home/PromoSpotlight";
import { LobbyScroller } from "@/components/home/LobbyScroller";
import { MiniGamesGrid } from "@/components/home/MiniGamesGrid";
import { VisualSportsGrid } from "@/components/home/VisualSportsGrid";
import { Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CTASection from "@/components/home/CTASection";
import Promostrip from "@/components/home/PromoStrip";

const casinoBannerImages = [
  "/images/imgi_174_Aviator-1766070541485.jpg",
  "/images/imgi_173_Evolution-1766067973985.jpg",
  "/images/imgi_175_Aura-1766067418600.jpg",
  "/images/imgi_176_Casino-1766067481768.jpg",
  "/images/imgi_178_LIMBO-1766070421382.webp",
  "/images/imgi_181_promotionBanner-DsJ3B3xu.webp",
];

const Index = () => {
  const [currentCasinoBanner, setCurrentCasinoBanner] = useState(0);
  const [casinoFade, setCasinoFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCasinoFade(false);
      setTimeout(() => {
        setCurrentCasinoBanner(
          (prev) => (prev + 1) % casinoBannerImages.length,
        );
        setCasinoFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full  md:pb-0 font-sans">
      {/* Mobile Action Buttons (Deposit/Withdraw) */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4 ">
        <Link
          to="/wallet?tab=deposit"
          className="flex items-center justify-center gap-2 bg-[#1a472a] text-white font-bold uppercase tracking-wider  rounded shadow-sm active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <ArrowDownCircle size={18} />
            <span className="text-sm">DEPOSIT</span>
          </div>
        </Link>
        <Link
          to="/wallet?tab=withdraw"
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-[#1a472a] font-bold uppercase tracking-wider py-2.5 rounded shadow-sm active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <ArrowUpCircle size={18} />
            <span className="text-sm">WITHDRAW</span>
          </div>
        </Link>
      </div>

      <div className="px-2 md:px-10">
        {/* Hero Promotional Banners */}
        <HeroBanner />

        {/* Dash Promos */}
        <PromoSpotlight />

        {/* Lobby Scroller */}
        <div className="mt-4 mb-2">
          <LobbyScroller />
        </div>

        <TopMatches />

        {/* Casino Games Showcase */}
        <CasinoShowcase />
        {/* Animated Games */}
        <MiniGamesGrid />

        {/* Visual Grids */}
        <VisualSportsGrid />

        <Promostrip />

        <CTASection />

        {/* Footer Section */}
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
