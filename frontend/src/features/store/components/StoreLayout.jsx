import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
const StoreLayout = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  /*
   * Route transition.
   *
   * `mode="wait"` holds the incoming screen until the outgoing one has left,
   * so the two never overlap and shift the scroll position mid-flight. The
   * distance is deliberately small — a page that slides a long way reads as
   * slow once you have navigated three times.
   */
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] };

  return (
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={transition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <StoreFooter />
      </div>
    </WishlistProvider>
  );
};

export default StoreLayout;
