import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Gamepad2,
  History,
  FileText,
  LogOut,
  Shield,
  DollarSign,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        navigate("/sports");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Bets", path: "/admin/bets", icon: Gamepad2 },
    { name: "Requests", path: "/admin/withdrawals", icon: Wallet },
    { name: "Transactions history", path: "/admin/transactions", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-pulse text-blue-500 font-display text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e293b] border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-white">Betting</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  location.pathname === item.path
                    ? "bg-blue-500/15 text-blue-400 font-medium shadow-lg shadow-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${
                  location.pathname === item.path ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="text-sm">{item.name}</span>
                {location.pathname === item.path && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link to="/sports" className="block">
            <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:bg-white/5 hover:border-blue-500/30 transition-all">
              Back to Player View
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen p-6 lg:p-8 bg-[#0f172a]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
