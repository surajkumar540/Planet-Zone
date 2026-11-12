import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ExternalLink, Eye, Image as ImageIcon, Package, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  getCategoryTree,
  getProductFilters,
  getProducts,
  updateProduct,
} from "../../../api/adminApi";
import { useApi, useListParams, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Input, Select, Switch, Textarea } from "../../../components/ui/Field";
import { EmptyState } from "../../../components/ui/States";
import { formatCurrency, formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";
import ListToolbar, { QuickTabs, useTabCounts } from "../../../components/ui/ListToolbar";

import { getErrorMessage } from "../../../lib/apiError";
const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  category: "",
  categoryRef: null,
  shortDescription: "",
  description: "",
  image: "",
  images: [],
  price: "",
  discount: 0,
  gst: 18,
  countInStock: 10,
  lowStockThreshold: 5,
  sku: "",
  isActive: true,
  isFeatured: false,
};

/** Only the fields this form edits are copied from an existing product. */
const toForm = (product) =>
  product
    ? Object.fromEntries(
        Object.keys(EMPTY_PRODUCT).map((key) => [key, product[key] ?? EMPTY_PRODUCT[key]])
      )
    : EMPTY_PRODUCT;

/** Same formula as the server: discount first, then GST on the discounted price. */
const customerPrice = (price, discount, gst) => {
  const discounted = Number(price || 0) * (1 - Number(discount || 0) / 100);
  return Math.round(discounted * (1 + Number(gst || 0) / 100) * 100) / 100;
};

const GST_RATES = [0, 5, 12, 18, 28];

/** Client-side checks mirroring the API's rules, for immediate feedback. */
const validate = (form) => {
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = "Give the product a name";
  if (!form.brand?.trim()) errors.brand = "Who makes it?";
  if (!form.category?.trim()) errors.category = "Pick a category";
  if (!form.description?.trim()) errors.description = "Describe the product";
  if (!form.image?.trim()) errors.image = "Add a main photo";
  if (form.price === "" || Number(form.price) < 0) errors.price = "Enter a price";
  if (Number(form.discount) < 0 || Number(form.discount) > 100) errors.discount = "0 to 100";
  if (Number(form.countInStock) < 0) errors.countInStock = "Can't be negative";
  return errors;
};

/** Which section each field lives in, to jump to the first problem. */
const SECTION_OF = { name: "basics", brand: "basics", category: "basics", description: "basics", image: "photos", price: "pricing", discount: "pricing", countInStock: "stock" };

