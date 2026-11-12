import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";

import { getAllProducts } from "../../../api/productApi";
import { getCategoryTree } from "../../../api/storeApi";
import { useApi } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState } from "../../../components/ui/States";
import { Doodle, Reveal } from "../../../components/ui/Doodles";
import { Container, SectionHeading } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import DealOfTheDay from "../components/DealOfTheDay";
import { useWishlistToggle } from "../hooks/useWishlist";
import { useI18n } from "../../../lib/i18n";
import PersonalRails from "../components/PersonalRails";

const PROMISES = [
  { icon: Truck, title: "Free delivery", body: "On orders above ₹499" },
  { icon: RefreshCw, title: "7-day returns", body: "No questions asked" },
  { icon: ShieldCheck, title: "Secure payments", body: "Cards, UPI, net banking" },
  { icon: BadgeCheck, title: "Quality checked", body: "Inspected before it ships" },
];

/** A grid that holds its shape while the products for it are still loading. */
const ProductRow = ({ products, loading, error, onRetry, onToggleWishlist, isWishlisted }) => {
  if (error) return <ErrorState description={error} onRetry={onRetry} />;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-line-subtle">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Reveal stagger={0.07} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <Reveal.Item key={product._id}>
          <ProductCard
            product={product}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={isWishlisted(product._id)}
          />
        </Reveal.Item>
      ))}
    </Reveal>
  );
};

/** Unique by id, keeping the first occurrence. */
const uniqueProducts = (...lists) => {
  const seen = new Map();
  for (const product of lists.flat()) {
    if (product && !seen.has(product._id)) seen.set(product._id, product);
  }
  return [...seen.values()];
};

