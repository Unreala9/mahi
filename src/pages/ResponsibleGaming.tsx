import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Wallet,
  Users,
  Phone,
  Shield,
} from "lucide-react";

const ResponsibleGaming = () => {
  const tips = [
    {
      icon: Wallet,
      title: "Set a Budget",
      description:
        "Only gamble with money you can afford to lose. Set daily, weekly, or monthly deposit limits.",
    },
    {
      icon: Clock,
      title: "Manage Your Time",
      description:
        "Set time limits for your gaming sessions. Take regular breaks to maintain perspective.",
    },
    {
      icon: AlertTriangle,
      title: "Know the Signs",
      description:
        "Recognize warning signs of problem gambling: chasing losses, borrowing money, neglecting responsibilities.",
    },
    {
      icon: Users,
      title: "Seek Support",
      description:
        "Talk to friends, family, or professional counselors if gaming is affecting your life negatively.",
    },
  ];

  const resources = [
    { name: "Gamblers Anonymous India", url: "#" },
    { name: "National Problem Gambling Helpline", phone: "1800-XXX-XXXX" },
    { name: "iCall Psychosocial Helpline", phone: "9152987821" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden border-b border-border mb-12">
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Responsible <span className="text-primary">Gaming</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            At MahiExchange, we're committed to providing a safe and enjoyable
            gaming environment. We believe gambling should be entertaining, not
            harmful. Here's how we help you stay in control.
          </p>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-8">
        <h2 className="font-display text-4xl font-bold text-foreground mb-8 text-center">
          Tips for <span className="text-primary">Safe Gaming</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <tip.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {tip.title}
              </h3>
              <p className="text-muted-foreground text-base">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Self-Exclusion Section */}
      <section className="py-12 mt-12 bg-card/50 rounded-3xl border border-border p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-foreground mb-6 text-center">
            Self-Exclusion <span className="text-primary">Options</span>
          </h2>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground text-center mb-8">
              If you feel you need a break from gaming, we offer self-exclusion
              options:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h4 className="font-semibold text-lg text-foreground mb-2">
                  Cooling-Off
                </h4>
                <p className="text-muted-foreground text-sm">
                  Take a break for 24h, 7d, or 30d
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h4 className="font-semibold text-lg text-foreground mb-2">
                  Exclusion
                </h4>
                <p className="text-muted-foreground text-sm">
                  Break for 6m, 1y, or permanent
                </p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border">
                <h4 className="font-semibold text-lg text-foreground mb-2">
                  Deposit Limits
                </h4>
                <p className="text-muted-foreground text-sm">
                  Set daily or weekly limits
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button className="bg-primary text-black hover:bg-primary/90 font-bold px-8">
                Manage My Limits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Resources */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">
            Need <span className="text-primary">Help?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            If you or someone you know is struggling with gambling addiction,
            please reach out to these support organizations:
          </p>
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
              >
                <span className="font-medium text-lg text-foreground">
                  {resource.name}
                </span>
                {resource.phone ? (
                  <a
                    href={`tel:${resource.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {resource.phone}
                  </a>
                ) : (
                  <a
                    href={resource.url}
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Gambling Problem? Call Now
          </h3>
          <p className="text-lg text-muted-foreground mb-4">
            Free, confidential support is available 24/7
          </p>
          <a
            href="tel:1800-XXX-XXXX"
            className="inline-flex items-center gap-2 text-2xl font-bold text-destructive hover:underline"
          >
            <Phone className="w-5 h-5" />
            1800-XXX-XXXX
          </a>
        </div>
      </section>
    </div>
  );
};

export default ResponsibleGaming;
