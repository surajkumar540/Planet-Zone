import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Boxes, PackagePlus, Search, Warehouse } from "lucide-react";
import { adjustStock, getInventory } from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";
import Modal from "../../../components/ui/Modal";
import { Input, Select, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";
import ListToolbar, { QuickTabs, useTabCounts } from "../../../components/ui/ListToolbar";

import { getErrorMessage } from "../../../lib/apiError";
const REASONS = [
  { value: "purchase", label: "Stock received" },
  { value: "adjustment", label: "Manual adjustment" },
  { value: "damage", label: "Damaged or written off" },
  { value: "return", label: "Customer return" },
  { value: "stocktake", label: "Stocktake correction" },
];

/** Adjusts stock by a signed delta, recorded in the movement ledger. */
const AdjustModal = ({ record, onClose, onSaved }) => {
  const toast = useToast();
  const { mutate, loading } = useMutation(adjustStock);
  const [form, setForm] = useState({ quantity: "", reason: "purchase", note: "" });

  const handleSubmit = async () => {
    const quantity = Number(form.quantity);
    if (!quantity) {
      toast.warning("Enter a quantity", "Use a negative number to remove stock.");
      return;
    }

    try {
      await mutate({
        product: record.product,
        variantSku: record.variantSku || "",
        warehouse: record.warehouse,
        quantity,
        reason: form.reason,
        note: form.note || undefined,
      });
      toast.success("Stock updated", `${record.name} adjusted by ${quantity > 0 ? "+" : ""}${quantity}.`);
      onSaved();
      onClose();
    } catch (caught) {
      toast.error("Could not adjust stock", getErrorMessage(caught));
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Adjust stock"
      description={record.name}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Apply adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-md bg-surface-sunken">
          <span className="type-caption">Currently on hand</span>
          <span className="type-body-strong type-numeric text-content">
            {formatNumber(record.onHand)}
          </span>
        </div>

        <Input
          label="Quantity change"
          type="number"
          required
          placeholder="e.g. 25 or -5"
          value={form.quantity}
          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
          hint="Positive adds stock, negative removes it"
        />

        <Select
          label="Reason"
          value={form.reason}
          onChange={(event) => setForm({ ...form, reason: event.target.value })}
          options={REASONS}
        />

        <Textarea
          label="Note"
          rows={2}
          placeholder="Optional, stored with the movement"
          value={form.note}
          onChange={(event) => setForm({ ...form, note: event.target.value })}
        />
      </div>
    </Modal>
  );
};

const STOCK_TABS = [
  { value: "all", label: "All stock", params: {} },
  { value: "low", label: "Needs reorder", params: { lowStock: "true" }, alert: true },
  { value: "out", label: "Out of stock", params: { outOfStock: "true" }, alert: true },
];

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const list = useListParams({ limit: 20, sort: "available:asc" });
  // Deep links from the dashboard open straight onto the low-stock view.
  const [tab, setTab] = useState(searchParams.get("lowStock") === "true" ? "low" : "all");
  const params = useMemo(
    () => ({ ...list.params, ...(STOCK_TABS.find((item) => item.value === tab)?.params || {}) }),
    [list.params, tab]
  );
  const [countVersion, setCountVersion] = useState(0);
  const { data, meta, loading, error, refetch, reload } = useApi(getInventory, params);
  const counts = useTabCounts(getInventory, {}, STOCK_TABS, countVersion);
  const [adjusting, setAdjusting] = useState(null);

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <span className="flex min-w-0 items-center gap-3">
          <img
            src={row.image}
            alt=""
            loading="lazy"
            className="h-11 w-11 shrink-0 rounded-xl border border-line-subtle bg-surface-sunken object-cover"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="block max-w-[18rem] truncate type-body-strong text-content">{row.name}</span>
            <span className="block truncate type-caption">{row.variantSku || row.category}</span>
          </span>
        </span>
      ),
    },
    {
      key: "warehouseName",
      header: "Location",
      hideBelow: "lg",
      render: (row) => (
        <span className="flex items-center gap-1.5 type-body text-content-secondary">
          <Warehouse size={14} className="text-content-muted" /> {row.warehouseName}
        </span>
      ),
    },
    {
      key: "available",
      header: "Available to sell",
      sortKey: "available",
      render: (row) => {
        const reorder = row.reorderPoint ?? 5;
        const isOut = row.available <= 0;
        const isLow = !isOut && row.available <= reorder;
        const fill = Math.min(100, (row.available / Math.max(1, reorder * 4)) * 100);
        return (
          <span className="block w-40">
            <span className="flex items-baseline justify-between gap-2">
              <span className={cn("type-numeric text-[1rem] font-semibold", isOut ? "text-status-critical" : isLow ? "text-status-warning" : "text-content")}>
                {formatNumber(Math.max(0, row.available))}
              </span>
              <span className={cn("type-caption", isOut ? "text-status-critical" : isLow ? "text-status-warning" : "")}>
                {isOut ? "Out of stock" : isLow ? `Reorder (≤ ${reorder})` : "Healthy"}
              </span>
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <span
                className={cn("block h-full rounded-full", isOut ? "bg-status-critical" : isLow ? "bg-status-warning" : "bg-status-good")}
                style={{ width: `${isOut ? 100 : Math.max(6, fill)}%` }}
              />
            </span>
          </span>
        );
      },
    },
    {
      key: "onHand",
      header: "On shelf",
      align: "right",
      numeric: true,
      hideBelow: "md",
      render: (row) => formatNumber(row.onHand),
    },
    {
      key: "reserved",
      header: "In open orders",
      align: "right",
      numeric: true,
      hideBelow: "md",
      render: (row) => (row.reserved ? <span className="text-status-info">{formatNumber(row.reserved)}</span> : <span className="type-caption">0</span>),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant={row.available <= (row.reorderPoint ?? 5) ? "primary" : "secondary"} size="sm" icon={PackagePlus} onClick={() => setAdjusting(row)}>
          {row.available <= (row.reorderPoint ?? 5) ? "Restock" : "Adjust"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Inventory" description="What you can sell right now, and what needs restocking first." />

      <Card className="overflow-hidden">
        <ListToolbar
          tabs={
            <QuickTabs
              id="stock"
              tabs={STOCK_TABS}
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
              placeholder="Product name or SKU"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
              aria-label="Search inventory"
              clearable
              onClear={() => list.setSearch("")}
            />
          }
          total={meta?.total}
          noun={meta?.total === 1 ? "item" : "items"}
        />

        <DataTable
          columns={columns}
          rows={data}
          keyField="_id"
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
            <EmptyState
              icon={Boxes}
              title={tab === "all" ? "No inventory records" : "Nothing needs restocking"}
              description={tab === "all" ? "Records are created automatically as products are added." : "Every item is above its reorder point."}
            />
          }
        />
      </Card>

      {adjusting && (
        <AdjustModal
          record={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            reload();
            setCountVersion((version) => version + 1);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
