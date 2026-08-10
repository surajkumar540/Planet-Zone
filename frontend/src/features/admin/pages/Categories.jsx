import { useState } from "react";
import { ChevronRight, FolderTree, Plus, Trash2 } from "lucide-react";
import { createCategory, deleteCategory, getCategoryTree } from "../../../api/adminApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Input, Switch, Textarea } from "../../../components/ui/Field";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import cn from "../../../lib/cn";

/**
 * One node of the category tree.
 *
 * Renders recursively, indenting by depth, so an arbitrarily deep hierarchy
 * needs no special handling per level.
 */
const CategoryRow = ({ category, depth = 0, onAddChild, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children?.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-line-subtle hover:bg-surface-hover transition-colors"
        style={{ paddingLeft: `${16 + depth * 22}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            className="p-0.5 rounded text-content-muted hover:text-content"
          >
            <ChevronRight
              size={15}
              className={cn("transition-transform", expanded && "rotate-90")}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="w-[22px]" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1">
          <p className="type-body-strong text-content truncate">{category.name}</p>
          <p className="type-caption truncate font-mono">{category.path}</p>
        </div>

        <Badge tone={category.isActive === false ? "neutral" : "good"} dot>
          {category.isActive === false ? "Hidden" : "Live"}
        </Badge>

        <Badge tone="neutral">
          {category.productCount || 0} {category.productCount === 1 ? "product" : "products"}
        </Badge>

        <Button
          variant="ghost"
          size="icon-sm"
          icon={Plus}
          aria-label={`Add subcategory under ${category.name}`}
          onClick={() => onAddChild(category)}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          icon={Trash2}
          aria-label={`Delete ${category.name}`}
          onClick={() => onDelete(category)}
          className="text-status-critical hover:bg-status-critical-bg"
        />
      </div>

      {expanded &&
        category.children?.map((child) => (
          <CategoryRow
            key={child._id}
            category={child}
            depth={depth + 1}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};

const CategoryForm = ({ parent, onClose, onSaved }) => {
  const toast = useToast();
  const { mutate, loading } = useMutation(createCategory);
  const [form, setForm] = useState({ name: "", description: "", isActive: true });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.warning("Name is required");
      return;
    }

    try {
      await mutate({ ...form, parent: parent?._id || null });
      toast.success("Category created", form.name);
      onSaved();
      onClose();
    } catch (caught) {
      toast.error("Could not create category", caught?.response?.data?.message);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={parent ? `New subcategory in ${parent.name}` : "New category"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Create category
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          hint="The URL slug is generated from this"
        />
        <Textarea
          label="Description"
          rows={3}
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <Switch
          label="Visible in storefront"
          checked={form.isActive}
          onChange={(checked) => setForm({ ...form, isActive: checked })}
        />
      </div>
    </Modal>
  );
};

const Categories = () => {
  const toast = useToast();
  const { data, loading, error, refetch } = useApi(getCategoryTree, { includeCounts: "true" });
  const { mutate: removeCategory, loading: deleting } = useMutation(deleteCategory);

  const [formState, setFormState] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDelete = async () => {
    try {
      await removeCategory(pendingDelete._id);
      toast.success("Category deleted", pendingDelete.name);
      setPendingDelete(null);
      refetch();
    } catch (caught) {
      // The API refuses while subcategories or products still reference it.
      toast.error("Could not delete category", caught?.response?.data?.message);
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-section">
      <PageHeader
        title="Categories"
        description="Organise your catalogue into a browsable hierarchy."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setFormState({ parent: null })}>
            New category
          </Button>
        }
      />

      <Card>
        {loading ? (
          <CardBody>
            <SkeletonText lines={6} />
          </CardBody>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : data?.length ? (
          <div>
            {data.map((category) => (
              <CategoryRow
                key={category._id}
                category={category}
                onAddChild={(parent) => setFormState({ parent })}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Group your products so customers can browse them."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setFormState({ parent: null })}>
                New category
              </Button>
            }
          />
        )}
      </Card>

      {formState && (
        <CategoryForm
          parent={formState.parent}
          onClose={() => setFormState(null)}
          onSaved={refetch}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${pendingDelete?.name}?`}
        description="Categories with subcategories or products cannot be deleted."
        confirmLabel="Delete category"
      />
    </div>
  );
};

export default Categories;
