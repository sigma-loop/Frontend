import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Eye, EyeOff } from "lucide-react";

const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeKatex];

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MathEditor: React.FC<MathEditorProps> = ({ value, onChange }) => {
  const [showPreview, setShowPreview] = useState(true);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Wrap the raw value in display math delimiters for preview
  const previewContent = value.trim()
    ? `$$${value}$$`
    : "*Type your LaTeX answer above...*";

  return (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            LaTeX Answer
          </span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            {showPreview ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {showPreview ? "Hide" : "Show"} Preview
          </button>
        </div>
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="e.g.  \frac{n(n+1)}{2}  or  \Theta(n \log n)"
          spellCheck={false}
          className="flex-1 w-full resize-none p-4 font-mono text-sm bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-100 border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preview
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-[#0d1117] min-h-[60px] max-h-[150px] overflow-y-auto prose prose-slate dark:prose-invert max-w-none text-center">
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
            >
              {previewContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathEditor;
