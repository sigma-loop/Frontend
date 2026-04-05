import React from "react";
import Navbar from "../../components/common/Navbar";
import PageMeta from "../../components/common/PageMeta";
import ChatWidget from "../../components/common/ChatWidget";

const Mentor: React.FC = () => {
  return (
    <>
      <PageMeta title="AI Mentor" />
      <div className="h-screen flex flex-col bg-white dark:bg-[#161b22]">
        <Navbar />

        <div className="flex flex-1 overflow-hidden mt-16">
          <ChatWidget
            scope="GENERAL"
            showSidebar={true}
            placeholder="Message SigmaLoop..."
            welcomeTitle="How can I help you today?"
            welcomeSubtitle="Ask me anything about programming, algorithms, or your coursework."
          />
        </div>
      </div>
    </>
  );
};

export default Mentor;
