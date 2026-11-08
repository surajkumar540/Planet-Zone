const prisma = require("../../db/client");
const { num } = require("../../db/mappers");
const AppError = require("../../core/AppError");
const userRepository = require("./user.repository");
const { toPublicUser } = require("../auth/auth.service");
const { parseSort, searchFilter, sortable } = require("../../utils/schemas");
const { ROLES } = require("../../constants/roles");
const { REVENUE_STATUSES } = require("../../constants/orderStatus");

const SORTABLE = sortable("createdAt", "firstName", "lastName", "email", "role", "lastLoginAt");

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
  const where = {
    ...searchFilter(search, ["firstName", "lastName", "email", "phone"]),
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const result = await userRepository.paginate(where, {
    page,
    limit,
    orderBy: parseSort(sort, SORTABLE),
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

  const stats = await prisma.order.aggregate({
    where: { userId: id, status: { in: [...REVENUE_STATUSES] } },
    _count: { _all: true },
    _sum: { grandTotal: true },
    _max: { createdAt: true },
  });

  const orderCount = stats._count._all;
  const totalSpent = num(stats._sum.grandTotal) || 0;

  return {
    ...toPublicUser(user),
    stats: {
      orderCount,
      totalSpent,
      averageOrderValue: orderCount ? totalSpent / orderCount : 0,
      lastOrderAt: stats._max.createdAt,
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

  const user = await userRepository.updateById(id, payload);
  return toPublicUser(user);
};

module.exports = { getProfile, updateProfile, listUsers, getUserById, updateUser };
