import React from "react";
import Navbar from "../../components/common/Navbar";
import PageMeta from "../../components/common/PageMeta";
import ChatWidget from "../../components/chat/ChatWidget";

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
            placeholder="Message your mentor..."
            welcomeTitle="What do you want to learn?"
            welcomeSubtitle="Ask me anything about programming or math — or tell me what you want to master and I'll build you a personalized course."
          />
        </div>
      </div>
    </>
  );
};

export default Mentor;
