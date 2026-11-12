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

/**
 * Comparing only makes sense between products of the same kind. Same
 * category always counts; these families also count (a shoe is a shoe).
 */
const FAMILIES = [
  ["Mens Shoes", "Womens Shoes"],
  ["Mens Watches", "Womens Watches"],
  ["Mens Shirts", "Tops"],
  ["Smartphones", "Tablets"],
  ["Beauty", "Skin Care"],
];
const familyOf = (category) => FAMILIES.find((family) => family.includes(category)) || [category];

/** True when `a` and `b` (category names) can be compared fairly. */
export const sameKind = (a, b) => !a || !b || a === b || familyOf(a).includes(b);


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

  /** Replaces the list with just this product (a fresh comparison). */
  const startWith = useCallback(
    (product) => setItems([{ _id: product._id, name: product.name, image: product.image, category: product.category }]),
    []
  );

  const toggle = useCallback(
    (product) => {
      if (items.some((item) => item._id === product._id)) {
        setItems((current) => current.filter((item) => item._id !== product._id));
        return;
      }
      // A different kind of product starts a new comparison, if the shopper wants.
      const other = items.find((item) => !sameKind(item.category, product.category));
      if (other) {
        toast.info(
          "Different kind of product",
          `You're comparing ${other.category || "other items"}. Compare like with like.`,
          {
            duration: 7000,
            action: {
              label: "Compare this instead",
              onClick: () => startWith(product),
            },
          }
        );
        return;
      }
      if (items.length >= COMPARE_LIMIT) {
        toast.info("Compare is full", `You can compare up to ${COMPARE_LIMIT} products. Remove one first.`);
        return;
      }
      setItems((current) => [...current, { _id: product._id, name: product.name, image: product.image, category: product.category }]);
    },
    [items, toast, startWith]
  );

  const remove = useCallback((id) => setItems((current) => current.filter((item) => item._id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  /** Keeps only the products matching `category` (fixes an older mixed list). */
  const keepKind = useCallback((category) => setItems((current) => current.filter((item) => sameKind(item.category, category))), []);
  const kind = items.find((item) => item.category)?.category || null;

  const value = useMemo(
    () => ({ items, has, toggle, remove, clear, keepKind, kind, startWith }),
    [items, has, toggle, remove, clear, keepKind, kind, startWith]
  );
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

/** Null outside the storefront, so shared components can hide compare controls. */
export const useCompare = () => useContext(CompareContext);
