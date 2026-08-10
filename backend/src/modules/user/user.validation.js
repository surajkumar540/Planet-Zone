const { z } = require("zod");
const { listQuery, idParam } = require("../../utils/schemas");
const { ROLE_VALUES } = require("../../constants/roles");

const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60).optional(),
    lastName: z.string().trim().max(60).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    avatar: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .strict();

const listUsersQuery = listQuery.extend({
  role: z.enum(ROLE_VALUES).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const updateUserSchema = z
  .object({
    role: z.enum(ROLE_VALUES).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = {
  updateProfileSchema,
  listUsersQuery,
  updateUserSchema,
  userIdParam: idParam("id"),
};
