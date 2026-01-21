import { Loader2 } from "lucide-react";
import { useApiLogs } from "@/hooks/api/useAdmin";

const AdminAuditLogs = () => {
  const { data: logs = [], isLoading } = useApiLogs();

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen bg-background text-foreground">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        API <span className="text-gradient">Audit Logs</span>
      </h1>

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Endpoint
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Latency
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Request
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-muted px-1 py-0.5 rounded text-xs">
                        {log.endpoint}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          log.status >= 400
                            ? "bg-destructive/20 text-destructive"
                            : "bg-success/20 text-success"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{log.latency_ms}ms</td>
                    <td
                      className="px-6 py-4 max-w-xs truncate text-xs font-mono text-muted-foreground"
                      title={JSON.stringify(log.request_data)}
                    >
                      {JSON.stringify(log.request_data)}
                    </td>
                    <td
                      className="px-6 py-4 max-w-xs truncate text-xs font-mono text-muted-foreground"
                      title={JSON.stringify(log.response_data)}
                    >
                      {JSON.stringify(log.response_data)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
