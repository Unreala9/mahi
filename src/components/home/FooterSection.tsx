import { ShieldCheck, MessageSquare } from "lucide-react";

export const FooterSection = () => {
  return (
    <div className="mt-16 w-full relative z-10 font-sans">
      {/* 1. Support & Safety Bar - Flat Design */}
      <div className="bg-[#f28729] text-white px-6 relative overflow-hidden py-3">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 w-full pl-6 pr-6">
          {/* Left: Support Message */}
          <div className="flex items-center gap-3">
            <div className="text-white">
              <MessageSquare size={20} fill="currentColor" strokeWidth={1} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-black uppercase tracking-wider leading-none mb-0.5">
                24/7 Live Support
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest opacity-95">
                Online & Ready to Assist
              </span>
            </div>
          </div>

          {/* Right: Security Trust */}
          <div className="flex flex-wrap items-center gap-6 pb-1 md:pb-0 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2 mr-4">
              <ShieldCheck size={18} className="text-white" strokeWidth={1.5} />
              <span className="text-[11px] font-black uppercase tracking-wider">
                100% Secure & Regulated
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img src="/images/ssl.png" alt="SSL" className="h-[22px]" />
              <img src="/images/chip.png" alt="Chip" className="h-[22px]" />
              <img src="/images/imgi_4_ic_vir.png" alt="Verified" className="h-[22px]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer - Light Theme */}
      <div className="bg-white border-t border-gray-100 pt-8 pb-8 px-6 relative">
        <div className="max-w-[1400px] mx-auto pl-6 pr-6">
          {/* Partner / Payment Images Grid - Single Row */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 pb-12 border-b border-gray-100 mb-12">
            {[
              "/images/ssl.png",
              "/images/footer1.png",
              "/images/footer2.png",
              "/images/footer3.png",
              "/images/footer4.png",
              "/images/footer5.png",
              "/images/footer6.png",
              "/images/footer7.png",
            ].map((src, i) => (
              <div
                key={i}
                className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
              >
                <img
                  src={src}
                  alt={`Partner ${i + 1}`}
                  className="w-full h-auto object-contain max-h-[50px] md:max-h-[60px]"
                />
              </div>
            ))}
          </div>

          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Description Column */}
            <div className="md:col-span-4">
              <p className="text-gray-500 text-[11px] tracking-wide leading-[1.8] max-w-sm font-mono mt-1">
                Experience the next generation of sports exchange and casino
                gaming. Built for speed, security, and reliability.
              </p>
            </div>

            {/* Links & Info Columns */}
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-5">
                <h4 className="text-[#1a472a] text-xs font-black uppercase tracking-widest">
                  Platform
                </h4>
                <ul className="space-y-3 text-[11px] text-gray-500 font-bold tracking-wide">
                  <li className="hover:text-[#1a472a] cursor-pointer transition-colors">
                    About Us
                  </li>
                  <li className="hover:text-[#1a472a] cursor-pointer transition-colors">
                    Contact Us
                  </li>
                </ul>
              </div>

              <div className="space-y-5">
                <h4 className="text-[#1a472a] text-xs font-black uppercase tracking-widest">
                  Policy
                </h4>
                <ul className="space-y-3 text-[11px] text-gray-500 font-bold tracking-wide">
                  <li className="hover:text-[#1a472a] cursor-pointer transition-colors">
                    Privacy Policy
                  </li>
                  <li className="hover:text-[#1a472a] cursor-pointer transition-colors">
                    Terms & Conditions
                  </li>
                  <li className="hover:text-[#1a472a] cursor-pointer transition-colors">
                    Responsible Gaming
                  </li>
                </ul>
              </div>

              <div className="space-y-5">
                <h4 className="text-[#1a472a] text-xs font-black uppercase tracking-widest">
                  Compliance
                </h4>
                <div className="flex gap-2">
                  <div className="w-9 h-9 bg-gray-50 border border-gray-100 flex items-center justify-center rounded">
                    <span className="font-serif italic font-black text-sm text-gray-800">
                      G
                    </span>
                  </div>
                  <div className="w-9 h-9 bg-gray-50 border border-gray-100 flex items-center justify-center rounded-full">
                    <span className="font-bold text-[10px] text-red-500">18+</span>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 font-mono leading-tight tracking-wide max-w-[120px]">
                  Gambling involves risk.<br />Please gamble responsibly.
                </p>
              </div>

              {/* Social Connect Column */}
              <div className="space-y-6">
                <h4 className="text-[#1a472a] text-xs font-black uppercase tracking-widest">
                  Connect
                </h4>
                <div className="flex flex-row flex-wrap gap-3 mt-3">
                  <a href="#" className="block hover:-translate-y-1 transition-transform">
                    <img
                      src="/images/imgi_150_default.webp"
                      alt="Instagram"
                      className="h-[40px] w-auto object-contain rounded drop-shadow-sm"
                    />
                  </a>
                  <a href="#" className="block hover:-translate-y-1 transition-transform">
                    <img
                      src="/images/imgi_149_default.webp"
                      alt="WhatsApp"
                      className="h-[40px] w-auto object-contain rounded drop-shadow-sm"
                    />
                  </a>
                  <a href="#" className="block hover:-translate-y-1 transition-transform">
                    <img
                      src="/images/imgi_151_default.webp"
                      alt="Telegram"
                      className="h-[40px] w-auto object-contain rounded drop-shadow-sm"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* end md:grid-cols-12 */}

          {/* Extreme bottom line separated by a clean top line */}
          <div className="h-px bg-gray-100 mt-12 mb-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] tracking-[0.1em] text-gray-500 font-bold uppercase">
              © 2026 RANA365. All rights reserved.
            </p>
            <p className="text-[9px] tracking-[0.1em] text-gray-400 font-black uppercase flex items-center">
              V2.4.0 <span className="mx-1.5">•</span> <span className="text-[#1a472a]">SYSTEMS NORMAL</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
