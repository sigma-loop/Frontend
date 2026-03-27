import React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "../../../contexts/ThemeContext";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onMount?: OnMount;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  onMount,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="h-full w-full border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden bg-white dark:bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        onMount={onMount}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
};

export default CodeEditor;
