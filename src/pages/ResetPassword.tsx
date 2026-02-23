import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck, Terminal, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast.error("Invalid or expired reset link. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 3000);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("[RESET PASSWORD] Error:", error);
        throw error;
      }

      console.log("[RESET PASSWORD] Password updated successfully");
      toast.success("Password reset successful!");
      setPasswordReset(true);

      // Redirect to auth page after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: unknown) {
      console.error("[RESET PASSWORD] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
            Reset Security Key
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#0f1826] border border-white/10 rounded-none shadow-2xl">
          <div className="p-8">
            {!passwordReset ? (
              <>
                {/* Instructions */}
                <div className="mb-6">
                  <h2 className="text-white font-bold text-lg mb-2">
                    Enter New Password
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Choose a strong password to secure your account.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* New Password Input */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                      New Security Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        placeholder="ENTER NEW PASSWORD"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 font-mono text-sm"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                      Confirm Security Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input
                        type="password"
                        placeholder="CONFIRM NEW PASSWORD"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 h-12 rounded-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 font-mono text-sm"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-white/5 border border-white/10 rounded p-3">
                    <p className="text-xs text-gray-400">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-none text-sm uppercase tracking-widest relative overflow-hidden group active:scale-[0.99] transition-all"
                    disabled={loading}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {loading ? "PROCESSING..." : "UPDATE PASSWORD"}
                    </span>
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-white font-bold text-xl mb-2">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Redirecting to login...
                  </p>
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

export default ResetPassword;
