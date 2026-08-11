import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, ShoppingBag, Star, Truck, Undo2 } from "lucide-react";

import cn from "../../../../lib/cn";

/**
 * Shared frame for the sign-in, sign-up, OTP and password screens.
 *
 * Two fields side by side: a dark showcase column that carries the brand, and
 * a lit column holding the form on a raised card. The dark side is a constant
 * neutral in both themes — `surface-inverse` flips to near-white on the dark
 * theme, and filling it with the accent turned most of the viewport into
 * saturated colour. Here the accent does the lighting, not the covering.
 */

const HIGHLIGHTS = [
  { icon: Truck, title: "Free delivery", body: "On orders above ₹499" },
  { icon: ShieldCheck, title: "Secure checkout", body: "Card, UPI, net banking" },
  { icon: Undo2, title: "7-day returns", body: "No explanation needed" },
];

/** Entrance for the form column: children arrive in sequence, not all at once. */
export const formStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const formItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Slow-drifting accent light.
 *
 * Two blurred blobs on long, offset loops. The movement is barely perceptible
 * by design — enough that the panel is not a flat rectangle, not so much that
 * it pulls attention from the form.
 */
const AmbientLight = () => (
  <>
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -left-28 -top-24 h-[30rem] w-[30rem] rounded-full opacity-30 blur-[100px]"
      style={{ background: "var(--accent-solid)" }}
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-32 -right-24 h-[26rem] w-[26rem] rounded-full opacity-20 blur-[100px]"
      style={{ background: "var(--accent-solid)" }}
      animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
  </>
);

const AuthShell = ({ title, description, children, footer, badge }) => (
  <div className="grid min-h-screen bg-surface-canvas lg:grid-cols-[minmax(0,27rem)_1fr] xl:grid-cols-[minmax(0,32rem)_1fr]">
    {/* ------------------------------- Showcase ------------------------------- */}
    <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0b0f14] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      <AmbientLight />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Link to="/" className="relative z-10 flex w-fit items-center gap-2.5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg text-accent-on shadow-lg"
          style={{ background: "var(--accent-solid)" }}
        >
          <ShoppingBag size={18} />
        </span>
        <span className="text-[1.125rem] font-semibold tracking-tight text-white">Planet</span>
      </Link>

      <div className="relative z-10 my-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2rem] font-semibold leading-[1.2] tracking-tight text-white xl:text-[2.25rem]"
        >
          A smaller catalogue,
          <br />
          <span className="text-white/45">chosen with care.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed text-white/60"
        >
          We stock fewer things so we can stand behind every one of them.
        </motion.p>

        {/* Glass cards: the same three promises, given enough weight to be read
            rather than skimmed past as a bullet list. */}
        <ul className="mt-10 space-y-3">
          {HIGHLIGHTS.map((item, index) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.25 + index * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <item.icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.875rem] font-medium text-white">{item.title}</span>
                {/* White at 60% clears 4.5:1 on this field. */}
                <span className="block text-[0.8125rem] text-white/60">{item.body}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="flex -space-x-2" aria-hidden="true">
          {["#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"].map((colour, index) => (
            <span
              key={colour}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f14] text-[0.625rem] font-semibold text-white"
              style={{ background: colour }}
            >
              {["A", "R", "M", "K"][index]}
            </span>
          ))}
        </div>
        <div>
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={11} className="fill-amber-400 text-amber-400" />
            ))}
          </span>
          <p className="text-[0.75rem] text-white/55">
            <span className="font-medium text-white/80">4.6 out of 5</span> from 40,000 shoppers
          </p>
        </div>
      </motion.div>
    </aside>

    {/* --------------------------------- Form --------------------------------- */}
    <div className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-8">
      {/* A single wash of accent behind the card, so the lit side is not a flat
          slab of canvas and the card has something to lift off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-[0.07] blur-[110px]"
        style={{ background: "var(--accent-solid)" }}
      />

      <motion.div
        variants={formStagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[26rem]"
      >
        <motion.div variants={formItem} className="mb-5 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 type-caption text-content-muted transition-colors hover:text-accent-text"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to shop
          </Link>

          {badge && (
            <span className="rounded-full bg-accent-subtle px-2.5 py-1 type-caption font-medium text-accent-text">
              {badge}
            </span>
          )}
        </motion.div>

        <motion.div
          variants={formItem}
          className="rounded-2xl border border-line bg-surface p-7 shadow-xl sm:p-8"
        >
          {/* The mark repeats inside the card on narrow layouts, where the
              showcase column is not rendered at all. */}
          <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-on shadow-sm lg:hidden">
            <ShoppingBag size={19} />
          </span>

          <h1 className="text-[1.625rem] font-semibold leading-tight tracking-tight text-content">
            {title}
          </h1>
          {description && <p className="type-description mt-2">{description}</p>}

          <div className="mt-7">{children}</div>
        </motion.div>

        {footer && (
          <motion.div
            variants={formItem}
            className="mt-6 text-center type-body text-content-secondary"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </div>
  </div>
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
