import { useState } from "react";
import { Mail, MailOpen, Search, Trash2 } from "lucide-react";
import { deleteMessage, getContactMessages, markMessageRead } from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Input, Select } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatDateTime } from "../../../lib/format";

const Messages = () => {
  const toast = useToast();
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const { data, meta, loading, error, refetch } = useApi(getContactMessages, list.params);

  const { mutate: markRead } = useMutation(markMessageRead);
  const { mutate: removeMessage, loading: deleting } = useMutation(deleteMessage);

  const [reading, setReading] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const openMessage = async (message) => {
    setReading(message);
    // Opening is what marks it read; no separate action needed.
    if (!message.isRead) {
      try {
        await markRead(message._id);
        refetch();
      } catch {
        // A failed read receipt should not interrupt reading the message.
      }
    }
  };

  const handleDelete = async () => {
    try {
      await removeMessage(pendingDelete._id);
      toast.success("Message deleted");
      setPendingDelete(null);
      refetch();
    } catch (caught) {
      toast.error("Could not delete message", caught?.response?.data?.message);
    }
  };

  const columns = [
    {
      key: "name",
      header: "From",
      render: (message) => (
        <span className="flex items-center gap-2.5 min-w-0">
          {!message.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-label="Unread" />
          )}
          <span className="min-w-0">
            <span
              className={
                message.isRead
                  ? "type-body text-content block truncate"
                  : "type-body-strong text-content block truncate"
              }
            >
              {message.name}
            </span>
            <span className="type-caption block truncate">{message.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      hideBelow: "md",
      render: (message) => (
        <span className="type-caption line-clamp-1 max-w-md block">{message.message}</span>
      ),
    },
    { key: "city", header: "City", hideBelow: "lg" },
    {
      key: "createdAt",
      header: "Received",
      sortKey: "createdAt",
      hideBelow: "sm",
      render: (message) => (
        <span className="type-caption">{formatDateTime(message.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (message) => (
        <Button
          variant="ghost"
          size="icon-sm"
          icon={Trash2}
          aria-label="Delete message"
          onClick={(event) => {
            event.stopPropagation();
            setPendingDelete(message);
          }}
          className="text-status-critical hover:bg-status-critical-bg"
        />
      ),
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Messages" description="Enquiries sent through your contact form." />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search messages"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search messages"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by read state"
            value={list.filters.isRead ?? ""}
            onChange={(event) => list.setFilter("isRead", event.target.value)}
            options={[
              { value: "", label: "All messages" },
              { value: "false", label: "Unread" },
              { value: "true", label: "Read" },
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
          onRowClick={openMessage}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={Mail}
              title="No messages"
              description="Enquiries from your contact form will land here."
            />
          }
        />
      </Card>

      <Modal
        open={Boolean(reading)}
        onClose={() => setReading(null)}
        title={reading?.name}
        description={reading?.email}
        footer={
          <Button variant="secondary" onClick={() => setReading(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="neutral" icon={MailOpen}>
              {reading?.city}
            </Badge>
            <span className="type-caption">{formatDateTime(reading?.createdAt)}</span>
          </div>
          <p className="type-body text-content whitespace-pre-wrap">{reading?.message}</p>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this message?"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Messages;
