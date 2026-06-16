import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Onboarding from "./pages/Onboarding/Onboarding";
import MyCourses from "./pages/MyCourses/MyCourses";
import CourseDetails from "./pages/Course/CourseDetails";
import Home from "./pages/Home/Home";
import LessonView from "./pages/Lesson/LessonView";
import Mentor from "./pages/Mentor/Mentor";
import Settings from "./pages/Settings/Settings";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import Contact from "./pages/Legal/Contact";

// Admin Pages — GOD panel
import CommandCenter from "./pages/Admin/CommandCenter/CommandCenter";
import ResourceList from "./pages/Admin/Explorer/ResourceList";
import ResourceDetail from "./pages/Admin/Explorer/ResourceDetail";
import UserOverview from "./pages/Admin/UserOverview/UserOverview";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";

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
          <LocaleProvider>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Mentor — open to guests AND authenticated users. The page itself
                branches: guests get a tool-less chat with signup CTAs; signed-in
                users get the full tool-using mentor. */}
              <Route path="/mentor" element={<Mentor />} />

              {/* Legal / informational — public, reachable by guests and members */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/courses/:courseId" element={<CourseDetails />} />
                <Route path="/lessons/:lessonId" element={<LessonView />} />

                {/* Admin GOD panel (AdminLayout enforces the ADMIN role) */}
                <Route path="/admin" element={<CommandCenter />} />
                <Route
                  path="/admin/data/:resource"
                  element={<ResourceList />}
                />
                <Route
                  path="/admin/data/:resource/:id"
                  element={<ResourceDetail />}
                />
                <Route
                  path="/admin/overview/:userId"
                  element={<UserOverview />}
                />
                <Route path="/admin/settings" element={<AdminSettings />} />
                {/* Legacy admin paths → new explorer */}
                <Route
                  path="/admin/users"
                  element={<Navigate to="/admin/data/users" replace />}
                />
                <Route
                  path="/admin/jobs"
                  element={<Navigate to="/admin/data/jobs" replace />}
                />
              </Route>

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LocaleProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
