import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addToWishlist, getWishlist, removeFromWishlist } from "../../../api/storeApi";
import { useToast } from "../../../components/ui/Toast";
import { getErrorMessage } from "../../../lib/apiError";
import { useSession } from "./useStorefront";

const WishlistContext = createContext(null);

/**
 * The wishlist, held once for the whole storefront.
 *
 * Toggling is fully optimistic: the heart and the confirmation change on the
 * click, and the server is updated in the background. The server's reply is
 * not written back over the list — with the database far away, a reply can
 * arrive after a newer click and would briefly undo it. Only a failure changes
 * the screen again, by rolling that one product back.
 *
 * Clicks on the same product are chained, so add-then-remove in quick
 * succession reaches the server in the order it was made.
 */
export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useSession();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Read inside `toggle` without making it change on every list update.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  // Per-product promise chain, so requests for one product never overtake each other.
  const queues = useRef(new Map());

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getWishlist();
      setItems(response?.data || []);
    } catch {
      // A wishlist that fails to load must not block the page it sits on.
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = useMemo(() => new Set(items.map((item) => String(item._id))), [items]);

  const toggle = useCallback(
    (product) => {
      if (!isLoggedIn) {
        toast.info("Sign in to save items", "Your wishlist follows you between devices.");
        navigate("/login", { state: { from: window.location.pathname } });
        return;
      }

      const id = String(product._id);
      const saved = itemsRef.current.some((item) => String(item._id) === id);

      const apply = (shouldBeSaved) =>
        setItems((current) => {
          const without = current.filter((item) => String(item._id) !== id);
          return shouldBeSaved ? [...without, product] : without;
        });

      apply(!saved);

      if (saved) {
        toast.success("Removed from wishlist", product.name, {
          action: { label: "Undo", onClick: () => toggleRef.current(product) },
        });
      } else {
        toast.success("Saved to wishlist", product.name, {
          action: { label: "View", onClick: () => navigate("/wishlist") },
        });
      }

      const previous = queues.current.get(id) || Promise.resolve();
      const next = previous
        .catch(() => {})
        .then(() => (saved ? removeFromWishlist(id) : addToWishlist(id)))
        .catch((error) => {
          apply(saved);
          toast.error(
            saved ? "Couldn't remove it" : "Couldn't save it",
            getErrorMessage(error, "Please try again.")
          );
        });
      queues.current.set(id, next);
    },
    [isLoggedIn, navigate, toast]
  );

  // Lets the Undo action call the latest toggle without a dependency cycle.
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;

  const value = useMemo(
    () => ({
      items,
      loading,
      refresh,
      toggle,
      isWishlisted: (productId) => ids.has(String(productId)),
    }),
    [items, loading, refresh, toggle, ids]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

/**
 * Wishlist access.
 *
 * Falls back to a no-op outside the provider so a component can be rendered in
 * isolation without crashing on a missing context.
 */
export const useWishlistToggle = () => {
  const context = useContext(WishlistContext);
  return (
    context || {
      items: [],
      loading: false,
      refresh: () => {},
      toggle: () => {},
      isWishlisted: () => false,
    }
  );
};

export default useWishlistToggle;
