import { useEffect, useState } from "react";
import { User, CheckCircle, XCircle, Loader2, Eye, Plus } from "lucide-react";
import { useAdminUsers } from "@/hooks/api/useAdmin";
import UserDetailModal from "@/components/admin/UserDetailModal";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  const { data: users = [], isLoading } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-400">Manage and view all registered users</p>
        </div>
        
        <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create new user
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#131824] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0A0E1A] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user: any) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.full_name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium border border-blue-500/20"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminUsers;

