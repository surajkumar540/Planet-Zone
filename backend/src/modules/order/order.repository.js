const BaseRepository = require("../../core/BaseRepository");
const { toOrder } = require("../../db/mappers");

const WITH_LINES = {
  items: { orderBy: { position: "asc" } },
  history: { orderBy: { sequence: "asc" } },
};

class OrderRepository extends BaseRepository {
  constructor() {
    super("order", toOrder, WITH_LINES);
  }
}

module.exports = new OrderRepository();
module.exports.WITH_LINES = WITH_LINES;
