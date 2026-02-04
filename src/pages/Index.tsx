import { MainLayout } from "@/components/layout/MainLayout";
import { HeroBanner } from "@/components/home/HeroBanner";
import { TopMatches } from "@/components/home/TopMatches";
import { CasinoShowcase } from "@/components/home/CasinoShowcase";

const Index = () => {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {/* Hero Promotional Banners */}
        <HeroBanner />

        {/* Top Live Matches from All Sports */}
        <TopMatches />

        {/* Casino Games Showcase */}
        <CasinoShowcase />
      </div>
    </MainLayout>
  );
};

export default Index;
