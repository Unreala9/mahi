import { useAdminStats } from "@/hooks/api/useAdmin";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  DollarSign,
  Loader2,
  UserCircle,
} from "lucide-react";
import DateFilter from "@/components/admin/DateFilter";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();
  const [user, setUser] = useState<any>(null);
  const [adminWallet, setAdminWallet] = useState<any>(null);
  const [transactionStats, setTransactionStats] = useState<any>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    depositsToday: 0,
  });
  const [betStats, setBetStats] = useState<any>({
    totalBetAmount: 0,
    totalWinnings: 0,
  });
  const [userRoleStats, setUserRoleStats] = useState<any>({
    totalCashiers: 0,
    totalAdmins: 0,
    registeredToday: 0,
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        setUser(profile);

        // Fetch admin wallet balance
        const { data: wallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        setAdminWallet(wallet);

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Fetch transaction stats (TODAY ONLY)
        const { data: deposits } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "deposit")
          .eq("status", "completed")
          .gte("created_at", todayISO);

        const { data: withdrawals } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "withdrawal")
          .eq("status", "completed")
          .gte("created_at", todayISO);

        const totalDeposits = deposits?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
        const totalWithdrawals = withdrawals?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        setTransactionStats({
          totalDeposits,
          totalWithdrawals,
          depositsToday: totalDeposits, // Same as totalDeposits now
        });

        // Fetch bet stats (TODAY ONLY)
        const { data: bets } = await supabase
          .from("bets")
          .select("amount, payout, status")
          .gte("created_at", todayISO);

        const totalBetAmount = bets?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
        const totalWinnings = bets?.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.payout || 0), 0) || 0;

        setBetStats({
          totalBetAmount,
          totalWinnings,
        });

        // Fetch user role stats
        const { data: cashiers } = await supabase
          .from("profiles")
          .select("id", { count: 'exact', head: true })
          .eq("role", "cashier");

        const { data: admins } = await supabase
          .from("profiles")
          .select("id", { count: 'exact', head: true })
          .eq("role", "admin");

        const { data: newUsersToday } = await supabase
          .from("profiles")
          .select("id", { count: 'exact', head: true })
          .gte("created_at", today.toISOString());

        setUserRoleStats({
          totalCashiers: cashiers?.length || 0,
          totalAdmins: admins?.length || 0,
          registeredToday: newUsersToday?.length || 0,
        });
      }
    };
    
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Admin Panel!
          </h1>
          <p className="text-gray-400">Use the left menu to manage users</p>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 bg-[#1e293b] rounded-lg px-4 py-2 border border-white/5">
            <UserCircle className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm font-medium">{user?.full_name || "Super_Admin"}</span>
          </div>
        )}
      </div>

      {/* Main Grid - 40/60 split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Card - 5 columns (40%) */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden h-full">
            {/* Background watermark */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10">
              <DollarSign className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10">
              <p className="text-blue-100 text-sm mb-3">My Balance</p>
              <p className="text-5xl font-bold text-white mb-8">
                {adminWallet?.balance?.toLocaleString() || '0'}<span className="text-2xl">.00</span>
              </p>
              
              {/* Stacked stats on left */}
              <div className="space-y-4">
                <div>
                  <p className="text-blue-100 text-xs mb-1">Income for Today</p>
                  <p className="text-xl font-bold text-white">
                    {transactionStats.depositsToday.toLocaleString()}<span className="text-sm">.00</span>
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs mb-1">Total Balance (All Users)</p>
                  <p className="text-xl font-bold text-white">
                    {stats?.totalBalance?.toLocaleString() || '0'}<span className="text-sm">.00</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section - 7 columns (60%) */}
        <div className="lg:col-span-7">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Users</h2>
              <button className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                All users →
              </button>
            </div>

            {/* Horizontal layout for stats */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-[#0f172a] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-400 text-xs">Total Players</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              
              <div className="flex-1 bg-[#0f172a] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-400 text-xs">Total Cashiers</p>
                </div>
                <p className="text-3xl font-bold text-white">{userRoleStats.totalCashiers}</p>
              </div>
              
              <div className="flex-1 bg-[#0f172a] rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-400 text-xs">Total Admins</p>
                </div>
                <p className="text-3xl font-bold text-white">{userRoleStats.totalAdmins}</p>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-4 border border-green-500/20 mb-4">
              <p className="text-gray-400 text-xs mb-2">Registered Today</p>
              <p className="text-3xl font-bold text-green-400">+{userRoleStats.registeredToday}</p>
            </div>

            <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm">
              + Create new user
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter />

      {/* Deposit/Withdrawal and Bets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit/Withdrawal */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Deposit/Withdrawal <span className="text-gray-500 text-xs font-normal">(Today)</span></h3>
            <button className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
              All transaction →
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0f172a] rounded-lg p-5 border border-green-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-gray-400 text-sm">Deposits (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{transactionStats.totalDeposits.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-5 border border-red-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <p className="text-gray-400 text-sm">Withdrawals (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-red-400">{transactionStats.totalWithdrawals.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-5 border border-blue-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <p className="text-gray-400 text-sm">Net (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{(transactionStats.totalDeposits - transactionStats.totalWithdrawals).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bets */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Bets <span className="text-gray-500 text-xs font-normal">(Today)</span></h3>
            <button className="text-blue-400 text-xs hover:text-blue-300 transition-colors flex items-center gap-1">
              Bet history →
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0f172a] rounded-lg p-5 border border-green-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-gray-400 text-sm">Total Bet Amount (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{betStats.totalBetAmount.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-5 border border-red-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <p className="text-gray-400 text-sm">Total Winnings (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-red-400">{betStats.totalWinnings.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-5 border border-blue-500/20 relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    <p className="text-gray-400 text-sm">GGR (Today)</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{(betStats.totalBetAmount - betStats.totalWinnings).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Admin Card */}
      {user && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 inline-flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">{user?.full_name || "Super_Admin"} <span className="text-gray-400 font-normal">({user?.role || "Super Admin"})</span></p>
            <p className="text-gray-500 text-sm">ID: {user?.id?.substring(0, 8)} • Balance: <span className="text-blue-400">{adminWallet?.balance?.toFixed(2) || '0.00'} USD</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

