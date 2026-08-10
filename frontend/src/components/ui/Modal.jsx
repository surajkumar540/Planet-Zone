import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "./Button";
import cn from "../../lib/cn";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Accessible modal dialog.
 *
 * Closes on Escape and on backdrop click, locks background scroll while open,
 * keeps focus inside the dialog, and returns focus to the trigger on close.
 */
const Modal = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  closeOnBackdrop = true,
  children,
}) => {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      // Cycle focus within the dialog so tabbing cannot escape to the page.
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;

    // Compensate for the vanishing scrollbar so the page does not shift.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusTimer = setTimeout(() => {
      const target = dialogRef.current?.querySelector(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      target?.focus();
    }, 60);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "relative w-full bg-surface-overlay shadow-xl border border-line",
              // Full-width sheet on phones, centred dialog from small up.
              "rounded-t-xl sm:rounded-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col",
              SIZES[size] || SIZES.md
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line-subtle shrink-0">
                <div className="min-w-0">
                  {title && <h2 className="type-section-title text-content">{title}</h2>}
                  {description && <p className="type-description mt-1">{description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  icon={X}
                  onClick={onClose}
                  aria-label="Close dialog"
                />
              </div>
            )}

            <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-line-subtle shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

/**
 * Confirmation dialog for destructive or irreversible actions.
 *
 * Defaults the tone to danger, because that is what it is almost always used
 * for, and keeps the cancel action first so the safe choice is nearest.
 */
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    title={title}
    description={description}
    size="sm"
    closeOnBackdrop={!loading}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="type-body text-content-secondary">
      This action cannot be undone. Please confirm you want to continue.
    </p>
  </Modal>
);

export default Modal;
