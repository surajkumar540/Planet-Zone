import { Outlet } from "react-router-dom";

import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";
import { WishlistProvider } from "../hooks/useWishlist";

/**
 * Storefront shell.
 *
 * The header and footer render once for the whole shop; only the outlet
 * changes between routes, so navigation never re-mounts the chrome. The
 * wishlist provider sits here too, so its single fetch is shared by every
 * screen rather than repeated per product tile.
 */
const StoreLayout = () => (
  <WishlistProvider>
    <div className="flex min-h-screen flex-col bg-surface-canvas">
      <a
        href="#store-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:type-button focus:text-content focus:shadow-lg"
      >
        Skip to content
      </a>

      <StoreHeader />

      <main id="store-main" className="flex-1">
        <Outlet />
      </main>

      <StoreFooter />
    </div>
  </WishlistProvider>
);

export default StoreLayout;
