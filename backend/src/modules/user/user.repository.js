const BaseRepository = require("../../core/BaseRepository");
const User = require("../../models/UserModel");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, { withPassword = false } = {}) {
    const query = this.model.findOne({ email: String(email).toLowerCase() });
    if (withPassword) query.select("+password");
    return query;
  }

  /** Counts customers created on or after `since`, for dashboard deltas. */
  countCustomersSince(since) {
    return this.model.countDocuments({
      role: "customer",
      createdAt: { $gte: since },
    });
  }
}

module.exports = new UserRepository();
