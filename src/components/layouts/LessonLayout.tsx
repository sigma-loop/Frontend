import React from "react";
import type { ReactNode } from "react";
import Navbar from "../common/Navbar";

interface LessonLayoutProps {
  children: ReactNode;
}

const LessonLayout: React.FC<LessonLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117] overflow-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col min-h-0">{children}</main>
    </div>
  );
};

export default LessonLayout;
