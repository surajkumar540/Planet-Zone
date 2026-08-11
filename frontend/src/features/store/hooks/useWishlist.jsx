import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addToWishlist, getWishlist, removeFromWishlist } from "../../../api/storeApi";
import { useToast } from "../../../components/ui/Toast";
import { useSession } from "./useStorefront";

const WishlistContext = createContext(null);

/**
 * The wishlist, held once for the whole storefront.
 *
 * It lives on the server so it follows a customer between devices, which means
 * every product tile would otherwise need its own request to know whether its
 * heart is filled. Loading the list once and sharing it keeps that to a single
 * call per session.
 */
export const WishlistProvider = ({ children }) => {
  const { isLoggedIn } = useSession();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

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
    async (product) => {
      if (!isLoggedIn) {
        toast.info("Sign in to save items", "Your wishlist follows you between devices.");
        navigate("/login", { state: { from: window.location.pathname } });
        return;
      }

      const id = String(product._id);
      const saved = ids.has(id);

      // Update first, reconcile with the server's copy on the way back: the
      // heart has to respond to the click immediately.
      setItems((current) =>
        saved ? current.filter((item) => String(item._id) !== id) : [...current, product]
      );

      try {
        const response = saved ? await removeFromWishlist(id) : await addToWishlist(id);
        setItems(response?.data || []);
        toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
      } catch (error) {
        setItems((current) =>
          saved ? [...current, product] : current.filter((item) => String(item._id) !== id)
        );
        toast.error(
          error?.response?.data?.message || "Could not update your wishlist. Try again."
        );
      }
    },
    [ids, isLoggedIn, navigate, toast]
  );

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
