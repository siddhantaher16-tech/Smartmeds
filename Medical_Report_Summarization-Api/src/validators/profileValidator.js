import { z } from "zod";

export const medicalProfileSchema = z.object({
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date_of_birth must be in YYYY-MM-DD format")
    .optional(),

  biological_sex: z.enum(["male", "female", "other"]).optional(),

  blood_group: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"])
    .optional(),

  height_cm: z.number().positive("Height must be a positive number").max(300).optional(),

  weight_kg: z.number().positive("Weight must be a positive number").max(700).optional(),

  known_conditions: z.array(z.string().trim().min(1)).optional(),

  current_medications: z.array(z.string().trim().min(1)).optional(),

  known_allergies: z.array(z.string().trim().min(1)).optional(),

  emergency_contact_name: z.string().trim().max(100).optional(),

  emergency_contact_phone: z.string().trim().max(20).optional(),

  emergency_contact_relation: z.string().trim().max(50).optional(),
});

export const doctorProfileSchema = z.object({
  specialisation: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(1000).optional(),
});
