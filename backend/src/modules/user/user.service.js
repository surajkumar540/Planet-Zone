const AppError = require("../../core/AppError");
const userRepository = require("./user.repository");
const orderRepository = require("../order/order.repository");
const { toPublicUser } = require("../auth/auth.service");
const { parseSort, searchFilter } = require("../../utils/schemas");
const { ROLES } = require("../../constants/roles");
const { REVENUE_STATUSES } = require("../../constants/orderStatus");

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw AppError.notFound("User not found");
  return toPublicUser(user);
};

const updateProfile = async (userId, payload) => {
  const user = await userRepository.updateById(userId, payload);
  if (!user) throw AppError.notFound("User not found");
  return toPublicUser(user);
};

/** Paginated customer directory for the dashboard. */
const listUsers = async ({ page, limit, search, sort, role, isActive }) => {
  const filter = {
    ...searchFilter(search, ["firstName", "lastName", "email", "phone"]),
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const result = await userRepository.paginate(filter, {
    page,
    limit,
    sort: parseSort(sort),
  });

  return { ...result, items: result.items.map(toPublicUser) };
};

/**
 * A single customer with their lifetime order statistics, which is what the
 * customer detail drawer needs in one round trip.
 */
const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw AppError.notFound("User not found");

  const [stats] = await orderRepository.aggregate([
    { $match: { User: user._id, status: { $in: REVENUE_STATUSES } } },
    {
      $group: {
        _id: null,
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$pricing.grandTotal" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);

  return {
    ...toPublicUser(user),
    stats: {
      orderCount: stats?.orderCount || 0,
      totalSpent: stats?.totalSpent || 0,
      averageOrderValue: stats?.orderCount ? stats.totalSpent / stats.orderCount : 0,
      lastOrderAt: stats?.lastOrderAt || null,
    },
  };
};

/**
 * Updates a user's role or active flag.
 *
 * An administrator may not change their own role or deactivate themselves,
 * which prevents a workspace from being locked out of its last admin seat.
 */
const updateUser = async (actorId, id, payload) => {
  if (String(actorId) === String(id)) {
    throw AppError.forbidden("You cannot change your own role or status");
  }

  const target = await userRepository.findById(id);
  if (!target) throw AppError.notFound("User not found");

  if (payload.role && target.role === ROLES.ADMIN && payload.role !== ROLES.ADMIN) {
    const adminCount = await userRepository.count({ role: ROLES.ADMIN, isActive: true });
    if (adminCount <= 1) {
      throw AppError.conflict("At least one active administrator must remain");
    }
  }

  const update = { ...payload };
  // Keep the legacy flag consistent with the canonical role.
  if (payload.role) update.isAdmin = payload.role === ROLES.ADMIN;

  const user = await userRepository.updateById(id, update);
  return toPublicUser(user);
};

module.exports = { getProfile, updateProfile, listUsers, getUserById, updateUser };
