import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminErrorAlertProps {
  error: Error | null;
  context?: string;
}

export function AdminErrorAlert({
  error,
  context = "data",
}: AdminErrorAlertProps) {
  const navigate = useNavigate();

  if (!error) return null;

  const isRLSError =
    error.message?.includes("policy") ||
    error.message?.includes("permission") ||
    error.message?.includes("row-level security");

  if (isRLSError) {
    return (
      <Alert className="bg-red-500/10 border-red-500/50">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <AlertTitle className="text-red-400 font-semibold mb-2">
          Admin Access Required
        </AlertTitle>
        <AlertDescription className="text-red-200 space-y-3">
          <p>
            You don't have permission to view {context}. This means your account
            doesn't have the admin role set.
          </p>

          <div className="bg-black/30 rounded-lg p-3 mt-3 space-y-2">
            <p className="font-semibold text-red-300">To fix this issue:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Supabase Dashboard</li>
              <li>Open SQL Editor</li>
              <li>Run this SQL command:</li>
            </ol>
            <div className="bg-black/50 p-2 rounded font-mono text-xs text-green-400 overflow-x-auto">
              UPDATE profiles SET role = 'admin' WHERE email =
              'your-email@example.com';
            </div>
            <p className="text-xs text-red-300">
              Replace 'your-email@example.com' with your actual email
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => navigate("/admin/setup")}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Admin Setup
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              size="sm"
            >
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-500/10 border-red-500/50">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <AlertTitle className="text-red-400">Error Loading {context}</AlertTitle>
      <AlertDescription className="text-red-200">
        <p>{error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
          size="sm"
        >
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
