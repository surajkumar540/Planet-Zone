/**
 * Role hierarchy. Higher rank implies every permission of the roles below it.
 */
const ROLES = Object.freeze({
  CUSTOMER: "customer",
  STAFF: "staff",
  MANAGER: "manager",
  ADMIN: "admin",
});

const ROLE_RANK = Object.freeze({
  [ROLES.CUSTOMER]: 0,
  [ROLES.STAFF]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.ADMIN]: 3,
});

const ROLE_VALUES = Object.values(ROLES);

/** True when `role` sits at or above `minimum` in the hierarchy. */
const hasAtLeastRole = (role, minimum) =>
  (ROLE_RANK[role] ?? -1) >= (ROLE_RANK[minimum] ?? Number.MAX_SAFE_INTEGER);

module.exports = { ROLES, ROLE_RANK, ROLE_VALUES, hasAtLeastRole };
