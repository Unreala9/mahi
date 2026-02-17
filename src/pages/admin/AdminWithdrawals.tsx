import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Bell } from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  payment_details: string;
  admin_notes: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();

    // Real-time subscription for withdrawal requests
    const subscription = supabase
      .channel("withdrawal_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "withdrawal_requests",
        },
        () => {
          fetchWithdrawals();
          // Play notification sound for new requests
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchWithdrawals = async () => {
    try {
      // Fetch from withdrawal_requests table
      const { data: requests, error: reqError } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (reqError) throw reqError;

      // Fetch user profiles for each request
      const userIds = [...new Set(requests?.map((t) => t.user_id) || [])];
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Merge data
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      const enrichedData =
        requests?.map((req) => ({
          ...req,
          profiles: profileMap.get(req.user_id),
        })) || [];

      setWithdrawals(enrichedData);
    } catch (error: any) {
      console.error("Error fetching withdrawals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawal: Transaction) => {
    setSelectedWithdrawal(withdrawal);
    setDialogOpen(true);
  };

  const confirmApproval = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      // Call updated RPC function to approve
      const { data, error } = await supabase.rpc("approve_withdrawal", {
        p_transaction_id: selectedWithdrawal.id,
      });

      if (error) throw error;
      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.message || "Operation failed");

      // Update admin notes if any
      if (adminNotes) {
        await supabase
          .from("withdrawal_requests")
          .update({ admin_notes: adminNotes })
          .eq("id", selectedWithdrawal.id);
      }

      toast({
        title: "Success",
        description: "Withdrawal approved and marked as completed",
      });

      setDialogOpen(false);
      setAdminNotes("");
      fetchWithdrawals();
    } catch (error: any) {
      console.error("Error approving withdrawal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (
      !confirm(
        "Are you sure you want to reject this withdrawal? The amount will be refunded to user.",
      )
    )
      return;

    try {
      // Call updated RPC function to reject
      const { data, error } = await supabase.rpc("reject_withdrawal", {
        p_transaction_id: requestId,
      });

      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.message || "Operation failed");

      toast({
        title: "Success",
        description: "Withdrawal rejected and amount refunded to user",
      });

      fetchWithdrawals();
    } catch (error: any) {
      console.error("Error rejecting withdrawal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-500 bg-green-500/10"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-500 bg-red-500/10"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
          <p className="text-gray-400 mt-1">Manage user withdrawal requests</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-blue-500 text-white border-0 px-4 py-2">
            <Bell className="w-4 h-4 mr-2" />
            {pendingCount} Pending
          </Badge>
        )}
      </div>
      <Card className="bg-[#131824] border-white/5">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white">Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">UPI ID</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow className="border-white/5 hover:bg-white/5">
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-400"
                    >
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <TableRow
                      key={withdrawal.id}
                      className="border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {withdrawal.profiles?.full_name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {withdrawal.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-white">
                          ₹{withdrawal.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs text-gray-300">
                          {withdrawal.payment_details || "No UPI ID provided"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(withdrawal.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(withdrawal)}
                              disabled={processing}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(withdrawal.id)}
                              disabled={processing}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {withdrawal.admin_notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Note: {withdrawal.admin_notes}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#131824] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Approve UPI Withdrawal
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Confirm that you have sent money to the user's UPI ID
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg space-y-2">
                <div className="text-gray-300">
                  <strong className="text-white">Amount:</strong> ₹
                  {selectedWithdrawal.amount.toFixed(2)}
                </div>
                <div className="text-gray-300">
                  <strong className="text-white">User:</strong>{" "}
                  {selectedWithdrawal.profiles?.full_name}
                </div>
                <div className="text-gray-300">
                  <strong className="text-white">UPI ID:</strong>{" "}
                  {selectedWithdrawal.payment_details}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Admin Notes (Optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this transfer..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={processing}
              className="border-white/10 text-gray-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={processing}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {processing ? "Processing..." : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
