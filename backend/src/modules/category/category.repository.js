const BaseRepository = require("../../core/BaseRepository");
const { toCategory } = require("../../db/mappers");

class CategoryRepository extends BaseRepository {
  constructor() {
    super("category", toCategory);
  }

  async slugExists(slug, excludeId) {
    const count = await this.count({ slug, ...(excludeId ? { id: { not: excludeId } } : {}) });
    return count > 0;
  }

  /** Direct children of a node, in display order. */
  findChildren(parentId, options = {}) {
    return this.find({ parentId }, { orderBy: [{ position: "asc" }, { name: "asc" }], ...options });
  }

  countChildren(categoryId) {
    return this.count({ parentId: categoryId });
  }

  findAllOrdered(where = {}) {
    return this.find(where, { orderBy: [{ depth: "asc" }, { position: "asc" }, { name: "asc" }] });
  }
}

module.exports = new CategoryRepository();
