import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useAdminTransactions } from "@/hooks/api/useAdmin";
import { useQueryClient } from "@tanstack/react-query";

const AdminTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: transactions = [], isLoading } = useAdminTransactions();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApproveWithdrawal = async (id: string) => {
    try {
      setProcessingId(id);
      const { data, error } = await supabase.rpc("approve_withdrawal", {
        p_transaction_id: id,
      });

      if (error) throw error;

      toast({
        title: "✅ Withdrawal Approved",
        description: "User withdrawal has been processed successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      setProcessingId(id);
      const { data, error } = await supabase.rpc("reject_withdrawal", {
        p_transaction_id: id,
      });

      if (error) throw error;

      toast({
        title: "❌ Withdrawal Rejected",
        description: "Withdrawal rejected and amount refunded to user wallet",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reject withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Transaction <span className="text-gradient">Management</span>
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground">
                      <div>
                        <div className="font-medium">
                          {tx.profiles?.full_name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.profiles?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-foreground">
                        {tx.type}
                      </span>
                      {tx.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      ₹{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : tx.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                      {tx.reference || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === "pending" && tx.type === "withdraw" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveWithdrawal(tx.id)}
                            disabled={processingId === tx.id}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            {processingId === tx.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectWithdrawal(tx.id)}
                            disabled={processingId === tx.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {processingId === tx.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      ) : tx.status === "pending" ? (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Processing</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No action needed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
