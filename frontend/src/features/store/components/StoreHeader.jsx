import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";

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
  const { count } = useCart();
  const { isLoggedIn, isAdmin, user } = useSession();
  const { isDark, setThemeMode } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [term, setTerm] = useState("");
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

  const submitSearch = (event) => {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

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
        scrolled || menuOpen
          ? "border-line-subtle bg-surface/80 shadow-sm backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-surface/40 backdrop-blur-md"
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

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-on">
            <ShoppingBag size={17} />
          </span>
          <span className="type-section-title text-[1.0625rem] tracking-tight text-content">
            Planet
          </span>
        </Link>

        <nav className="ml-4 hidden items-center lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="h-control w-full rounded-md border-[1.5px] border-line-strong bg-surface-sunken pl-9 pr-3 text-body text-content outline-none transition-colors placeholder:text-content-muted hover:border-content-muted focus:border-accent focus:bg-surface"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Button
            size="icon"
            variant="ghost"
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

          <Link
            to="/cart"
            className="relative flex h-control w-control items-center justify-center rounded-md text-content-secondary transition-colors hover:bg-surface-hover hover:text-content"
            aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 type-numeric text-[0.625rem] font-semibold text-accent-on">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex h-control items-center gap-2 rounded-md px-2 text-content-secondary transition-colors hover:bg-surface-hover"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-subtle type-caption font-semibold text-accent-text">
                  {(user?.firstName?.[0] || "U").toUpperCase()}
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
                    <MenuLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                  )}
                  <MenuLink to="/profile" icon={User} label="Profile" />
                  <MenuLink to="/orders" icon={Package} label="Orders" />
                  <MenuLink to="/wishlist" icon={Heart} label="Wishlist" />
                  <div className="my-1 h-px bg-line-subtle" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 type-button text-status-critical transition-colors hover:bg-status-critical-bg"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button as={Link} to="/login" size="sm" variant="primary" className="ml-1">
              Sign in
            </Button>
          )}
        </div>
      </Container>

      {menuOpen && (
        <div className="border-t border-line-subtle bg-surface lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            <form onSubmit={submitSearch} className="mb-2 md:hidden">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
                />
                <input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-control w-full rounded-md border-[1.5px] border-line-strong bg-surface-sunken pl-9 pr-3 text-body text-content outline-none focus:border-accent focus:bg-surface"
                />
              </div>
            </form>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/wishlist" className={navClass}>
              Wishlist
            </NavLink>
          </Container>
        </div>
      )}
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
