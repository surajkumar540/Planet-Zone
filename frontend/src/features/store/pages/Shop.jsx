import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";

import { getAllProducts, getProductFilters } from "../../../api/productApi";
import { useApi, useDebounced } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Checkbox, Input, Select } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import { useWishlistToggle } from "../hooks/useWishlist";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "totalPrice:asc", label: "Price: low to high" },
  { value: "totalPrice:desc", label: "Price: high to low" },
  { value: "rating:desc", label: "Top rated" },
  { value: "name:asc", label: "Name: A–Z" },
];

const PAGE_SIZE = 12;

/**
 * Catalogue.
 *
 * Filters live in the URL rather than in component state, so a filtered view
 * can be shared, bookmarked and restored by the back button — which is what a
 * shopper expects from a shop.
 */
const Shop = () => {
  const [params, setParams] = useSearchParams();
  const { toggle, isWishlisted } = useWishlistToggle();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The search box is local and debounced; committing every keystroke to the
  // URL would flood the history stack.
  const [searchDraft, setSearchDraft] = useState(params.get("search") || "");
  const search = useDebounced(searchDraft, 350);

  const page = Number(params.get("page")) || 1;

  const setParam = useCallback(
    (patch) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          }
          // Any filter change invalidates the current page number.
          if (!("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sort: params.get("sort") || "createdAt:desc",
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(params.get("category") ? { category: params.get("category") } : {}),
      ...(params.get("brand") ? { brand: params.get("brand") } : {}),
      ...(params.get("minPrice") ? { minPrice: params.get("minPrice") } : {}),
      ...(params.get("maxPrice") ? { maxPrice: params.get("maxPrice") } : {}),
      ...(params.get("minRating") ? { minRating: params.get("minRating") } : {}),
      ...(params.get("inStock") === "true" ? { inStock: true } : {}),
      ...(params.get("isFeatured") === "true" ? { isFeatured: true } : {}),
    }),
    [page, params, search]
  );

  const { data: products, meta, loading, error, refetch } = useApi(getAllProducts, query);
  const { data: options } = useApi(getProductFilters, null);

  const activeFilters = useMemo(
    () =>
      ["category", "brand", "minPrice", "maxPrice", "minRating", "inStock", "isFeatured"].filter(
        (key) => params.get(key)
      ),
    [params]
  );

  const clearAll = () => {
    setSearchDraft("");
    setParams({}, { replace: true });
  };

  const totalPages = meta?.totalPages || 1;

  const filterPanel = (
    <div className="space-y-6">
      <FilterGroup label="Category">
        <Select
          value={params.get("category") || ""}
          onChange={(event) => setParam({ category: event.target.value })}
          aria-label="Category"
          placeholder="All categories"
          options={(options?.categories || []).map((category) => ({
            value: category,
            label: category,
          }))}
        />
      </FilterGroup>

      <FilterGroup label="Brand">
        <Select
          value={params.get("brand") || ""}
          onChange={(event) => setParam({ brand: event.target.value })}
          aria-label="Brand"
          placeholder="All brands"
          options={(options?.brands || []).map((brand) => ({ value: brand, label: brand }))}
        />
      </FilterGroup>

      <FilterGroup label="Price range">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={params.get("minPrice") || ""}
            onChange={(event) => setParam({ minPrice: event.target.value })}
            aria-label="Minimum price"
          />
          <span className="type-caption text-content-muted">to</span>
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={params.get("maxPrice") || ""}
            onChange={(event) => setParam({ maxPrice: event.target.value })}
            aria-label="Maximum price"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Rating">
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                setParam({ minRating: params.get("minRating") === String(rating) ? "" : rating })
              }
              className={cn(
                "rounded-sm px-2 py-1.5 text-left type-button transition-colors",
                params.get("minRating") === String(rating)
                  ? "bg-accent-subtle text-accent-text"
                  : "text-content-secondary hover:bg-surface-hover"
              )}
            >
              {rating} stars and above
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Availability">
        <div className="flex flex-col gap-2">
          <Checkbox
            checked={params.get("inStock") === "true"}
            onChange={(checked) => setParam({ inStock: checked ? "true" : "" })}
            label="In stock only"
          />
          <Checkbox
            checked={params.get("isFeatured") === "true"}
            onChange={(checked) => setParam({ isFeatured: checked ? "true" : "" })}
            label="Featured products"
          />
        </div>
      </FilterGroup>

      {activeFilters.length > 0 && (
        <Button variant="ghost" size="sm" icon={X} onClick={clearAll} fullWidth>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <Container className="py-8">
      <header className="mb-6">
        <h1 className="type-page-title text-content">
          {params.get("category") || "All products"}
        </h1>
        <p className="type-description mt-1">
          {loading
            ? "Loading products…"
            : `${meta?.total ?? products?.length ?? 0} product${
                (meta?.total ?? 0) === 1 ? "" : "s"
              } found`}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-overline mb-4 text-content">Filters</h2>
            {filterPanel}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="min-w-[12rem] flex-1">
              <Input
                type="search"
                icon={Search}
                clearable
                onClear={() => setSearchDraft("")}
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Search this catalogue"
                aria-label="Search products"
              />
            </div>

            <div className="w-48">
              <Select
                value={params.get("sort") || "createdAt:desc"}
                onChange={(event) => setParam({ sort: event.target.value })}
                aria-label="Sort products"
                options={SORT_OPTIONS}
              />
            </div>

            <Button
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen((open) => !open)}
              className="lg:hidden"
            >
              Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}
            </Button>
          </div>

          {filtersOpen && (
            <div className="mb-5 rounded-lg border border-line-subtle bg-surface p-5 lg:hidden">
              {filterPanel}
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {activeFilters.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setParam({ [key]: "" })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 type-caption text-content-secondary transition-colors hover:border-status-critical hover:text-status-critical"
                >
                  {LABELS[key] || key}: {formatFilterValue(key, params.get(key))}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}

          {error ? (
            <ErrorState description={error} onRetry={refetch} />
          ) : loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
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
          ) : products?.length ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onToggleWishlist={toggle}
                    isWishlisted={isWishlisted(product._id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  <Button
                    icon={ChevronLeft}
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setParam({ page: page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="type-caption type-numeric px-3 text-content-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    iconRight={ChevronRight}
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setParam({ page: page + 1 })}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title="Nothing matched those filters"
              description="Try widening the price range or clearing a filter."
              action={
                activeFilters.length > 0 ? (
                  <Button variant="primary" onClick={clearAll}>
                    Clear filters
                  </Button>
                ) : null
              }
            />
          )}
        </div>
      </div>
    </Container>
  );
};

const LABELS = {
  category: "Category",
  brand: "Brand",
  minPrice: "Min",
  maxPrice: "Max",
  minRating: "Rating",
  inStock: "Availability",
  isFeatured: "Featured",
};

/** Chips read as sentences rather than raw query values. */
const formatFilterValue = (key, value) => {
  if (key === "minPrice" || key === "maxPrice") return formatCurrency(value);
  if (key === "minRating") return `${value}★ and up`;
  if (key === "inStock") return "In stock";
  if (key === "isFeatured") return "Yes";
  return value;
};

const FilterGroup = ({ label, children }) => (
  <div>
    <h3 className="type-label mb-2 text-content">{label}</h3>
    {children}
  </div>
);

export default Shop;
