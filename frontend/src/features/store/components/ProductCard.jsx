import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, ShoppingBag, SlidersHorizontal } from "lucide-react";

import cn from "../../../lib/cn";
import { Price, Rating } from "./Primitives";
import { useCart } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";

/**
 * The catalogue tile.
 *
 * One component for every grid on the storefront, so a product reads the same
 * on the home page, in search results and in a category listing.
 *
 * Products with variants cannot be added from here — the customer has to pick
 * a size or colour first — so their button opens the product page instead of
 * adding a line checkout would later reject.
 */
const ProductCard = ({ product, onToggleWishlist, isWishlisted = false }) => {
  const { add } = useCart();
  const notifyAdded = useCartFeedback();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const [justAdded, setJustAdded] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);

  const outOfStock = !product.hasVariants && product.countInStock <= 0;
  const lowStock = !outOfStock && product.countInStock > 0 && product.countInStock <= 5;
  const discount = product.discount > 0 ? Math.round(product.discount) : 0;
  const hoverImage = (product.images || []).find((image) => image && image !== product.image);

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    if (product.hasVariants) {
      navigate(`/product/${product._id}`);
      return;
    }
    add(product, 1);
    notifyAdded({ product, qty: 1, sourceEl: imageRef.current });
    setJustAdded(true);
  };

  const handleWishlist = () => {
    if (!isWishlisted) setHeartBurst((value) => value + 1);
    onToggleWishlist(product);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-xs transition-[box-shadow,border-color] duration-300 hover:border-line hover:shadow-lg"
    >
      {/* --------------------------------- Image -------------------------------- */}
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-square overflow-hidden bg-surface-sunken"
        aria-label={product.name}
      >
        <img
          ref={imageRef}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.06]",
            hoverImage && "group-hover:opacity-0"
          )}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {discount > 0 && !outOfStock && (
            <span className="rounded-full bg-status-critical px-2 py-0.5 text-[0.6875rem] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-surface-inverse px-2 py-0.5 text-[0.6875rem] font-semibold text-content-inverse">
              Sold out
            </span>
          )}
          {lowStock && (
            <span className="rounded-full bg-status-warning-bg px-2 py-0.5 text-[0.6875rem] font-semibold text-status-warning">
              Only {product.countInStock} left
            </span>
          )}
          {product.isFeatured && !outOfStock && (
            <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
              Featured
            </span>
          )}
        </div>
      </Link>

      {/* ------------------------------- Wishlist ------------------------------- */}
      {onToggleWishlist && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-content-secondary shadow-sm backdrop-blur transition-colors hover:text-status-critical"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isWishlisted}
        >
          <motion.span
            key={heartBurst}
            initial={heartBurst ? { scale: 0.4 } : false}
            animate={{ scale: [0.4, 1.3, 1] }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                isWishlisted && "fill-status-critical text-status-critical"
              )}
            />
          </motion.span>
          {/* A ring that expands once when an item is saved. */}
          <AnimatePresence>
            {heartBurst > 0 && isWishlisted && (
              <motion.span
                key={`ring-${heartBurst}`}
                aria-hidden="true"
                initial={{ scale: 0.6, opacity: 0.7 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-full border-2 border-status-critical"
              />
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* --------------------------------- Body --------------------------------- */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-content-muted">
          {product.brand}
        </p>

        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-content">
          <Link to={`/product/${product._id}`} className="transition-colors hover:text-accent-text">
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.numReviews} size={13} />

        <div className="mt-auto pt-2">
          <Price value={product.totalPrice} compareAt={discount ? product.price : 0} />

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={
              product.hasVariants ? `Choose options for ${product.name}` : `Add ${product.name} to bag`
            }
            className={cn(
              "mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg text-[0.8125rem] font-semibold transition-colors",
              "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-content-disabled",
              justAdded
                ? "bg-status-good text-white"
                : product.hasVariants
                  ? "border border-line text-content hover:border-accent hover:text-accent-text"
                  : "bg-accent-subtle text-accent-text hover:bg-accent hover:text-accent-on"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={justAdded ? "added" : "idle"}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                {justAdded ? (
                  <>
                    <Check size={15} strokeWidth={3} /> Added
                  </>
                ) : outOfStock ? (
                  "Sold out"
                ) : product.hasVariants ? (
                  <>
                    <SlidersHorizontal size={14} /> Choose options
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} /> Add to bag
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
