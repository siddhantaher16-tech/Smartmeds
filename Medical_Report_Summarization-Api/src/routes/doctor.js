import express from "express";
import * as doctorController from "../controllers/doctorController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/search", doctorController.searchDoctors);
router.get("/my-doctors", doctorController.getMyDoctors);
router.post("/link/:doctorId", doctorController.linkDoctor);
router.delete("/unlink/:doctorId", doctorController.unlinkDoctor);
router.get("/patients/:patientId/reports", doctorController.getPatientReports);
router.get("/patients", doctorController.getPatients);
router.get("/dashboard", doctorController.getDashboard);

export default router;
