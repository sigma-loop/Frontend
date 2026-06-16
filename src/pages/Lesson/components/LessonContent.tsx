import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import { ListChecks } from "lucide-react";
import { EmptyState } from "../../../components/common/EmptyState";
import { useLocale } from "../../../contexts/LocaleContext";

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex, rehypeHighlight];

interface LessonContentProps {
  content: string;
}

const LessonContent: React.FC<LessonContentProps> = ({ content }) => {
  const { t } = useLocale();
  // Challenge-only lessons may have no teaching content — show a friendly hint
  // pointing the learner to the workspace instead of an empty panel.
  if (!content || !content.trim()) {
    return (
      <div className="h-full bg-white dark:bg-[#161b22] overflow-y-auto flex items-center justify-center">
        <EmptyState
          icon={<ListChecks className="w-10 h-10" />}
          title={t("Hands-on lesson")}
          description={t(
            "This lesson is all about the challenge — head to the workspace to get started."
          )}
        />
      </div>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-white dark:bg-[#161b22] h-full overflow-y-auto">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default LessonContent;
