import { z } from "zod";

// Reusable email and password schemas to ensure consistency
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Invalid email address format");

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const signupSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["patient", "doctor"]).optional().default("patient"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
