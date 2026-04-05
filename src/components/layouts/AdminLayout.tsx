import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import PageMeta from "../common/PageMeta";
import {
  BookOpen,
  Users,
  Home,
  LogOut,
  Sparkles,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin or instructor
  React.useEffect(() => {
    if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Overview", path: "/admin" },
    { icon: BookOpen, label: "Courses", path: "/admin/courses" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: Sparkles, label: "Generated Content", path: "/admin/generated-content" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0d1117]">
      <PageMeta title={title ? `Admin - ${title}` : "Admin Dashboard"} />
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user?.email}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Admin Dashboard</span>
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
