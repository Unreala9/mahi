import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Users, ShieldCheck, ArrowRight } from "lucide-react";
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
          console.error("[AUTH] Login error:", error);

          // Check if user doesn't exist - suggest registration
          if (error.message.includes("Invalid login credentials")) {
            toast.error(
              "Invalid credentials. Please check your email/password or register first.",
            );
            return;
          }
          throw error;
        }

        console.log("[AUTH] Login successful");
        toast.success("Login successful!");
        navigate("/");
      } else {
        console.log("[AUTH] Signup attempt for:", email);

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email: email,
              },
            },
          });

          console.log("[AUTH] SignUp response - data:", data);
          console.log("[AUTH] SignUp response - error:", error);

          // Handle database trigger errors gracefully
          if (error) {
            if (error.message.includes("Database error saving new user")) {
              console.warn(
                "[AUTH] Database trigger error, but user may be created. Using demo mode.",
              );
              localStorage.setItem("demo_session", "true");
              localStorage.setItem("demo_email", email);
              toast.success(
                "Account created! Logged in as demo user (database setup pending)",
              );
              navigate("/");
              return;
            }
            throw error;
          }

          console.log("[AUTH] User created:", data?.user?.id);

          // Auto-login if session exists
          if (data.session) {
            console.log("[AUTH] Session exists, auto-logging in");
            toast.success("Account created successfully!");
            navigate("/");
          } else if (data.user) {
            // User created but no session (email confirmation required)
            console.log(
              "[AUTH] User created, email confirmation may be required",
            );
            toast.success("Account created! You can now login.");
            setIsLogin(true); // Switch to login mode
          } else {
            toast.error("Signup failed. Please try again.");
          }
        } catch (signupError: any) {
          // Catch any signup errors
          console.error("[AUTH] Signup error:", signupError);

          if (signupError.message.includes("Database error")) {
            console.warn(
              "[AUTH] Database error during signup, using demo mode",
            );
            localStorage.setItem("demo_session", "true");
            localStorage.setItem("demo_email", email);
            toast.success(
              "Account created in demo mode! (Database setup pending)",
            );
            navigate("/");
            return;
          }

          if (signupError.message.includes("already registered")) {
            toast.error("Email already registered. Please login instead.");
            setIsLogin(true);
            return;
          }

          throw signupError;
        }
      }
    } catch (error: any) {
      console.error("[AUTH] Auth error caught:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("demo_session", "true");
      toast.success("Logged in as Demo User");
      navigate("/");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e27] relative overflow-hidden mt-24">
      {/* Yellow bars */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFFF3C] z-20" />
      <div className="absolute bottom-0 w-full h-1 bg-[#FFFF3C] z-20" />

      <div className="z-10 w-full max-w-md p-4">
        <div className="bg-card border border-border shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          {/* Header Branding */}
          <div className="p-8 text-center border-b border-border bg-card/10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary mb-4 shadow-[0_0_20px_rgba(255,255,60,0.3)]">
              <span className="text-black font-black text-4xl font-display">
                M
              </span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 font-display">
              MAHI<span className="text-primary">EXCHANGE</span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
              Professional Betting Terminal
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    className="pl-12 bg-input/20 border-border text-foreground h-12 rounded-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50 font-mono text-sm uppercase tracking-wide"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="PASSWORD"
                    className="pl-12 bg-input/20 border-border text-foreground h-12 rounded-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50 font-mono text-sm uppercase tracking-wide"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Register New ID" : "Back to Login"}
                </span>
                <span className="cursor-pointer text-primary hover:text-foreground transition-colors">
                  Forgot Password?
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary text-black hover:bg-white font-black h-12 rounded-none text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,60,0.2)] active:scale-[0.98] transition-all"
                disabled={loading}
              >
                {loading
                  ? "AUTHENTICATING..."
                  : isLogin
                    ? "LOGIN TO TERMINAL"
                    : "CREATE ACCESS ID"}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-card px-3 text-muted-foreground font-bold">
                  System Access
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-border bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white h-12 rounded-none font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
              onClick={handleDemoLogin}
            >
              <Users className="w-4 h-4" />
              DEMO SIMULATION MODE
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-center gap-2 mt-8 opacity-50">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                256-BIT ENCRYPTED CONNECTION
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
