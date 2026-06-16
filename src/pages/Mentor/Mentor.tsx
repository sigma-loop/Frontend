import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import PageMeta from "../../components/common/PageMeta";
import ChatWidget from "../../components/chat/ChatWidget";
import GuestChat from "../../components/chat/GuestChat";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";

const Mentor: React.FC = () => {
  const { t } = useLocale();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  // Opened with ?thread=<id> after a guest chat is carried over on signup.
  const initialThreadId = searchParams.get("thread") || undefined;

  return (
    <>
      <PageMeta title={t("AI Mentor")} />
      <div className="flex h-screen flex-col bg-white dark:bg-[#161b22]">
        <Navbar />

        <div className="mt-16 flex flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              {t("Loading…")}
            </div>
          ) : isAuthenticated ? (
            <ChatWidget
              scope="GENERAL"
              showSidebar={true}
              initialThreadId={initialThreadId}
              placeholder={t("Message your mentor...")}
              welcomeTitle={t("What do you want to learn?")}
              welcomeSubtitle={t(
                "Ask me anything about programming or math — or tell me what you want to master and I'll build you a personalized course."
              )}
            />
          ) : (
            <GuestChat />
          )}
        </div>
      </div>
    </>
  );
};

export default Mentor;
