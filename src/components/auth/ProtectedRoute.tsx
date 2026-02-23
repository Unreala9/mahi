import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      if (requireAdmin) {
        console.log(
          "🔒 [ProtectedRoute] Admin access required, checking role...",
        );
        console.log("🔒 [ProtectedRoute] User ID:", session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        console.log("🔒 [ProtectedRoute] Profile data:", profile);
        console.log("🔒 [ProtectedRoute] Profile error:", profileError);
        console.log("🔒 [ProtectedRoute] Role found:", profile?.role);

        if (profile?.role !== "admin") {
          console.error(
            "❌ [ProtectedRoute] ACCESS DENIED - User is not admin!",
          );
          console.error(
            "❌ [ProtectedRoute] Expected: 'admin', Got:",
            profile?.role,
          );
          setAuthorized(false);
          setLoading(false);
          return;
        }

        console.log("✅ [ProtectedRoute] Admin access GRANTED!");
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
