import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Scale, X } from "lucide-react";

import { COMPARE_LIMIT, useCompare } from "../hooks/useCompare";

/**
 * The bar that appears once something is added to compare: thumbnails of the
 * chosen products, empty slots, and a button to the comparison. Hidden on the
 * compare page itself.
 */
const CompareTray = () => {
  const compare = useCompare();
  const { pathname } = useLocation();
  if (!compare) return null;
  const { items, remove, clear } = compare;
  const visible = items.length > 0 && pathname !== "/compare";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="fixed inset-x-3 bottom-[5.25rem] z-[65] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface-overlay p-2.5 shadow-2xl sm:bottom-5 sm:left-5 sm:right-auto sm:mx-0 print:hidden"
          role="region"
          aria-label="Products to compare"
        >
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text sm:flex">
            <Scale size={18} />
          </span>
          <div className="flex flex-1 gap-2">
            {Array.from({ length: COMPARE_LIMIT }, (_, index) => {
              const item = items[index];
              return item ? (
                <div key={item._id} className="group relative">
                  <img src={item.image} alt={item.name} title={item.name} className="h-12 w-12 rounded-lg border border-line-subtle bg-white object-cover" />
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    aria-label={`Remove ${item.name} from compare`}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-content text-surface shadow"
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <span key={index} className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-line text-[0.625rem] text-content-muted">
                  Add
                </span>
              );
            })}
          </div>
          <button type="button" onClick={clear} className="hidden px-2 type-caption text-content-muted hover:text-content sm:block">
            Clear
          </button>
          <Link
            to="/compare"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-[0.875rem] font-semibold text-accent-on transition-opacity hover:opacity-90"
          >
            Compare {items.length}
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareTray;
