const { Prisma } = require("@prisma/client");
const prisma = require("../db/client");

const isNotFound = (error) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

/**
 * Thin persistence wrapper around a Prisma model.
 *
 * Every read returns the API shape produced by `map`, and the same pagination
 * contract applies to every table. Methods accept an optional `tx` so they can
 * take part in a transaction.
 */
class BaseRepository {
  /**
   * @param {string} modelName Prisma delegate name, e.g. "product"
   * @param {(row: object) => object} map row-to-API mapper
   * @param {object} [include] relations loaded by default
   */
  constructor(modelName, map, include) {
    this.modelName = modelName;
    this.map = map;
    this.defaultInclude = include;
  }

  delegate(tx) {
    return (tx || prisma)[this.modelName];
  }

  async findById(id, { include = this.defaultInclude, tx } = {}) {
    return this.map(await this.delegate(tx).findUnique({ where: { id }, include }));
  }

  async findOne(where, { include = this.defaultInclude, orderBy, tx } = {}) {
    return this.map(await this.delegate(tx).findFirst({ where, include, orderBy }));
  }

  async find(where = {}, { include = this.defaultInclude, orderBy, take, skip, tx } = {}) {
    const rows = await this.delegate(tx).findMany({ where, include, orderBy, take, skip });
    return rows.map((row) => this.map(row));
  }

  /** Returns `{ items, total, page, limit }`, ready for ApiResponse.paginated. */
  async paginate(where = {}, { page = 1, limit = 20, orderBy, include = this.defaultInclude } = {}) {
    const [items, total] = await Promise.all([
      this.find(where, { include, orderBy, take: limit, skip: (page - 1) * limit }),
      this.delegate().count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async create(data, { include = this.defaultInclude, tx } = {}) {
    return this.map(await this.delegate(tx).create({ data, include }));
  }

  /** Resolves to null, rather than throwing, when the row does not exist. */
  async updateById(id, data, { include = this.defaultInclude, tx } = {}) {
    try {
      return this.map(await this.delegate(tx).update({ where: { id }, data, include }));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  /** Resolves to null, rather than throwing, when the row does not exist. */
  async deleteById(id, { tx } = {}) {
    try {
      return this.map(await this.delegate(tx).delete({ where: { id } }));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  count(where = {}, { tx } = {}) {
    return this.delegate(tx).count({ where });
  }
}

module.exports = BaseRepository;
