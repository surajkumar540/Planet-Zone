import { Search, Users } from "lucide-react";
import { getCustomers } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input, Select } from "../../../components/ui/Field";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/States";
import { formatDate } from "../../../lib/format";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "customer", label: "Customer" },
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const Customers = () => {
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const { data, meta, loading, error, refetch } = useApi(getCustomers, list.params);

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (user) => (
        <span className="flex items-center gap-3 min-w-0">
          <Avatar size="sm" firstName={user.firstName} lastName={user.lastName} src={user.avatar} />
          <span className="min-w-0">
            <span className="type-body-strong text-content block truncate">
              {`${user.firstName} ${user.lastName || ""}`.trim()}
            </span>
            <span className="type-caption block truncate">{user.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge tone={user.role === "admin" ? "accent" : "neutral"} className="capitalize">
          {user.role}
        </Badge>
      ),
    },
    { key: "phone", header: "Phone", hideBelow: "lg", render: (user) => user.phone || "—" },
    {
      key: "emailVerify",
      header: "Verified",
      hideBelow: "md",
      render: (user) => (
        <Badge tone={user.emailVerify ? "good" : "warning"} dot>
          {user.emailVerify ? "Verified" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortKey: "createdAt",
      hideBelow: "sm",
      render: (user) => <span className="type-caption">{formatDate(user.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Customers" description="Everyone with an account on your store." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search by name, email or phone"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search customers"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by role"
            value={list.filters.role || ""}
            onChange={(event) => list.setFilter("role", event.target.value)}
            options={ROLE_OPTIONS}
            className="sm:w-44"
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
          emptyState={<EmptyState icon={Users} title="No customers yet" />}
        />
      </Card>
    </div>
  );
};

export default Customers;
