const prisma = require("../../db/client");
const AppError = require("../../core/AppError");
const { withTransaction } = require("../../core/transaction");
const categoryRepository = require("./category.repository");
const { uniqueSlug } = require("../../utils/slug");
const { searchFilter } = require("../../utils/schemas");

/**
 * Resolves the tree position of a node given its parent.
 * A null parent produces a root node at depth zero.
 */
const resolvePlacement = async (parentId, slug) => {
  if (!parentId) {
    return { parentId: null, ancestors: [], depth: 0, path: slug };
  }

  const parent = await categoryRepository.findById(parentId);
  if (!parent) throw AppError.badRequest("Parent category not found");

  return {
    parentId: parent._id,
    ancestors: [...(parent.ancestors || []), parent._id],
    depth: (parent.depth || 0) + 1,
    path: `${parent.path}/${slug}`,
  };
};

const create = async ({ parent, slug: requestedSlug, ...fields }) => {
  const slug = await uniqueSlug(requestedSlug || fields.name, (candidate) =>
    categoryRepository.slugExists(candidate)
  );
  const placement = await resolvePlacement(parent, slug);

  return categoryRepository.create({ ...fields, slug, ...placement });
};

/**
 * Rewrites the cached `path`, `ancestors` and `depth` of a node's whole
 * subtree. Called whenever a rename or move invalidates them.
 */
const rebuildSubtree = async (root, tx) => {
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    const children = await categoryRepository.findChildren(node._id, { tx });

    for (const child of children) {
      const updated = await categoryRepository.updateById(
        child._id,
        {
          ancestors: [...node.ancestors, node._id],
          depth: node.depth + 1,
          path: `${node.path}/${child.slug}`,
        },
        { tx }
      );
      queue.push(updated);
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

const update = async (id, { parent, slug: requestedSlug, ...fields }) => {
  const category = await categoryRepository.findById(id);
  if (!category) throw AppError.notFound("Category not found");

  const parentChanged =
    parent !== undefined && String(parent || "") !== String(category.parent || "");

  if (parentChanged) await assertNotCircular(id, parent);

  let slug = category.slug;
  if (requestedSlug || fields.name) {
    slug = await uniqueSlug(requestedSlug || fields.name, (candidate) =>
      categoryRepository.slugExists(candidate, id)
    );
  }
  const slugChanged = slug !== category.slug;

  const data = { ...fields, slug };
  const moved = parentChanged || slugChanged;
  if (moved) {
    // `null` means "move to the root", so only undefined keeps the current parent.
    const nextParent = parent !== undefined ? parent : category.parent;
    Object.assign(data, await resolvePlacement(nextParent, slug));
  }

  return withTransaction(async (tx) => {
    const updated = await categoryRepository.updateById(id, data, { tx });
    // Descendants cache this node's path, so they must be refreshed.
    if (moved) await rebuildSubtree(updated, tx);
    return updated;
  });
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

  const productCount = await prisma.product.count({ where: { categoryRefId: id } });
  if (productCount > 0) {
    if (!reassignTo) {
      throw AppError.conflict(
        `${productCount} product${productCount === 1 ? "" : "s"} use this category. Reassign them first.`
      );
    }

    const target = await categoryRepository.findById(reassignTo);
    if (!target) throw AppError.badRequest("Replacement category not found");

    await prisma.product.updateMany({
      where: { categoryRefId: id },
      data: { categoryRefId: target._id, category: target.name },
    });
  }

  await categoryRepository.deleteById(id);
  return { deleted: true, reassigned: productCount };
};

const list = async ({ search, isActive, parent, includeCounts }) => {
  const where = {
    ...searchFilter(search, ["name", "slug", "path"]),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(parent !== undefined ? { parentId: parent || null } : {}),
  };

  const categories = await categoryRepository.findAllOrdered(where);
  if (!includeCounts) return categories;

  // One grouped query rather than a count per category.
  const counts = await prisma.product.groupBy({
    by: ["categoryRefId"],
    where: { categoryRefId: { not: null } },
    _count: { _all: true },
  });
  const byCategory = new Map(counts.map((row) => [row.categoryRefId, row._count._all]));

  return categories.map((category) => ({
    ...category,
    productCount: byCategory.get(category._id) || 0,
  }));
};

/** Assembles the flat list into a nested tree for the sidebar and menus. */
const tree = async ({ isActive } = {}) => {
  const categories = await list({ isActive, includeCounts: true });

  const nodes = new Map(categories.map((category) => [category._id, { ...category, children: [] }]));
  const roots = [];

  for (const node of nodes.values()) {
    const parentNode = node.parent && nodes.get(node.parent);
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
    prisma.product.count({ where: { categoryRefId: id } }),
  ]);

  return { ...category, children, productCount };
};

/** Applies a new manual ordering within a parent. */
const reorder = async (items) => {
  await prisma.$transaction(
    items.map(({ id, position }) =>
      prisma.category.updateMany({ where: { id }, data: { position } })
    )
  );
  return { updated: items.length };
};

module.exports = { create, update, remove, list, tree, getById, reorder };
