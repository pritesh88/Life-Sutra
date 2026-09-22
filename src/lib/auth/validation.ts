import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(254)
  .transform((value) => value.toLowerCase());

const COMMON_PASSWORDS = new Set([
  "password1234",
  "passw0rd1234",
  "123456789012",
  "1234567890123",
  "qwertyuiop12",
  "qwerty123456",
  "letmein12345",
  "welcome12345",
  "iloveyou1234",
  "administrator1",
]);

/** Returns a user-facing reason if the password is unacceptable, otherwise null. */
export function passwordPolicyViolation(
  password: string,
  context: { email?: string; name?: string } = {},
): string | null {
  const lowered = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lowered)) return "That password is too common.";
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lowered.includes(local))
    return "Your password must not contain your email address.";
  return null;
}

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128, "Use at most 128 characters.")
  .regex(/[A-Za-z]/, "Include a letter.")
  .regex(/\d/, "Include a number.");

// Zod strips unknown keys: a client-supplied `role`, `roles` or `userId` never
// reaches the service layer.
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name.").max(100),
    email,
    password: passwordSchema,
  })
  .superRefine((value, ctx) => {
    const violation = passwordPolicyViolation(value.password, value);
    if (violation) ctx.addIssue({ code: "custom", path: ["password"], message: violation });
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required.").max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required.").max(128),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});
