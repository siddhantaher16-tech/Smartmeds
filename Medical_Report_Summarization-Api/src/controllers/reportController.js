import reportService from "../services/reportService.js";
import multer from "multer";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import supabase from "../config/supabase.js";

// Multer setup
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPEG, and PNG are allowed."));
    }
  },
});

export const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, "No file uploaded", 400);
  }

  const userId = req.user.id;
  const { report_type, report_name } = req.body;

  const reportData = await reportService.uploadReport(
    userId,
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    report_type,
    report_name,
  );

  return sendSuccess(
    res,
    reportData,
    "Report uploaded and processing started",
    201,
  );
});

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await reportService.getDashboardStats(userId);
  return sendSuccess(res, stats, "Dashboard stats fetched successfully", 200);
});

export const getReports = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const name = req.query.name || "";
  
  const result = await reportService.getReportsForUser(userId, page, limit, name);

  const { data: shares } = await supabase
    .from("report_shares")
    .select("report_id, doctor_id, shared_at")
    .eq("patient_id", userId);

  const safeShares = shares || [];

  result.reports = result.reports.map(report => {
    const share = safeShares.find(s => s.report_id === report.id);
    return {
      ...report,
      is_shared: !!share,
      shared_with_doctor_id: share?.doctor_id || null,
      shared_at: share?.shared_at || null
    };
  });

  return sendSuccess(res, result, "Reports fetched successfully", 200);
});

export const getReportById = asyncHandler(async (req, res) => {
  const reportId = req.params.id;
  const result = await reportService.getReportById(reportId);

  return sendSuccess(res, result, "Report fetched successfully", 200);
});

export const updateReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, "No file uploaded", 400);
  }

  const reportId = req.params.id;
  const userId = req.user.id;
  const { report_type, report_name } = req.body;

  const updatedReport = await reportService.updateReport(
    reportId,
    userId,
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    report_type,
    report_name,
  );

  return sendSuccess(
    res,
    updatedReport,
    "Report replaced and reprocessing started",
    200,
  );
});

export const deleteReport = asyncHandler(async (req, res) => {
  const reportId = req.params.id;
  await reportService.deleteReport(reportId);

  return sendSuccess(res, null, "Report deleted successfully", 200);
});

export const addReportNote = asyncHandler(async (req, res) => {
  const reportId = req.params.reportId;
  const doctorId = req.user.id;
  const { note } = req.body;

  if (!note || note.trim() === "") {
    return res.status(400).json({ error: "Note content is required." });
  }

  // 1. Verify user is a doctor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", doctorId)
    .single();

  if (profile?.role !== "doctor") {
    return res.status(403).json({ error: "Only doctors can add notes." });
  }

  // 2. Verify doctor has access to the report
  const { data: share } = await supabase
    .from("report_shares")
    .select("id")
    .eq("report_id", reportId)
    .eq("doctor_id", doctorId)
    .maybeSingle();

  if (!share) {
    return res.status(403).json({ error: "You do not have access to this report." });
  }

  // 3. Insert report note
  const { data: newNote, error } = await supabase
    .from("report_notes")
    .insert([
      {
        report_id: reportId,
        doctor_id: doctorId,
        note: note.trim()
      }
    ])
    .select(`
      id,
      note,
      created_at,
      doctor:profiles(full_name)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to add report note: ${error.message}`);
  }

  return sendSuccess(res, newNote, "Note added successfully", 201);
});

