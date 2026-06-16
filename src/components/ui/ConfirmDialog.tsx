import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle } from "lucide-react";
import Button from "./Button";
import { useLocale } from "../../contexts/LocaleContext";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hide the cancel button → alert-style (single acknowledge button). */
  hideCancel?: boolean;
  /** Style the confirm action as destructive (red). */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The app's own confirmation/alert dialog — a styled, accessible replacement for
 * the native `window.confirm` / `window.alert` browser prompts. Presentational
 * only; the promise-based plumbing lives in `contexts/ConfirmContext.tsx`
 * (`useConfirm` / `useAlert`). Don't reach for `window.confirm` anywhere.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  hideCancel,
  danger,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    // Lock background scroll while the modal is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22]">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              danger
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            }`}
          >
            {danger ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <HelpCircle className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {message}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {!hideCancel && (
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel ?? t("Cancel")}
            </Button>
          )}
          <Button
            autoFocus
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel ?? t("Confirm")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
