import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import { BookOpen, Users, FileText } from "lucide-react";
import api from "../../../services/api";
import type { JSendResponse, Course } from "../../../types/api";

const AdminDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    users: 0,
    lessons: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get<JSendResponse<Course[]>>("/courses"),
        api.get<JSendResponse<{ users: any[]; pagination: { total: number } }>>("/users?limit=1"),
      ]);

      const coursesData = coursesRes.data.data || [];
      const usersCount = usersRes.data.data?.pagination?.total || 0;

      const totalLessons = coursesData.reduce((acc, course) => acc + (course.meta.lessonCount || 0), 0);

      setCourses(coursesData);
      setStats({
        users: usersCount,
        lessons: totalLessons,
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-500/20",
      link: "/admin/courses",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-500/20",
      link: "/admin/users",
    },
    {
      label: "Total Lessons",
      value: stats.lessons,
      icon: FileText,
      color: "text-violet-600",
      bg: "bg-violet-100 dark:bg-violet-500/20",
      link: "/admin/courses", // Redirect to courses as we don't have a global lesson list
    },
  ];

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
    <AdminLayout title="Overview">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to the SigmaLoop administration panel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions or Recent Activity could go here */}

        {/* Courses List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Courses</h2>
            <Link to="/admin/courses/new" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
              + Create New
            </Link>
          </div>

          {courses.length === 0 ? (
             <Card>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No courses available.</p>
             </Card>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{course.meta.lessonCount || 0} Lessons</span>
                        <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs items-center inline-flex">
                          {course.difficulty.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/admin/courses/${course.id}/lessons`}>
                        <div className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
                          Manage Lessons
                        </div>
                      </Link>
                      <Link to={`/admin/courses/${course.id}/edit`}>
                         <div className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
                          Edit
                        </div>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
