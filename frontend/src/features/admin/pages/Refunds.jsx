import { useState } from "react";
import { Check, RotateCcw, Search, X } from "lucide-react";
import { getRefunds, processRefund, reviewRefund } from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import { Input, Select } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatCurrency, formatDate, humanise } from "../../../lib/format";

const STATUS_TONE = {
  requested: "warning",
  approved: "info",
  processing: "info",
  completed: "good",
  rejected: "critical",
  failed: "critical",
};

/**
 * Refund queue.
 *
 * Review and payout are separate actions, matching the API: approving records
 * the decision, processing records the money actually moving.
 */
const Refunds = () => {
  const toast = useToast();
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const { data, meta, loading, error, refetch } = useApi(getRefunds, list.params);

  const { mutate: review } = useMutation(reviewRefund);
  const { mutate: complete } = useMutation(processRefund);
  const [busyId, setBusyId] = useState(null);

  const runAction = async (refund, action) => {
    setBusyId(refund._id);
    try {
      if (action === "process") {
        await complete(refund._id, {});
        toast.success("Refund completed", formatCurrency(refund.amount));
      } else {
        await review(refund._id, { approve: action === "approve" });
        toast.success(action === "approve" ? "Refund approved" : "Refund rejected");
      }
      refetch();
    } catch (caught) {
      toast.error("Could not update refund", caught?.response?.data?.message);
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      render: (refund) => (
        <span className="type-body-strong text-content font-mono text-caption">
          {refund.orderNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      hideBelow: "md",
      render: (refund) =>
        refund.User
          ? `${refund.User.firstName} ${refund.User.lastName || ""}`.trim()
          : "—",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      numeric: true,
      render: (refund) => (
        <span className="type-body-strong text-content">{formatCurrency(refund.amount)}</span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      hideBelow: "lg",
      render: (refund) => (
        <span className="type-caption line-clamp-1 max-w-[240px] block">{refund.reason}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (refund) => (
        <Badge tone={STATUS_TONE[refund.status] || "neutral"} dot>
          {humanise(refund.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Requested",
      hideBelow: "xl",
      render: (refund) => <span className="type-caption">{formatDate(refund.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (refund) => {
        const busy = busyId === refund._id;

        if (refund.status === "requested") {
          return (
            <span className="inline-flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={Check}
                loading={busy}
                onClick={() => runAction(refund, "approve")}
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                icon={X}
                aria-label="Reject refund"
                disabled={busy}
                onClick={() => runAction(refund, "reject")}
                className="text-status-critical hover:bg-status-critical-bg"
              />
            </span>
          );
        }

        if (refund.status === "approved") {
          return (
            <Button
              variant="primary"
              size="sm"
              loading={busy}
              onClick={() => runAction(refund, "process")}
            >
              Mark refunded
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Refunds" description="Review and settle refund requests." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search by order number"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search refunds"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by status"
            value={list.filters.status || ""}
            onChange={(event) => list.setFilter("status", event.target.value)}
            options={[
              { value: "", label: "All refunds" },
              { value: "requested", label: "Awaiting review" },
              { value: "approved", label: "Approved" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Rejected" },
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
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={RotateCcw}
              title="No refund requests"
              description="Refund requests from customers will appear here."
            />
          }
        />
      </Card>
    </div>
  );
};

export default Refunds;
