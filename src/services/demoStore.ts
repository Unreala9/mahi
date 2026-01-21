// Basic reactive store for Demo User State using localStorage
// This simulates a backend database for the Demo Account.

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  status: "completed" | "pending" | "failed";
  gateway_provider: string; // or 'sportsbook' for bets
  created_at: string;
  description?: string;
}

export interface Bet {
  id: string;
  fixtureName: string;
  marketName: string;
  outcomeName: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  status: "pending" | "won" | "lost";
  placedAt: string;
}

const STORAGE_KEY = "mahiexchange_demo_store";

const DEFAULT_STATE = {
  balance: 100000,
  transactions: [] as Transaction[],
  bets: [] as Bet[],
  user: {
    id: "demo-user-123",
    email: "demo@mahiexchange.com",
    full_name: "Demo VIP User",
    phone: "+91 98765 43210",
    kyc_status: "approved",
  },
};

class DemoStore {
  private state = DEFAULT_STATE;

  constructor() {
    this.load();
  }

  private load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.state = JSON.parse(stored);
    } else {
      this.state = DEFAULT_STATE;
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    // Dispatch event for components to listen to
    window.dispatchEvent(new Event("demo-store-updated"));
  }

  // Getters
  getBalance() {
    this.load();
    return this.state.balance;
  }
  getTransactions() {
    this.load();
    return this.state.transactions;
  }
  getBets() {
    this.load();
    return this.state.bets;
  }
  getUser() {
    this.load();
    return this.state.user;
  }

  // Actions
  init() {
    // Reset to default on fresh login if needed, or just ensure loaded
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.save();
    }
  }

  addTransaction(
    type: Transaction["type"],
    amount: number,
    description: string
  ) {
    this.load();
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      status: "completed",
      gateway_provider:
        type === "bet" || type === "win" ? "sportsbook" : "demo-bank",
      created_at: new Date().toISOString(),
      description,
    };

    this.state.transactions.unshift(newTx);

    if (type === "deposit" || type === "win") {
      this.state.balance += amount;
    } else if (type === "withdraw" || type === "bet") {
      this.state.balance -= amount;
    }

    this.save();
  }

  placeBet(betDetails: Omit<Bet, "id" | "status" | "placedAt">) {
    this.load();
    if (this.state.balance < betDetails.stake) {
      throw new Error("Insufficient demo balance!");
    }

    const newBet: Bet = {
      id: Math.random().toString(36).substr(2, 9),
      ...betDetails,
      status: "pending",
      placedAt: new Date().toISOString(),
    };

    this.state.bets.unshift(newBet);
    this.addTransaction(
      "bet",
      betDetails.stake,
      `Bet on ${betDetails.outcomeName} (${betDetails.fixtureName})`
    );
    this.save();
  }

  simulateWin(betId: string) {
    this.load();
    const bet = this.state.bets.find((b) => b.id === betId);
    if (bet && bet.status === "pending") {
      bet.status = "won";
      this.addTransaction(
        "win",
        bet.potentialReturn,
        `Win: ${bet.fixtureName}`
      );
      this.save();
    }
  }
}

export const demoStore = new DemoStore();
