import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import {
  Send,
  Trophy,
  CheckCircle2,
  XCircle,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { mcqService } from "../../../services/mcqService";
import type { MCQChallenge, MCQSubmissionResult } from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex, rehypeHighlight];

interface MCQWorkspaceProps {
  challenge: MCQChallenge;
  onCompleted?: () => void;
}

/**
 * Workspace for MCQ challenges: single- or multi-select, graded deterministically
 * on the server. The correct options / explanations are only known after submit.
 */
const MCQWorkspace: React.FC<MCQWorkspaceProps> = ({
  challenge,
  onCompleted,
}) => {
  const { t } = useLocale();
  const challengeId = challenge.id;
  const storageKey = `sigmaloop_mcq_${challengeId}`;

  const [selected, setSelected] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [result, setResult] = useState<MCQSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Reset on challenge change
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setSelected(saved ? (JSON.parse(saved) as string[]) : []);
    setResult(null);
    setError(null);
    setLessonCompleted(false);
  }, [storageKey]);

  const submitted = result !== null;

  const persist = useCallback(
    (next: string[]) => {
      setSelected(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const toggleOption = (optionId: string) => {
    if (submitted) return;
    if (challenge.allowMultiple) {
      persist(
        selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId]
      );
    } else {
      persist([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await mcqService.submit({
        challengeId,
        selectedOptionIds: selected,
      });
      setResult(res);
      if (res.lessonCompleted) setLessonCompleted(true);
      if (res.verdict.correct) onCompleted?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
    persist([]);
  };

  const correctIds = new Set(result?.verdict.correctOptionIds ?? []);
  const explanationFor = (optionId: string) =>
    result?.verdict.explanations.find((e) => e.optionId === optionId);

  const verdictLabel = !result
    ? ""
    : result.verdict.correct
      ? t("Correct")
      : result.verdict.partial
        ? t("Partially correct")
        : t("Incorrect");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161b22] border-s border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-sm z-10">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
            {t("Quiz")}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ms-1">
            {challenge.allowMultiple
              ? t("Select all that apply")
              : t("Select one")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {submitted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t("Try again")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || selected.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="w-4 h-4" />
              {t("Submit")}
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Completed Banner */}
      {lessonCompleted && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 animate-pulse">
          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            {t("Lesson Complete! +50 XP")}
          </span>
        </div>
      )}

      {/* Prompt + options */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5">
        <div className="prose prose-slate dark:prose-invert max-w-none mb-5">
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
          >
            {challenge.prompt}
          </ReactMarkdown>
        </div>

        <div className="space-y-3">
          {challenge.options.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = correctIds.has(opt.id);
            const exp = explanationFor(opt.id);

            // Border/background styling: pre-submit = selection highlight;
            // post-submit = correctness highlight.
            const stateClass = !submitted
              ? isSelected
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                : "border-gray-200 dark:border-gray-800 hover:border-indigo-300"
              : isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : isSelected
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-800 opacity-70";

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.id)}
                disabled={submitted}
                className={cn(
                  "w-full text-start rounded-lg border p-3 transition-colors flex gap-3 items-start",
                  stateClass,
                  submitted ? "cursor-default" : "cursor-pointer"
                )}
              >
                {/* Selection / verdict marker */}
                <span className="mt-0.5 flex-shrink-0">
                  {submitted ? (
                    isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <span
                        className={cn(
                          "block w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600",
                          challenge.allowMultiple
                            ? "rounded-md"
                            : "rounded-full"
                        )}
                      />
                    )
                  ) : (
                    <span
                      className={cn(
                        "block w-5 h-5 border-2 flex items-center justify-center",
                        challenge.allowMultiple ? "rounded-md" : "rounded-full",
                        isSelected
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      {isSelected && (
                        <span className="block w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none [&_p]:my-0">
                    <ReactMarkdown
                      remarkPlugins={remarkPlugins}
                      rehypePlugins={rehypePlugins}
                    >
                      {opt.text}
                    </ReactMarkdown>
                  </div>
                  {submitted && exp?.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {exp.explanation}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Verdict summary */}
        {result && (
          <div
            className={cn(
              "mt-5 rounded-xl border p-4",
              result.verdict.correct
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                : result.verdict.partial
                  ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                  : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {result.verdict.correct ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {verdictLabel}
              </span>
            </div>
            {result.verdict.rationale && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.verdict.rationale}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQWorkspace;
