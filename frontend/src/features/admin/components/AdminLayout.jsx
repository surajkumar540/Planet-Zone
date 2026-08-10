import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../../theme/ThemeProvider";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import cn from "../../../lib/cn";

/**
 * Shell for every dashboard route.
 *
 * The content column is offset by the rail's width on large screens and sits
 * full-bleed below that, where the sidebar becomes a drawer. An error boundary
 * wraps the outlet so a failing screen keeps its navigation.
 */
const AdminLayout = ({ lowStockCount }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { appearance } = useTheme();

  return (
    <div className="min-h-screen bg-surface-canvas">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-[padding] duration-200",
          appearance.sidebarCollapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar"
        )}
      >
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} lowStockCount={lowStockCount} />

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
