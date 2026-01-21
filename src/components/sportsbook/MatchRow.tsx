import { Fixture } from "@/types/sportbex";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchRowProps {
  fixture: Fixture;
  onAddToSlip: (selection: any) => void;
}

export const MatchRow = ({ fixture, onAddToSlip }: MatchRowProps) => {
  const matchWinnerMarket = fixture.markets.find(
    (m) => m.name === "Match Winner" || m.name === "Moneyline",
  );

  const isLive = fixture.status === "live";

  return (
    <div className="bg-card border-l-4 border-l-primary border border-border p-2 hover:bg-muted/50 transition-all">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Match Details */}
        <div className="flex-1 w-full pl-2">
          <div className="flex items-center gap-2 mb-1">
            {isLive ? (
              <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 animate-pulse">
                Live
              </span>
            ) : (
              <span className="text-primary text-xs font-bold font-mono">
                {new Date(fixture.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
              | {fixture.league?.name || "Match"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center pr-4">
              <span className="font-black text-foreground text-sm uppercase tracking-tight">
                {fixture.participants.home.name}
              </span>
            </div>
            <div className="flex justify-between items-center pr-4">
              <span className="font-black text-foreground text-sm uppercase tracking-tight">
                {fixture.participants.away.name}
              </span>
            </div>
          </div>
        </div>

        {/* Odds Grid (MahiExchange Style) */}
        <div className="flex gap-1 w-full md:w-auto mt-2 md:mt-0">
          {matchWinnerMarket ? (
            matchWinnerMarket.outcomes.map((outcome, idx) => (
              <div key={outcome.id} className="flex gap-1">
                {/* Back Button (Blue) */}
                <Button
                  className="flex flex-col items-center justify-center w-14 h-9 bg-[#0077b6] hover:bg-[#0096c7] text-white rounded-none p-0 border border-transparent hover:border-white transition-all"
                  onClick={() =>
                    onAddToSlip({
                      fixtureId: fixture.id,
                      fixtureName: `${fixture.participants.home.name} vs ${fixture.participants.away.name}`,
                      marketId: matchWinnerMarket.id,
                      marketName: "Match Winner",
                      outcomeId: outcome.id,
                      outcomeName: outcome.name,
                      price: outcome.price,
                      type: "back",
                    })
                  }
                >
                  <span className="font-bold text-sm leading-none">
                    {outcome.price.toFixed(2)}
                  </span>
                  <span className="text-[7px] uppercase tracking-wider opacity-90 leading-none mt-0.5">
                    Back
                  </span>
                </Button>

                {/* Lay Button (Pink) - Simulated */}
                <Button
                  className="flex flex-col items-center justify-center w-14 h-9 bg-[#ff4d6d] hover:bg-[#ff758f] text-white rounded-none p-0 border border-transparent hover:border-white transition-all"
                  onClick={() =>
                    onAddToSlip({
                      fixtureId: fixture.id,
                      fixtureName: `${fixture.participants.home.name} vs ${fixture.participants.away.name}`,
                      marketId: matchWinnerMarket.id,
                      marketName: "Match Winner",
                      outcomeId: outcome.id,
                      outcomeName: outcome.name,
                      price: outcome.price + 0.02, // Mock Lay price
                      type: "lay",
                    })
                  }
                >
                  <span className="font-bold text-sm leading-none">
                    {(outcome.price + 0.02).toFixed(2)}
                  </span>
                  <span className="text-[7px] uppercase tracking-wider opacity-90 leading-none mt-0.5">
                    Lay
                  </span>
                </Button>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground italic uppercase font-bold px-2">
              Odds Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
