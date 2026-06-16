import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { adminService, type AdminUser } from "../../../services/adminService";
import { useLocale } from "../../../contexts/LocaleContext";

const AdminUsers: React.FC = () => {
  const { t } = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { users } = await adminService.getUsers(1, 100);
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profileData?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (userId: string) => {
    if (
      !window.confirm(
        t(
          "Are you sure you want to delete this user? This action cannot be undone."
        )
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter((u) => (u._id || u.id) !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(t("Failed to delete user"));
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await adminService.updateUser(editingUser._id || editingUser.id, {
        role: editingUser.role,
        profileData: { name: editingUser.profileData?.name || "" },
      });

      // Update local state
      setUsers(
        users.map((u) =>
          (u._id || u.id) === (editingUser._id || editingUser.id)
            ? editingUser
            : u
        )
      );
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      alert(t("Failed to update user"));
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t("Users")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Users")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("Manage platform users and roles")}
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <div className="flex gap-4">
            <Input
              placeholder={t("Search by name or email...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-md"
            />
          </div>
        </Card>

        {filteredUsers.length === 0 ? (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {t("No users found matching your search.")}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user._id || user.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {user.profileData?.name || t("Unknown User")}
                      </h3>
                      <Badge
                        variant={user.role === "ADMIN" ? "error" : "default"}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    {user.stats && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{t("XP: {xp}", { xp: user.stats.totalXp })}</span>
                        <span>
                          {t("Streak: {days} days", {
                            days: user.stats.streakDays,
                          })}
                        </span>
                        <span>
                          {t("Lessons: {count}", {
                            count: user.stats.lessonsCompleted,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      {t("Edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(user._id || user.id)}
                    >
                      {t("Delete")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                {t("Edit User")}
              </h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Name")}
                  </label>
                  <Input
                    value={editingUser.profileData?.name || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        profileData: {
                          ...editingUser.profileData,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Role")}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-[#0d1117] dark:text-gray-100"
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as "STUDENT" | "ADMIN",
                      })
                    }
                  >
                    <option value="STUDENT">{t("Student")}</option>
                    <option value="ADMIN">{t("Admin")}</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingUser(null)}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button type="submit">{t("Save Changes")}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
