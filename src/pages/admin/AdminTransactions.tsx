import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useAdminTransactions } from "@/hooks/api/useAdmin";
import { useQueryClient } from "@tanstack/react-query";

const AdminTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transactions = [], isLoading } = useAdminTransactions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: "completed" | "failed") => {
    const { error } = await supabase.from("transactions").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Success", description: `Transaction ${status}` }); queryClient.invalidateQueries({ queryKey: ["admin-transactions"] }); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Transaction Management</h1>
        <p className="text-gray-400">View and manage all transactions</p>
      </div>

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
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white">{tx.profiles?.full_name || tx.profiles?.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`capitalize ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">₹{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        tx.status === "completed" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : tx.status === "pending" 
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20" 
                            onClick={() => handleAction(tx.id, "completed")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
                            onClick={() => handleAction(tx.id, "failed")}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
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

export default AdminTransactions;