const Home = () => {
  const { t } = useI18n();
  const { toggle, isWishlisted } = useWishlistToggle();

  const featured = useApi(getAllProducts, { isFeatured: true, limit: 4 });
  const newest = useApi(getAllProducts, { sort: "createdAt:desc", limit: 8 });
  const topRated = useApi(getAllProducts, { minRating: 4, sort: "rating:desc", limit: 4 });
  const { data: categories } = useApi(getCategoryTree, null, { cacheTime: 5 * 60 * 1000 });

  // Featured is curated and can legitimately be empty; fall back to the newest
  // products so the first band on the page is never blank.
  const heroProducts = featured.data?.length ? featured.data : newest.data?.slice(0, 4) || [];

  const everything = useMemo(
    () => uniqueProducts(newest.data || [], featured.data || [], topRated.data || []),
    [newest.data, featured.data, topRated.data]
  );
  const byDiscount = useMemo(
    () => [...everything].sort((a, b) => (b.discount || 0) - (a.discount || 0)),
    [everything]
  );
  const maxDiscount = Math.round(byDiscount[0]?.discount || 0);
  // Each banner photo links to its product, so the banner carries the id and name too.
  const imagesOf = (list) =>
    list.filter((product) => product.image).map((product) => ({ src: product.image, id: product._id, name: product.name }));

  // Banner copy is derived from the catalogue: a discount is only promised
  // when a product actually has one.
  const slides = [
    {
      id: "new",
      palette: "leaf",
      eyebrow: t("Just landed"),
      title: t("New season, new shelf"),
      body: t("Fresh picks added this week. Be the first to find your new favourite."),
      cta: { label: t("Shop new arrivals"), to: "/shop?sort=createdAt:desc" },
      images: imagesOf(newest.data || []),
    },
    {
      id: "deals",
      palette: "sun",
      eyebrow: maxDiscount > 0 ? t("Limited time") : t("Everyday value"),
      title: maxDiscount > 0 ? t("Save up to {n}%", { n: maxDiscount }) : t("Prices you'll love"),
      body:
        maxDiscount > 0
          ? t("On selected essentials while stocks last.")
          : t("Fairly priced essentials, delivered across India."),
      cta: { label: maxDiscount > 0 ? t("Shop the deals") : t("Browse the shop"), to: "/shop?sort=totalPrice:asc" },
      images: imagesOf(byDiscount),
    },
    {
      id: "delivery",
      palette: "dusk",
      eyebrow: t("On us"),
      title: t("Free delivery over ₹499"),
      body: t("Plus 7-day easy returns on every order. No fine print."),
      cta: { label: t("Start shopping"), to: "/shop" },
      images: imagesOf(topRated.data?.length ? topRated.data : everything.slice(3)),
    },
  ];

  const dealProduct = byDiscount.find((product) => product.isActive !== false) || null;

  return (
    <>
      {/* ---------------------------------- Hero --------------------------------- */}
      <Container className="pt-5 sm:pt-7">
        {newest.loading && !everything.length ? (
          <Skeleton className="h-[25rem] w-full rounded-[1.75rem] sm:h-[26rem] lg:h-[28rem]" />
        ) : (
          <HeroCarousel slides={slides} />
        )}
      </Container>

      {/* -------------------------------- Promises ------------------------------- */}
      <Container className="py-6">
        <Reveal stagger={0.08} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PROMISES.map((promise) => (
            <Reveal.Item
              key={promise.title}
              className="group flex items-center gap-3 rounded-2xl border border-line-subtle bg-surface p-3.5 transition-colors hover:border-accent"
            >
              <motion.span
                whileHover={{ rotate: -10, scale: 1.08 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text"
              >
                <promise.icon size={18} />
              </motion.span>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-semibold leading-snug text-content sm:text-[0.875rem]">{t(promise.title)}</p>
                <p className="type-caption leading-snug text-content-muted">{t(promise.body)}</p>
              </div>
            </Reveal.Item>
          ))}
        </Reveal>
      </Container>

      {/* ------------------------------- Categories ------------------------------ */}
      {categories?.length > 0 && (
        <Container className="py-section">
          <SectionHeading
            eyebrow={t("Browse")}
            title={t("Shop by category")}
            description={t("Jump straight to the shelf you came for.")}
          />
          <Reveal stagger={0.05} className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <Reveal.Item key={category._id}>
                <Link
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-line-subtle bg-surface p-4 text-center transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="font-display flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle text-[1.375rem] font-semibold text-accent-text transition-transform group-hover:scale-110">
                      {category.name[0]}
                    </span>
                  )}
                  <span className="truncate text-[0.8125rem] font-semibold text-content">
                    {category.name}
                  </span>
                </Link>
              </Reveal.Item>
            ))}
          </Reveal>
        </Container>
      )}

      {/* --------------------------------- Bands --------------------------------- */}
      <Container className="py-section">
        <SectionHeading
          eyebrow={t("Handpicked")}
          title={t("Featured this week")}
          action={
            <Button as={Link} to="/shop?isFeatured=true" variant="link" iconRight={ArrowRight}>
              {t("View all")}
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

      {dealProduct && (
        <Container className="pb-section">
          <DealOfTheDay product={dealProduct} />
        </Container>
      )}

      <Container className="pb-section">
        <SectionHeading
          eyebrow={t("Just landed")}
          title={t("New arrivals")}
          action={
            <Button as={Link} to="/shop?sort=createdAt:desc" variant="link" iconRight={ArrowRight}>
              {t("View all")}
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
            eyebrow={t("Customer favourites")}
            title={t("Rated four stars and above")}
            action={
              <Button as={Link} to="/shop?minRating=4" variant="link" iconRight={ArrowRight}>
                {t("View all")}
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

      {/* ------------------------------ For you ------------------------------ */}
      <PersonalRails />

      {/* --------------------------------- Closing -------------------------------- */}
      <Container className="pb-section">
        <Reveal className="relative overflow-hidden rounded-[1.75rem] border border-line-subtle bg-surface px-6 py-10 text-center sm:px-12">
          <Doodle type="sprout" size={44} className="mx-auto text-accent-text" />
          <Doodle type="sparkle" size={22} float className="absolute left-10 top-8 hidden text-accent-text opacity-50 sm:block" />
          <Doodle type="leaf" size={40} float delay={0.6} className="absolute bottom-8 right-12 hidden text-accent-text opacity-40 sm:block" />
          <h2 className="font-display mt-3 text-[1.75rem] font-semibold tracking-tight text-content sm:text-[2.125rem]">
            {t("Small shop, carefully stocked")}
          </h2>
          <p className="mx-auto mt-2 max-w-[48ch] type-description">
            {t("Every product is chosen by people, checked before it ships, and easy to send back.")}
          </p>
          <Button as={Link} to="/shop" variant="primary" size="lg" iconRight={ArrowRight} className="mt-6">
            {t("Explore the shop")}
          </Button>
        </Reveal>
      </Container>
    </>
  );
};

export default Home;
