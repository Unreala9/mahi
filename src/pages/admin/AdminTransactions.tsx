import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const AdminTransactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    const { data } = await supabase.from("transactions").select("*, profiles(full_name, email)").order("created_at", { ascending: false });
    if (data) setTransactions(data);
  };

  const handleAction = async (id: string, status: "completed" | "failed") => {
    const { error } = await supabase.from("transactions").update({ status, processed_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Success", description: `Transaction ${status}` }); fetchTransactions(); }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Transaction <span className="text-gradient">Management</span></h1>
      <div className="bg-card rounded-2xl border border-border/50 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 text-foreground">{tx.profiles?.full_name || tx.profiles?.email}</td>
                <td className="px-4 py-3 capitalize text-foreground">{tx.type}</td>
                <td className="px-4 py-3 font-medium text-foreground">₹{tx.amount}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${tx.status === "completed" ? "bg-success/10 text-success" : tx.status === "pending" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>{tx.status}</span></td>
                <td className="px-4 py-3">
                  {tx.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(tx.id, "completed")}><CheckCircle className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(tx.id, "failed")}><XCircle className="w-4 h-4" /></Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;
