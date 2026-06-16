import React from "react";
import type { ReactNode } from "react";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import PageMeta from "../common/PageMeta";
import PageSkeleton from "../common/PageSkeleton";
import { useLocale } from "../../contexts/LocaleContext";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  // While switching into a new language, mask the content with a skeleton but
  // keep the frame (Navbar/Footer) — so the page loads in its new language
  // rather than flashing half-translated English.
  const { isSwitchingLanguage } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0d1117]">
      <PageMeta title={title || "Master the Logic"} />
      <Navbar />
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {isSwitchingLanguage ? <PageSkeleton /> : children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
