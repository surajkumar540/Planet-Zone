import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Moon,
  Package,
  Scale,
  Shirt,
  ShoppingBag,
  Store,
  Sun,
  User,
  X,
} from "lucide-react";

import { getCategoryTree } from "../../../api/storeApi";
import { useApi } from "../../../hooks/useApi";
import { useI18n } from "../../../lib/i18n";
import Logo from "../../../components/ui/Logo";
import { Doodle } from "../../../components/ui/Doodles";
import cn from "../../../lib/cn";

const PRIMARY = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/try-on", label: "Try-On", icon: Shirt },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

/**
 * Slide-in navigation for phones and tablets.
 *
 * Holds everything the desktop header spreads across the bar: navigation,
 * departments, the account menu, language and theme. Closes on backdrop tap,
 * Escape, a left swipe, or any navigation (the header resets it on route change).
 */
const MobileNav = ({ open, onClose, user, isLoggedIn, isAdmin, onSignOut, isDark, onToggleTheme, bagCount }) => {
  const { t, lang, setLang, languages } = useI18n();
  const { data: tree } = useApi(getCategoryTree, null, { enabled: open, cacheTime: 5 * 60 * 1000 });

  // While open: Escape closes, and the page behind does not scroll.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const linkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors",
      isActive ? "bg-accent-subtle text-accent-text" : "text-content-secondary hover:bg-surface-hover hover:text-content"
    );

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-[22rem] flex-col overflow-hidden bg-surface shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.5, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -90 || info.velocity.x < -500) onClose();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3">
              <Link to="/" onClick={onClose} aria-label="Planet Zone home">
                <Logo size="md" animated />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-content-secondary hover:bg-surface-hover"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {/* Account card */}
              <div
                className="relative mb-4 overflow-hidden rounded-2xl p-4 text-white"
                style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}
              >
                <Doodle type="leaf" size={56} float className="absolute -right-2 -top-2 text-white opacity-25" />
                {isLoggedIn ? (
                  <Link to="/profile" onClick={onClose} className="relative flex items-center gap-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/60" />
                    ) : (
                      <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-[1.125rem] font-semibold ring-2 ring-white/40">
                        {initials}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || t("Your account")}
                      </span>
                      <span className="block truncate text-[0.8125rem] opacity-85">{user?.email}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 opacity-80" />
                  </Link>
                ) : (
                  <div className="relative">
                    <p className="font-display text-[1.25rem] font-semibold">Welcome to Planet Zone</p>
                    <p className="mt-0.5 text-[0.8125rem] opacity-85">Sign in to track orders and save favourites.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link to="/login" onClick={onClose} className="flex items-center justify-center gap-1.5 rounded-full bg-white py-2 text-[0.875rem] font-semibold text-[color:var(--promo-leaf-from)]">
                        <LogIn size={15} /> {t("Sign in")}
                      </Link>
                      <Link to="/signup" onClick={onClose} className="flex items-center justify-center rounded-full py-2 text-[0.875rem] font-semibold ring-1 ring-white/60">
                        Create account
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav aria-label="Primary" className="space-y-0.5">
                {PRIMARY.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={linkClass}>
                    <item.icon size={18} />
                    {t(item.label)}
                  </NavLink>
                ))}
                <NavLink to="/cart" onClick={onClose} className={linkClass}>
                  <ShoppingBag size={18} />
                  <span className="flex-1">{t("Your bag")}</span>
                  {bagCount > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[0.75rem] font-bold text-accent-on">{bagCount}</span>
                  )}
                </NavLink>
              </nav>

              {/* Departments */}
              {tree?.length > 0 && (
                <div className="mt-5">
                  <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-content-muted">
                    {t("Shop by department")}
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {tree.map((dept) => (
                      <Link
                        key={dept._id}
                        to={`/shop?dept=${dept._id}`}
                        onClick={onClose}
                        className="rounded-full border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-content-secondary transition-colors hover:border-accent hover:text-accent-text"
                      >
                        {dept.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Account links */}
              {isLoggedIn && (
                <div className="mt-5 space-y-0.5">
                  <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-content-muted">
                    {t("Account")}
                  </p>
                  {isAdmin && (
                    <NavLink to="/admin" onClick={onClose} className={linkClass}>
                      <LayoutDashboard size={18} /> {t("Dashboard")}
                    </NavLink>
                  )}
                  <NavLink to="/orders" onClick={onClose} className={linkClass}>
                    <Package size={18} /> {t("Your orders")}
                  </NavLink>
                  <NavLink to="/wishlist" onClick={onClose} className={linkClass}>
                    <Heart size={18} /> {t("Wishlist")}
                  </NavLink>
                  <NavLink to="/profile" onClick={onClose} className={linkClass}>
                    <User size={18} /> {t("Your profile")}
                  </NavLink>
                </div>
              )}

              {/* Preferences */}
              <div className="mt-5 space-y-3 rounded-2xl border border-line-subtle bg-surface-sunken p-3">
                <div>
                  <p className="pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-content-muted">{t("Language")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => setLang(language.code)}
                        aria-pressed={language.code === lang}
                        className={cn(
                          "rounded-full px-3 py-1 text-[0.8125rem] font-medium transition-colors",
                          language.code === lang
                            ? "bg-accent text-accent-on"
                            : "bg-surface text-content-secondary ring-1 ring-line hover:text-content"
                        )}
                      >
                        {language.native}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex w-full items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-[0.875rem] font-medium text-content ring-1 ring-line"
                >
                  <span className="flex items-center gap-2.5">
                    {isDark ? <Moon size={17} /> : <Sun size={17} />}
                    {isDark ? "Dark mode" : "Light mode"}
                  </span>
                  <span className={cn("relative h-5 w-9 rounded-full transition-colors", isDark ? "bg-accent" : "bg-line-strong")}>
                    <motion.span
                      layout
                      className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow", isDark ? "right-0.5" : "left-0.5")}
                    />
                  </span>
                </button>
              </div>
            </div>

            {isLoggedIn && (
              <div className="border-t border-line-subtle p-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[0.875rem] font-semibold text-status-critical transition-colors hover:bg-status-critical-bg"
                >
                  <LogOut size={16} /> {t("Sign out")}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
