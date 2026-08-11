import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";

import { getAllProducts } from "../../../api/productApi";
import { getCategoryTree } from "../../../api/storeApi";
import { useApi } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState } from "../../../components/ui/States";
import { Container, SectionHeading } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import { useWishlistToggle } from "../hooks/useWishlist";

const PROMISES = [
  { icon: Truck, title: "Free delivery", body: "On every order above ₹499, anywhere in India." },
  { icon: RefreshCw, title: "7-day returns", body: "Changed your mind? Send it back, no questions." },
  { icon: ShieldCheck, title: "Secure payments", body: "Cards, UPI and net banking via Razorpay." },
  { icon: BadgeCheck, title: "Quality checked", body: "Every batch inspected before it ships." },
];

/** A grid that holds its shape while the products for it are still loading. */
const ProductRow = ({ products, loading, error, onRetry, onToggleWishlist, isWishlisted }) => {
  if (error) return <ErrorState description={error} onRetry={onRetry} />;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="overflow-hidden rounded-lg border border-line-subtle">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted(product._id)}
        />
      ))}
    </div>
  );
};

const Home = () => {
  const { toggle, isWishlisted } = useWishlistToggle();

  const featured = useApi(getAllProducts, { isFeatured: true, limit: 4 });
  const newest = useApi(getAllProducts, { sort: "createdAt:desc", limit: 8 });
  const topRated = useApi(getAllProducts, { minRating: 4, sort: "rating:desc", limit: 4 });
  const { data: categories } = useApi(getCategoryTree, null);

  // Featured is curated and can legitimately be empty; fall back to the newest
  // products so the first band on the page is never blank.
  const heroProducts = featured.data?.length ? featured.data : newest.data?.slice(0, 4) || [];

  return (
    <>
      {/* ---------------------------------- Hero --------------------------------- */}
      <section className="border-b border-line-subtle bg-surface">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="type-overline mb-3 text-accent-text">New season, new shelf</p>
            <h1 className="type-display text-[2.5rem] leading-[1.1] text-content sm:text-[3.25rem]">
              Everyday essentials, chosen with care.
            </h1>
            <p className="type-description mt-4 max-w-[52ch] text-[1rem]">
              A tightly edited catalogue of products worth keeping — fairly priced, honestly
              described and delivered to your door.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/shop" variant="primary" size="lg" iconRight={ArrowRight}>
                Shop the catalogue
              </Button>
              <Button as={Link} to="/shop?sort=createdAt:desc" size="lg">
                See what&apos;s new
              </Button>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line-subtle pt-6">
              {[
                { label: "Products", value: "500+" },
                { label: "Cities served", value: "120" },
                { label: "Avg. rating", value: "4.6" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="type-caption text-content-muted">{stat.label}</dt>
                  <dd className="type-numeric mt-0.5 text-[1.375rem] font-semibold text-content">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            The hero art is the catalogue itself rather than a stock photo, so
            the first thing a visitor sees is something they can actually buy.
          */}
          <div className="grid grid-cols-2 gap-4">
            {heroProducts.slice(0, 4).map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group relative overflow-hidden rounded-xl border border-line-subtle bg-surface-sunken"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 type-caption font-medium text-white">
                  {product.name}
                </span>
              </Link>
            ))}
            {heroProducts.length === 0 &&
              [0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="aspect-square w-full rounded-xl" />
              ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------- Promises ------------------------------- */}
      <section className="border-b border-line-subtle bg-surface-sunken">
        <Container className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-accent-text">
                <promise.icon size={17} />
              </span>
              <div>
                <p className="type-body-strong text-content">{promise.title}</p>
                <p className="type-caption text-content-secondary">{promise.body}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ------------------------------- Categories ------------------------------ */}
      {categories?.length > 0 && (
        <Container className="py-section">
          <SectionHeading
            eyebrow="Browse"
            title="Shop by category"
            description="Jump straight to the shelf you came for."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-line-subtle bg-surface p-4 text-center transition-colors hover:border-accent hover:bg-accent-subtle"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken type-section-title text-content-secondary">
                    {category.name[0]}
                  </span>
                )}
                <span className="type-button text-content">{category.name}</span>
              </Link>
            ))}
          </div>
        </Container>
      )}

      {/* --------------------------------- Bands --------------------------------- */}
      <Container className="pb-section">
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured this week"
          action={
            <Button as={Link} to="/shop?isFeatured=true" variant="link" iconRight={ArrowRight}>
              View all
            </Button>
          }
        />
        <ProductRow
          products={heroProducts}
          loading={featured.loading && newest.loading}
          error={featured.error}
          onRetry={featured.refetch}
          onToggleWishlist={toggle}
          isWishlisted={isWishlisted}
        />
      </Container>

      <Container className="pb-section">
        <SectionHeading
          eyebrow="Just landed"
          title="New arrivals"
          action={
            <Button as={Link} to="/shop?sort=createdAt:desc" variant="link" iconRight={ArrowRight}>
              View all
            </Button>
          }
        />
        <ProductRow
          products={newest.data?.slice(0, 8) || []}
          loading={newest.loading}
          error={newest.error}
          onRetry={newest.refetch}
          onToggleWishlist={toggle}
          isWishlisted={isWishlisted}
        />
      </Container>

      {topRated.data?.length > 0 && (
        <Container className="pb-section">
          <SectionHeading
            eyebrow="Customer favourites"
            title="Rated four stars and above"
            action={
              <Button as={Link} to="/shop?minRating=4" variant="link" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          <ProductRow
            products={topRated.data}
            loading={topRated.loading}
            error={topRated.error}
            onRetry={topRated.refetch}
            onToggleWishlist={toggle}
            isWishlisted={isWishlisted}
          />
        </Container>
      )}
    </>
  );
};

export default Home;
