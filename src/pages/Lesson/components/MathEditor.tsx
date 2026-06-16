import React, { useCallback, useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import { Eye, EyeOff, Keyboard } from "lucide-react";

// MathLive loads its fonts (and optionally sounds) at runtime. The fonts are
// copied into /public/mathlive/fonts so Vite serves them at this path.
// These are static settings and only take effect before a field is created.
MathfieldElement.fontsDirectory = "/mathlive/fonts";
MathfieldElement.soundsDirectory = null; // no keypress sounds

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Visual math editor for MATH challenges. Students compose their answer with a
 * WYSIWYG field and an on-screen math keyboard (MathLive) instead of hand-writing
 * LaTeX — but the field still emits LaTeX, so the submission pipeline is unchanged.
 */
const MathEditor: React.FC<MathEditorProps> = ({ value, onChange }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<MathfieldElement | null>(null);
  const [showLatex, setShowLatex] = useState(false);

  // Keep the latest onChange callback without re-creating the field.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Create the math field once and wire up its input event.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const field = new MathfieldElement();
    field.value = value;
    // NOTE: we render our own placeholder overlay below instead of the
    // math-field `placeholder` attribute — MathLive typesets that text as math,
    // which collapses the spaces ("Type your answer" → "Typeyouranswer").
    field.mathVirtualKeyboardPolicy = "auto"; // touch: on focus; desktop: via the button
    field.className =
      "block w-full bg-transparent text-gray-900 dark:text-gray-100";
    field.style.fontSize = "1.25rem";
    field.style.padding = "1rem";

    const handleInput = () => onChangeRef.current(field.value);
    field.addEventListener("input", handleInput);

    // Make Enter insert a single LaTeX line break so a student can write a
    // multi-line answer. We listen in the CAPTURE phase and stop propagation so
    // MathLive's own keydown handler (on its shadow-DOM sink) never runs —
    // otherwise it inserts a line break too and Enter jumps two lines.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        field.insert("\\\\", { focus: true });
      }
    };
    field.addEventListener("keydown", handleKeyDown, { capture: true });

    host.appendChild(field);
    fieldRef.current = field;

    return () => {
      field.removeEventListener("input", handleInput);
      field.removeEventListener("keydown", handleKeyDown, { capture: true });
      field.remove();
      fieldRef.current = null;
    };
    // value is intentionally read only for the initial mount; later changes are
    // synced by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push external value changes (challenge switch, localStorage restore) into the field.
  useEffect(() => {
    const field = fieldRef.current;
    if (field && field.value !== value) {
      field.value = value;
    }
  }, [value]);

  const toggleKeyboard = useCallback(() => {
    const keyboard = window.mathVirtualKeyboard;
    keyboard.visible = !keyboard.visible;
    fieldRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
        <span className="eyebrow">
          Your Answer
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleKeyboard}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            Math Keyboard
          </button>
          <button
            type="button"
            onClick={() => setShowLatex((s) => !s)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            {showLatex ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {showLatex ? "Hide" : "Show"} LaTeX
          </button>
        </div>
      </div>

      {/* WYSIWYG math field (MathLive mounts here) */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={hostRef}
          className="absolute inset-0 overflow-y-auto bg-white dark:bg-[#161b22] flex items-start"
        />
        {/* Custom placeholder — see note in the field effect above. */}
        {!value.trim() && (
          <span className="pointer-events-none absolute left-4 top-4 text-[1.25rem] leading-none text-gray-400 dark:text-gray-500 select-none">
            Type your answer or use the math keyboard…
          </span>
        )}
      </div>

      {/* Raw LaTeX — what actually gets submitted */}
      {showLatex && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
            <span className="eyebrow">
              LaTeX Source
            </span>
          </div>
          <div className="p-3 bg-white dark:bg-[#0d1117] max-h-[120px] overflow-y-auto">
            <code className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
              {value.trim() || "—"}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathEditor;
