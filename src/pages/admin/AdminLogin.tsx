import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Mail, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("✅ [AdminLogin] Login successful, user:", data.user.id);

      // Check if user is admin
      console.log("🔍 [AdminLogin] Checking admin status...");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      console.log("📋 [AdminLogin] Profile data:", profile);
      console.log("📋 [AdminLogin] Profile error:", profileError);
      console.log("📋 [AdminLogin] Role found:", profile?.role);

      if (profileError) {
        console.error("❌ [AdminLogin] Error fetching profile:", profileError);
        toast({
          title: "Error",
          description:
            "Could not verify admin status. Please check RLS policies.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      if (!profile || profile.role !== "admin") {
        console.error("❌ [AdminLogin] Not admin. Role:", profile?.role);
        // Not an admin - sign them out
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This account does not have admin privileges",
          variant: "destructive",
        });
        return;
      }

      // Success - redirect to admin panel
      console.log("✅ [AdminLogin] Admin verified! Redirecting...");
      toast({
        title: "Success",
        description: "Welcome to Admin Panel",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive to-accent mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm">
            Secure login for authorized personnel only
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@mahiexchange.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border/50"
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border/50"
                disabled={loading}
                required
              />
            </div>

            {/* Warning */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-xs text-destructive">
                Unauthorized access attempts are logged and monitored
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              ← Back to Main Site
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Protected by 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
