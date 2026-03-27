import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const Home: React.FC = () => {
  return (
    <MainLayout title="Home">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 dark:text-gray-100 sm:text-7xl">
            Master the Future with{" "}
            <span className="relative whitespace-nowrap text-indigo-600">
              <span className="relative text-gradient">SigmaLoop</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700 dark:text-gray-300">
            The ultimate learning platform designed to accelerate your coding
            journey. Interactive lessons, real-time challenges, and expert
            mentorship.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-full px-8 py-3 text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-500/10"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-8 py-3 text-lg"
              >
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="hover:scale-105 transition-transform duration-300 border-t-4 border-indigo-500">
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Interactive Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice as you learn with our integrated code challenges.
                Immediate feedback to help you improve faster.
              </p>
            </div>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-300 border-t-4 border-purple-500">
            <div className="p-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Structured Curriculum
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Follow a carefully crafted path from beginner to expert. Don't
                waste time figuring out what to learn next.
              </p>
            </div>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-300 border-t-4 border-pink-500">
            <div className="p-4">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 text-pink-600 dark:text-pink-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Expert Mentorship
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get stuck? Connect with industry experts and get unstuck in
                minutes. You are never learning alone.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
