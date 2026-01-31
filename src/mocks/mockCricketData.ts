import type { MatchEvent, MatchDetails, OddsData } from "@/services/diamondApi";
import type { MatchOddsData } from "@/types/sports-betting";

// Mock Cricket Matches
export const MOCK_CRICKET_MATCHES: MatchEvent[] = [
    {
        gmid: 99001,
        sid: 4,
        sname: "Cricket",
        name: "India vs Australia",
        is_live: true,
        start_date: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
        cname: "Test Series",
        srno: 1,
    },
    {
        gmid: 99002,
        sid: 4,
        sname: "Cricket",
        name: "England vs Pakistan",
        is_live: true,
        start_date: new Date(Date.now() - 7200000).toISOString(), // Started 2 hours ago
        cname: "ODI Series",
        srno: 2,
    },
    {
        gmid: 99003,
        sid: 4,
        sname: "Cricket",
        name: "South Africa vs New Zealand",
        is_live: false,
        start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        cname: "T20 Series",
        srno: 3,
    },
];

// Mock Match Details
export const MOCK_MATCH_DETAILS: Record<number, MatchDetails> = {
    99001: {
        gmid: 99001,
        sid: 4,
        name: "India vs Australia",
        is_live: true,
        start_date: new Date(Date.now() - 3600000).toISOString(),
        gtv: 123456,
        teams: {
            home: "India",
            away: "Australia",
        },
    },
    99002: {
        gmid: 99002,
        sid: 4,
        name: "England vs Pakistan",
        is_live: true,
        start_date: new Date(Date.now() - 7200000).toISOString(),
        gtv: 123457,
        teams: {
            home: "England",
            away: "Pakistan",
        },
    },
    99003: {
        gmid: 99003,
        sid: 4,
        name: "South Africa vs New Zealand",
        is_live: false,
        start_date: new Date(Date.now() + 86400000).toISOString(),
        gtv: 123458,
        teams: {
            home: "South Africa",
            away: "New Zealand",
        },
    },
};

// Base mock odds that will be randomized
const createMockMatchOdds = (homeTeam: string, awayTeam: string) => {
    const randomVariation = () => (Math.random() - 0.5) * 0.1; // ±0.05 variation

    return {
        match_odds: [
            {
                runner_name: homeTeam,
                runner_id: 1,
                nat: homeTeam,
                odds: [],
                back: { price: Number((1.85 + randomVariation()).toFixed(2)), size: 50000 },
                lay: { price: Number((1.90 + randomVariation()).toFixed(2)), size: 45000 },
                status: "ACTIVE" as const,
            },
            {
                runner_name: awayTeam,
                runner_id: 2,
                nat: awayTeam,
                odds: [],
                back: { price: Number((2.10 + randomVariation()).toFixed(2)), size: 48000 },
                lay: { price: Number((2.15 + randomVariation()).toFixed(2)), size: 42000 },
                status: "ACTIVE" as const,
            },
            {
                runner_name: "The Draw",
                runner_id: 3,
                nat: "The Draw",
                odds: [],
                back: { price: Number((3.50 + randomVariation()).toFixed(2)), size: 30000 },
                lay: { price: Number((3.60 + randomVariation()).toFixed(2)), size: 28000 },
                status: "ACTIVE" as const,
            },
        ],
        bookmaker: [
            {
                runner_name: homeTeam,
                runner_id: 1,
                nat: homeTeam,
                odds: [],
                back: { price: Number((90 + randomVariation() * 10).toFixed(0)), size: 100000 },
                lay: { price: Number((92 + randomVariation() * 10).toFixed(0)), size: 95000 },
                status: "ACTIVE" as const,
            },
            {
                runner_name: awayTeam,
                runner_id: 2,
                nat: awayTeam,
                odds: [],
                back: { price: Number((88 + randomVariation() * 10).toFixed(0)), size: 98000 },
                lay: { price: Number((90 + randomVariation() * 10).toFixed(0)), size: 92000 },
                status: "ACTIVE" as const,
            },
        ],
        fancy: [
            {
                runner_name: "Total Runs Over/Under",
                runner_id: 101,
                nat: "Total Runs",
                runs: 275,
                odds: [],
                back: { price: Number((1.95 + randomVariation()).toFixed(2)), size: 25000 },
                lay: { price: Number((2.00 + randomVariation()).toFixed(2)), size: 23000 },
                status: "ACTIVE" as const,
            },
            {
                runner_name: "First Innings Runs",
                runner_id: 102,
                nat: "First Innings",
                runs: 320,
                odds: [],
                back: { price: Number((1.90 + randomVariation()).toFixed(2)), size: 30000 },
                lay: { price: Number((1.95 + randomVariation()).toFixed(2)), size: 28000 },
                status: "ACTIVE" as const,
            },
            {
                runner_name: "Top Batsman Runs",
                runner_id: 103,
                nat: "Top Batsman",
                runs: 85,
                odds: [],
                back: { price: Number((2.20 + randomVariation()).toFixed(2)), size: 20000 },
                lay: { price: Number((2.25 + randomVariation()).toFixed(2)), size: 18000 },
                status: "ACTIVE" as const,
            },
        ],
    };
};

// Initial mock odds data
export const MOCK_MATCH_ODDS: Record<number, OddsData> = {
    99001: createMockMatchOdds("India", "Australia"),
    99002: createMockMatchOdds("England", "Pakistan"),
    99003: createMockMatchOdds("South Africa", "New Zealand"),
};

// Function to get fresh mock odds with random variations
export const getRandomizedMockOdds = (gmid: number): MatchOddsData => {
    const details = MOCK_MATCH_DETAILS[gmid];
    if (!details || !details.teams) {
        return {};
    }

    const odds = createMockMatchOdds(details.teams.home, details.teams.away);
    console.log("[Mock Data] Generated initial odds for gmid", gmid, odds);
    return odds;
};

// Simulate odds update with small random changes
export const simulateOddsUpdate = (currentOdds: MatchOddsData): MatchOddsData => {
    const updateRunner = (runner: any) => {
        if (!runner) return runner;

        // Smaller variation for realistic updates (±0.02 to ±0.04)
        const backVariation = (Math.random() - 0.5) * 0.06;
        const layVariation = (Math.random() - 0.5) * 0.06;

        const updated = {
            ...runner,
            back: runner.back
                ? {
                    ...runner.back,
                    price: Math.max(1.01, Number((runner.back.price + backVariation).toFixed(2))),
                }
                : null,
            lay: runner.lay
                ? {
                    ...runner.lay,
                    price: Math.max(1.01, Number((runner.lay.price + layVariation).toFixed(2))),
                }
                : null,
        };

        return updated;
    };

    const updated = {
        match_odds: currentOdds.match_odds?.map(updateRunner),
        bookmaker: currentOdds.bookmaker?.map(updateRunner),
        fancy: currentOdds.fancy?.map(updateRunner),
        toss: currentOdds.toss?.map(updateRunner),
    };

    console.log("[Mock Data] Simulated odds update", {
        match_odds_count: updated.match_odds?.length || 0,
        bookmaker_count: updated.bookmaker?.length || 0,
        fancy_count: updated.fancy?.length || 0,
    });

    return updated;
};
