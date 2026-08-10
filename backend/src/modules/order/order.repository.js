const BaseRepository = require("../../core/BaseRepository");
const Order = require("../../models/OrderModel");

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /** Returns only the owner id, for cheap ownership checks. */
  findOwner(orderId) {
    return this.model.findById(orderId).select("User").lean();
  }
}

module.exports = new OrderRepository();
