import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminGames = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<any[]>([]);
  useEffect(() => { fetchGames(); }, []);
  const fetchGames = async () => { const { data } = await supabase.from("games").select("*").order("name"); if (data) setGames(data); };
  
  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    await supabase.from("games").update({ status: newStatus }).eq("id", id);
    toast({ title: "Success", description: `Game ${newStatus}` });
    fetchGames();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Game <span className="text-gradient">Management</span></h1>
      <div className="bg-card rounded-2xl border border-border/50 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left text-sm text-muted-foreground">Game</th><th className="px-4 py-3 text-left text-sm text-muted-foreground">Provider</th><th className="px-4 py-3 text-left text-sm text-muted-foreground">Category</th><th className="px-4 py-3 text-left text-sm text-muted-foreground">Status</th><th className="px-4 py-3 text-left text-sm text-muted-foreground">Actions</th></tr></thead>
          <tbody className="divide-y divide-border/50">
            {games.map((game) => (<tr key={game.id} className="hover:bg-muted/20"><td className="px-4 py-3 text-foreground font-medium">{game.name}</td><td className="px-4 py-3 text-muted-foreground">{game.provider_name}</td><td className="px-4 py-3 text-muted-foreground">{game.category}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${game.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{game.status}</span></td><td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => toggleStatus(game.id, game.status)}>{game.status === "active" ? "Disable" : "Enable"}</Button></td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGames;
