import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MessageSquareText, Search, Star } from "lucide-react";

import { getProducts } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import { Input } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import ListToolbar, { QuickTabs, useTabCounts } from "../../../components/ui/ListToolbar";
import { formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";

/** Star rating, with the numeric value alongside so it is not shape-only. */
const RatingStars = ({ value = 0 }) => (
  <span className="flex items-center gap-2">
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          className={cn(star <= Math.round(value) ? "fill-[var(--status-warning)] text-[var(--status-warning)]" : "text-line-strong")}
        />
      ))}
    </span>
    <span className={cn("type-numeric type-body-strong", value ? "text-content" : "text-content-muted")}>{value ? value.toFixed(1) : "—"}</span>
  </span>
);

const TABS = [
  { value: "all", label: "All products", params: {} },
  { value: "reviewed", label: "Reviewed", params: { hasReviews: "true" } },
  { value: "top", label: "4★ and up", params: { minRating: "4" } },
  { value: "waiting", label: "No reviews yet", params: { hasReviews: "false" } },
];

/**
 * Review overview.
 *
 * Reviews belong to products (only verified buyers can leave one), so this
 * lists products by rating, linking to each product page where the reviews
 * themselves are shown.
 */
const Reviews = () => {
  const list = useListParams({ limit: 20, sort: "numReviews:desc" });
  const [tab, setTab] = useState("all");
  const params = useMemo(
    () => ({ ...list.params, includeInactive: "true", ...(TABS.find((item) => item.value === tab)?.params || {}) }),
    [list.params, tab]
  );
  const { data, meta, loading, error, refetch } = useApi(getProducts, params);
  const counts = useTabCounts(getProducts, { includeInactive: "true" }, TABS);

  const columns = [
    {
      key: "name",
      header: "Product",
      sortKey: "name",
      render: (product) => (
        <span className="flex min-w-0 items-center gap-3">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-xl border border-line-subtle bg-surface-sunken object-cover"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="block max-w-[20rem] truncate type-body-strong text-content">{product.name}</span>
            <span className="block truncate type-caption">{product.category}</span>
          </span>
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortKey: "rating",
      render: (product) => <RatingStars value={product.numReviews ? product.rating : 0} />,
    },
    {
      key: "numReviews",
      header: "Reviews",
      align: "right",
      numeric: true,
      sortKey: "numReviews",
      hideBelow: "md",
      render: (product) => (
        <span className="inline-flex items-center gap-1.5 type-body-strong text-content">
          <MessageSquareText size={14} className="text-content-muted" />
          {formatNumber(product.numReviews || 0)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Verdict",
      hideBelow: "lg",
      render: (product) =>
        !product.numReviews ? (
          <Badge tone="neutral">No reviews yet</Badge>
        ) : product.rating >= 4 ? (
          <Badge tone="good" dot>Customers love it</Badge>
        ) : product.rating < 3 ? (
          <Badge tone="critical" dot>Needs attention</Badge>
        ) : (
          <Badge tone="warning" dot>Mixed</Badge>
        ),
    },
    {
      key: "open",
      header: "",
      align: "right",
      render: (product) => (
        <Button as={Link} to={`/product/${product._id}#reviews`} target="_blank" variant="ghost" size="sm" iconRight={ExternalLink}>
          Read
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Reviews" description="What verified buyers think of each product." />

      <Card className="overflow-hidden">
        <ListToolbar
          tabs={
            <QuickTabs
              id="reviews"
              tabs={TABS}
              value={tab}
              counts={counts}
              onChange={(value) => {
                setTab(value);
                list.setPage(1);
              }}
            />
          }
          search={
            <Input
              icon={Search}
              placeholder="Search products"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
              aria-label="Search reviewed products"
              clearable
              onClear={() => list.setSearch("")}
            />
          }
          total={meta?.total}
          noun={meta?.total === 1 ? "product" : "products"}
        />

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
          filtered={list.hasFilters || tab !== "all"}
          onClearFilters={() => {
            list.clearFilters();
            setTab("all");
          }}
          emptyState={
            <EmptyState icon={Star} title="Nothing here yet" description="Ratings appear once verified buyers start reviewing." />
          }
        />
      </Card>
    </div>
  );
};

export default Reviews;
