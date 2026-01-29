import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Key, Ban, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import DateFilter from "./DateFilter";
import { CasinoChip } from "@/components/ui/CasinoChip";
import StatCard from "./StatCard";
import { supabase } from "@/lib/supabase";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onBanUser?: (userId: string) => void;
  onUnbanUser?: (userId: string) => void;
}

const UserDetailModal = ({ open, onOpenChange, user, onBanUser, onUnbanUser }: UserDetailModalProps) => {
  const [isBanned, setIsBanned] = useState(user?.is_banned || false);
  const [userBetStats, setUserBetStats] = useState({
    totalBetAmount: 0,
    totalWinnings: 0,
  });
  const [userWallet, setUserWallet] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserStats = async () => {
      // Fetch user's wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setUserWallet(wallet);

      // Fetch user's bet stats
      const { data: bets } = await supabase
        .from("bets")
        .select("amount, payout, status")
        .eq("user_id", user.id);

      const totalBetAmount = bets?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
      const totalWinnings = bets?.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.payout || 0), 0) || 0;

      setUserBetStats({
        totalBetAmount,
        totalWinnings,
      });
    };

    fetchUserStats();
  }, [user?.id]);

  if (!user) return null;

  const handleBanToggle = () => {
    if (isBanned) {
      onUnbanUser?.(user.id);
    } else {
      onBanUser?.(user.id);
    }
    setIsBanned(!isBanned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0A0E1A] border-white/10 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <DialogTitle className="text-white text-2xl">About user</DialogTitle>
              <p className="text-gray-400 text-sm mt-1">Users / {user.full_name || "User"}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - User Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Data Card */}
            <div className="bg-[#131824] rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">User Data</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm">
                    <Key className="w-4 h-4" />
                    Reset Password
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">ID</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.id?.substring(0, 8) || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Level IP</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.last_ip || "192.168.10.2"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Name</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.full_name?.split(" ")[0] || "Name"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Surname</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.full_name?.split(" ")[1] || "Surname"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Phone</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-white text-sm">{user.phone || "+998 32 454 64 96"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Passport</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.passport || "M12344498"}</p>
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-gray-400 text-sm">Date of Birth</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                    <p className="text-white text-sm">{user.date_of_birth || "08.08.1992"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10">
                <span className="text-white text-sm">
                  {isBanned ? "User is banned" : "User is not banned"}
                </span>
                <button
                  onClick={handleBanToggle}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                    isBanned
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  <Ban className="w-4 h-4" />
                  {isBanned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>

            {/* Date Filter */}
            <DateFilter />

            {/* Bets Section */}
            <div className="bg-[#131824] rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Bets</h3>
                <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1">
                  Bet history
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0A0E1A] rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-gray-400 text-sm">Total Bet Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{userBetStats.totalBetAmount.toFixed(2)}</p>
                  <CasinoChip size="md" />
                </div>

                <div className="bg-[#0A0E1A] rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <p className="text-gray-400 text-sm">Total Winnings</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{userBetStats.totalWinnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Coins</p>
                </div>

                <div className="bg-[#0A0E1A] rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <p className="text-gray-400 text-sm">Total (GGR)</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{(userBetStats.totalBetAmount - userBetStats.totalWinnings).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Coins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Balance */}
          <div className="space-y-6">
            <div className="bg-[#131824] rounded-xl p-6 border border-white/5">
              <h3 className="text-white font-semibold text-lg mb-6">Balance</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">Balance</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
                    <p className="text-white">{userWallet?.balance?.toFixed(2) || '0.00'}</p>
                    <CasinoChip size="sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400 text-sm">TopUp</label>
                  <div className="bg-[#0A0E1A] rounded-lg px-4 py-3 border border-white/10 flex items-center justify-between">
                    <p className="text-white">0.00</p>
                    <p className="text-blue-400 text-sm">Coins</p>
                  </div>
                </div>

                <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Topup
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
