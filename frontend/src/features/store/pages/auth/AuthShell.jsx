import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import cn from "../../../../lib/cn";
import Logo from "../../../../components/ui/Logo";
import ProductWall from "../../../../components/ui/ProductWall";

/**
 * Shared frame for the sign-in, sign-up, OTP and password screens.
 *
 * One compact card, centred, and nothing competing with it. The previous
 * layout gave half of every desktop screen to a marketing column, and its
 * card did not fit a phone without scrolling; this one fits a 390 × 844
 * viewport with the keyboard closed.
 *
 * The backdrop is a soft brand-green glow plus one large, faint leaf. Both
 * use the --brand-* tokens, so they shift with the theme instead of being
 * painted for light mode only.
 */

/** Entrance for the card: one gentle rise, not a staggered sequence. */
const rise = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const Backdrop = () => (
  <>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(52rem 26rem at 50% -8%, color-mix(in srgb, var(--brand-leaf-from) 16%, transparent), transparent 70%)",
      }}
    />
    <ProductWall />
  </>
);

const AuthShell = ({ title, description, children, footer }) => (
  <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06100b] px-4 py-6 sm:py-10">
    <Backdrop />

    <motion.div
      variants={rise}
      initial="hidden"
      animate="visible"
      className="relative z-10 w-full max-w-[23rem]"
    >
      <div className="mb-4 flex items-center justify-between rounded-full bg-[color-mix(in_srgb,var(--surface-default)_80%,transparent)] px-3 py-1.5 shadow-sm backdrop-blur-md">
        <Link to="/" aria-label="Planet Zone home" className="rounded-md">
          <Logo size="md" animated />
        </Link>
        <Link
          to="/"
          className="group inline-flex items-center gap-1 type-caption text-content-muted transition-colors hover:text-content"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
          Shop
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-[color-mix(in_srgb,var(--surface-default)_97%,transparent)] p-5 shadow-2xl backdrop-blur-md sm:p-6">
        <h1 className="text-[1.25rem] font-semibold leading-tight tracking-tight text-content">
          {title}
        </h1>
        {description && (
          <p className="mt-1 type-caption leading-relaxed text-content-muted">{description}</p>
        )}
        <div className="mt-5">{children}</div>
      </div>

      {footer && (
        <p className="mx-auto mt-4 w-fit rounded-full bg-black/45 px-4 py-1.5 text-center type-caption text-white/85 shadow-sm ring-1 ring-white/10 backdrop-blur-md [&_a]:text-[#4ade80]">{footer}</p>
      )}
    </motion.div>
  </div>
);

/** Error banner shared by every auth form; compact so it does not push the form down far. */
export const AuthError = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto", x: [0, -5, 5, -3, 3, 0] }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ x: { duration: 0.35 }, height: { duration: 0.2 } }}
    role="alert"
    className="overflow-hidden"
  >
    <p className="rounded-md border border-status-critical bg-status-critical-bg px-3 py-2 type-caption text-status-critical">
      {children}
    </p>
  </motion.div>
);

/** The inline link style used in every auth footer. */
export const AuthLink = ({ to, children, className }) => (
  <Link
    to={to}
    className={cn(
      "font-medium text-accent-text underline-offset-4 transition-colors hover:underline",
      className
    )}
  >
    {children}
  </Link>
);

export default AuthShell;
