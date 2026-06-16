import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CheckCircle2, XCircle, Clock, Terminal, Equal } from "lucide-react";
import {
  type MathExecutionResult,
  type MathSubmissionStatus,
} from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";

const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];

interface MathOutputPanelProps {
  result: MathExecutionResult | null;
  error?: string | null;
  isLoading?: boolean;
}

const statusConfig: Record<
  MathSubmissionStatus,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  PASSED: {
    icon: (
      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
    ),
    label: "Correct",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
  },
  FAILED: {
    icon: <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
    label: "Incorrect",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
  },
  PENDING_REVIEW: {
    icon: <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    label: "Pending review",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
  },
};

const MathOutputPanel: React.FC<MathOutputPanelProps> = ({
  result,
  error,
  isLoading,
}) => {
  const { t } = useLocale();
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm">{t("Evaluating...")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4 gap-2">
        <XCircle className="w-8 h-8 opacity-70" />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
        <Terminal className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm text-center">
          {t("Write your LaTeX answer and click Run to check it.")}
        </p>
      </div>
    );
  }

  const config = statusConfig[result.status] ?? statusConfig.PENDING_REVIEW;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0d1117] overflow-hidden">
      {/* Verdict Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${config.bg} ${config.border}`}
      >
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`text-sm font-semibold ${config.color}`}>
            {t(config.label)}
          </span>
          {result.verdict.equivalentForm && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Equal className="w-3 h-3" />
              {t("Equivalent form")}
            </span>
          )}
        </div>
      </div>

      {/* Pending-review explainer */}
      {result.status === "PENDING_REVIEW" && (
        <div className="px-4 py-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30">
          {t(
            "The grader wasn't confident enough to auto-grade this answer. It has been recorded for review and doesn't count as correct or incorrect."
          )}
        </div>
      )}

      {/* Rationale */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
          >
            {result.verdict.rationale}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MathOutputPanel;
