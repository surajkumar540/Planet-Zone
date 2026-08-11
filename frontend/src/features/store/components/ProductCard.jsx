import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";

import cn from "../../../lib/cn";
import Button from "../../../components/ui/Button";
import { Price, ProductImage, Rating } from "./Primitives";
import { useCart } from "../hooks/useStorefront";
import { useToast } from "../../../components/ui/Toast";

/**
 * The catalogue tile.
 *
 * One component for every grid on the storefront, so a product reads the same
 * on the home page, in search results and in a category listing.
 */
const ProductCard = ({ product, onToggleWishlist, isWishlisted = false }) => {
  const { add } = useCart();
  const toast = useToast();

  const outOfStock = !product.hasVariants && product.countInStock <= 0;
  const lowStock = !outOfStock && product.countInStock > 0 && product.countInStock <= 5;

  const handleAdd = () => {
    // Variants have to be chosen on the detail page; adding blind would pick
    // one for the customer.
    add(product, 1);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface transition-shadow duration-200 hover:shadow-md">
      <Link to={`/product/${product._id}`} className="relative block">
        <ProductImage src={product.image} alt={product.name} />

        {(outOfStock || lowStock || product.isFeatured) && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-sm px-2 py-0.5 type-caption font-medium",
              outOfStock && "bg-surface-inverse text-content-inverse",
              !outOfStock && lowStock && "bg-status-warning-bg text-status-warning",
              !outOfStock && !lowStock && "bg-accent-subtle text-accent-text"
            )}
          >
            {outOfStock ? "Sold out" : lowStock ? `Only ${product.countInStock} left` : "Featured"}
          </span>
        )}
      </Link>

      {onToggleWishlist && (
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-content-secondary shadow-sm backdrop-blur transition-colors hover:text-status-critical"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isWishlisted}
        >
          <Heart
            size={16}
            className={cn(isWishlisted && "fill-status-critical text-status-critical")}
          />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="type-caption uppercase tracking-wide text-content-muted">{product.brand}</p>

        <h3 className="type-card-title line-clamp-2 text-content">
          <Link to={`/product/${product._id}`} className="hover:text-accent-text">
            {product.name}
          </Link>
        </h3>

        <Rating value={product.rating} count={product.numReviews} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price value={product.totalPrice} compareAt={product.discount ? product.price : 0} />
          <Button
            size="icon-sm"
            variant="subtle"
            icon={ShoppingBag}
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to bag`}
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
