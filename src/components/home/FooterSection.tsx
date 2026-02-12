import { ShieldCheck, Lock, ChevronRight, MessageSquare } from "lucide-react";

export const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-24 w-full relative z-10 font-sans">
      {/* 1. Support & Safety Bar - Cyberpunk / Terminal Style */}
      <div className="bg-yellow-400 text-black py-3 px-4 relative overflow-hidden">
        {/* Scrolling Stripes Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:20px_20px] opacity-20 animate-[slide_1s_linear_infinite]"></div>

        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          {/* Left: Support Message */}
          <div className="flex items-center gap-3">
            <div className="bg-black text-yellow-400 p-1.5 rounded-sm">
              <MessageSquare size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">
                24/7 Live Support
              </span>
              <span className="text-[10px] font-bold uppercase tracking-tight opacity-80">
                Online & Ready to Assist
              </span>
            </div>
          </div>

          {/* Right: Security Trust */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-black/10 pt-2 md:pt-0 md:pl-4 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-black" />
              <span className="text-[10px] font-bold uppercase tracking-wide">
                100% Secure & Regulated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer - Dark Financial Terminal Look */}
      <div className="bg-[#050b14] border-t border-white/10 pt-12 pb-8 px-6 relative">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <h3 className="text-2xl font-display font-black text-white italic tracking-wider mb-2">
                MAHI<span className="text-yellow-400">EXCHANGE</span>
              </h3>
              <div className="h-1 w-20 bg-yellow-400"></div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md font-mono">
              Experience the next generation of sports exchange and casino
              gaming. Built for speed, security, and reliability.
            </p>

            {/* Credentials */}
            <div className="flex items-center gap-4 pt-2">
              <div className="">
                <img src="/images/ssl.png" alt="" />
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group">
                  <ChevronRight
                    size={10}
                    className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />{" "}
                  About Us
                </li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 group">
                  <ChevronRight
                    size={10}
                    className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />{" "}
                  Contact Us
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                Policy
              </h4>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="hover:text-white cursor-pointer transition-colors group flex items-center gap-2">
                  Privacy Policy
                </li>
                <li className="hover:text-white cursor-pointer transition-colors group flex items-center gap-2">
                  Terms & Conditions
                </li>
                <li className="hover:text-white cursor-pointer transition-colors group flex items-center gap-2">
                  Responsible Gaming
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                Compliance
              </h4>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-[#0a1120] border border-white/10 flex items-center justify-center rounded">
                  <span className="font-serif italic font-black text-lg text-white">
                    G
                  </span>
                </div>
                <div className="w-10 h-10 bg-[#0a1120] border border-white/10 flex items-center justify-center rounded-full">
                  <span className="font-bold text-xs text-red-500">18+</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-600 leading-tight">
                Gambling involves risk. Please gamble responsibly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-600 font-mono uppercase">
            © {currentYear} MahiExchange. All rights reserved.
          </p>
          <p className="text-[10px] text-gray-600 font-mono uppercase">
            v2.4.0 <span className="text-green-500">● Systems Normal</span>
          </p>
        </div>
      </div>
    </div>
  );
};
