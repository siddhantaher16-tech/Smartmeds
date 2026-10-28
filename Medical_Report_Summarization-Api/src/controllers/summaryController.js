import summaryService from "../services/summaryService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import supabase from "../config/supabase.js";

export const getSummary = asyncHandler(async (req, res) => {
  const reportId = req.params.reportId;
  const userId = req.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "doctor") {
    const { data: share } = await supabase
      .from("report_shares")
      .select("id")
      .eq("report_id", reportId)
      .eq("doctor_id", userId)
      .maybeSingle();

    if (!share) {
      return res.status(403).json({ error: "You do not have access to this report." });
    }
  } else if (profile?.role === "patient") {
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .eq("patient_id", userId)
      .maybeSingle();
      
    if (!report) {
      return res.status(403).json({ error: "You do not have access to this report." });
    }
  }

  const summary = await summaryService.getSummaryForReport(reportId);

  return sendSuccess(res, summary, "Summary fetched successfully", 200);
});

export const getOverallSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const paramPatientId = req.params.patientId;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  let result;
  if (profile.role === "doctor") {
    const patientId = paramPatientId;
    if (!patientId) {
      return res.status(400).json({ error: "patientId parameter is required for doctor view." });
    }

    // Verify doctor-patient link
    const { data: link } = await supabase
      .from("doctor_patient")
      .select("id")
      .eq("doctor_id", userId)
      .eq("patient_id", patientId)
      .maybeSingle();

    if (!link) {
      return res.status(403).json({ error: "You are not linked to this patient." });
    }

    result = await summaryService.getOverallSummary(patientId, userId);
  } else if (profile.role === "patient") {
    // Patient views their own summary
    result = await summaryService.getOverallSummary(userId);
  } else {
    return res.status(403).json({ error: "Invalid role." });
  }

  return sendSuccess(res, result, "Overall summary fetched successfully", 200);
});

