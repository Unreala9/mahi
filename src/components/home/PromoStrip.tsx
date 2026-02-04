import { ArrowRight } from "lucide-react";

export const PromoStrip = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Deposit Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-6 md:p-8">
        <div className="relative z-10">
          <div className="text-white/90 text-sm font-medium mb-2">
            Special Offer
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get <span className="text-yellow-300">500%</span>
            <br />
            Joining Bonus
          </h3>
          <button className="bg-white text-green-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 group">
            Deposit Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Affiliate Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-8">
        <div className="relative z-10">
          <div className="text-white/90 text-sm font-medium mb-2">
            Earn More
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Join Our Affiliate
            <br />
            Program
          </h3>
          <p className="text-white/70 text-sm mb-4">✨ Earn daily commission</p>
          <button className="bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 group">
            Join Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
};
