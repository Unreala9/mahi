import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAdminUsers } from "@/hooks/api/useAdmin";

const AdminUsers = () => {
  const { data: users = [], isLoading } = useAdminUsers();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Ideally needs Admin Sidebar but typically internal apps reuse sidebar or have layouts.
            The file I read didn't show sidebar wrapper in AdminUsers?
            Check AdminUsers.tsx content again.
            It just returned a div.
            I will wrap it in a simple layout or just the content if the parent handles layout.
            Use Admin Layout if it exists, otherwise standard dashboard sidebar?
            Admin should typically have access to same sidebar with extra links.
        */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          User <span className="text-gradient">Management</span>
        </h1>

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.full_name || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium capitalize">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
