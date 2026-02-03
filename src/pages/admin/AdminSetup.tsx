import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminSetup() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserEmail(user.email || "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setCurrentUserRole(profile?.role || "user");
    }
  };

  useState(() => {
    checkCurrentUser();
  });

  const handleSetAdmin = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Method 1: Try using the RPC function (requires service role or existing admin)
      const { error: rpcError } = await supabase.rpc("set_user_as_admin", {
        user_email: email,
      });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw rpcError;
      }

      toast({
        title: "Success",
        description: `User ${email} has been set as admin`,
      });
      setEmail("");
      checkCurrentUser();
    } catch (error: any) {
      console.error("Error setting admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set admin role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Setup</h1>
          <p className="text-gray-400">
            Configure admin access for your platform
          </p>
        </div>

        {/* Current User Status */}
        <Card className="bg-[#131824] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Current User Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0A0E1A] rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-semibold">
                  {currentUserEmail || "Not logged in"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <div className="flex items-center gap-2">
                  {currentUserRole === "admin" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <p
                    className={`font-semibold ${currentUserRole === "admin" ? "text-green-500" : "text-yellow-500"}`}
                  >
                    {currentUserRole || "user"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Set Admin Role */}
        <Card className="bg-[#131824] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Set Admin Role</CardTitle>
            <CardDescription>
              Grant admin privileges to a user account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                This action requires admin privileges or must be done via
                Supabase SQL Editor
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  User Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0A0E1A] border-white/10 text-white"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleSetAdmin}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Setting Admin..." : "Set as Admin"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Instructions */}
        <Card className="bg-[#131824] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Manual Setup (Supabase Dashboard)
            </CardTitle>
            <CardDescription>
              If the above method doesn't work, use SQL Editor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <AlertDescription className="text-blue-200 space-y-2">
                <p className="font-semibold">Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run this SQL command:</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="bg-[#0A0E1A] p-4 rounded-lg border border-white/5">
              <code className="text-sm text-green-400 font-mono break-all">
                UPDATE profiles SET role = 'admin' WHERE email =
                'your-email@example.com';
              </code>
            </div>

            <Alert className="bg-purple-500/10 border-purple-500/20">
              <AlertDescription className="text-purple-200 text-sm">
                Replace 'your-email@example.com' with the actual email address
                you want to make admin
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-2">
                After setting the role, you can:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>
                  Login at{" "}
                  <a
                    href="/admin/login"
                    className="text-blue-400 hover:underline"
                  >
                    /admin/login
                  </a>
                </li>
                <li>
                  Access admin dashboard at{" "}
                  <a href="/admin" className="text-blue-400 hover:underline">
                    /admin
                  </a>
                </li>
                <li>View transactions, bets, and withdrawal requests</li>
                <li>Manage users and platform settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
