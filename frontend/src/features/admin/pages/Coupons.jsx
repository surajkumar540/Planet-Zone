import { useState } from "react";
import { Plus, Search, Tag, Trash2 } from "lucide-react";
import { createCoupon, deleteCoupon, getCoupons } from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Input, Select, Switch } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatCurrency, formatDate, formatNumber } from "../../../lib/format";

const TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off" },
  { value: "free_shipping", label: "Free delivery" },
];

const CouponForm = ({ onClose, onSaved }) => {
  const toast = useToast();
  const { mutate, loading } = useMutation(createCoupon);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    usageLimit: "",
    usageLimitPerUser: 1,
    expiresAt: "",
    firstOrderOnly: false,
    isActive: true,
  });

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event?.target?.value ?? event }));

  const handleSubmit = async () => {
    try {
      await mutate({
        ...form,
        value: Number(form.value) || 0,
        // Blank means "no limit"; the API reads zero as unlimited.
        maxDiscountAmount: Number(form.maxDiscountAmount) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        usageLimitPerUser: Number(form.usageLimitPerUser) || 0,
        expiresAt: form.expiresAt || null,
      });
      toast.success("Coupon created", form.code.toUpperCase());
      onSaved();
      onClose();
    } catch (caught) {
      toast.error("Could not create coupon", caught?.response?.data?.message);
    }
  };

  const isPercentage = form.type === "percentage";
  const isFreeShipping = form.type === "free_shipping";

  return (
    <Modal
      open
      onClose={onClose}
      title="New discount"
      description="Create a code customers can apply at checkout."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Create discount
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Code"
          required
          placeholder="SAVE20"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
          hint="Letters, numbers, hyphens and underscores"
        />

        <Input label="Description" value={form.description} onChange={setField("description")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Type" value={form.type} onChange={setField("type")} options={TYPE_OPTIONS} />
          {!isFreeShipping && (
            <Input
              label={isPercentage ? "Percentage off" : "Amount off"}
              required
              type="number"
              min="0"
              max={isPercentage ? "100" : undefined}
              suffix={isPercentage ? "%" : "₹"}
              value={form.value}
              onChange={setField("value")}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isPercentage && (
            <Input
              label="Maximum discount"
              type="number"
              min="0"
              suffix="₹"
              value={form.maxDiscountAmount}
              onChange={setField("maxDiscountAmount")}
              hint="Leave blank for no cap"
            />
          )}
          <Input
            label="Minimum order value"
            type="number"
            min="0"
            suffix="₹"
            value={form.minOrderAmount}
            onChange={setField("minOrderAmount")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Total uses"
            type="number"
            min="0"
            value={form.usageLimit}
            onChange={setField("usageLimit")}
            hint="Blank means unlimited"
          />
          <Input
            label="Uses per customer"
            type="number"
            min="0"
            value={form.usageLimitPerUser}
            onChange={setField("usageLimitPerUser")}
          />
          <Input label="Expires" type="date" value={form.expiresAt} onChange={setField("expiresAt")} />
        </div>

        <Switch
          label="First order only"
          description="Restrict to customers who have never ordered before"
          checked={form.firstOrderOnly}
          onChange={(checked) => setForm({ ...form, firstOrderOnly: checked })}
        />
      </div>
    </Modal>
  );
};

const Coupons = () => {
  const toast = useToast();
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const { data, meta, loading, error, refetch } = useApi(getCoupons, list.params);
  const { mutate: removeCoupon, loading: deleting } = useMutation(deleteCoupon);

  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDelete = async () => {
    try {
      const response = await removeCoupon(pendingDelete._id);
      const wasDeactivated = response?.data?.deactivated;
      toast.success(
        wasDeactivated ? "Coupon deactivated" : "Coupon deleted",
        wasDeactivated
          ? "It has been used before, so it was retired rather than removed."
          : pendingDelete.code
      );
      setPendingDelete(null);
      refetch();
    } catch (caught) {
      toast.error("Could not delete coupon", caught?.response?.data?.message);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (coupon) => (
        <span>
          <span className="type-body-strong text-content font-mono block">{coupon.code}</span>
          {coupon.description && (
            <span className="type-caption block truncate max-w-[220px]">{coupon.description}</span>
          )}
        </span>
      ),
    },
    {
      key: "value",
      header: "Discount",
      render: (coupon) => {
        if (coupon.type === "free_shipping") return "Free delivery";
        if (coupon.type === "fixed") return formatCurrency(coupon.value);
        return `${coupon.value}%${
          coupon.maxDiscountAmount ? ` up to ${formatCurrency(coupon.maxDiscountAmount)}` : ""
        }`;
      },
    },
    {
      key: "usedCount",
      header: "Used",
      align: "right",
      numeric: true,
      hideBelow: "md",
      render: (coupon) =>
        `${formatNumber(coupon.usedCount)}${
          coupon.usageLimit ? ` / ${formatNumber(coupon.usageLimit)}` : ""
        }`,
    },
    {
      key: "expiresAt",
      header: "Expires",
      hideBelow: "lg",
      render: (coupon) => (coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"),
    },
    {
      key: "status",
      header: "Status",
      render: (coupon) => {
        if (!coupon.isActive) {
          return (
            <Badge tone="neutral" dot>
              Inactive
            </Badge>
          );
        }
        if (coupon.isExpired) {
          return (
            <Badge tone="critical" dot>
              Expired
            </Badge>
          );
        }
        if (coupon.isExhausted) {
          return (
            <Badge tone="warning" dot>
              Limit reached
            </Badge>
          );
        }
        return (
          <Badge tone="good" dot>
            Active
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (coupon) => (
        <Button
          variant="ghost"
          size="icon-sm"
          icon={Trash2}
          aria-label={`Delete ${coupon.code}`}
          onClick={() => setPendingDelete(coupon)}
          className="text-status-critical hover:bg-status-critical-bg"
        />
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader
        title="Discounts"
        description="Coupon codes customers can apply at checkout."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setFormOpen(true)}>
            New discount
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search codes"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search discounts"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by status"
            value={list.filters.status || ""}
            onChange={(event) => list.setFilter("status", event.target.value)}
            options={[
              { value: "", label: "All discounts" },
              { value: "active", label: "Active" },
              { value: "scheduled", label: "Scheduled" },
              { value: "expired", label: "Expired" },
            ]}
            className="sm:w-44"
          />
        </div>

        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={refetch}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={Tag}
              title="No discounts yet"
              description="Create a coupon code to run your first promotion."
              action={
                <Button variant="primary" icon={Plus} onClick={() => setFormOpen(true)}>
                  New discount
                </Button>
              }
            />
          }
        />
      </Card>

      {formOpen && <CouponForm onClose={() => setFormOpen(false)} onSaved={refetch} />}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${pendingDelete?.code}?`}
        confirmLabel="Delete discount"
      />
    </div>
  );
};

export default Coupons;
