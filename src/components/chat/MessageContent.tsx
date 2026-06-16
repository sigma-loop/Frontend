import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.min.css";

// ──────────────────────────────────────────
// Shared Markdown + LaTeX renderer
//
// Used by both the authenticated ChatWidget and the guest landing-page chat so
// the mentor's replies render identically (code blocks, tables, KaTeX math).
// ──────────────────────────────────────────

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex, rehypeHighlight];

export const MessageContent: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={remarkPlugins}
    rehypePlugins={rehypePlugins}
    components={{
      pre({ children }) {
        return (
          <pre className="rounded-xl bg-[#22272e] text-sm overflow-x-auto p-4 my-3">
            {children}
          </pre>
        );
      },
      code({ className, children, ...props }) {
        const isInline = !className;
        if (isInline) {
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-[13px] font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      a({ children, ...props }) {
        return (
          <a
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {children}
            </table>
          </div>
        );
      },
      th({ children }) {
        return (
          <th className="px-3 py-2 text-start font-semibold bg-gray-50 dark:bg-gray-800/80">
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            {children}
          </td>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MessageContent;
