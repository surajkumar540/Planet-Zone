import { useMemo, useState } from "react";
import { BadgeCheck, Clock, Mail, Phone, Search, Users } from "lucide-react";

import { getCustomers } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input } from "../../../components/ui/Field";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import { EmptyState } from "../../../components/ui/States";
import ListToolbar, { QuickTabs, useTabCounts } from "../../../components/ui/ListToolbar";
import { formatDate, formatRelativeTime } from "../../../lib/format";

const TABS = [
  { value: "all", label: "Everyone", params: {} },
  { value: "customer", label: "Customers", params: { role: "customer" } },
  { value: "staff", label: "Staff", params: { role: "staff" } },
  { value: "manager", label: "Managers", params: { role: "manager" } },
  { value: "admin", label: "Admins", params: { role: "admin" } },
];

const ROLE_TONE = { admin: "accent", manager: "info", staff: "info", customer: "neutral" };

const Customers = () => {
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const [tab, setTab] = useState("all");
  const params = useMemo(
    () => ({ ...list.params, ...(TABS.find((item) => item.value === tab)?.params || {}) }),
    [list.params, tab]
  );
  const { data, meta, loading, error, refetch } = useApi(getCustomers, params);
  const counts = useTabCounts(getCustomers, {}, TABS);

  const columns = [
    {
      key: "name",
      header: "Person",
      render: (user) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar size="md" firstName={user.firstName} lastName={user.lastName} src={user.avatar} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate type-body-strong text-content">{`${user.firstName} ${user.lastName || ""}`.trim()}</span>
              {user.emailVerify && <BadgeCheck size={15} className="shrink-0 text-status-good" aria-label="Email verified" />}
            </span>
            <span className="flex items-center gap-1 truncate type-caption">
              <Mail size={11} /> {user.email}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge tone={ROLE_TONE[user.role] || "neutral"} className="capitalize">
          {user.role}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      hideBelow: "lg",
      render: (user) =>
        user.phone ? (
          <span className="flex items-center gap-1.5 type-body text-content">
            <Phone size={13} className="text-content-muted" /> {user.phone}
          </span>
        ) : (
          <span className="type-caption">Not added</span>
        ),
    },
    {
      key: "emailVerify",
      header: "Email",
      hideBelow: "md",
      render: (user) => (
        <Badge tone={user.emailVerify ? "good" : "warning"} dot>
          {user.emailVerify ? "Verified" : "Not verified"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortKey: "createdAt",
      hideBelow: "sm",
      render: (user) => (
        <span className="block">
          <span className="flex items-center gap-1 type-body text-content">
            <Clock size={12} className="text-content-muted" /> {formatRelativeTime(user.createdAt)}
          </span>
          <span className="block type-caption">{formatDate(user.createdAt)}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Customers" description="Everyone with an account: shoppers and your team." />

      <Card className="overflow-hidden">
        <ListToolbar
          tabs={
            <QuickTabs
              id="people"
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
              placeholder="Name, email or phone"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
              aria-label="Search people"
              clearable
              onClear={() => list.setSearch("")}
            />
          }
          total={meta?.total}
          noun={meta?.total === 1 ? "person" : "people"}
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
          emptyState={<EmptyState icon={Users} title={list.hasFilters || tab !== "all" ? "Nobody matches" : "No customers yet"} />}
        />
      </Card>
    </div>
  );
};

export default Customers;
