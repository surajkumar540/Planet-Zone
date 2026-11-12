import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";
import Logo from "../../../components/ui/Logo";
import SearchBox from "./SearchBox";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileNav from "./MobileNav";
import { useI18n } from "../../../lib/i18n";

import cn from "../../../lib/cn";
import Button from "../../../components/ui/Button";
import { Container } from "./Primitives";
import { useCart, useSession } from "../hooks/useStorefront";
import { setLoggedOut } from "../../../redux/reducers/userSlice";
import { useTheme } from "../../../theme/ThemeProvider";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

/** Underlined active state, shared by the desktop bar and the drawer. */
const navClass = ({ isActive }) =>
  cn(
    "type-button rounded-sm px-3 py-2 transition-colors",
    isActive ? "text-accent-text" : "text-content-secondary hover:text-content"
  );

const StoreHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const { t } = useI18n();
  // Keeps the box showing the active query when the shop is opened from a search.
  const currentSearch = pathname === "/shop" ? new URLSearchParams(search).get("search") || "" : "";
  const { count, items: bagItems, subtotal } = useCart();
  const { isLoggedIn, isAdmin, user } = useSession();
  const { isDark, setThemeMode } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);

  // Increments when an added item lands in the bag, replaying the icon's pop.

  const [bump, setBump] = useState(0);

  useEffect(() => {

    const onBump = () => setBump((value) => value + 1);

    window.addEventListener("cart:bump", onBump);

    return () => window.removeEventListener("cart:bump", onBump);

  }, []);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);

  /*
   * The bar is glass over the page rather than a solid strip: at the top it is
   * mostly transparent so the hero reads as full-bleed, and it gains opacity,
   * a hairline and a shadow once content starts passing underneath — which is
   * the point at which text needs something to sit against.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route changes close both overlays; leaving one open would hang over the
  // new page with no obvious way back.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onPointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [accountOpen]);


  const signOut = () => {
    dispatch(setLoggedOut());
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        // A menu panel hangs off the bar on mobile, so it takes the solid
        // treatment while open regardless of scroll position.
        scrolled
          ? "border-line-subtle bg-[color-mix(in_srgb,var(--surface-default)_94%,transparent)] shadow-sm backdrop-blur-md"
          : "border-transparent bg-surface-canvas"
      )}
    >
      <Container className="flex h-16 items-center gap-3">
        <button
          type="button"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-content-secondary hover:bg-surface-hover lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center shrink-0" aria-label="Planet Zone home">
          <Logo size="md" animated />
        </Link>

        <nav className="ml-4 hidden items-center lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              {t(link.label)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <SearchBox initialValue={currentSearch} />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="hidden sm:inline-flex"
            icon={isDark ? Sun : Moon}
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          />

          <Button
            as={Link}
            to="/wishlist"
            size="icon"
            variant="ghost"
            icon={Heart}
            aria-label="Wishlist"
            className="hidden sm:inline-flex"
          />

          {/* Hovering the bag on desktop previews it, one click from checkout. */}
          <div className="group relative">
          <Link
            to="/cart"
            data-cart-target
            className="relative flex h-control w-control items-center justify-center rounded-md text-content-secondary transition-colors hover:bg-surface-hover hover:text-content"
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
          >
            <motion.span
              key={`bag-${bump}`}
              initial={bump ? { rotate: -18, scale: 1.25 } : false}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="flex"
            >
              <span className={count > 0 ? "bag-nudge flex" : "flex"}>
                <ShoppingBag size={18} />
              </span>
            </motion.span>
            {count > 0 && (
              <motion.span
                key={`badge-${bump}-${count}`}
                initial={bump ? { scale: 1.8 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 14 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 type-numeric text-[0.625rem] font-semibold text-accent-on">
                {count > 99 ? "99+" : count}
              </motion.span>
            )}
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 animate-ping rounded-full bg-accent opacity-30" aria-hidden="true" />
            )}
          </Link>

          {count > 0 && (
            <div className="invisible absolute right-0 top-full z-50 w-80 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
              <div className="rounded-2xl border border-line bg-surface-overlay p-4 shadow-xl">
                <p className="mb-3 flex items-center justify-between text-[0.875rem] font-semibold text-content">
                  {t("Your bag")}
                  <span className="type-caption font-normal text-content-muted">
                    {count === 1 ? t("Bag: 1 item") : t("Bag: {n} items", { n: count })}
                  </span>
                </p>
                <ul className="space-y-2.5">
                  {bagItems.slice(0, 3).map((item) => (
                    <li key={`${item._id}::${item.variantSku || ""}`} className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line-subtle object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-medium text-content">{item.name}</span>
                        <span className="block type-caption text-content-muted">× {item.qty}</span>
                      </span>
                      <span className="type-numeric text-[0.8125rem] font-semibold text-content">
                        ₹{Math.round(item.totalPrice * item.qty).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
                {bagItems.length > 3 && (
                  <p className="mt-2 type-caption text-content-muted">+{bagItems.length - 3} more</p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3">
                  <span className="type-caption text-content-secondary">Subtotal</span>
                  <span className="type-numeric font-semibold text-content">₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button as={Link} to="/cart" size="sm">{t("View bag")}</Button>
                  <Button as={Link} to="/checkout" size="sm" variant="primary" className="shine">{t("Checkout")}</Button>
                </div>
              </div>
            </div>
          )}
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex h-control items-center gap-2 rounded-md px-2 text-content-secondary transition-colors hover:bg-surface-hover"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="avatar-ring flex">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface type-caption font-semibold text-accent-text">
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="type-button hidden max-w-[8rem] truncate lg:block">
                  {user?.firstName || "Account"}
                </span>
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1 w-52 animate-slide-up overflow-hidden rounded-md border border-line bg-surface-overlay p-1 shadow-lg"
                >
                  {isAdmin && (
                    <MenuLink to="/admin" icon={LayoutDashboard} label={t("Dashboard")} />
                  )}
                  <MenuLink to="/profile" icon={User} label={t("Profile")} />
                  <MenuLink to="/orders" icon={Package} label={t("Orders")} />
                  <MenuLink to="/wishlist" icon={Heart} label={t("Wishlist")} />
                  <div className="my-1 h-px bg-line-subtle" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 type-button text-status-critical transition-colors hover:bg-status-critical-bg"
                  >
                    <LogOut size={15} />
                    {t("Sign out")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button as={Link} to="/login" size="sm" variant="primary" className="shine ml-1">
              {t("Sign in")}
            </Button>
          )}
        </div>
      </Container>
      {pathname !== "/shop" && (
        <Container className="pb-2.5 md:hidden">
          <SearchBox size="sm" />
        </Container>
      )}

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onSignOut={signOut}
        isDark={isDark}
        onToggleTheme={() => setThemeMode(isDark ? "light" : "dark")}
        bagCount={count}
      />
    </header>
  );
};

const MenuLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    role="menuitem"
    className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 type-button text-content-secondary transition-colors hover:bg-surface-hover hover:text-content"
  >
    <Icon size={15} />
    {label}
  </Link>
);

export default StoreHeader;
