import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "../../../components/ui/Toast";

/**
 * The compare list: up to three products, remembered in this browser.
 *
 * Only ids and a tiny preview (name, image) are kept, so the tray can show
 * thumbnails instantly; the compare page always loads fresh prices and stock.
 */
const KEY = "planet.compare";
export const COMPARE_LIMIT = 3;

const CompareContext = createContext(null);

const load = () => {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(items) ? items.slice(0, COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
};

export const CompareProvider = ({ children }) => {
  const toast = useToast();
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable: the list lasts for this visit only.
    }
  }, [items]);

  const has = useCallback((id) => items.some((item) => item._id === id), [items]);

  const toggle = useCallback(
    (product) => {
      if (items.some((item) => item._id === product._id)) {
        setItems((current) => current.filter((item) => item._id !== product._id));
        return;
      }
      if (items.length >= COMPARE_LIMIT) {
        toast.info("Compare is full", `You can compare up to ${COMPARE_LIMIT} products. Remove one first.`);
        return;
      }
      setItems((current) => [...current, { _id: product._id, name: product.name, image: product.image }]);
    },
    [items, toast]
  );

  const remove = useCallback((id) => setItems((current) => current.filter((item) => item._id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, has, toggle, remove, clear }), [items, has, toggle, remove, clear]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

/** Null outside the storefront, so shared components can hide compare controls. */
export const useCompare = () => useContext(CompareContext);
