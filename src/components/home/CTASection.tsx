import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card/50 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-primary/30 shadow-[0_0_50px_-10px_hsla(var(--primary)/0.2)] hover:shadow-[0_0_70px_-10px_hsla(var(--primary)/0.3)] transition-all duration-500 group">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text-cyan">Win Big?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of players and start your winning journey today.
              Get a <span className="text-success font-bold">welcome bonus</span> on your first deposit!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 text-lg font-bold bg-primary text-black hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                  <Gamepad2 className="w-5 h-5 mr-2 fill-black" />
                  Create Account
                </Button>
              </Link>
              <Link to="/games" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-lg font-bold border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                  Browse Games
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges Simple */}
            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="text-sm font-semibold tracking-widest text-white">VISA</div>
               <div className="text-sm font-semibold tracking-widest text-white">MASTERCARD</div>
               <div className="text-sm font-semibold tracking-widest text-white">UPI</div>
               <div className="text-sm font-semibold tracking-widest text-white">CRYPTO</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
