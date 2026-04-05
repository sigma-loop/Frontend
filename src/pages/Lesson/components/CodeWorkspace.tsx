import React, { useState, useEffect, useCallback } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import CodeEditor from "./CodeEditor";
import OutputPanel from "./OutputPanel";
import { Play, Send, Trophy } from "lucide-react";
import Button from "../../../components/ui/Button";
import { type CodeExecutionPayload, lessonService } from "../../../services/lessonService";
import { type Challenge, type ExecutionResult } from "../../../types/api";

interface CodeWorkspaceProps {
  initialCode: string;
  language?: string;
  challengeId?: string;
  challenge?: Challenge;
  availableLanguages?: string[];
  onLanguageChange?: (lang: string) => void;
  isGenerated?: boolean;
}

const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  initialCode,
  language = "python",
  challengeId,
  challenge: _challenge,
  availableLanguages = [],
  onLanguageChange,
  isGenerated = false,
}) => {
  // Load saved code from localStorage, fall back to initialCode
  const storageKey = challengeId ? `sigmaloop_code_${challengeId}_${language}` : "";

  const [code, setCode] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return saved;
    }
    return initialCode;
  });
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Save to localStorage on change
  const handleCodeChange = useCallback(
    (val: string | undefined) => {
      const newCode = val || "";
      setCode(newCode);
      if (storageKey) {
        localStorage.setItem(storageKey, newCode);
      }
    },
    [storageKey]
  );

  // Sync when challengeId or language changes (component re-keyed)
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setCode(saved);
        return;
      }
    }
    setCode(initialCode);
  }, [storageKey, initialCode]);

  const handleRun = async () => {
    setIsLoading(true);
    setExecutionResult(null);
    try {
      const payload: CodeExecutionPayload = {
        challengeId,
        code,
        language,
        ...(isGenerated && { generated: true }),
      };
      const result = await lessonService.runCode(payload);
      setExecutionResult(result);
    } catch (error) {
      console.error("Execution error:", error);
      setExecutionResult({
        status: "ERROR",
        stdout: "",
        stderr: error instanceof Error ? error.message : "Unknown error occurred",
        metrics: { runtime: "0s" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!challengeId) {
      // If no challenge, we can't really "submit" a solution in the persistent sense
      // Fallback to running or show error
      await handleRun();
      return;
    }

    setIsLoading(true);
    setExecutionResult(null);
    try {
      const payload = {
        challengeId,
        code,
        language,
        ...(isGenerated && { generated: true }),
      };

      const result = await lessonService.submitCode(payload);
      setExecutionResult(result);

      if (result.lessonCompleted) {
        setLessonCompleted(true);
      }

    } catch (error) {
      console.error("Submission error:", error);
      setExecutionResult({
        status: "ERROR",
        stdout: "",
        stderr: error instanceof Error ? error.message : "Unknown error occurred",
        metrics: { runtime: "0s" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-gray-800">
      {/* Toolkit / Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] shadow-sm z-10">
        <div className="flex items-center gap-2">
          {availableLanguages.length > 1 ? (
            <select
              value={language}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded capitalize">
              {language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>

      {/* Lesson Completed Banner */}
      {lessonCompleted && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 animate-pulse">
          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            Lesson Complete! +50 XP
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

export default CodeWorkspace;
