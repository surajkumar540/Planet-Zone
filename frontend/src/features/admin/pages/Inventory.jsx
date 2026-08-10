import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Boxes, PackagePlus, Search } from "lucide-react";
import { adjustStock, getInventory } from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Modal from "../../../components/ui/Modal";
import { Input, Select, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatNumber } from "../../../lib/format";

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
      toast.error("Could not adjust stock", caught?.response?.data?.message);
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

const Inventory = () => {
  const [searchParams] = useSearchParams();
  // Deep links from the dashboard open straight onto the low-stock view.
  const list = useListParams({
    limit: 20,
    sort: "available:asc",
    ...(searchParams.get("lowStock") === "true" ? { lowStock: "true" } : {}),
  });

  const { data, meta, loading, error, refetch } = useApi(getInventory, list.params);
  const [adjusting, setAdjusting] = useState(null);

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (row) => (
        <span className="flex items-center gap-3 min-w-0">
          <img
            src={row.image}
            alt=""
            loading="lazy"
            className="w-9 h-9 rounded-md object-cover bg-surface-sunken shrink-0"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="type-body-strong text-content block truncate">{row.name}</span>
            <span className="type-caption block truncate">
              {row.variantSku || row.category}
            </span>
          </span>
        </span>
      ),
    },
    { key: "warehouseName", header: "Location", hideBelow: "lg" },
    {
      key: "onHand",
      header: "On hand",
      align: "right",
      numeric: true,
      render: (row) => formatNumber(row.onHand),
    },
    {
      key: "reserved",
      header: "Reserved",
      align: "right",
      numeric: true,
      hideBelow: "md",
      render: (row) => formatNumber(row.reserved),
    },
    {
      key: "available",
      header: "Available",
      align: "right",
      numeric: true,
      sortKey: "available",
      render: (row) => {
        const isOut = row.available <= 0;
        const isLow = !isOut && row.available <= (row.reorderPoint ?? 5);
        return (
          <Badge tone={isOut ? "critical" : isLow ? "warning" : "good"}>
            {isOut ? "Out of stock" : formatNumber(row.available)}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant="secondary" size="sm" icon={PackagePlus} onClick={() => setAdjusting(row)}>
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Inventory" description="Stock levels across your locations." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search inventory"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search inventory"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by stock level"
            value={list.filters.lowStock || ""}
            onChange={(event) => list.setFilter("lowStock", event.target.value)}
            options={[
              { value: "", label: "All stock levels" },
              { value: "true", label: "Needs reorder" },
            ]}
            className="sm:w-48"
          />
        </div>

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
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={Boxes}
              title="No inventory records"
              description="Records are created automatically as products are added."
            />
          }
        />
      </Card>

      {adjusting && (
        <AdjustModal record={adjusting} onClose={() => setAdjusting(null)} onSaved={refetch} />
      )}
    </div>
  );
};

export default Inventory;