const Section = ({ id, number, title, hint, children }) => (
  <section id={`product-${id}`} className="scroll-mt-4 rounded-2xl border border-line-subtle bg-surface p-4 sm:p-5">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-[0.8125rem] font-bold text-accent-text">
        {number}
      </span>
      <div>
        <h3 className="text-[0.9375rem] font-semibold text-content">{title}</h3>
        {hint && <p className="type-caption text-content-muted">{hint}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

/** A thumbnail that shows a friendly placeholder until the URL loads. */
const PhotoThumb = ({ src, onRemove, main }) => {
  const [broken, setBroken] = useState(false);
  return (
    <div className={cn("group relative aspect-square overflow-hidden rounded-xl border bg-surface-sunken", main ? "border-accent" : "border-line-subtle")}>
      {src && !broken ? (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-content-muted">
          <ImageIcon size={20} />
          <span className="text-[0.6875rem]">{src ? "Can't load" : "No photo"}</span>
        </span>
      )}
      {main && <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[0.625rem] font-bold text-accent-on">MAIN</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

const ProductForm = ({ open, onClose, product, onSaved }) => {
  const toast = useToast();
  const isEdit = Boolean(product?._id);
  const [form, setForm] = useState(() => toForm(product));
  const [errors, setErrors] = useState({});
  const [extraUrl, setExtraUrl] = useState("");
  const { data: tree } = useApi(getCategoryTree, null, { cacheTime: 5 * 60 * 1000 });

  const { mutate: save, loading } = useMutation((payload) =>
    isEdit ? updateProduct(product._id, payload) : createProduct(payload)
  );

  // Departments with their sub-categories, for a grouped picker.
  const categoryGroups = useMemo(
    () =>
      (tree || []).map((dept) => ({
        label: dept.name,
        options: [dept, ...(dept.children || [])].map((node) => ({ value: node._id, label: node.name })),
      })),
    [tree]
  );
  const categoryById = useMemo(() => {
    const map = new Map();
    const walk = (nodes) => nodes.forEach((node) => (map.set(node._id, node), walk(node.children || [])));
    walk(tree || []);
    return map;
  }, [tree]);

  const set = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const setField = (field) => (event) => set(field, event?.target?.value ?? event);

  const finalPrice = customerPrice(form.price, form.discount, form.gst);
  const saving = Number(form.price || 0) * (Number(form.discount || 0) / 100);

  const addExtra = () => {
    const url = extraUrl.trim();
    if (!/^https?:\/\//.test(url)) {
      toast.error("That isn't a link", "Paste an image address starting with http:// or https://");
      return;
    }
    if (form.images.length >= 10) return;
    set("images", [...form.images, url]);
    setExtraUrl("");
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document.getElementById(`product-${SECTION_OF[Object.keys(found)[0]]}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    try {
      // totalPrice is derived server-side, so it is never sent.
      await save({
        ...form,
        categoryRef: form.categoryRef || null,
        price: Number(form.price),
        discount: Number(form.discount),
        gst: Number(form.gst),
        countInStock: Number(form.countInStock),
        lowStockThreshold: Number(form.lowStockThreshold),
      });
      toast.success(isEdit ? "Product updated" : "Product added", form.name);
      onSaved();
      onClose();
    } catch (caught) {
      const apiErrors = caught?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        setErrors(Object.fromEntries(apiErrors.map((issue) => [issue.field.replace("body.", ""), issue.message])));
      }
      toast.error("Could not save product", getErrorMessage(caught));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit product" : "Add a product"}
      description={isEdit ? form.name : "Four quick steps. The preview on the right shows how shoppers will see it."}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon={isEdit ? Check : Plus}>
            {isEdit ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15.5rem]">
        <div className="space-y-4">
          {/* 1. Basics */}
          <Section id="basics" number="1" title="What is it?" hint="Name, maker and where it lives in the shop">
            <Input
              label="Product name"
              required
              placeholder="e.g. Organic Cotton Bath Towel"
              value={form.name}
              onChange={setField("name")}
              error={errors.name}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Brand" required placeholder="e.g. Planet Home" value={form.brand} onChange={setField("brand")} error={errors.brand} />
              <Select
                label="Category"
                required
                placeholder="Choose a category"
                value={form.categoryRef || undefined}
                options={categoryGroups}
                showSearch
                error={errors.category}
                onChange={(event) => {
                  const value = event.target.value;
                  const node = categoryById.get(value);
                  setForm((current) => ({ ...current, categoryRef: value, category: node?.name || "" }));
                  setErrors((current) => ({ ...current, category: undefined }));
                }}
              />
            </div>
            <Input
              label="One-line summary"
              placeholder="Shown on product cards, e.g. Soft, quick-drying, 600 GSM"
              maxLength={500}
              value={form.shortDescription}
              onChange={setField("shortDescription")}
            />
            <Textarea
              label="Description"
              required
              rows={4}
              placeholder="What it is, what it's made of, sizes, care instructions…"
              value={form.description}
              onChange={setField("description")}
              error={errors.description}
              hint={`${form.description.length} / 5000 characters`}
            />
          </Section>

          {/* 2. Photos */}
          <Section id="photos" number="2" title="Photos" hint="Paste image links. The first is the main photo; add up to 10 more for the gallery.">
            <Input
              label="Main photo link"
              required
              icon={ImageIcon}
              placeholder="https://…/photo.jpg"
              value={form.image}
              onChange={setField("image")}
              error={errors.image}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="More photos"
                  placeholder="Paste another image link and press Add"
                  value={extraUrl}
                  onChange={(event) => setExtraUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addExtra();
                    }
                  }}
                />
              </div>
              <Button className="mt-[1.6rem]" variant="secondary" icon={Plus} onClick={addExtra} disabled={!extraUrl.trim() || form.images.length >= 10}>
                Add
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <PhotoThumb src={form.image} main />
              {form.images.map((url, index) => (
                <PhotoThumb key={`${url}-${index}`} src={url} onRemove={() => set("images", form.images.filter((_, i) => i !== index))} />
              ))}
            </div>
          </Section>

          {/* 3. Pricing */}
          <Section id="pricing" number="3" title="Price" hint="Enter the price before discount and tax. We work out what the customer pays.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Price (MRP)" required type="number" min="0" step="0.01" suffix="₹" placeholder="999" value={form.price} onChange={setField("price")} error={errors.price} />
              <Input label="Discount" type="number" min="0" max="100" suffix="%" placeholder="0" value={form.discount} onChange={setField("discount")} error={errors.discount} />
              <div>
                <p className="mb-1.5 type-label text-content">GST</p>
                <div className="flex flex-wrap gap-1.5">
                  {GST_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => set("gst", rate)}
                      aria-pressed={Number(form.gst) === rate}
                      className={cn(
                        "rounded-full px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
                        Number(form.gst) === rate ? "bg-accent text-accent-on" : "bg-surface-sunken text-content-secondary hover:text-content"
                      )}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl bg-surface-sunken px-4 py-3">
              <span className="type-caption text-content-secondary">Customer pays</span>
              <span className="type-numeric text-[1.25rem] font-semibold text-content">{formatCurrency(finalPrice, { precise: true })}</span>
              {saving > 0 && <span className="type-caption text-status-good">saves {formatCurrency(saving, { precise: true })}</span>}
              <span className="type-caption text-content-muted">incl. {form.gst}% GST</span>
            </div>
          </Section>

          {/* 4. Stock & visibility */}
          <Section id="stock" number="4" title="Stock & visibility">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="In stock" type="number" min="0" placeholder="10" value={form.countInStock} onChange={setField("countInStock")} error={errors.countInStock} />
              <Input
                label="Warn me at"
                type="number"
                min="0"
                placeholder="5"
                value={form.lowStockThreshold}
                onChange={setField("lowStockThreshold")}
                hint="Shows on the dashboard as low stock"
              />
              <Input label="SKU" placeholder="Optional, e.g. TWL-ORG-01" value={form.sku} onChange={setField("sku")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Switch
                label="Show in the shop"
                description="Turn off to hide it from customers"
                checked={form.isActive}
                onChange={(checked) => set("isActive", checked)}
              />
              <Switch
                label="Feature on the home page"
                description="Appears in highlighted sections"
                checked={form.isFeatured}
                onChange={(checked) => set("isFeatured", checked)}
              />
            </div>
          </Section>
        </div>

        {/* Live preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-0">
            <p className="mb-2 type-label text-content-muted">Shopper preview</p>
            <div className="overflow-hidden rounded-2xl border border-line-subtle bg-surface shadow-sm">
              <div className="relative">
                <PhotoThumb src={form.image} />
                {Number(form.discount) > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-status-critical px-2 py-0.5 text-[0.6875rem] font-bold text-white">
                    {Math.round(Number(form.discount))}% OFF
                  </span>
                )}
                {!form.isActive && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[0.8125rem] font-semibold text-white">
                    Hidden from shop
                  </span>
                )}
              </div>
              <div className="space-y-1 p-3.5">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-content-muted">{form.brand || "Brand"}</p>
                <p className="line-clamp-2 text-[0.875rem] font-medium text-content">{form.name || "Product name"}</p>
                {form.shortDescription && <p className="line-clamp-2 type-caption text-content-muted">{form.shortDescription}</p>}
                <p className="flex items-baseline gap-2 pt-1">
                  <span className="type-numeric font-semibold text-content">{formatCurrency(finalPrice)}</span>
                  {Number(form.discount) > 0 && (
                    <span className="type-numeric text-[0.75rem] text-content-muted line-through">{formatCurrency(form.price)}</span>
                  )}
                </p>
                <p className={cn("type-caption", Number(form.countInStock) > 0 ? "text-status-good" : "text-status-critical")}>
                  {Number(form.countInStock) > 0 ? `In stock (${form.countInStock})` : "Out of stock"}
                </p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 type-caption text-content-muted">
              <Eye size={13} /> {form.category || "No category yet"}
            </p>
          </div>
        </aside>
      </form>
    </Modal>
  );
};

/** Quick slices of the catalogue; every tab includes hidden products except "Live". */
const PRODUCT_TABS = [
  { value: "all", label: "All", params: { includeInactive: "true" } },
  { value: "live", label: "Live", params: {} },
  { value: "hidden", label: "Hidden", params: { includeInactive: "true", onlyInactive: "true" } },
  { value: "low", label: "Low stock", params: { includeInactive: "true", lowStock: "true" }, alert: true },
  { value: "out", label: "Out of stock", params: { includeInactive: "true", inStock: "false" }, alert: true },
];

const Products = () => {
  const toast = useToast();
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const [tab, setTab] = useState("all");
  const params = useMemo(
    () => ({ ...list.params, ...(PRODUCT_TABS.find((item) => item.value === tab)?.params || {}) }),
    [list.params, tab]
  );
  const [countVersion, setCountVersion] = useState(0);

  const { data, meta, loading, error, refetch, reload: reloadList } = useApi(getProducts, params);
  const counts = useTabCounts(getProducts, list.filters.category ? { category: list.filters.category } : {}, PRODUCT_TABS, countVersion);
  const reload = () => {
    reloadList();
    setCountVersion((version) => version + 1);
  };
  const { data: filters } = useApi(getProductFilters, null, { cacheTime: 5 * 60 * 1000 });
  const { mutate: removeProduct, loading: deleting } = useMutation(deleteProduct);

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // /admin/products?new=1 (from the dashboard) opens the form straight away.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await removeProduct(pendingDelete._id);
      toast.success("Product deleted", pendingDelete.name);
      setPendingDelete(null);
      reload();
    } catch (caught) {
      toast.error("Could not delete product", getErrorMessage(caught));
    }
  };

  const columns = [
    {
      key: "name",
      header: "Product",
      sortKey: "name",
      render: (product) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className="relative shrink-0">
            <img
              src={product.image}
              alt=""
              loading="lazy"
              className={cn("h-12 w-12 rounded-xl border border-line-subtle bg-surface-sunken object-cover", product.isActive === false && "opacity-50 grayscale")}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
            {product.isFeatured && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-status-warning text-white shadow" title="Featured">
                <Star size={11} fill="currentColor" />
              </span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[18rem] truncate type-body-strong text-content">{product.name}</span>
            <span className="block truncate type-caption">
              {product.brand}
              {product.sku ? ` · ${product.sku}` : ""}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      hideBelow: "md",
      render: (product) => (
        <span className="inline-flex rounded-full bg-surface-sunken px-2.5 py-1 text-[0.75rem] font-medium text-content-secondary">
          {product.category || "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      numeric: true,
      sortKey: "totalPrice",
      render: (product) => (
        <span className="block">
          <span className="block type-body-strong text-content">{formatCurrency(product.totalPrice)}</span>
          {product.discount > 0 && (
            <span className="flex items-center justify-end gap-1.5 type-caption">
              {/* Before discount, tax included, so it compares like for like with the price above. */}
              <span className="line-through">{formatCurrency(product.price * (1 + (product.gst || 0) / 100))}</span>
              <span className="font-semibold text-status-good">−{Math.round(product.discount)}%</span>
            </span>
          )}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortKey: "countInStock",
      render: (product) => {
        const stock = product.countInStock ?? 0;
        const threshold = product.lowStockThreshold ?? 5;
        const isOut = stock === 0;
        const isLow = !isOut && stock <= threshold;
        // Full bar at four times the reorder point: enough to read "plenty" vs "nearly gone".
        const fill = Math.min(100, (stock / Math.max(1, threshold * 4)) * 100);
        return (
          <span className="block w-28">
            <span className="flex items-baseline justify-between">
              <span className={cn("type-numeric type-body-strong", isOut ? "text-status-critical" : isLow ? "text-status-warning" : "text-content")}>
                {formatNumber(stock)}
              </span>
              <span className={cn("type-caption", isOut ? "text-status-critical" : isLow ? "text-status-warning" : "")}>
                {isOut ? "Out" : isLow ? "Low" : "In stock"}
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
      key: "isActive",
      header: "Status",
      hideBelow: "lg",
      render: (product) => (
        <Badge tone={product.isActive === false ? "neutral" : "good"} dot>
          {product.isActive === false ? "Hidden" : "Live"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (product) => (
        <span className="inline-flex items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
          <Button
            as={Link}
            to={`/product/${product._id}`}
            target="_blank"
            variant="ghost"
            size="icon-sm"
            icon={ExternalLink}
            aria-label={`View ${product.name} in the store`}
            title="View in store"
          />
          <Button variant="ghost" size="icon-sm" icon={Pencil} aria-label={`Edit ${product.name}`} title="Edit" onClick={() => openEdit(product)} />
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Trash2}
            aria-label={`Delete ${product.name}`}
            title="Delete"
            onClick={() => setPendingDelete(product)}
            className="text-status-critical hover:bg-status-critical-bg"
          />
        </span>
      ),
    },
  ];

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...(filters?.categories || []).map((category) => ({ value: category, label: category })),
  ];

  return (
    <div className="space-y-section">
      <PageHeader
        title="Products"
        description="Your catalogue at a glance. Click a row to edit it."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Add product
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <ListToolbar
          tabs={
            <QuickTabs
              id="products"
              tabs={PRODUCT_TABS}
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
              placeholder="Name, brand, SKU or category"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
              aria-label="Search products"
              clearable
              onClear={() => list.setSearch("")}
            />
          }
          filters={
            <Select
              aria-label="Filter by category"
              value={list.filters.category || ""}
              onChange={(event) => list.setFilter("category", event.target.value)}
              options={categoryOptions}
              className="w-52"
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
          onRowClick={openEdit}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters || tab !== "all"}
          onClearFilters={() => {
            list.clearFilters();
            setTab("all");
          }}
          emptyState={
            <EmptyState
              icon={Package}
              title={list.hasFilters || tab !== "all" ? "No products match" : "No products yet"}
              description={list.hasFilters || tab !== "all" ? "Try another tab or search." : "Add your first product to start selling."}
              action={
                <Button variant="primary" icon={Plus} onClick={openCreate}>
                  Add product
                </Button>
              }
            />
          }
        />
      </Card>

      {formOpen && (
        <ProductForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          product={editing}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete ${pendingDelete?.name}?`}
        confirmLabel="Delete product"
      />
    </div>
  );
};

export default Products;
