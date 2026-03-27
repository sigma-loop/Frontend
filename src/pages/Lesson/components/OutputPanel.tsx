import React, { useState } from "react";
import {
  Terminal,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  EyeOff,
} from "lucide-react";
import { type ExecutionResult, type TestResult } from "../../../types/api";

interface OutputPanelProps {
  executionResult: ExecutionResult | null;
  isLoading?: boolean;
}

const TestCaseCard: React.FC<{ result: TestResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(!result.passed);

  if (result.isHidden) {
    return (
      <div
        className={`rounded-lg border ${
          result.passed
            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30"
            : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {result.passed ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
          )}
          <span
            className={`text-sm font-medium ${
              result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            Test {result.index}
          </span>
          <EyeOff className="w-3.5 h-3.5 text-gray-400 ml-auto" />
          <span className="text-xs text-gray-400 italic">Hidden</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${
        result.passed
          ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30"
          : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        {result.passed ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
        )}
        <span
          className={`text-sm font-medium ${
            result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
          }`}
        >
          Test {result.index}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            result.passed
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          }`}
        >
          {result.status}
        </span>
        {result.time && (
          <span className="text-xs text-gray-400 ml-auto mr-1">
            {result.time}s
          </span>
        )}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Input
              </span>
              <pre className="mt-0.5 text-xs bg-white dark:bg-[#161b22] rounded px-2 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 overflow-x-auto">
                {result.input || "(empty)"}
              </pre>
            </div>
            <div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Expected Output
              </span>
              <pre className="mt-0.5 text-xs bg-white dark:bg-[#161b22] rounded px-2 py-1.5 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 overflow-x-auto">
                {result.expectedOutput || "(empty)"}
              </pre>
            </div>
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                Your Output
              </span>
              <pre
                className={`mt-0.5 text-xs bg-white dark:bg-[#161b22] rounded px-2 py-1.5 border overflow-x-auto ${
                  result.passed
                    ? "border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
                    : "border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
                }`}
              >
                {result.actualOutput || "(empty)"}
              </pre>
            </div>
          </div>
          {result.stderr && (
            <div>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                Stderr / Compile Error
              </span>
              <pre className="mt-0.5 text-xs bg-red-50 dark:bg-red-900/20 rounded px-2 py-1.5 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 overflow-x-auto whitespace-pre-wrap">
                {result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OutputPanel: React.FC<OutputPanelProps> = ({
  executionResult,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm">Running...</span>
      </div>
    );
  }

  if (!executionResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
        <Terminal className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">Run your code to see the output here.</p>
      </div>
    );
  }

  const hasTestResults =
    executionResult.testResults && executionResult.testResults.length > 0;

  // Fallback for ERROR status (network errors, etc.)
  if (executionResult.status === "ERROR") {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0d1117] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Error</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-sm text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap">
            {executionResult.stderr || executionResult.stdout || "Unknown error"}
          </pre>
        </div>
      </div>
    );
  }

  const passed = executionResult.metrics?.passed ?? 0;
  const total = executionResult.metrics?.total ?? 0;
  const allPassed =
    executionResult.status === "PASSED" || executionResult.status === "PASS";

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          allPassed
            ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {allPassed ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
          )}
          <span
            className={`text-sm font-semibold ${
              allPassed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {allPassed ? "All Tests Passed" : "Some Tests Failed"}
          </span>
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded ${
              allPassed
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {passed}/{total}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {executionResult.metrics.runtime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {executionResult.metrics.runtime}
            </span>
          )}
          {executionResult.metrics.memoryUsed && (
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {executionResult.metrics.memoryUsed}
            </span>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {hasTestResults ? (
          executionResult.testResults!.map((result) => (
            <TestCaseCard key={result.index} result={result} />
          ))
        ) : (
          <div className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap p-2">
            {executionResult.stdout}
            {executionResult.stderr && (
              <div className="mt-2 text-red-600 dark:text-red-400">{executionResult.stderr}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
