import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

interface JsonBlockProps {
  value: unknown;
  label?: string;
  defaultCollapsed?: boolean;
}

const JsonBlock: React.FC<JsonBlockProps> = ({
  value,
  label = "Raw JSON",
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  let text: string;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {label}
        </button>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {!collapsed && (
        <pre className="p-4 text-xs leading-relaxed overflow-auto max-h-[480px] bg-white dark:bg-[#0d1117] text-gray-800 dark:text-gray-200">
          {text}
        </pre>
      )}
    </div>
  );
};

export default JsonBlock;
