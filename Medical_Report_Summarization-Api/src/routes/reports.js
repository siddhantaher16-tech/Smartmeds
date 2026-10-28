import express from "express";
import * as reportController from "../controllers/reportController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/upload",
  reportController.upload.single("file"),
  reportController.uploadReport,
);
router.get("/dashboard", reportController.getDashboard);
router.get("/", reportController.getReports);
router.get("/:id", reportController.getReportById);
router.put(
  "/:id",
  reportController.upload.single("file"),
  reportController.updateReport,
);
router.delete("/:id", reportController.deleteReport);
router.post("/:reportId/notes", reportController.addReportNote);

export default router;
