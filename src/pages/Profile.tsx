import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Lock,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Eye,
  EyeOff,
  User,
  Terminal,
  FileText,
  HelpCircle,
  Phone,
  LogOut,
  ChevronRight,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Demo Mode
      if (localStorage.getItem("demo_session") === "true") {
        import("@/services/demoStore").then(({ demoStore }) => {
          const u = demoStore.getUser();
          const demoUser = { id: u.id, email: u.email } as any;
          setUser(demoUser);
          setProfile(u);
          setFullName(u.full_name);
          setPhone(u.phone);
        });
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Profile updated successfully" });
      fetchProfile(user.id);
    }
    setUpdating(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setUpdating(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Verified
            </span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pending Review
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Rejected
            </span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/10 text-muted-foreground border border-border">
            <Shield className="w-3 h-3" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Not Submitted
            </span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-black uppercase tracking-widest text-xl">
          Loading User Data...
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 animate-fade-in px-3 md:px-0">
        <div className="mb-0 border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-xl md:text-2xl text-foreground uppercase tracking-tight flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary text-black flex items-center justify-center">
                <Terminal className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              Identity <span className="text-primary">Control</span>
            </h1>
            <p className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider font-bold mt-1 pl-8 md:pl-10">
              User Configuration & Security
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground hidden md:block">
            ID: {user?.id}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Profile Info */}
          <div className="bg-card border border-border overflow-hidden relative group">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-black font-display text-sm text-foreground flex items-center gap-3 uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-input/20 border-border text-muted-foreground h-10 rounded-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ENTER YOUR FULL NAME"
                  className="bg-input/20 border-border text-foreground h-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-none uppercase placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ENTER YOUR PHONE NUMBER"
                  className="bg-input/20 border-border text-foreground h-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-none font-mono placeholder:text-muted-foreground/50"
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full h-10 bg-primary text-black hover:bg-white font-bold text-sm uppercase tracking-widest rounded-none transition-all"
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </div>

          {/* KYC Status */}
          <div className="bg-card border border-border overflow-hidden relative group">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-black font-display text-sm text-foreground flex items-center gap-3 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-primary" />
                KYC Verification
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border border-dashed">
                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  Current Status
                </span>
                {getKYCStatusBadge(profile?.kyc_status)}
              </div>

              {profile?.kyc_status === "not_submitted" && (
                <div className="bg-card/5 border border-border p-4 mb-0">
                  <p className="text-muted-foreground/80 leading-relaxed mb-6 text-xs text-center font-mono">
                    Complete your KYC verification to unlock higher withdrawal
                    limits and faster processing times.
                  </p>
                  <Button className="w-full h-10 bg-muted hover:bg-primary hover:text-black text-foreground border border-border font-bold text-sm uppercase tracking-widest rounded-none transition-all">
                    <Upload className="w-3 h-3 mr-2" />
                    Start Verification
                  </Button>
                </div>
              )}

              {profile?.kyc_status === "pending" && (
                <div className="bg-primary/5 border border-primary/20 p-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide text-center">
                    Your documents are being reviewed. This usually takes 24-48
                    hours.
                  </p>
                </div>
              )}

              {profile?.kyc_status === "approved" && (
                <div className="bg-green-500/5 border border-green-500/20 p-4">
                  <p className="text-xs font-bold text-green-500 uppercase tracking-wide text-center">
                    Your identity has been verified. You have access to all
                    features.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border overflow-hidden lg:col-span-2 relative group">
            <div className="p-4 border-b border-border bg-card/50">
              <h3 className="font-black font-display text-sm text-foreground flex items-center gap-3 uppercase tracking-wider">
                <Lock className="w-4 h-4 text-primary" />
                Security Settings
              </h3>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="relative space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-input/20 border-border text-foreground h-10 rounded-none focus:border-primary font-mono placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="relative space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-input/20 border-border text-foreground h-10 rounded-none focus:border-primary font-mono placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="relative space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-input/20 border-border text-foreground h-10 rounded-none focus:border-primary font-mono placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {showPasswords ? "Hide" : "Show"} passwords
                </button>
                <Button
                  onClick={handleChangePassword}
                  disabled={updating}
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-muted font-bold text-sm uppercase tracking-widest rounded-none px-6 h-10 transition-all border border-transparent hover:border-foreground/50"
                >
                  {updating ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-card border border-border rounded-none overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Account Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-3">
              <button
                onClick={() => navigate("/terms")}
                className="flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border border-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">
                    Terms & Conditions
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border border-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Privacy Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={() => navigate("/responsible-gaming")}
                className="flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border border-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">
                    Responsible Gaming
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border border-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">Contact Us</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    Sign Out
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
