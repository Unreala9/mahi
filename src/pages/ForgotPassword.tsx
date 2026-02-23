import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, ShieldCheck, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      // Use production URL from env or fallback to current origin
      const redirectUrl = import.meta.env.VITE_APP_URL 
        ? `${import.meta.env.VITE_APP_URL}/reset-password`
        : `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("[FORGOT PASSWORD] Error:", error);
        throw error;
      }

      console.log("[FORGOT PASSWORD] Reset email sent to:", email);
      toast.success("Password reset email sent! Check your inbox.");
      setEmailSent(true);
    } catch (error: unknown) {
      console.error("[FORGOT PASSWORD] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 mb-6">
            <Terminal className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-black text-white mb-2 tracking-tight">
            MAHI<span className="text-primary">EX</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">
            Security Key Reset
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0f1826] border border-white/10 rounded-none shadow-2xl">
          <div className="p-8">
            {!emailSent ? (
              <>
                {/* Instructions */}
                <div className="mb-6">
                  <h2 className="text-white font-bold text-lg mb-2">
                    Reset Your Security Key
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Enter your registered email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                      Access ID / Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="email"
                        placeholder="ENTER EMAIL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 font-mono text-sm uppercase"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-none text-sm uppercase tracking-widest relative overflow-hidden group active:scale-[0.99] transition-all"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {loading ? "PROCESSING..." : "SEND RESET LINK"}
                    </span>
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-primary font-mono text-sm mb-6">{email}</p>
                  <p className="text-gray-500 text-xs mb-8">
                    Click the link in the email to reset your password. The link will expire in 60 minutes.
                  </p>
                  
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="outline"
                    className="border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 h-12 rounded-none font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-wider mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Login
                  </Button>
                </div>
              </>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-8 opacity-60">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                Encrypted Connection (TLS 1.3)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 text-center">
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

export default ForgotPassword;
