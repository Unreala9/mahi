import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Users, ShieldCheck } from "lucide-react";
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login successful!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success(
          "Registration successful! Check your email for confirmation.",
        );
      }
    } catch (error: any) {
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

      <div className="z-10 w-full max-w-md p-6">
        <div className="bg-[#1a1f3a] border border-[#2a2f4a] shadow-2xl rounded-lg overflow-hidden">
          {/* Logo Header */}
          <div className="p-12 text-center border-b border-[#2a2f4a]">
            <img
              src="/mahiex.png"
              alt="MahiEx"
              className="h-32 w-auto mx-auto "
            />
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
              Professional Betting Terminal
            </p>
          </div>

          {/* Login/Register Tabs */}
          <div className="flex border-b border-[#2a2f4a]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                isLogin
                  ? "bg-[#FFFF3C] text-black"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                !isLogin
                  ? "bg-[#FFFF3C] text-black"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-11 bg-[#0f1329] border-[#2a2f4a] text-white h-12 rounded-md focus:border-[#FFFF3C] focus:ring-1 focus:ring-[#FFFF3C] placeholder:text-gray-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    className="pl-11 bg-[#0f1329] border-[#2a2f4a] text-white h-12 rounded-md focus:border-[#FFFF3C] focus:ring-1 focus:ring-[#FFFF3C] placeholder:text-gray-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Forgot Password - Only show on login */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-[#FFFF3C] hover:text-white font-semibold uppercase"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#FFFF3C] hover:bg-[#ffff50] text-black font-black h-12 rounded-md text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading
                  ? "Please Wait..."
                  : isLogin
                    ? "Login"
                    : "Create Account"}
              </Button>

              {/* Demo Login - Only show on login */}
              {isLogin && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#2a2f4a]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#1a1f3a] px-3 text-gray-500 font-semibold uppercase">
                        Or
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#2a2f4a] bg-transparent text-gray-300 hover:bg-[#2a2f4a] hover:text-white h-12 rounded-md font-semibold flex items-center justify-center gap-2 uppercase text-xs"
                    onClick={handleDemoLogin}
                    disabled={loading}
                  >
                    <Users className="w-4 h-4" />
                    Try Demo Mode
                  </Button>
                </>
              )}
            </form>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-[#2a2f4a]/50">
              <ShieldCheck className="w-4 h-4 text-[#FFFF3C]" />
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                Secure Connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
