const { z } = require("zod");
const { email, password } = require("../../utils/schemas");
const { OTP_LENGTH } = require("../../constants/otp");

const otpCode = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH} digit code`);

const name = z.string().trim().min(1, "Required").max(60);

const signupSchema = z
  .object({
    firstName: name,
    lastName: z.string().trim().max(60).optional().default(""),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const verifyOtpSchema = z.object({ email, otp: otpCode });

const requestOtpSchema = z.object({ email });

const resetPasswordSchema = z
  .object({
    email,
    otp: otpCode,
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  });

module.exports = {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  requestOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
