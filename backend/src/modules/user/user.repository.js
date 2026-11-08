const BaseRepository = require("../../core/BaseRepository");
const { toUser } = require("../../db/mappers");

class UserRepository extends BaseRepository {
  constructor() {
    super("user", toUser);
  }

  /** The password hash is only ever returned when explicitly requested. */
  async findByEmail(email, { withPassword = false } = {}) {
    const row = await this.delegate().findUnique({ where: { email: String(email).toLowerCase() } });
    return toUser(row, { withPassword });
  }

  async findByIdWithPassword(id) {
    return toUser(await this.delegate().findUnique({ where: { id } }), { withPassword: true });
  }
}

module.exports = new UserRepository();
