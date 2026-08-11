import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, ShieldCheck, ShoppingBag, Sparkles, Truck, Undo2 } from "lucide-react";

import cn from "../../../../lib/cn";

/**
 * Shared frame for the sign-in, sign-up, OTP and password screens.
 *
 * The showcase panel is a constant deep neutral in both themes rather than a
 * role token. `surface-inverse` flips to near-white on the dark theme, which
 * put a glaring slab beside a dark form; filling it with the accent instead
 * turned two thirds of the screen into saturated colour. A fixed dark field
 * with the accent used only for the glow and the small marks keeps the accent
 * meaningful and leaves the form as the brightest thing on the page.
 */

const HIGHLIGHTS = [
  { icon: Truck, title: "Free delivery", body: "On every order above ₹499." },
  { icon: ShieldCheck, title: "Secure checkout", body: "Card, UPI and net banking." },
  { icon: Undo2, title: "7-day returns", body: "No explanation needed." },
];

/** Entrance for the form column: children arrive in sequence, not all at once. */
export const formStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const formItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const AuthShell = ({ title, description, children, footer, badge }) => (
  <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,26rem)_1fr] xl:grid-cols-[minmax(0,30rem)_1fr]">
    {/* ------------------------------- Showcase ------------------------------- */}
    {/* The right border carries the seam on the dark theme, where the panel and
        the form surface sit only a few steps apart in lightness. */}
    <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#0c1116] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      {/* One soft accent glow, drawn from the live accent token so the panel
          still re-themes, without flooding the whole surface with it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--accent-solid)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-20 h-[24rem] w-[24rem] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "var(--accent-solid)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <Link to="/" className="relative z-10 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md text-accent-on"
          style={{ background: "var(--accent-solid)" }}
        >
          <ShoppingBag size={17} />
        </span>
        <span className="text-[1.0625rem] font-semibold tracking-tight text-white">Planet</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 my-10"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.75rem] font-medium text-white/90 backdrop-blur">
          <Sparkles size={12} />
          Trusted by 40,000 shoppers
        </span>

        <blockquote className="mt-6">
          <Quote size={22} className="mb-3 text-white/30" aria-hidden="true" />
          <p className="text-[1.5rem] font-semibold leading-[1.35] tracking-tight text-white">
            A smaller catalogue, chosen so we can stand behind every item in it.
          </p>
        </blockquote>

        <ul className="mt-9 space-y-4">
          {HIGHLIGHTS.map((item, index) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.25 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-start gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
                <item.icon size={15} />
              </span>
              <span className="pt-0.5">
                <span className="block text-[0.875rem] font-medium text-white">{item.title}</span>
                {/* White at 70% clears 4.5:1 on this field; the 75%-opacity
                    accent-on ink used before was unreadable. */}
                <span className="block text-[0.8125rem] leading-relaxed text-white/70">
                  {item.body}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <p className="relative z-10 text-[0.75rem] text-white/45">
        © {new Date().getFullYear()} Planet
      </p>
    </aside>

    {/* --------------------------------- Form --------------------------------- */}
    <div className="flex items-center justify-center px-5 py-12 sm:px-10">
      <motion.div
        variants={formStagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[24rem]"
      >
        <motion.div variants={formItem} className="mb-8 flex items-center justify-between gap-3">
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

        {/* The mark repeats here for the narrow layout, where the panel is gone. */}
        <motion.div variants={formItem} className="mb-6 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-on">
            <ShoppingBag size={18} />
          </span>
        </motion.div>

        <motion.h1
          variants={formItem}
          className="text-[1.75rem] font-semibold leading-tight tracking-tight text-content"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p variants={formItem} className="type-description mt-2">
            {description}
          </motion.p>
        )}

        <motion.div variants={formItem} className="mt-8">
          {children}
        </motion.div>

        {footer && (
          <motion.div variants={formItem} className="mt-7 type-body text-content-secondary">
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
