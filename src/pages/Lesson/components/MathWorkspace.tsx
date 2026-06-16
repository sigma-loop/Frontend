import React, { useState, useEffect, useCallback } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import MathEditor from "./MathEditor";
import MathOutputPanel from "./MathOutputPanel";
import { Play, Trophy, Calculator } from "lucide-react";
import Button from "../../../components/ui/Button";
import { mathService } from "../../../services/mathService";
import {
  type MathChallenge,
  type MathExecutionResult,
} from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";

interface MathWorkspaceProps {
  challenge: MathChallenge;
  onCompleted?: () => void;
}

/**
 * Workspace for MATH challenges: LaTeX input with live KaTeX preview,
 * graded by the LLM. Low-confidence verdicts surface as "Pending review".
 */
const MathWorkspace: React.FC<MathWorkspaceProps> = ({
  challenge,
  onCompleted,
}) => {
  const { t } = useLocale();
  const challengeId = challenge.id;
  const storageKey = `sigmaloop_math_${challengeId}`;

  const [latex, setLatex] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ?? "";
  });
  const [result, setResult] = useState<MathExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Persist answer to localStorage
  const handleChange = useCallback(
    (val: string) => {
      setLatex(val);
      localStorage.setItem(storageKey, val);
    },
    [storageKey]
  );

  // Sync on challengeId change
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setLatex(saved ?? "");
    setResult(null);
    setError(null);
    setLessonCompleted(false);
  }, [storageKey]);

  // Single action: grade the answer and, on a confident pass, mark the
  // challenge (and the lesson, if it was the last one) done.
  const handleRun = async () => {
    if (!latex.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await mathService.submit({ challengeId, latex });
      setResult(res);
      if (res.lessonCompleted) {
        setLessonCompleted(true);
      }
      if (res.status === "PASSED") {
        onCompleted?.();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161b22] border-s border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
            {t("Math")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isLoading || !latex.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4" />
            {t("Run")}
          </Button>
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

      {/* Editor & Output Split */}
      <div className="flex-1 h-full min-h-0">
        <PanelGroup orientation="vertical">
          <Panel defaultSize={55} minSize={20}>
            <MathEditor value={latex} onChange={handleChange} />
          </Panel>
          <PanelResizeHandle className="h-2 bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-row-resize">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </PanelResizeHandle>
          <Panel defaultSize={45} minSize={20}>
            <MathOutputPanel
              result={result}
              error={error}
              isLoading={isLoading}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default MathWorkspace;
