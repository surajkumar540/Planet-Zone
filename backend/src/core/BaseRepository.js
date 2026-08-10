/**
 * Thin persistence wrapper around a Mongoose model.
 *
 * Services depend on repositories rather than models directly, which keeps
 * query construction out of business logic and gives every collection a
 * consistent pagination contract.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(payload, options = {}) {
    return this.model.create([payload], options).then(([doc]) => doc);
  }

  findById(id, { select, populate, lean = true } = {}) {
    let query = this.model.findById(id);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return lean ? query.lean() : query;
  }

  findOne(filter, { select, populate, lean = true } = {}) {
    let query = this.model.findOne(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return lean ? query.lean() : query;
  }

  find(filter = {}, { select, populate, sort, limit, skip, lean = true } = {}) {
    let query = this.model.find(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);
    if (typeof skip === "number") query = query.skip(skip);
    if (typeof limit === "number") query = query.limit(limit);
    return lean ? query.lean() : query;
  }

  /**
   * Runs the filtered page query and its matching count in parallel.
   * Returns `{ items, total, page, limit }` ready for ApiResponse.paginated.
   */
  async paginate(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 }, select, populate } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.find(filter, { select, populate, sort, limit, skip }),
      this.model.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  }

  updateById(id, update, options = {}) {
    return this.model
      .findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options })
      .lean();
  }

  updateOne(filter, update, options = {}) {
    return this.model
      .findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options })
      .lean();
  }

  deleteById(id, options = {}) {
    return this.model.findByIdAndDelete(id, options).lean();
  }

  exists(filter) {
    return this.model.exists(filter);
  }

  count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  aggregate(pipeline, options = {}) {
    return this.model.aggregate(pipeline, options);
  }
}

module.exports = BaseRepository;
