import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { useAdminTransactions } from "@/hooks/api/useAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { AdminErrorAlert } from "@/components/admin/AdminErrorAlert";

const AdminTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transactions = [], isLoading, error } = useAdminTransactions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (tx: any) => {
    try {
      setProcessingId(tx.id);
      if (tx.type === "deposit") {
        const { data, error } = await supabase.rpc("approve_deposit", {
          p_transaction_id: tx.id,
        });
        if (error) throw error;
        if (!data.success) throw new Error(data.message);
      } else if (tx.type === "withdraw") {
        // Existing withdrawal logic or new RPC if needed, but keeping simple update for now if no RPC exists for withdraw
        // actually we have approve_withdrawal RPC from previous schema inspection!
        const { data, error } = await supabase.rpc("approve_withdrawal", {
          p_transaction_id: tx.id,
        });
        if (error) throw error;
        if (!data.success) throw new Error(data.message);
      } else {
        // Fallback for other types
        const { error } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", tx.id);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Transaction Approved" });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: any) => {
    try {
      setProcessingId(tx.id);
      if (tx.type === "deposit") {
        const { data, error } = await supabase.rpc("reject_deposit", {
          p_transaction_id: tx.id,
          p_reason: "Admin Rejected",
        });
        if (error) throw error;
        if (!data.success) throw new Error(data.message);
      } else if (tx.type === "withdraw") {
        const { data, error } = await supabase.rpc("reject_withdrawal", {
          p_transaction_id: tx.id,
        });
        if (error) throw error;
        if (!data.success) throw new Error(data.message);
      } else {
        const { error } = await supabase
          .from("transactions")
          .update({ status: "failed", processed_at: new Date().toISOString() })
          .eq("id", tx.id);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Transaction Rejected" });
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getPublicUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("deposit_proofs").getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Transaction Management
        </h1>
        <p className="text-gray-400">View and manage all transactions</p>
      </div>

      {error && <AdminErrorAlert error={error} context="transactions" />}

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
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Proof / Ref ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {tx.profiles?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {tx.profiles?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "deposit" ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`capitalize ${tx.type === "deposit" ? "text-green-400" : "text-red-400"}`}
                        >
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ₹{tx.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex flex-col gap-1">
                        {tx.provider_ref_id && (
                          <span className="font-mono text-xs text-yellow-500">
                            Ref: {tx.provider_ref_id}
                          </span>
                        )}
                        {tx.screenshot_url && (
                          <a
                            href={getPublicUrl(tx.screenshot_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-xs"
                          >
                            View Screenshot
                          </a>
                        )}
                        {!tx.provider_ref_id && !tx.screenshot_url && (
                          <span className="text-xs text-gray-600">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : tx.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
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
                            onClick={() => handleApprove(tx)}
                            disabled={processingId === tx.id}
                          >
                            {processingId === tx.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            onClick={() => handleReject(tx)}
                            disabled={processingId === tx.id}
                          >
                            {processingId === tx.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
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
