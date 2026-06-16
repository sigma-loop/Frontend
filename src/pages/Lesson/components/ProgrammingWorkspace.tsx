import React, { useState, useEffect, useCallback } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import CodeEditor from "./CodeEditor";
import OutputPanel from "./OutputPanel";
import { Play, Trophy } from "lucide-react";
import Button from "../../../components/ui/Button";
import { lessonService } from "../../../services/lessonService";
import { type ExecutionResult } from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";

interface ProgrammingWorkspaceProps {
  initialCode: string;
  language?: string;
  challengeId: string;
  availableLanguages?: string[];
  onLanguageChange?: (lang: string) => void;
  onCompleted?: () => void;
}

/**
 * Workspace for PROGRAMMING challenges: Monaco editor + Judge0-backed
 * run/submit against the AI-generated test cases.
 */
const ProgrammingWorkspace: React.FC<ProgrammingWorkspaceProps> = ({
  initialCode,
  language = "python",
  challengeId,
  availableLanguages = [],
  onLanguageChange,
  onCompleted,
}) => {
  const { t } = useLocale();
  // Load saved code from localStorage, fall back to initialCode
  const storageKey = `sigmaloop_code_${challengeId}_${language}`;

  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved : initialCode;
  });
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Save to localStorage on change
  const handleCodeChange = useCallback(
    (val: string | undefined) => {
      const newCode = val || "";
      setCode(newCode);
      localStorage.setItem(storageKey, newCode);
    },
    [storageKey]
  );

  // Sync when challengeId or language changes (component re-keyed)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setCode(saved !== null ? saved : initialCode);
  }, [storageKey, initialCode]);

  // Single action: run the code against all test cases and, when everything
  // passes, mark the challenge (and the lesson, if it was the last one) done.
  const handleRun = async () => {
    setIsLoading(true);
    setExecutionResult(null);
    try {
      const result = await lessonService.submitCode({
        challengeId,
        code,
        language,
      });
      setExecutionResult(result);

      if (result.lessonCompleted) {
        setLessonCompleted(true);
      }
      if (result.status === "PASSED") {
        onCompleted?.();
      }
    } catch (error) {
      console.error("Execution error:", error);
      setExecutionResult({
        status: "ERROR",
        stdout: "",
        stderr:
          error instanceof Error ? error.message : "Unknown error occurred",
        metrics: { runtime: "0s" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161b22] border-s border-gray-200 dark:border-gray-800">
      {/* Toolkit / Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-sm z-10">
        <div className="flex items-center gap-2">
          {availableLanguages.length > 1 ? (
            <select
              value={language}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md capitalize">
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isLoading}
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
          <Panel defaultSize={70} minSize={20}>
            <CodeEditor
              language={language}
              value={code}
              onChange={handleCodeChange}
            />
          </Panel>
          <PanelResizeHandle className="h-2 bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-row-resize">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </PanelResizeHandle>
          <Panel defaultSize={30} minSize={20}>
            <OutputPanel
              executionResult={executionResult}
              isLoading={isLoading}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default ProgrammingWorkspace;
