import { Link } from "react-router-dom";

export const MainFooter = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card py-16 px-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-foreground tracking-wider italic">
              MAHI <span className="text-primary">EXCHANGE</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The world's most advanced decentralized betting arena. Join the
              elite and experience the next generation of online games.
            </p>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-muted/20 border border-border rounded text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                SSL Secure
              </div>
              <div className="px-3 py-1 bg-muted/20 border border-border rounded text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Provably Fair
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-4">
              {["Games", "Sports", "Live Deals", "Promotions"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Support */}
          <div>
            <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest">
              Support
            </h4>
            <ul className="space-y-4">
              {["FAQ", "Terms", "Privacy", "Responsible Gaming", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Compliance */}
          <div className="bg-muted/20 rounded-3xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-muted-foreground font-bold text-xs italic">
                18+
              </div>
              <div>
                <h5 className="text-foreground font-bold text-sm leading-tight">
                  Gamble Responsibly
                </h5>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight">
                  Know your limits • Stay in control
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mb-4">
              Gambling can be addictive and may result in financial loss.
              MahiExchange encourages players to use our self-exclusion and
              limit tools.
            </p>
            <Link to="/responsible-gaming">
              <button className="w-full py-2 bg-background border border-primary/20 text-muted-foreground text-[10px] font-bold rounded-lg hover:bg-card hover:text-foreground transition-all">
                LEARN MORE
              </button>
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 MahiExchange Arena. Powered by Blockchain Technology.
          </p>
          <div className="flex items-center gap-6">
            <img
              src="https://img.icons8.com/color/48/000000/visa.png"
              className="h-4 grayscale opacity-40 hover:opacity-100 transition-opacity"
              alt="Visa"
            />
            <img
              src="https://img.icons8.com/color/48/000000/mastercard.png"
              className="h-4 grayscale opacity-40 hover:opacity-100 transition-opacity"
              alt="Mastercard"
            />
            <img
              src="https://img.icons8.com/color/48/000000/bitcoin.png"
              className="h-4 grayscale opacity-40 hover:opacity-100 transition-opacity"
              alt="Bitcoin"
            />
            <img
              src="https://img.icons8.com/color/48/000000/ethereum.png"
              className="h-4 grayscale opacity-40 hover:opacity-100 transition-opacity"
              alt="Ethereum"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
