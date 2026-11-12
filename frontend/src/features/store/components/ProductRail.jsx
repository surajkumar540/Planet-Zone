import ProductCard from "./ProductCard";
import { SectionHeading } from "./Primitives";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState } from "../../../components/ui/States";
import { useWishlistToggle } from "../hooks/useWishlist";
import cn from "../../../lib/cn";

/**
 * A titled row of product cards, used by every recommendation section.
 *
 * `caption(product)` adds one line under a card explaining why it is there
 * ("Because you viewed Laptops", "Save ₹2,000"). An empty result renders
 * `empty` when given, otherwise nothing, so optional sections simply vanish.
 */
const ProductRail = ({ eyebrow, title, description, action, products, loading, error, onRetry, caption, empty, columns = 4, className }) => {
  const { toggle, isWishlisted } = useWishlistToggle();
  const grid = cn("grid grid-cols-2 gap-3 sm:gap-4", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3");

  if (!loading && !error && !products?.length && !empty) return null;

  return (
    <section className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} action={action} />
      {error ? (
        <ErrorState description={error} onRetry={onRetry} />
      ) : loading && !products?.length ? (
        <div className={grid}>
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-line-subtle">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-3.5">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : products?.length ? (
        <div className={grid}>
          {products.map((product) => (
            <div key={product._id} className="flex flex-col gap-1.5">
              <ProductCard product={product} onToggleWishlist={toggle} isWishlisted={isWishlisted(product._id)} />
              {caption && caption(product) && (
                <p className="px-1 type-caption text-accent-text">{caption(product)}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        empty
      )}
    </section>
  );
};

export default ProductRail;
