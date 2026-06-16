import React, { useState } from "react";
import Button from "../../../components/ui/Button";

interface RecordEditorModalProps {
  title: string;
  initialValue: Record<string, unknown>;
  hint?: string;
  onClose: () => void;
  onSave: (value: Record<string, unknown>) => Promise<void>;
}

/**
 * The god-mode editor. Edits any record as raw JSON, so every field of every
 * model is reachable — testcases, MCQ correctness flags, math solutions, chat
 * content, verdicts, etc. Validation happens server-side; errors surface here.
 */
const RecordEditorModal: React.FC<RecordEditorModalProps> = ({
  title,
  initialValue,
  hint,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState(() => JSON.stringify(initialValue, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError("Invalid JSON — " + (e as Error).message);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(parsed);
    } catch (e) {
      setError((e as Error).message || "Failed to save");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold dark:text-gray-100">{title}</h2>
          {hint && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {hint}
            </p>
          )}
        </div>
        <div className="p-6 overflow-auto">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="w-full h-[50vh] font-mono text-xs p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error}
            </p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordEditorModal;
