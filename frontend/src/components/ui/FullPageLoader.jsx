import { Loader2 } from "lucide-react";

/**
 * Whole-page loading state, used while the session is being restored.
 *
 * Painted on the themed canvas rather than a hard-coded white, so a customer
 * on the dark theme does not get a flash of light before the app appears.
 */
const FullPageLoader = ({ label = "Loading" }) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-canvas"
  >
    <Loader2 size={26} className="animate-spin text-accent" aria-hidden="true" />
    <p className="type-caption text-content-muted">{label}</p>
  </div>
);

export default FullPageLoader;
