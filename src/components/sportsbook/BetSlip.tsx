import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { usePlaceBet } from "@/hooks/api/useBets";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type BetSelection = {
  // Old format (SportBex)
  fixtureId?: string;
  fixtureName?: string;
  marketId?: string;
  marketName?: string;
  outcomeId?: string;
  outcomeName?: string;
  price?: number;
  
  // New format (Diamond API)
  id?: string;
  matchId?: number;
  matchName?: string;
  outcomeType?: string;
  back?: number | null;
  lay?: number | null;
  isLive?: boolean;
};

interface BetSlipProps {
  selections: BetSelection[];
  onRemove: (id: string) => void;
  onClear: () => void;
  className?: string; // Allow overriding styles (e.g. for mobile sheet)
}

export const BetSlip = ({
  selections,
  onRemove,
  onClear,
  className,
}: BetSlipProps) => {
  const [stake, setStake] = useState<string>("100");
  const [isPlaced, setIsPlaced] = useState(false);

  // Reset placed state when selections change
  useEffect(() => {
    if (selections.length > 0) setIsPlaced(false);
  }, [selections]);

  const { mutate: placeBet, isPending } = usePlaceBet();

  // Calculate odds and returns based on format
  const getSelectionPrice = (sel: BetSelection): number => {
    // New format (Diamond API)
    if (sel.back !== undefined && sel.back !== null) return sel.back;
    if (sel.lay !== undefined && sel.lay !== null) return sel.lay;
    // Old format (SportBex)
    if (sel.price !== undefined) return sel.price;
    return 1;
  };

  const totalOdds = selections.reduce((acc, sel) => acc * getSelectionPrice(sel), 1);
  const potentialReturn = parseFloat(stake || "0") * totalOdds;

  const handlePlaceBet = async () => {
    if (!stake || isNaN(parseFloat(stake))) {
      toast.error("Please enter a valid stake");
      return;
    }

    // Demo Mode Check
    if (localStorage.getItem("demo_session") === "true") {
      const { demoStore } = await import("@/services/demoStore");
      try {
        // Calculate stake per bet
        const stakePerBet = parseFloat(stake) / selections.length;

        selections.forEach((sel) => {
          const fixtureName = sel.matchName || sel.fixtureName || "Unknown Match";
          const marketName = sel.outcomeType || sel.marketName || "Market";
          const outcomeName = sel.outcomeName || "Selection";
          const odds = getSelectionPrice(sel);

          demoStore.placeBet({
            fixtureName,
            marketName,
            outcomeName,
            odds,
            stake: stakePerBet,
            potentialReturn: stakePerBet * odds,
          });
        });

        setIsPlaced(true);
        setTimeout(() => {
          onClear();
          toast.success("Demo Bets placed successfully!");
        }, 800);
      } catch (e: any) {
        toast.error(e.message || "Failed to place demo bet");
      }
      return;
    }

    // Real Betting Logic
    selections.forEach((sel) => {
      placeBet({
        sportId: "unknown",
        eventId: sel.matchId?.toString() || sel.fixtureId || "0",
        marketId: sel.marketId || "0",
        selectionId: sel.outcomeId || sel.id || "0",
        odds: getSelectionPrice(sel),
        stake: parseFloat(stake) / selections.length,
      });
    });

    setTimeout(() => {
      onClear();
      toast.success("Bets placed successfully!");
    }, 500);
  };

  if (selections.length === 0 && !isPending) {
    return (
      <div
        className={cn(
          "w-80 bg-card border border-border hidden xl:flex flex-col h-[calc(100vh-100px)] fixed right-4 top-20",
          className,
        )}
      >
        <div className="p-4 bg-card/50 border-b border-border">
          <h2 className="font-black text-foreground uppercase tracking-wider text-sm flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" /> Bet Slip
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
          <div className="text-center">
            <p className="text-xs uppercase font-bold tracking-widest">
              Your slip is empty
            </p>
            <p className="text-[10px] mt-2">Click odds to add selections</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-80 bg-card border border-border hidden xl:flex flex-col h-[calc(100vh-100px)] fixed right-4 top-20 shadow-2xl z-20",
        className,
      )}
    >
      <div className="p-3 border-b border-border bg-card/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center">
            {selections.length}
          </span>
          <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
            Bet Slip
          </h2>
        </div>
        <button
          onClick={onClear}
          className="text-[10px] text-destructive hover:text-foreground uppercase font-bold flex items-center gap-1 hover:bg-destructive/10 px-2 py-0.5 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {selections.map((item) => {
            const itemId = item.id || item.outcomeId || String(item.matchId);
            const displayName = item.outcomeName || "Selection";
            const matchName = item.matchName || item.fixtureName || "Match";
            const marketName = item.outcomeType || item.marketName || "Market";
            const odds = getSelectionPrice(item);
            const isLiveTag = item.isLive ? "🔴 LIVE" : "";

            return (
              <div
                key={itemId}
                className="bg-card rounded-lg p-3 border border-border relative group"
              >
                <button
                  onClick={() => onRemove(itemId)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="pr-4">
                  <p className="text-sm font-semibold text-foreground">
                    {displayName} {isLiveTag}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {matchName}
                  </p>
                  <p className="text-xs text-primary mt-1">{marketName}</p>
                  {item.back !== undefined && item.back !== null && (
                    <span className="text-xs text-blue-400">Back</span>
                  )}
                  {item.lay !== undefined && item.lay !== null && (
                    <span className="text-xs text-pink-400">Lay</span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-success text-success-foreground px-1.5 py-0.5 rounded text-xs font-bold font-mono">
                    {odds.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border bg-card">
        <div className="space-y-3">
          {selections.length > 1 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground uppercase font-bold">
                Total Odds
              </span>
              <span className="text-primary font-black font-mono">
                {totalOdds.toFixed(2)}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Stake Amount (₹)
            </label>
            <Input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="bg-muted border-border font-mono text-right font-bold h-8 rounded-none focus:ring-0 focus:border-primary text-foreground"
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-border/50">
            <span className="text-muted-foreground uppercase font-bold">
              Potential Return
            </span>
            <span className="text-green-500 font-black font-mono text-sm">
              ₹{potentialReturn.toFixed(2)}
            </span>
          </div>

          <Button
            className="w-full h-10 text-sm font-black uppercase tracking-widest rounded-none bg-primary text-black hover:bg-white hover:text-black transition-all"
            onClick={handlePlaceBet}
          >
            {isPlaced ? "Placed! 🚀" : "Place Bet"}
          </Button>
        </div>
      </div>
    </div>
  );
};
