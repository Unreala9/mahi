import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  Fingerprint,
  Loader2,
  Activity,
  Medal,
  Settings,
  AlertCircle,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  /* const [currentPassword, setCurrentPassword] = useState(""); */ // Unused in this snippet but maybe needed for password change
  /* const [newPassword, setNewPassword] = useState(""); */
  /* const [confirmPassword, setConfirmPassword] = useState(""); */
  /* const [showPasswords, setShowPasswords] = useState(false); */
  const [updating, setUpdating] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem("demo_session") === "true") {
        import("@/services/demoStore").then(({ demoStore }) => {
          const u = demoStore.getUser();
          setUser({ id: u.id, email: u.email } as any);
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
      if (data.avatar_url) downloadImage(data.avatar_url);
    }
  };

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log("Error downloading image: ", error);
    }
  };

  const updateProfile = (updates: any) => {
    setProfile((prev: any) => ({ ...prev, ...updates }));
    if (updates.full_name !== undefined) setFullName(updates.full_name);
    if (updates.phone !== undefined) setPhone(updates.phone);
  };

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const updates = {
        id: user!.id,
        avatar_url: filePath,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      downloadImage(filePath);
      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Update failed",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Identity updated" });
      fetchProfile(user.id);
    }
    setUpdating(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Mismatch detected",
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
      toast({ title: "Success", description: "Credentials updated" });
      setCurrentPassword("");
      setNewPassword("");
    }
    setUpdating(false);
  };

  const handleSignOut = async () => {
    localStorage.removeItem("demo_session");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono uppercase tracking-widest text-sm">
          Initializing Identity Protocol...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 pb-20 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-[#0a1120] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-none bg-[#050b14] border-2 border-primary/20 flex items-center justify-center p-1 relative overflow-hidden group-hover:border-primary/50 transition-colors">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 p-2 bg-primary text-black cursor-pointer hover:bg-white transition-colors border-2 border-[#0a1120]"
            >
              <Upload className="w-3 h-3" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
              />
            </label>
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest font-display mb-2">
              {profile?.username || "Anonymous User"}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-gray-500">
              <span className="bg-[#050b14] px-3 py-1 border border-white/10 text-primary">
                ID: {user?.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> VERIFIED_ACCOUNT
              </span>
              <span className="flex items-center gap-1">
                <Medal className="w-3 h-3 text-yellow-500" /> VIP_TIER_1
              </span>
            </div>
          </div>

          <div className="bg-[#050b14] p-4 border border-white/10 min-w-[200px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Account Status
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-bold tracking-wider">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-[#0a1120] border border-white/5 sticky top-24">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Control Panel
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: User,
                  desc: "Personal Details",
                },
                {
                  id: "security",
                  label: "Security",
                  icon: Shield,
                  desc: "2FA & Password",
                },
                {
                  id: "preferences",
                  label: "Preferences",
                  icon: Settings,
                  desc: "App Settings",
                },
                {
                  id: "verification",
                  label: "KYC",
                  icon: AlertCircle,
                  desc: "Identity Check",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 transition-all border border-transparent group",
                    activeTab === item.id
                      ? "bg-primary text-black border-primary"
                      : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      activeTab === item.id ? "text-black" : "text-gray-500",
                    )}
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-wider leading-none mb-1">
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "text-[9px] font-mono leading-none",
                        activeTab === item.id
                          ? "text-black/70"
                          : "text-gray-600",
                      )}
                    >
                      {item.desc}
                    </div>
                  </div>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-[#0a1120] border border-white/5 p-6 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Personal
                  Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">
                      Full Name
                    </label>
                    <div className="relative group">
                      <Input
                        value={profile?.full_name || ""}
                        onChange={(e) =>
                          updateProfile({ full_name: e.target.value })
                        }
                        className="bg-[#050b14] border-white/10 focus:border-blue-500/50 text-white font-mono h-11"
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">
                      Username
                    </label>
                    <div className="relative group">
                      <Input
                        value={profile?.username || ""}
                        onChange={(e) =>
                          updateProfile({ username: e.target.value })
                        }
                        className="bg-[#050b14] border-white/10 focus:border-blue-500/50 text-white font-mono h-11"
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Input
                        type="tel"
                        value={profile?.phone || ""}
                        onChange={(e) =>
                          updateProfile({ phone: e.target.value })
                        }
                        className="bg-[#050b14] border-white/10 focus:border-blue-500/50 text-white font-mono h-11"
                        placeholder="+91..."
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-blue-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">
                      Date of Birth
                    </label>
                    <div className="relative group">
                      <Input
                        type="date"
                        className="bg-[#050b14] border-white/10 focus:border-blue-500/50 text-white font-mono h-11"
                        placeholder="DD/MM/YYYY"
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-none uppercase tracking-widest text-xs font-bold px-8 h-10"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-[#0a1120] border border-white/5 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" /> Account
                  Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Bets",
                      value: "1,234",
                      color: "text-white",
                    },
                    {
                      label: "Win Rate",
                      value: "64.2%",
                      color: "text-green-500",
                    },
                    {
                      label: "Turnover",
                      value: "₹45.2K",
                      color: "text-blue-500",
                    },
                    {
                      label: "Member Since",
                      value: "2023",
                      color: "text-gray-400",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-[#050b14] p-4 border border-white/5"
                    >
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                        {stat.label}
                      </div>
                      <div
                        className={`text-xl font-mono font-bold ${stat.color}`}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-[#0a1120] border border-white/5 p-6 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-500" /> Security Settings
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#050b14] border border-white/5">
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                        Password
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Last changed 30 days ago
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-xs uppercase"
                    >
                      Update
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#050b14] border border-white/5">
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Add an extra layer of security
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-red-500 font-bold uppercase">
                        Disabled
                      </span>
                      <Button
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 text-xs uppercase"
                      >
                        Enable
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ status }: { status: string }) => {
  if (status === "approved")
    return (
      <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 uppercase border border-green-500/20">
        Verified
      </span>
    );
  if (status === "pending")
    return (
      <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 uppercase border border-yellow-500/20">
        In Review
      </span>
    );
  return (
    <span className="bg-gray-500/10 text-gray-500 text-[10px] font-bold px-2 py-1 uppercase border border-white/10">
      Unverified
    </span>
  );
};

export default Profile;
