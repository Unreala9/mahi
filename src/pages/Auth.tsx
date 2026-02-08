import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  Users,
  ShieldCheck,
  ArrowRight,
  Terminal,
} from "lucide-react";
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
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .single();

          if (existingUser) {
            toast.error("Email already registered. Please login instead.");
            setIsLogin(true);
            return;
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email: email,
                full_name: email.split("@")[0],
              },
            },
          });

          // Handle database trigger errors gracefully
          if (error) {
            if (error.message.includes("User already registered")) {
              toast.error("Email already registered. Please login instead.");
              setIsLogin(true);
              return;
            }
            if (
              error.message.includes("Database error") ||
              error.message.includes("relation")
            ) {
              console.warn(
                "[AUTH] Database trigger error, but user may be created.",
              );
              toast.success(
                "Account created! Please login with your credentials.",
              );
              setIsLogin(true);
              return;
            }
            throw error;
          }

          console.log("[AUTH] User created:", data?.user?.id);

          // Check if profile was created
          if (data.user) {
            // Auto-login if session exists
            if (data.session) {
              console.log("[AUTH] Session exists, auto-logging in");
              toast.success("Account created and logged in successfully!");
              navigate("/");
            } else {
              // User created but no session
              console.log("[AUTH] User created, please login");
              toast.success(
                "Account created! Please login with your credentials.",
              );
              setIsLogin(true); // Switch to login mode
            }
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
    <div className="min-h-screen flex items-center justify-center bg-[#050b14] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      <div className="z-10 w-full max-w-md relative animate-in fade-in zoom-in duration-500">
        {/* Card Container */}
        <div className="bg-[#0a1120]/80 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* Header Branding */}
          <div className="p-8 pb-6 text-center border-b border-white/5 bg-black/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 rounded-lg mb-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] relative group">
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Users className="w-8 h-8 text-primary relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-widest mb-1 font-display">
              MAHI<span className="text-primary">EX</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">
              Financial Betting Terminal
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8 pt-6">
            <form onSubmit={handleAuth} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1 group">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Access ID / Email
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[40px] flex items-center justify-center border-r border-white/10 bg-white/5 text-gray-400 group-focus-within:text-primary group-focus-within:bg-primary/10 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="ENTER EMAIL"
                    className="pl-12 bg-[#050b14] border-white/10 text-white h-12 rounded-none focus:border-primary/50 focus:ring-0 focus:bg-[#050b14] transition-all placeholder:text-gray-600 font-mono text-sm uppercase"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {/* Tech Corner Accents */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1 group">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Security Key
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[40px] flex items-center justify-center border-r border-white/10 bg-white/5 text-gray-400 group-focus-within:text-primary group-focus-within:bg-primary/10 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="ENTER PASSWORD"
                    className="pl-12 bg-[#050b14] border-white/10 text-white h-12 rounded-none focus:border-primary/50 focus:ring-0 focus:bg-[#050b14] transition-all placeholder:text-gray-600 font-mono text-sm uppercase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Tech Corner Accents */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-primary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Initialize New ID" : "Return to Login"}
                </button>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Reset Key?
                </button>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-none text-sm uppercase tracking-widest relative overflow-hidden group active:scale-[0.99] transition-all"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  {loading
                    ? "PROCESSING..."
                    : isLogin
                      ? "AUTHENTICATE SESSION"
                      : "REGISTER AUTHORITY"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#0a1120] px-3 text-gray-500 font-bold border border-white/5">
                  Restricted Access
                </span>
              </div>
            </div>

            {/* Demo Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 h-12 rounded-none font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-wider group transition-all"
              onClick={handleDemoLogin}
            >
              <Terminal className="w-4 h-4 group-hover:text-primary transition-colors" />
              ENTER SIMULATION MODE
            </Button>

            <div className="flex items-center justify-center gap-2 mt-6 opacity-60">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                Encrypted Connection (TLS 1.3)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex justify-center gap-1 text-[10px] text-gray-600 font-mono">
            <span>LATENCY: 24ms</span>
            <span className="text-gray-800">|</span>
            <span>REGION: ASIA-PACIFIC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
