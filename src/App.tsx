// import React from 'react';
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
import CourseList from "./pages/Course/CourseList";
import CourseDetails from "./pages/Course/CourseDetails";
import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import LessonView from "./pages/Lesson/LessonView";
import Mentor from "./pages/Mentor/Mentor";
import Curriculum from "./pages/Curriculum/Curriculum";

// Admin Pages
import AdminCourses from "./pages/Admin/Courses/AdminCourses";
import CourseForm from "./pages/Admin/Courses/CourseForm";
import AdminLessons from "./pages/Admin/Lessons/AdminLessons";
import LessonForm from "./pages/Admin/Lessons/LessonForm";
import AdminChallenges from "./pages/Admin/Challenges/AdminChallenges";
import ChallengeForm from "./pages/Admin/Challenges/ChallengeForm";
import AdminUsers from "./pages/Admin/Users/AdminUsers";

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

          {/* Lesson Route - Temporarily Public for Testing */}
          <Route path="/lessons/:lessonId" element={<LessonView />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/curriculum" element={<Curriculum />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/courses/:courseId/edit" element={<CourseForm />} />
            <Route path="/admin/courses/new" element={<CourseForm />} />
            <Route path="/admin/courses/:courseId/lessons" element={<AdminLessons />} />
            <Route path="/admin/courses/:courseId/lessons/:lessonId/edit" element={<LessonForm />} />
            <Route path="/admin/courses/:courseId/lessons/new" element={<LessonForm />} />
            <Route path="/admin/lessons/:lessonId/challenges" element={<AdminChallenges />} />
            <Route path="/admin/lessons/:lessonId/challenges/:challengeId/edit" element={<ChallengeForm />} />
            <Route path="/admin/lessons/:lessonId/challenges/new" element={<ChallengeForm />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            {/* Add more protected routes here */}
          </Route>

          {/* Root Redirect - now redundant if public route handles /, so removing replace logic or keeping as fallback */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* 404 - Redirect to Home if not logged in, Dashboard if logged in (logic handled by public/protected wrappers) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
