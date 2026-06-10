import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import MyCourses from "./pages/MyCourses/MyCourses";
import CourseDetails from "./pages/Course/CourseDetails";
import Home from "./pages/Home/Home";
import LessonView from "./pages/Lesson/LessonView";
import Mentor from "./pages/Mentor/Mentor";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminUsers from "./pages/Admin/Users/AdminUsers";
import AdminJobs from "./pages/Admin/Jobs/AdminJobs";

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-50 dark:bg-[#0d1117] dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-50 dark:bg-[#0d1117] dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/lessons/:lessonId" element={<LessonView />} />

              {/* Admin Routes (AdminLayout enforces the ADMIN role) */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
