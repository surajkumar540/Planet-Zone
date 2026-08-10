const BaseRepository = require("../../core/BaseRepository");
const Category = require("../../models/CategoryModel");

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  findBySlug(slug) {
    return this.model.findOne({ slug }).lean();
  }

  slugExists(slug, excludeId) {
    return this.model
      .exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
      .then(Boolean);
  }

  /** Direct children of a node, in display order. */
  findChildren(parentId) {
    return this.model
      .find({ parent: parentId })
      .sort({ position: 1, name: 1 })
      .lean();
  }

  /** Every descendant at any depth, found through the cached ancestors list. */
  findDescendants(categoryId) {
    return this.model.find({ ancestors: categoryId }).lean();
  }

  countChildren(categoryId) {
    return this.model.countDocuments({ parent: categoryId });
  }

  findAllOrdered(filter = {}) {
    return this.model.find(filter).sort({ depth: 1, position: 1, name: 1 }).lean();
  }
}

module.exports = new CategoryRepository();
