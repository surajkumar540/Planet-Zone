import { Search, Star } from "lucide-react";
import { getProducts } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import { Input, Select } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";

/** Star rating, with the numeric value alongside so it is not shape-only. */
const RatingStars = ({ value = 0, count }) => (
  <span className="flex items-center gap-1.5">
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={cn(
            star <= Math.round(value)
              ? "fill-[var(--status-warning)] text-[var(--status-warning)]"
              : "text-line-strong"
          )}
        />
      ))}
    </span>
    <span className="type-caption type-numeric">
      {value ? value.toFixed(1) : "—"}
      {count !== undefined && ` (${formatNumber(count)})`}
    </span>
  </span>
);

/**
 * Review overview.
 *
 * Reviews are embedded in products, so this lists products by their rating
 * rather than inventing a separate collection the API does not expose.
 */
const Reviews = () => {
  const list = useListParams({ limit: 20, sort: "rating:desc", includeInactive: "true" });
  const { data, meta, loading, error, refetch } = useApi(getProducts, list.params);

  const columns = [
    {
      key: "name",
      header: "Product",
      sortKey: "name",
      render: (product) => (
        <span className="flex items-center gap-3 min-w-0">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="w-9 h-9 rounded-md object-cover bg-surface-sunken shrink-0"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="type-body-strong text-content block truncate">{product.name}</span>
            <span className="type-caption block truncate">{product.category}</span>
          </span>
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortKey: "rating",
      render: (product) => <RatingStars value={product.rating} count={product.numReviews} />,
    },
    {
      key: "numReviews",
      header: "Reviews",
      align: "right",
      numeric: true,
      sortKey: "numReviews",
      hideBelow: "md",
      render: (product) => formatNumber(product.numReviews || 0),
    },
    {
      key: "status",
      header: "",
      align: "right",
      hideBelow: "lg",
      render: (product) =>
        !product.numReviews ? (
          <Badge tone="neutral">Awaiting reviews</Badge>
        ) : product.rating >= 4 ? (
          <Badge tone="good">Well rated</Badge>
        ) : product.rating < 3 ? (
          <Badge tone="critical">Needs attention</Badge>
        ) : (
          <Badge tone="warning">Mixed</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Reviews" description="How customers rate your products." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search products"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search reviewed products"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by rating"
            value={list.filters.minRating || ""}
            onChange={(event) => list.setFilter("minRating", event.target.value)}
            options={[
              { value: "", label: "All ratings" },
              { value: "4", label: "4 stars and up" },
              { value: "3", label: "3 stars and up" },
              { value: "1", label: "Rated products only" },
            ]}
            className="sm:w-48"
          />
        </div>

        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={refetch}
          sort={list.sort}
          onSortChange={list.setSort}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Customer ratings will appear here once they start reviewing."
            />
          }
        />
      </Card>
    </div>
  );
};

export default Reviews;
