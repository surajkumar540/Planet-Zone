import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  FolderTree,
  LayoutDashboard,
  Mail,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "../../../theme/ThemeProvider";
import Button from "../../../components/ui/Button";
import cn from "../../../lib/cn";

/**
 * Navigation is grouped by the job being done rather than by data model, so
 * the day-to-day screens sit together and configuration stays out of the way.
 */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Customers",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
      { to: "/admin/messages", label: "Messages", icon: Mail },
    ],
  },
  {
    label: "Revenue",
    items: [
      { to: "/admin/coupons", label: "Discounts", icon: Tag },
      { to: "/admin/refunds", label: "Refunds", icon: RotateCcw },
      { to: "/admin/reports", label: "Reports", icon: Receipt },
    ],
  },
  {
    label: "Configuration",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const NavItem = ({ item, collapsed, onNavigate }) => (
  <NavLink
    to={item.to}
    end={item.end}
    onClick={onNavigate}
    // The label doubles as the tooltip when the rail is collapsed.
    title={collapsed ? item.label : undefined}
    className={({ isActive }) =>
      cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors type-body-strong",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-accent-subtle text-accent-text"
          : "text-content-secondary hover:bg-surface-hover hover:text-content"
      )
    }
  >
    {({ isActive }) => (
      <>
        {/* A rail marker so the active item is not signalled by colour alone. */}
        {isActive && !collapsed && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[var(--accent-solid)]"
            aria-hidden="true"
          />
        )}
        <item.icon size={18} className="shrink-0" aria-hidden="true" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </>
    )}
  </NavLink>
);

/**
 * Dashboard navigation.
 *
 * One component serves both layouts: a collapsible rail from `lg` up, and a
 * slide-over drawer below it. Keeping them together means a nav change cannot
 * drift between the two.
 */
const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { appearance, toggleSidebar } = useTheme();
  const collapsed = appearance.sidebarCollapsed;

  const content = (isCollapsed, onNavigate) => (
    <>
      <div
        className={cn(
          "flex items-center gap-2.5 h-topbar px-4 border-b border-line-subtle shrink-0",
          isCollapsed && "justify-center px-0"
        )}
      >
        <span className="w-8 h-8 rounded-md bg-accent text-accent-on grid place-items-center font-bold shrink-0">
          P
        </span>
        {!isCollapsed && (
          <span className="type-section-title text-content truncate">Planet</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4" aria-label="Dashboard">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!isCollapsed && <p className="type-overline px-3 mb-1.5">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  collapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30",
          "bg-surface border-r border-line-subtle transition-[width] duration-200",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar"
        )}
      >
        {content(collapsed)}

        <div className="p-2.5 border-t border-line-subtle shrink-0">
          <Button
            variant="ghost"
            size={collapsed ? "icon-sm" : "sm"}
            onClick={toggleSidebar}
            fullWidth={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(!collapsed && "justify-start")}
          >
            <ChevronLeft
              size={16}
              className={cn("transition-transform shrink-0", collapsed && "rotate-180")}
              aria-hidden="true"
            />
            {!collapsed && "Collapse"}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-black/50"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="relative flex flex-col h-full w-sidebar bg-surface border-r border-line-subtle"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                icon={X}
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="absolute top-3 right-3 z-10"
              />
              {content(false, onCloseMobile)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
