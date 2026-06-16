import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm action as destructive (red). Use for deletes. */
  danger?: boolean;
}

export interface AlertOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

interface DialogState {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel: boolean;
  danger: boolean;
}

interface ConfirmContextType {
  /** Ask the user to confirm; resolves true if confirmed, false if dismissed. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Show a single-button notice; resolves once acknowledged/dismissed. */
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const CLOSED: DialogState = {
  open: false,
  message: "",
  hideCancel: false,
  danger: false,
};

/**
 * App-wide custom confirm/alert dialogs. Replaces the native browser
 * `window.confirm` / `window.alert` prompts everywhere — every destructive
 * action (deletes, etc.) must route through `useConfirm`, never `window.confirm`.
 * Mount once, high in the tree (inside LocaleProvider so the dialog can translate).
 */
export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<DialogState>(CLOSED);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    setState((s) => ({ ...s, open: false }));
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(value);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setState({
          open: true,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel,
          cancelLabel: options.cancelLabel,
          hideCancel: false,
          danger: options.danger ?? false,
        });
      }),
    []
  );

  const alert = useCallback(
    (options: AlertOptions) =>
      new Promise<void>((resolve) => {
        // The dialog resolves with a boolean; for an alert we discard it.
        resolveRef.current = () => resolve();
        setState({
          open: true,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel,
          hideCancel: true,
          danger: options.danger ?? false,
        });
      }),
    []
  );

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        hideCancel={state.hideCancel}
        danger={state.danger}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
};

function useConfirmContext(hook: string): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error(`${hook} must be used within a ConfirmProvider`);
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = (): ConfirmContextType["confirm"] =>
  useConfirmContext("useConfirm").confirm;

// eslint-disable-next-line react-refresh/only-export-components
export const useAlert = (): ConfirmContextType["alert"] =>
  useConfirmContext("useAlert").alert;
