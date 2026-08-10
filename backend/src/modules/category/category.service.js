const AppError = require("../../core/AppError");
const Category = require("../../models/CategoryModel");
const Product = require("../../models/ProductModel");
const categoryRepository = require("./category.repository");
const { uniqueSlug } = require("../../utils/slug");
const { searchFilter } = require("../../utils/schemas");

/**
 * Resolves the tree position of a node given its parent.
 * A null parent produces a root node at depth zero.
 */
const resolvePlacement = async (parentId, slug) => {
  if (!parentId) {
    return { parent: null, ancestors: [], depth: 0, path: slug };
  }

  const parent = await categoryRepository.findById(parentId);
  if (!parent) throw AppError.badRequest("Parent category not found");

  return {
    parent: parent._id,
    ancestors: [...(parent.ancestors || []), parent._id],
    depth: (parent.depth || 0) + 1,
    path: `${parent.path}/${slug}`,
  };
};

const create = async (payload) => {
  const slug = await uniqueSlug(payload.slug || payload.name, (candidate) =>
    categoryRepository.slugExists(candidate)
  );
  const placement = await resolvePlacement(payload.parent, slug);

  const category = await Category.create({ ...payload, slug, ...placement });
  return category.toObject();
};

/**
 * Rewrites the cached `path`, `ancestors` and `depth` of a node's whole
 * subtree. Called whenever a rename or move invalidates them.
 */
const rebuildSubtree = async (categoryId) => {
  const root = await Category.findById(categoryId);
  if (!root) return;

  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    const children = await Category.find({ parent: node._id });

    for (const child of children) {
      child.ancestors = [...node.ancestors, node._id];
      child.depth = node.depth + 1;
      child.path = `${node.path}/${child.slug}`;
      await child.save();
      queue.push(child);
    }
  }
};

/** Rejects a move that would place a node inside its own subtree. */
const assertNotCircular = async (categoryId, newParentId) => {
  if (!newParentId) return;
  if (String(categoryId) === String(newParentId)) {
    throw AppError.badRequest("A category cannot be its own parent");
  }

  const newParent = await categoryRepository.findById(newParentId);
  if (!newParent) throw AppError.badRequest("Parent category not found");

  if ((newParent.ancestors || []).some((id) => String(id) === String(categoryId))) {
    throw AppError.badRequest("A category cannot be moved inside its own subtree");
  }
};

const update = async (id, payload) => {
  const category = await Category.findById(id);
  if (!category) throw AppError.notFound("Category not found");

  const parentChanged =
    payload.parent !== undefined && String(payload.parent || "") !== String(category.parent || "");

  if (parentChanged) await assertNotCircular(id, payload.parent);

  let slugChanged = false;
  if (payload.slug || payload.name) {
    const desired = payload.slug || payload.name;
    const nextSlug = await uniqueSlug(desired, (candidate) =>
      categoryRepository.slugExists(candidate, id)
    );
    slugChanged = nextSlug !== category.slug;
    category.slug = nextSlug;
  }

  Object.assign(category, { ...payload, slug: category.slug });

  if (parentChanged || slugChanged) {
    const placement = await resolvePlacement(payload.parent ?? category.parent, category.slug);
    Object.assign(category, placement);
  }

  await category.save();

  // Descendants cache this node's path, so they must be refreshed.
  if (parentChanged || slugChanged) await rebuildSubtree(category._id);

  return category.toObject();
};

/**
 * Removes a category.
 *
 * Refuses while children or products still reference it, so the tree cannot
 * be left with orphans. `reassignTo` moves products first when supplied.
 */
const remove = async (id, { reassignTo } = {}) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw AppError.notFound("Category not found");

  const childCount = await categoryRepository.countChildren(id);
  if (childCount > 0) {
    throw AppError.conflict(
      `This category has ${childCount} subcategor${childCount === 1 ? "y" : "ies"}. Move or delete them first.`
    );
  }

  const productCount = await Product.countDocuments({ categoryRef: id });
  if (productCount > 0) {
    if (!reassignTo) {
      throw AppError.conflict(
        `${productCount} product${productCount === 1 ? "" : "s"} use this category. Reassign them first.`
      );
    }

    const target = await categoryRepository.findById(reassignTo);
    if (!target) throw AppError.badRequest("Replacement category not found");

    await Product.updateMany(
      { categoryRef: id },
      { $set: { categoryRef: target._id, category: target.name } }
    );
  }

  await Category.findByIdAndDelete(id);
  return { deleted: true, reassigned: productCount };
};

const list = async ({ search, isActive, parent, includeCounts }) => {
  const filter = {
    ...searchFilter(search, ["name", "slug", "path"]),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(parent !== undefined ? { parent: parent || null } : {}),
  };

  const categories = await categoryRepository.findAllOrdered(filter);
  if (!includeCounts) return categories;

  // One grouped query rather than a count per category.
  const counts = await Product.aggregate([
    { $match: { categoryRef: { $ne: null } } },
    { $group: { _id: "$categoryRef", count: { $sum: 1 } } },
  ]);
  const byCategory = new Map(counts.map((row) => [String(row._id), row.count]));

  return categories.map((category) => ({
    ...category,
    productCount: byCategory.get(String(category._id)) || 0,
  }));
};

/** Assembles the flat list into a nested tree for the sidebar and menus. */
const tree = async ({ isActive } = {}) => {
  const categories = await list({ isActive, includeCounts: true });

  const nodes = new Map(
    categories.map((category) => [String(category._id), { ...category, children: [] }])
  );
  const roots = [];

  for (const node of nodes.values()) {
    const parentNode = node.parent && nodes.get(String(node.parent));
    if (parentNode) parentNode.children.push(node);
    else roots.push(node);
  }
  return roots;
};

const getById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw AppError.notFound("Category not found");

  const [children, productCount] = await Promise.all([
    categoryRepository.findChildren(id),
    Product.countDocuments({ categoryRef: id }),
  ]);

  return { ...category, children, productCount };
};

/** Applies a new manual ordering within a parent. */
const reorder = async (items) => {
  await Promise.all(
    items.map(({ id, position }) => Category.updateOne({ _id: id }, { $set: { position } }))
  );
  return { updated: items.length };
};

module.exports = { create, update, remove, list, tree, getById, reorder };
