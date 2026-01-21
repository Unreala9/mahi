import { Loader2 } from "lucide-react";
import { useAdminBets } from "@/hooks/api/useAdmin";

const AdminBets = () => {
  const { data: bets = [], isLoading } = useAdminBets();

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen bg-background text-foreground">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        All <span className="text-gradient">Bets</span>
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
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Market
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Selection
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Stake
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bets.map((bet: any) => (
                  <tr key={bet.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 text-xs font-mono">
                      {bet.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {bet.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">{bet.event}</td>
                    <td className="px-6 py-4">{bet.market}</td>
                    <td className="px-6 py-4">
                      {bet.selection} @ {bet.odds}
                    </td>
                    <td className="px-6 py-4 font-bold">₹{bet.stake}</td>
                    <td className="px-6 py-4 capitalize">{bet.status}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(bet.created_at).toLocaleString()}
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

export default AdminBets;
