import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ============ LOGIN ============
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Welcome back!");
        navigate("/");
      } else {
        // ============ SIGNUP ============
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split("@")[0], // Use email prefix as name
            },
          },
        });

        if (error) {
          console.error("[SIGNUP ERROR]", error);
          toast.error(error.message);
          return;
        }

        // Success
        if (data.user) {
          if (data.session) {
            // Instant login (email confirmation disabled)
            toast.success("Account created! Welcome aboard!");
            navigate("/");
          } else {
            // Email confirmation required
            toast.success("Check your email to confirm account!");
            setIsLogin(true);
          }
        }
      }
    } catch (error: any) {
      console.error("[AUTH ERROR]", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("demo_session", "true");
      toast.success("Logged in as Demo User (Simulation Mode)");
      navigate("/");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary z-20" />
      <div className="absolute bottom-0 w-full h-1 bg-primary z-20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

      <div className="z-10 w-full max-w-md p-4">
        <div className="bg-card border border-border shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          {/* Header Branding */}
          <div className="p-8 text-center border-b border-border bg-card/10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary mb-4 shadow-[0_0_20px_rgba(255,255,60,0.3)]">
              <span className="text-4xl font-black text-black">M</span>
            </div>
            <h1 className="text-3xl font-black tracking-wider">
              MAHI<span className="text-primary">EXCHANGE</span>
            </h1>
            <p className="text-sm text-muted-foreground tracking-wider mt-2">
              PROFESSIONAL BETTING TERMINAL
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border uppercase tracking-wider text-sm"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border uppercase tracking-wider text-sm"
                  required
                />
              </div>

              {/* Toggle & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                >
                  {isLogin ? "BACK TO LOGIN" : "BACK TO LOGIN"}
                </button>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors uppercase tracking-wider font-medium"
                >
                  FORGOT PASSWORD?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black tracking-wider text-sm shadow-[0_0_20px_rgba(255,255,60,0.3)]"
                disabled={loading}
              >
                {loading
                  ? "PROCESSING..."
                  : isLogin
                    ? "LOGIN"
                    : "CREATE ACCESS ID"}
              </Button>
            </form>

            {/* Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground tracking-wider">
                  SYSTEM ACCESS
                </span>
              </div>
            </div>

            {/* Demo Mode Button */}
            <Button
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full h-12 border-border hover:bg-card/50 uppercase tracking-wider text-sm font-medium"
              disabled={loading}
            >
              <Users className="w-4 h-4 mr-2" />
              DEMO SIMULATION MODE
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-card/5 text-center">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
              <span className="tracking-wider">
                256-BIT ENCRYPTED CONNECTION
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
