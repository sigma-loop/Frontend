import React from "react";
import ReactMarkdown from "react-markdown";

interface LessonContentProps {
  content: string;
}

const LessonContent: React.FC<LessonContentProps> = ({ content }) => {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-white dark:bg-[#161b22] h-full overflow-y-auto">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default LessonContent;
