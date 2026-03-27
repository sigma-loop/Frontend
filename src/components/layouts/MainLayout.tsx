import React from "react";
import type { ReactNode } from "react";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import PageMeta from "../common/PageMeta";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117]">
      <PageMeta title={title || "Master the Logic"} />
      <Navbar />
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
