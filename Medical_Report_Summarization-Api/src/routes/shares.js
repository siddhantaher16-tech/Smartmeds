import express from "express";
import * as shareController from "../controllers/shareController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/:reportId", shareController.shareReport);
router.delete("/:reportId", shareController.revokeAccess);
router.get("/", shareController.getMyShares);
router.get("/doctor/:doctorId", shareController.getSharesByDoctor);

export default router;
