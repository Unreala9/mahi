import { Loader2, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAdminBets } from "@/hooks/api/useAdmin";
import { AdminErrorAlert } from "@/components/admin/AdminErrorAlert";

const AdminBets = () => {
  const { data: bets = [], isLoading, error } = useAdminBets();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Won
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            Lost
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">All Bets</h1>
        <p className="text-gray-400">View and manage all betting activity</p>
      </div>

      {error && <AdminErrorAlert error={error} context="bets" />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#131824] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0E1A] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Market
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Selection
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Stake
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bets.map((bet: any) => (
                  <tr
                    key={bet.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {bet.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {bet.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-white">{bet.event}</td>
                    <td className="px-6 py-4 text-gray-300">{bet.market}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{bet.selection}</span>
                        <span className="text-blue-400 font-medium">
                          @ {bet.odds}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">₹{bet.stake}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(bet.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
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
