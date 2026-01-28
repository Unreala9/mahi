import { useMyBets } from "@/hooks/api/useBets";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";
import {
  Loader2,
  Trophy,
  XCircle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Bets = () => {
  const { data: bets = [], isLoading, error, refetch } = useMyBets();

  const stats = {
    total: bets.length,
    won: bets.filter((b: any) => b.status === "won" || b.status === "win")
      .length,
    lost: bets.filter((b: any) => b.status === "lost" || b.status === "loss")
      .length,
    wagered: bets.reduce(
      (acc: number, b: any) => acc + (Number(b.stake) || 0),
      0,
    ),
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            My <span className="text-primary">Bets</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your betting history and performance.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard label="Total Bets" value={stats.total} />
            <StatCard label="Won" value={stats.won} color="text-green-500" />
            <StatCard
              label="Lost"
              value={stats.lost}
              color="text-destructive"
            />
            <StatCard
              label="Wagered"
              value={`₹${stats.wagered.toLocaleString()}`}
            />
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-card/50 flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-foreground">
              Betting History
            </h3>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Refresh Bets"
            >
              <History className="w-5 h-5 text-primary" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              <XCircle className="w-12 h-12 mx-auto mb-3 opacity-80" />
              <p className="font-medium text-lg">Failed to load bets</p>
              <p className="text-sm opacity-80 mb-4">
                {(error as Error).message}
              </p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : bets.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-lg">No bets placed yet.</p>
              <Link
                to="/sports"
                className="text-primary hover:underline mt-4 inline-block font-bold"
              >
                Go to Sportsbook
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bets.map((bet: any) => (
                <div
                  key={bet.id}
                  className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border border-border",
                        bet.status === "won" || bet.status === "win"
                          ? "bg-green-500/10 text-green-500"
                          : bet.status === "lost" || bet.status === "loss"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                      )}
                    >
                      {bet.status === "won" || bet.status === "win" ? (
                        <ArrowUpRight strokeWidth={2.5} />
                      ) : bet.status === "lost" || bet.status === "loss" ? (
                        <ArrowDownRight strokeWidth={2.5} />
                      ) : (
                        <History />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-lg">
                        {bet.event_name || bet.event || "Unknown Event"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        <span className="text-primary font-medium">
                          {bet.market_name || bet.market} -{" "}
                          {bet.selection_name || bet.selection}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(bet.created_at), "PPP p")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
                    <div className="text-right">
                      <p className="font-display font-bold text-foreground text-xl">
                        ₹{bet.stake}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        @{bet.odds}
                      </p>
                    </div>
                    <StatusBadge status={bet.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ label, value, color = "text-foreground" }: any) => (
  <div className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden group">
    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 relative z-10">
      {label}
    </p>
    <p className={cn("text-2xl font-bold font-display relative z-10", color)}>
      {value}
    </p>
    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    won: "bg-green-500/10 text-green-500 border-green-500/20",
    win: "bg-green-500/10 text-green-500 border-green-500/20",
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    loss: "bg-destructive/10 text-destructive border-destructive/20",
    pending: "bg-primary/10 text-primary border-primary/20",
  };

  const normalizedStatus = status?.toLowerCase() || "pending";

  return (
    <span
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-bold uppercase border",
        styles[normalizedStatus] ||
          "bg-muted/10 text-muted-foreground border-border",
      )}
    >
      {normalizedStatus}
    </span>
  );
};

export default Bets;
