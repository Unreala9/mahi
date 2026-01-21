import { Shield, Zap, Wallet, Headphones, Lock, Gift } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Fair",
    description:
      "All games are provably fair with industry-standard encryption.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "group-hover:border-primary/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--primary)/0.3)]",
  },
  {
    icon: Zap,
    title: "Instant Deposits",
    description: "Fund your wallet instantly with UPI, cards, or crypto.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "group-hover:border-accent/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--accent)/0.3)]",
  },
  {
    icon: Wallet,
    title: "Quick Withdrawals",
    description: "Get your winnings within minutes, not days.",
    color: "text-success",
    bg: "bg-success/10",
    border: "group-hover:border-success/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--success)/0.3)]",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our support team is always ready to help you.",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "group-hover:border-secondary/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--secondary)/0.3)]",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data is encrypted and never shared.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "group-hover:border-primary/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--primary)/0.3)]",
  },
  {
    icon: Gift,
    title: "Daily Bonuses",
    description: "Earn rewards, bonuses, and exclusive perks daily.",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "group-hover:border-accent/50",
    glow: "group-hover:shadow-[0_0_30px_-5px_hsla(var(--accent)/0.3)]",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white/[0.02]">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[128px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent tracking-wider uppercase">
            Platform Features
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text-cyan">
              MahiExchange?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Experience the best gaming platform with unmatched features,
            security, and world-class support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-8 bg-card/30 backdrop-blur-md rounded-3xl border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${feature.border} ${feature.glow}`}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
              >
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
