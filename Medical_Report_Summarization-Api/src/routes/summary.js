import express from "express";
import * as summaryController from "../controllers/summaryController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/overall", summaryController.getOverallSummary);
router.get("/overall/:patientId", summaryController.getOverallSummary);
router.get("/:reportId", summaryController.getSummary);

export default router;
