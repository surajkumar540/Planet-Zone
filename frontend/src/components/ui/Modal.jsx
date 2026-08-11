import { Modal as AntdModal } from "antd";
import { X } from "lucide-react";

import Button from "./Button";

/**
 * Dialog.
 *
 * Wraps Ant Design's Modal so the focus trap, scroll lock, Escape handling,
 * portalling and enter/exit motion come from a maintained implementation
 * rather than three hundred lines of our own. The props are unchanged, so
 * every call site is untouched.
 *
 * The close affordance uses the app's icon set: `closeIcon` takes a node, so
 * lucide stays the single source of iconography.
 */
const SIZES = {
  sm: 420,
  md: 560,
  lg: 720,
  xl: 960,
};

const Modal = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  closeOnBackdrop = true,
  children,
}) => (
  <AntdModal
    open={open}
    onCancel={onClose}
    width={SIZES[size] || SIZES.md}
    maskClosable={closeOnBackdrop}
    // `onClose` is absent while a dialog is mid-flight, which is how callers
    // express "not dismissible right now".
    closable={Boolean(onClose)}
    closeIcon={<X size={17} />}
    centered
    destroyOnHidden
    title={
      (title || description) && (
        <div className="pr-6">
          {title && <p className="type-section-title text-content">{title}</p>}
          {description && <p className="type-description mt-1 font-normal">{description}</p>}
        </div>
      )
    }
    footer={footer ? <div className="flex justify-end gap-2">{footer}</div> : null}
  >
    {children}
  </AntdModal>
);

/**
 * Confirmation dialog.
 *
 * Keeps the cancel action first so the safe choice is nearest, and states what
 * is about to happen rather than only asking whether the user is sure.
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
  children,
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
    {children || (
      <p className="type-body text-content-secondary">
        This action cannot be undone. Please confirm you want to continue.
      </p>
    )}
  </Modal>
);

export default Modal;
