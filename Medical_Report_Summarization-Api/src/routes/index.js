import express from "express";
import authRoutes from "./auth.js";
import reportRoutes from "./reports.js";
import summaryRoutes from "./summary.js";
import profileRoutes from "./profile.js";
import doctorRoutes from "./doctor.js";
import sharesRoutes from "./shares.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);
router.use("/summary", summaryRoutes);
router.use("/profile", profileRoutes);
router.use("/doctor", doctorRoutes);
router.use("/shares", sharesRoutes);

export default router;
