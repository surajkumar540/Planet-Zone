import { useState } from "react";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  createProduct,
  deleteProduct,
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

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  category: "",
  description: "",
  image: "",
  price: "",
  discount: 0,
  gst: 0,
  countInStock: 0,
  lowStockThreshold: 5,
  isActive: true,
};

/** Client-side checks mirroring the API's rules, for immediate feedback. */
const validate = (form) => {
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = "Enter a product name";
  if (!form.brand?.trim()) errors.brand = "Brand is required";
  if (!form.category?.trim()) errors.category = "Category is required";
  if (!form.description?.trim()) errors.description = "Description is required";
  if (!form.image?.trim()) errors.image = "Image URL is required";
  if (form.price === "" || Number(form.price) < 0) errors.price = "Enter a valid price";
  if (Number(form.discount) < 0 || Number(form.discount) > 100)
    errors.discount = "Must be between 0 and 100";
  if (Number(form.gst) < 0 || Number(form.gst) > 100) errors.gst = "Must be between 0 and 100";
  if (Number(form.countInStock) < 0) errors.countInStock = "Cannot be negative";
  return errors;
};

const ProductForm = ({ open, onClose, product, onSaved, categories }) => {
  const toast = useToast();
  const isEdit = Boolean(product?._id);
  const [form, setForm] = useState(product || EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});

  const { mutate: save, loading } = useMutation((payload) =>
    isEdit ? updateProduct(product._id, payload) : createProduct(payload)
  );

  const setField = (field) => (event) => {
    const value =
      event?.target?.type === "checkbox" ? event.target.checked : event?.target?.value ?? event;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    try {
      // totalPrice is derived server-side, so it is never sent.
      await save({
        ...form,
        price: Number(form.price),
        discount: Number(form.discount),
        gst: Number(form.gst),
        countInStock: Number(form.countInStock),
        lowStockThreshold: Number(form.lowStockThreshold),
      });
      toast.success(isEdit ? "Product updated" : "Product created", form.name);
      onSaved();
      onClose();
    } catch (caught) {
      const apiErrors = caught?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        setErrors(
          Object.fromEntries(
            apiErrors.map((issue) => [issue.field.replace("body.", ""), issue.message])
          )
        );
      }
      toast.error("Could not save product", caught?.response?.data?.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit product" : "New product"}
      description={isEdit ? form.name : "Add a product to your catalogue."}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={setField("name")}
          error={errors.name}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Brand"
            required
            value={form.brand}
            onChange={setField("brand")}
            error={errors.brand}
          />
          <Input
            label="Category"
            required
            list="product-categories"
            value={form.category}
            onChange={setField("category")}
            error={errors.category}
            hint="Pick an existing category or type a new one"
          />
          <datalist id="product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <Input
          label="Image URL"
          required
          value={form.image}
          onChange={setField("image")}
          error={errors.image}
        />

        <Textarea
          label="Description"
          required
          rows={3}
          value={form.description}
          onChange={setField("description")}
          error={errors.description}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Price"
            required
            type="number"
            min="0"
            step="0.01"
            suffix="₹"
            value={form.price}
            onChange={setField("price")}
            error={errors.price}
          />
          <Input
            label="Discount"
            type="number"
            min="0"
            max="100"
            suffix="%"
            value={form.discount}
            onChange={setField("discount")}
            error={errors.discount}
          />
          <Input
            label="GST"
            type="number"
            min="0"
            max="100"
            suffix="%"
            value={form.gst}
            onChange={setField("gst")}
            error={errors.gst}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.countInStock}
            onChange={setField("countInStock")}
            error={errors.countInStock}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Input
            label="Low stock threshold"
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={setField("lowStockThreshold")}
            hint="Flagged for reorder at or below this level"
          />
          <Switch
            label="Visible in storefront"
            description="Inactive products stay hidden from customers"
            checked={form.isActive}
            onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))}
          />
        </div>
      </form>
    </Modal>
  );
};

const Products = () => {
  const toast = useToast();
  const list = useListParams({ limit: 20, sort: "createdAt:desc", includeInactive: "true" });

  const { data, meta, loading, error, refetch } = useApi(getProducts, list.params);
  const { data: filters } = useApi(getProductFilters, null);
  const { mutate: removeProduct, loading: deleting } = useMutation(deleteProduct);

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

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
      refetch();
    } catch (caught) {
      toast.error("Could not delete product", caught?.response?.data?.message);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Product",
      sortKey: "name",
      render: (product) => (
        <span className="flex items-center gap-3 min-w-0">
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className="w-9 h-9 rounded-md object-cover bg-surface-sunken shrink-0"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span className="type-body-strong text-content block truncate">{product.name}</span>
            <span className="type-caption block truncate">{product.brand}</span>
          </span>
        </span>
      ),
    },
    { key: "category", header: "Category", hideBelow: "md" },
    {
      key: "price",
      header: "Price",
      align: "right",
      numeric: true,
      sortKey: "totalPrice",
      render: (product) => (
        <span>
          <span className="type-body-strong text-content block">
            {formatCurrency(product.totalPrice)}
          </span>
          {product.discount > 0 && (
            <span className="type-caption block">{product.discount}% off</span>
          )}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      numeric: true,
      sortKey: "countInStock",
      render: (product) => {
        const isOut = product.countInStock === 0;
        const isLow = !isOut && product.countInStock <= (product.lowStockThreshold ?? 5);
        return (
          <Badge tone={isOut ? "critical" : isLow ? "warning" : "neutral"}>
            {isOut ? "Out of stock" : formatNumber(product.countInStock)}
          </Badge>
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
        <span
          className="inline-flex items-center gap-1"
          // The row is not clickable here, but stop propagation defensively.
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Pencil}
            aria-label={`Edit ${product.name}`}
            onClick={() => openEdit(product)}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Trash2}
            aria-label={`Delete ${product.name}`}
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
        description="Manage your catalogue, pricing and stock."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            Add product
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search products"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search products"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by category"
            value={list.filters.category || ""}
            onChange={(event) => list.setFilter("category", event.target.value)}
            options={categoryOptions}
            className="sm:w-52"
          />
          <Select
            aria-label="Filter by stock"
            value={list.filters.lowStock ? "low" : list.filters.inStock === "false" ? "out" : ""}
            onChange={(event) => {
              const { value } = event.target;
              list.setFilter("lowStock", value === "low" ? "true" : "");
              list.setFilter("inStock", value === "out" ? "false" : "");
            }}
            options={[
              { value: "", label: "All stock levels" },
              { value: "low", label: "Low stock" },
              { value: "out", label: "Out of stock" },
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
          sort={list.sort}
          onSortChange={list.setSort}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first product to start selling."
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
          onSaved={refetch}
          categories={filters?.categories || []}
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
