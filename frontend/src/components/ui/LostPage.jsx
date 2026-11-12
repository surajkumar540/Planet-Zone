import { motion } from "framer-motion";

import { Doodle } from "./Doodles";
import { LogoMark } from "./Logo";
import cn from "../../lib/cn";

/**
 * Friendly full-width screen for "not found" (404) and "no access" (403).
 *
 * A big code with the leaf orbiting it, a plain-language title and
 * explanation, then whatever ways out the caller passes (buttons, a search
 * box, links). Shared by the storefront and the dashboard.
 */
const LostPage = ({ code = "404", title, description, actions, children, compact = false, className }) => (
  <section
    className={cn(
      "relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center",
      compact ? "py-12" : "py-16 sm:py-24",
      className
    )}
  >
    <Doodle type="sparkle" size={26} float className="absolute left-[12%] top-10 text-accent-text opacity-50" />
    <Doodle type="star" size={18} float delay={0.6} className="absolute right-[14%] top-24 text-accent-text opacity-40" />
    <Doodle type="circle" size={34} float delay={0.3} className="absolute bottom-16 left-[8%] text-accent-text opacity-25" />

    <div className="relative">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="font-display select-none bg-clip-text text-[6.5rem] font-bold leading-none tracking-tight text-transparent sm:text-[9rem]"
        style={{ backgroundImage: "linear-gradient(135deg, var(--brand-leaf-to), var(--brand-leaf-from))" }}
        aria-hidden="true"
      >
        {code}
      </motion.p>
      {/* The leaf orbits the number, a little lost itself. */}
      <motion.span
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <span className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-surface p-1.5 shadow-md ring-1 ring-line-subtle">
          <LogoMark size={26} animated />
        </span>
      </motion.span>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="mt-6"
    >
      <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-content sm:text-[2.125rem]">{title}</h1>
      {description && <p className="mx-auto mt-2 max-w-[46ch] type-body text-content-secondary">{description}</p>}
    </motion.div>

    {actions && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-7 flex flex-wrap justify-center gap-2"
      >
        {actions}
      </motion.div>
    )}
    {children && <div className="mt-8 w-full">{children}</div>}
  </section>
);

export default LostPage;
