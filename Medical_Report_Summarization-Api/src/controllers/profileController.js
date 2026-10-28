import authService from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { medicalProfileSchema, doctorProfileSchema } from "../validators/profileValidator.js";

export const saveMedicalProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Validate request body with Zod
  const parsed = medicalProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.errors.map((e) => e.message).join(", "),
      400,
    );
  }

  const profile = await authService.saveMedicalProfile(userId, parsed.data);

  return sendSuccess(res, profile, "Medical profile saved successfully", 200);
});

export const getMedicalProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await authService.getMedicalProfile(userId);

  return sendSuccess(res, profile, "Medical profile fetched successfully", 200);
});

export const saveDoctorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify that the user is a doctor
  const profileBase = await authService.getProfile(userId);
  if (profileBase.role !== "doctor") {
    return sendError(res, "Forbidden: Doctor role required", 403);
  }

  // Validate request body with Zod
  const parsed = doctorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.errors.map((e) => e.message).join(", "),
      400,
    );
  }

  const profile = await authService.saveDoctorProfile(userId, parsed.data);

  return sendSuccess(res, profile, "Doctor profile saved successfully", 200);
});
