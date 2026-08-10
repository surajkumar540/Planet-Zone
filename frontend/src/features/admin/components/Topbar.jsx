import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, LogOut, Menu, Monitor, Moon, Palette, Store, Sun, User } from "lucide-react";
import { useTheme } from "../../../theme/ThemeProvider";
import { setLoggedOut } from "../../../redux/reducers/userSlice";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import Dropdown, {
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "../../../components/ui/Dropdown";
import cn from "../../../lib/cn";

const MODE_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Segmented control for the theme mode, kept within reach at all times. */
const ThemeToggle = () => {
  const { appearance, setThemeMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 p-0.5 rounded-md bg-surface-sunken border border-line-subtle"
    >
      {MODE_OPTIONS.map((option) => {
        const active = appearance.themeMode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => setThemeMode(option.value)}
            className={cn(
              "grid place-items-center w-7 h-7 rounded transition-colors",
              active
                ? "bg-surface text-accent-text shadow-xs"
                : "text-content-muted hover:text-content"
            )}
          >
            <option.icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

/**
 * Dashboard header.
 *
 * Sticky so the theme control and account menu stay reachable while a long
 * table scrolls beneath it.
 */
const Topbar = ({ onOpenMobileNav, lowStockCount = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appearance } = useTheme();
  const profile = useSelector((state) => state.user.userObj) || {};

  const handleSignOut = () => {
    dispatch(setLoggedOut());
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-topbar shrink-0",
        "flex items-center gap-3 px-4 sm:px-6",
        "bg-surface/85 backdrop-blur-md border-b border-line-subtle"
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        icon={Menu}
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="lg:hidden"
      />

      <div className="flex-1" />

      <ThemeToggle />

      <Button
        as="a"
        href="/"
        variant="ghost"
        size="icon-sm"
        icon={Store}
        aria-label="View storefront"
        title="View storefront"
        className="hidden sm:inline-flex"
      />

      {/* The count is the notification: an icon alone would not say what is wrong. */}
      <Dropdown
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Notifications${lowStockCount ? `, ${lowStockCount} low stock` : ""}`}
            className="relative"
          >
            <Bell size={17} aria-hidden="true" />
            {lowStockCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-status-critical text-white text-[10px] font-semibold grid place-items-center">
                {lowStockCount > 9 ? "9+" : lowStockCount}
              </span>
            )}
          </Button>
        }
      >
        <DropdownLabel>Notifications</DropdownLabel>
        {lowStockCount > 0 ? (
          <DropdownItem icon={Bell} onClick={() => navigate("/admin/inventory?lowStock=true")}>
            {lowStockCount} product{lowStockCount === 1 ? "" : "s"} low on stock
          </DropdownItem>
        ) : (
          <p className="px-3 py-2 type-caption">You are all caught up.</p>
        )}
      </Dropdown>

      <Dropdown
        trigger={
          <button
            type="button"
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="Account menu"
          >
            <Avatar
              size="sm"
              src={profile.avatar}
              firstName={profile.firstName}
              lastName={profile.lastName}
            />
            <span className="hidden sm:block text-left min-w-0">
              <span className="type-caption text-content font-medium block truncate max-w-[120px]">
                {profile.firstName || "Account"}
              </span>
              <span className="type-caption block capitalize">{profile.role || "staff"}</span>
            </span>
          </button>
        }
      >
        <DropdownLabel>{profile.email || "Signed in"}</DropdownLabel>
        <DropdownSeparator />
        <DropdownItem icon={User} onClick={() => navigate("/admin/settings?tab=profile")}>
          Profile
        </DropdownItem>
        <DropdownItem icon={Palette} onClick={() => navigate("/admin/settings?tab=appearance")}>
          Appearance
          <span className="ml-auto type-caption capitalize">{appearance.themeMode}</span>
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={LogOut} tone="danger" onClick={handleSignOut}>
          Sign out
        </DropdownItem>
      </Dropdown>
    </header>
  );
};

export default Topbar;
