import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import cn from "../../lib/cn";

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, bar: "bg-status-good", iconClass: "text-status-good" },
  error: { icon: XCircle, bar: "bg-status-critical", iconClass: "text-status-critical" },
  warning: { icon: AlertTriangle, bar: "bg-status-warning", iconClass: "text-status-warning" },
  info: { icon: Info, bar: "bg-status-info", iconClass: "text-status-info" },
};

const DEFAULT_DURATION = 4500;

const ToastItem = ({ toast, onDismiss }) => {
  const tone = TONES[toast.tone] || TONES.info;
  const Icon = tone.icon;

  useEffect(() => {
    if (toast.duration === Infinity) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 460, damping: 34 }}
      className={cn(
        "relative flex items-start gap-3 w-[min(92vw,380px)] overflow-hidden",
        "rounded-lg border border-line bg-surface-overlay shadow-lg p-3.5 pl-4"
      )}
      role="status"
      aria-live="polite"
    >
      {/* Colour is doubled by the icon and the message, never carrying meaning alone. */}
      <span className={cn("absolute left-0 top-0 bottom-0 w-1", tone.bar)} aria-hidden="true" />

      <Icon size={18} className={cn("shrink-0 mt-0.5", tone.iconClass)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="type-body-strong text-content">{toast.title}</p>
        {toast.description && (
          <p className="type-caption mt-0.5 text-content-secondary">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 -m-1 rounded-sm text-content-muted hover:text-content hover:bg-surface-hover transition-colors"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
};

/**
 * Application-wide toast notifications.
 *
 * Rendered through a portal so a toast is never clipped by an ancestor's
 * overflow or stacking context.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => {
      const next = [...current, { id, duration: DEFAULT_DURATION, tone: "info", ...toast }];
      // Cap the stack so a burst of failures cannot bury the screen.
      return next.slice(-4);
    });
    return id;
  }, []);

  const value = useMemo(
    () => ({
      toast: push,
      success: (title, description) => push({ tone: "success", title, description }),
      error: (title, description) => push({ tone: "error", title, description }),
      warning: (title, description) => push({ tone: "warning", title, description }),
      info: (title, description) => push({ tone: "info", title, description }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[1400] flex flex-col items-end gap-2 pointer-events-none">
            <AnimatePresence initial={false}>
              {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                  <ToastItem toast={toast} onDismiss={dismiss} />
                </div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside a ToastProvider");
  return context;
};

export default ToastProvider;
