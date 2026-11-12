import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Apple, Baby, BookOpen, Dumbbell, FolderTree, Laptop, Layers, Package, Plus, Search, Shirt, Sofa, Sparkles, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, getCategoryTree, getProducts } from "../../../api/adminApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Input, Switch, Textarea } from "../../../components/ui/Field";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import cn from "../../../lib/cn";

import { getErrorMessage } from "../../../lib/apiError";
/** Total products under a category, its own plus every descendant's. */
const totalProducts = (node) =>
  (node.productCount || 0) + (node.children || []).reduce((sum, child) => sum + totalProducts(child), 0);

/** An icon that says what the department sells, guessed from its name. */
const DEPT_ICONS = [
  [/beauty|fragrance|cosmetic|skin/i, Sparkles],
  [/home|kitchen|furniture|decor/i, Sofa],
  [/electronic|phone|laptop|tech|gadget/i, Laptop],
  [/fashion|cloth|apparel|wear|shoe/i, Shirt],
  [/grocer|food|fruit|vegetable/i, Apple],
  [/sport|outdoor|fitness|gym/i, Dumbbell],
  [/toy|kid|baby/i, Baby],
  [/book|station/i, BookOpen],
];
const iconFor = (name) => DEPT_ICONS.find(([pattern]) => pattern.test(name))?.[1] || FolderTree;

/**
 * A department as a card: a banner made from its own product photos, its
 * name and totals over it, how much of the catalogue it holds, and its
 * sub-categories as chips.
 */
const DepartmentCard = ({ dept, catalogueTotal, onAddChild, onDelete, query, index }) => {
  const { data: products } = useApi(
    getProducts,
    { dept: dept._id, limit: 4, includeInactive: "true", sort: "rating:desc" },
    { cacheTime: 5 * 60 * 1000 }
  );
  const children = (dept.children || []).filter(
    (child) => !query || child.name.toLowerCase().includes(query) || dept.name.toLowerCase().includes(query)
  );
  const total = totalProducts(dept);
  const share = catalogueTotal ? Math.round((total / catalogueTotal) * 100) : 0;
  const Icon = iconFor(dept.name);
  const photos = (products || []).map((product) => product.image).filter(Boolean).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-surface-sunken">
        {photos.length ? (
          <div className={cn("grid h-full gap-px", photos.length >= 4 ? "grid-cols-4" : photos.length === 3 ? "grid-cols-3" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
            {photos.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full bg-white object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ))}
          </div>
        ) : (
          <div className="h-full w-full" style={{ background: "linear-gradient(135deg, var(--promo-leaf-from), var(--promo-leaf-to))" }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 100%)" }}
        />

        <div className="absolute right-3 top-3 flex gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
          {dept.isActive === false && (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur">Hidden</span>
          )}
          <button
            type="button"
            onClick={() => onDelete(dept)}
            aria-label={`Delete ${dept.name}`}
            title="Delete department"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-status-critical"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="absolute inset-x-4 bottom-3.5 flex items-end gap-3 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40 backdrop-blur">
            <Icon size={21} />
          </span>
          <div className="min-w-0">
            <p className="font-display truncate text-[1.25rem] font-semibold leading-tight">{dept.name}</p>
            <p className="text-[0.8125rem] opacity-85">
              {dept.children?.length || 0} sub-categor{dept.children?.length === 1 ? "y" : "ies"} · {total} product{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="type-caption">Share of your catalogue</span>
            <span className="type-numeric text-[0.8125rem] font-semibold text-content">{share}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${share}%` }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-accent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {children.map((child) => {
            const count = totalProducts(child);
            return (
              <span
                key={child._id}
                className={cn(
                  "group/chip inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1 text-[0.8125rem] transition-colors",
                  child.isActive === false
                    ? "border-dashed border-line text-content-muted"
                    : "border-line-subtle bg-surface-sunken text-content hover:border-accent"
                )}
              >
                {child.name}
                <span className="rounded-full bg-surface px-1.5 text-[0.6875rem] font-semibold text-content-secondary type-numeric">{count}</span>
                <button
                  type="button"
                  onClick={() => onDelete(child)}
                  aria-label={`Delete ${child.name}`}
                  title="Delete"
                  className="flex h-5 w-5 items-center justify-center rounded-full text-content-muted opacity-0 transition-opacity hover:bg-status-critical-bg hover:text-status-critical focus:opacity-100 group-hover/chip:opacity-100"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => onAddChild(dept)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1 text-[0.8125rem] font-medium text-content-secondary transition-colors hover:border-accent hover:text-accent-text"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </motion.div>
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
      toast.error("Could not create category", getErrorMessage(caught));
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
  const { data, loading, error, refetch, reload } = useApi(getCategoryTree, { includeCounts: "true" });
  const { mutate: removeCategory, loading: deleting } = useMutation(deleteCategory);

  const [formState, setFormState] = useState(null);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const departments = useMemo(
    () =>
      (data || []).filter(
        (dept) =>
          !query ||
          dept.name.toLowerCase().includes(query) ||
          (dept.children || []).some((child) => child.name.toLowerCase().includes(query))
      ),
    [data, query]
  );
  const stats = useMemo(() => {
    const all = data || [];
    return {
      departments: all.length,
      categories: all.reduce((sum, dept) => sum + (dept.children?.length || 0), 0),
      products: all.reduce((sum, dept) => sum + totalProducts(dept), 0),
    };
  }, [data]);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDelete = async () => {
    try {
      await removeCategory(pendingDelete._id);
      toast.success("Category deleted", pendingDelete.name);
      setPendingDelete(null);
      reload();
    } catch (caught) {
      // The API refuses while subcategories or products still reference it.
      toast.error("Could not delete category", getErrorMessage(caught));
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-section">
      <PageHeader
        title="Categories"
        description="Departments and the sub-categories inside them, as shoppers browse them."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setFormState({ parent: null })}>
            New department
          </Button>
        }
      />

      {/* Summary + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-3 gap-3">
          {[
            { icon: FolderTree, label: "Departments", value: stats.departments },
            { icon: Layers, label: "Sub-categories", value: stats.categories },
            { icon: Package, label: "Products filed", value: stats.products },
          ].map((item) => (
            <Card key={item.label} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                <item.icon size={17} />
              </span>
              <span>
                <span className="block type-numeric text-[1.25rem] font-semibold leading-tight text-content">{loading ? "–" : item.value}</span>
                <span className="block type-caption">{item.label}</span>
              </span>
            </Card>
          ))}
        </div>
        <div className="lg:w-80">
          <Input
            icon={Search}
            placeholder="Find a category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Find a category"
            clearable
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <SkeletonText lines={6} />
          </CardBody>
        </Card>
      ) : error ? (
        <Card>
          <ErrorState description={error} onRetry={refetch} />
        </Card>
      ) : departments.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept, index) => (
            <DepartmentCard
              key={dept._id}
              dept={dept}
              index={index}
              catalogueTotal={stats.products}
              query={query}
              onAddChild={(parent) => setFormState({ parent })}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FolderTree}
            title={query ? "No category matches" : "No categories yet"}
            description={query ? "Try another name." : "Group your products so customers can browse them."}
            action={
              !query && (
                <Button variant="primary" icon={Plus} onClick={() => setFormState({ parent: null })}>
                  New department
                </Button>
              )
            }
          />
        </Card>
      )}

      {formState && (
        <CategoryForm
          parent={formState.parent}
          onClose={() => setFormState(null)}
          onSaved={reload}
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
