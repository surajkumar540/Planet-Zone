import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Heart,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import { fetchSingleProductApi, getAllProducts, saveProductReview } from "../../../api/productApi";
import { getProductReviewSummary, getProductReviews } from "../../../api/storeApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Textarea } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { formatDate, formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";
import { Container, Price, QuantityStepper, Rating, SectionHeading } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import { useCart, useSession } from "../hooks/useStorefront";
import { useWishlistToggle } from "../hooks/useWishlist";

const ProductDetail = () => {
  const { pid } = useParams();
  const toast = useToast();
  const { add } = useCart();
  const { isLoggedIn } = useSession();
  const { toggle, isWishlisted } = useWishlistToggle();

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [variantSku, setVariantSku] = useState(null);

  const { data: product, loading, error, refetch } = useApi(fetchSingleProductApi, pid);
  // `useApi` calls its fetcher with a single params argument, so the two-arg
  // review endpoint is adapted here rather than being reshaped in the API layer.
  const reviews = useApi(
    ({ id }) => getProductReviews(id, { limit: 10 }),
    { id: pid },
    { enabled: Boolean(pid) }
  );
  const { data: summary } = useApi(getProductReviewSummary, pid, { enabled: Boolean(pid) });

  const related = useApi(
    getAllProducts,
    product ? { category: product.category, limit: 5 } : null,
    { enabled: Boolean(product) }
  );

  /** The variant the customer has selected, or null when the product has none. */
  const variant = useMemo(() => {
    if (!product?.hasVariants) return null;
    const active = (product.variants || []).filter((item) => item.isActive !== false);
    return active.find((item) => item.sku === variantSku) || active[0] || null;
  }, [product, variantSku]);

  if (loading) return <ProductSkeleton />;
  if (error) {
    return (
      <Container className="py-16">
        <ErrorState description={error} onRetry={refetch} />
      </Container>
    );
  }
  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState title="Product not found" description="It may have been removed." />
      </Container>
    );
  }

  const gallery = [product.image, ...(product.images || [])].filter(Boolean);
  const pricing = variant || product;
  const stock = variant ? variant.countInStock : product.availableStock ?? product.countInStock;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    add(product, qty, variant);
    toast.success("Added to bag", `${qty} × ${product.name}`);
  };

  return (
    <>
      <Container className="py-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 type-caption">
          <Link to="/" className="text-content-muted hover:text-accent-text">
            Home
          </Link>
          <ChevronRight size={13} className="text-content-disabled" />
          <Link to="/shop" className="text-content-muted hover:text-accent-text">
            Shop
          </Link>
          <ChevronRight size={13} className="text-content-disabled" />
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="text-content-muted hover:text-accent-text"
          >
            {product.category}
          </Link>
          <ChevronRight size={13} className="text-content-disabled" />
          <span className="truncate text-content-secondary">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {/* -------------------------------- Gallery ------------------------------- */}
          <div>
            <div className="overflow-hidden rounded-xl border border-line-subtle bg-surface">
              <img
                src={gallery[activeImage] || product.image}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                      index === activeImage ? "border-accent" : "border-line-subtle"
                    )}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === activeImage}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------ Buy panel ------------------------------- */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <p className="type-caption uppercase tracking-wide text-content-muted">
              {product.brand}
            </p>
            <h1 className="type-page-title mt-1 text-content">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Rating value={product.rating} count={product.numReviews} size={16} />
              {product.sku && (
                <span className="type-caption type-numeric text-content-muted">
                  SKU {variant?.sku || product.sku}
                </span>
              )}
            </div>

            <div className="mt-5">
              <Price
                value={pricing.totalPrice}
                compareAt={pricing.discount ? pricing.price : 0}
                size="lg"
              />
              {pricing.gst > 0 && (
                <p className="type-caption mt-1 text-content-muted">
                  Inclusive of {pricing.gst}% GST
                </p>
              )}
            </div>

            {product.shortDescription && (
              <p className="type-description mt-4">{product.shortDescription}</p>
            )}

            {/* Variants */}
            {product.hasVariants && (
              <div className="mt-6">
                <h2 className="type-label mb-2 text-content">Choose an option</h2>
                <div className="flex flex-wrap gap-2">
                  {(product.variants || [])
                    .filter((item) => item.isActive !== false)
                    .map((item) => {
                      const selected = variant?.sku === item.sku;
                      const soldOut = item.countInStock <= 0;
                      return (
                        <button
                          key={item.sku}
                          type="button"
                          onClick={() => setVariantSku(item.sku)}
                          disabled={soldOut}
                          className={cn(
                            "rounded-md border px-3 py-2 type-button transition-colors",
                            selected
                              ? "border-accent bg-accent-subtle text-accent-text"
                              : "border-line text-content-secondary hover:border-line-strong",
                            soldOut && "cursor-not-allowed line-through opacity-50"
                          )}
                          aria-pressed={selected}
                        >
                          {Object.values(item.options || {}).join(" · ") || item.sku}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Stock */}
            <p
              className={cn(
                "mt-5 flex items-center gap-1.5 type-body",
                outOfStock
                  ? "text-status-critical"
                  : stock <= 5
                    ? "text-status-warning"
                    : "text-status-good"
              )}
            >
              <Check size={15} />
              {outOfStock
                ? "Out of stock"
                : stock <= 5
                  ? `Hurry — only ${stock} left`
                  : "In stock, ships in 24 hours"}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={qty}
                onChange={setQty}
                max={Math.max(1, Math.min(10, stock || 1))}
                disabled={outOfStock}
              />
              <Button
                variant="primary"
                size="lg"
                icon={ShoppingBag}
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex-1"
              >
                Add to bag
              </Button>
              <Button
                size="icon"
                variant="secondary"
                icon={Heart}
                onClick={() => toggle(product)}
                aria-label={isWishlisted(product._id) ? "Remove from wishlist" : "Save for later"}
                className={cn(
                  "h-control-lg w-control-lg",
                  isWishlisted(product._id) && "text-status-critical"
                )}
              />
            </div>

            <ul className="mt-6 space-y-2.5 rounded-lg border border-line-subtle bg-surface p-4">
              {[
                { icon: Truck, text: "Free delivery on orders above ₹499" },
                { icon: RefreshCw, text: "7-day easy returns" },
                { icon: ShieldCheck, text: "Secure payment via Razorpay" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 type-body text-content-secondary">
                  <item.icon size={15} className="text-content-muted" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ------------------------------ Description ----------------------------- */}
        <section className="mt-section grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="type-section-title mb-3 text-content">About this product</h2>
            <p className="type-body whitespace-pre-line text-content-secondary">
              {product.description}
            </p>
          </div>

          {product.attributes?.length > 0 && (
            <div>
              <h2 className="type-section-title mb-3 text-content">Specifications</h2>
              <dl className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle">
                {product.attributes.map((attribute) => (
                  <div key={attribute.code} className="flex gap-4 bg-surface px-4 py-2.5">
                    <dt className="w-40 shrink-0 type-body text-content-muted">
                      {attribute.name}
                    </dt>
                    <dd className="type-body text-content">{String(attribute.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {/* -------------------------------- Reviews ------------------------------- */}
        <ReviewSection
          productId={pid}
          product={product}
          summary={summary}
          reviews={reviews}
          isLoggedIn={isLoggedIn}
          onSaved={() => {
            reviews.refetch();
            refetch();
          }}
        />
      </Container>

      {/* -------------------------------- Related -------------------------------- */}
      {related.data?.length > 1 && (
        <Container className="pb-section">
          <SectionHeading title="You may also like" eyebrow={product.category} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.data
              .filter((item) => item._id !== product._id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                  onToggleWishlist={toggle}
                  isWishlisted={isWishlisted(item._id)}
                />
              ))}
          </div>
        </Container>
      )}
    </>
  );
};

/* ---------------------------------- Reviews --------------------------------- */

const ReviewSection = ({ productId, product, summary, reviews, isLoggedIn, onSaved }) => {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { mutate, loading } = useMutation((body) => saveProductReview(productId, body));

  const submit = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.warning("Pick a rating first");
      return;
    }
    try {
      await mutate({ rating, comment: comment.trim() });
      toast.success("Thanks for your review");
      setRating(0);
      setComment("");
      onSaved();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save your review");
    }
  };

  const total = summary?.total || product.numReviews || 0;

  return (
    <section className="mt-section">
      <h2 className="type-section-title mb-5 text-content">
        Reviews {total > 0 && <span className="text-content-muted">({formatNumber(total)})</span>}
      </h2>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <div className="rounded-lg border border-line-subtle bg-surface p-5">
            <p className="type-numeric text-[2.5rem] font-semibold leading-none text-content">
              {(summary?.average || product.rating || 0).toFixed(1)}
            </p>
            <Rating
              value={summary?.average || product.rating}
              count={total}
              showCount={false}
              className="mt-2"
            />

            {/* The histogram shows whether an average hides a split opinion. */}
            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary?.distribution?.[star] || 0;
                const share = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="type-caption type-numeric w-3 text-content-muted">{star}</span>
                    <Star size={11} className="text-content-muted" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className="h-full rounded-full bg-[var(--status-warning)]"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="type-caption type-numeric w-6 text-right text-content-muted">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {isLoggedIn ? (
            <form onSubmit={submit} className="mt-4 rounded-lg border border-line-subtle bg-surface p-5">
              <h3 className="type-card-title mb-3 text-content">Write a review</h3>

              <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    onClick={() => setRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      size={22}
                      className={cn(
                        star <= rating
                          ? "fill-[var(--status-warning)] text-[var(--status-warning)]"
                          : "text-line-strong"
                      )}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What did you think of it?"
                rows={4}
                required
                aria-label="Your review"
              />

              <Button type="submit" variant="primary" loading={loading} className="mt-3" fullWidth>
                Submit review
              </Button>
            </form>
          ) : (
            <div className="mt-4 rounded-lg border border-line-subtle bg-surface p-5">
              <p className="type-body text-content-secondary">
                <Link to="/login" className="text-accent-text hover:underline">
                  Sign in
                </Link>{" "}
                to share your experience with this product.
              </p>
            </div>
          )}
        </div>

        <div>
          {reviews.loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : reviews.data?.length ? (
            <ul className="space-y-4">
              {reviews.data.map((review) => (
                <li
                  key={review._id}
                  className="rounded-lg border border-line-subtle bg-surface p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle type-caption font-semibold text-accent-text">
                        {(review.name?.[0] || "?").toUpperCase()}
                      </span>
                      <div>
                        <p className="type-body-strong text-content">{review.name}</p>
                        <p className="type-caption text-content-muted">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Rating value={review.rating} showCount={false} />
                  </div>
                  <p className="type-body mt-3 whitespace-pre-line text-content-secondary">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Be the first to tell others what you think."
            />
          )}
        </div>
      </div>
    </section>
  );
};

const ProductSkeleton = () => (
  <Container className="py-8">
    <Skeleton className="mb-6 h-4 w-64" />
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </Container>
);

export default ProductDetail;
