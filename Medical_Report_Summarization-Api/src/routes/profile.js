import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  saveMedicalProfile,
  getMedicalProfile,
  saveDoctorProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.use(authMiddleware);

router.put("/medical", saveMedicalProfile);
router.get("/medical", getMedicalProfile);
router.put("/doctor", saveDoctorProfile);

export default router;
