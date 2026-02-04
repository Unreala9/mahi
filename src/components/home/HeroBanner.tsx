import { useNavigate } from "react-router-dom";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  gradient: string;
  image?: string;
}

const HeroBannerCard = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  gradient,
  image,
}: HeroBannerProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`relative overflow-hidden rounded-lg p-8 min-h-[200px] flex flex-col justify-between ${gradient}`}
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/90 text-sm md:text-base mb-4">{subtitle}</p>
        )}
      </div>
      <button
        onClick={() => navigate(buttonLink)}
        className="relative z-10 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-fit"
      >
        {buttonText}
      </button>
    </div>
  );
};

export const HeroBanner = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <HeroBannerCard
        title="Get 500% Joining Bonus"
        subtitle="Start your betting journey with an amazing welcome offer"
        buttonText="Deposit Now"
        buttonLink="/wallet"
        gradient="bg-gradient-to-r from-red-900 to-red-700"
      />
      <HeroBannerCard
        title="Join Our Affiliate Program"
        subtitle="Earn daily commission"
        buttonText="Join Now"
        buttonLink="/contact"
        gradient="bg-gradient-to-r from-blue-900 to-blue-700"
      />
    </div>
  );
};
