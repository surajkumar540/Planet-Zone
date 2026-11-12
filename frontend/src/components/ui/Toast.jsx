import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import cn from "../../lib/cn";

const ToastContext = createContext(null);

/*
 * Snackbar-style notifications.
 *
 * Inverted against the page (dark on the light theme, light on the dark one),
 * so a toast never blends into the cards behind it. Each tone has a filled
 * badge with a white glyph, which reads the same on either inverse surface.
 * A thin bar shows the time left; hovering pauses it, and a toast can be
 * swiped away or carry one action (such as Undo).
 */

const TONES = {
  success: { icon: Check, badge: "bg-status-good", bar: "bg-status-good" },
  error: { icon: X, badge: "bg-status-critical", bar: "bg-status-critical" },
  warning: { icon: AlertTriangle, badge: "bg-status-warning", bar: "bg-status-warning" },
  info: { icon: Info, badge: "bg-status-info", bar: "bg-status-info" },
};

const DEFAULT_DURATION = 4000;

const ToastItem = ({ toast, onDismiss }) => {
  const tone = TONES[toast.tone] || TONES.info;
  const Icon = tone.icon;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (toast.duration === Infinity || paused) return undefined;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [toast, onDismiss, paused]);

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80) onDismiss(toast.id);
      }}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 480, damping: 32 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "relative w-full overflow-hidden rounded-xl sm:w-[360px]",
        "bg-surface-inverse text-content-inverse shadow-xl ring-1 ring-black/5",
        "cursor-grab active:cursor-grabbing"
      )}
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 18, delay: 0.05 }}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
            tone.badge
          )}
          aria-hidden="true"
        >
          <Icon size={15} strokeWidth={2.75} />
        </motion.span>

        <div className="min-w-0 flex-1">
          <p className="text-[0.875rem] font-semibold leading-snug">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 truncate text-[0.8125rem] leading-snug opacity-70">
              {toast.description}
            </p>
          )}
        </div>

        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              onDismiss(toast.id);
            }}
            className="shrink-0 rounded-md px-2.5 py-1 text-[0.8125rem] font-semibold underline-offset-4 transition-opacity hover:underline hover:opacity-90"
          >
            {toast.action.label}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>

      {toast.duration !== Infinity && (
        <motion.span
          aria-hidden="true"
          className={cn("absolute bottom-0 left-0 h-[3px] origin-left", tone.bar)}
          style={{ width: "100%" }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: paused ? undefined : 0 }}
          transition={{ duration: remaining.current / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

/**
 * Application-wide toast notifications.
 *
 * Rendered through a portal so a toast is never clipped by an ancestor's
 * overflow or stacking context. Centred at the bottom on phones, where it is
 * in thumb reach; bottom-right on wider screens.
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
      return next.slice(-3);
    });
    return id;
  }, []);

  /** `options` may carry `{ action: { label, onClick }, duration }`. */
  const value = useMemo(
    () => ({
      toast: push,
      success: (title, description, options) => push({ tone: "success", title, description, ...options }),
      error: (title, description, options) =>
        push({ tone: "error", title, description, duration: 6000, ...options }),
      warning: (title, description, options) => push({ tone: "warning", title, description, ...options }),
      info: (title, description, options) => push({ tone: "info", title, description, ...options }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-3 bottom-4 z-[1400] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end">
            <AnimatePresence initial={false}>
              {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
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
