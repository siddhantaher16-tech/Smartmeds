import supabase from "../config/supabase.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const shareReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const patientId = req.user.id;

  const doctorId = req.body.doctor_id;
  if (!doctorId) {
    return sendError(res, "doctor_id is required", 400);
  }

  // Validation check 1 — report ownership
  const { data: report, error: reportErr } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("patient_id", patientId)
    .single();

  if (reportErr || !report) {
    return sendError(res, "You do not have access to this report", 403);
  }

  // Validation check 2 — doctor linked
  const { data: linkedDoctor } = await supabase
    .from('doctor_patient')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .single();

  if (!linkedDoctor) {
    return sendError(res, "This doctor is not linked to you.", 400);
  }

  // Validation check 3 — not already shared
  const { data: existingShare, error: shareErr } = await supabase
    .from("report_shares")
    .select("id")
    .eq("report_id", reportId)
    .eq("doctor_id", doctorId)
    .maybeSingle();

  if (existingShare) {
    return sendError(res, "This report is already shared with your doctor.", 400);
  }

  // All checks pass: Insert into report_shares
  const { data: newShare, error: insertErr } = await supabase
    .from("report_shares")
    .insert([{
      report_id: reportId,
      patient_id: patientId,
      doctor_id: doctorId
    }])
    .select()
    .single();

  if (insertErr) {
    return sendError(res, "Failed to share report", 500);
  }

  return sendSuccess(res, newShare, "Report shared successfully", 201);
});

export const revokeAccess = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const patientId = req.user.id;

  const doctorId = req.body.doctor_id;
  if (!doctorId) {
    return sendError(res, "doctor_id is required", 400);
  }

  // Validation check 1 — report ownership
  const { data: report, error: reportErr } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .eq("patient_id", patientId)
    .single();

  if (reportErr || !report) {
    return sendError(res, "You do not have access to this report", 403);
  }

  // Validation check 2 — share exists
  const { data: existingShare, error: shareErr } = await supabase
    .from("report_shares")
    .select("id")
    .eq("report_id", reportId)
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId)
    .single();

  if (shareErr || !existingShare) {
    return sendError(res, "This report was not shared.", 404);
  }

  // Delete from report_shares
  const { error: deleteErr } = await supabase
    .from("report_shares")
    .delete()
    .eq("report_id", reportId)
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId);

  if (deleteErr) {
    return sendError(res, "Failed to revoke access", 500);
  }

  return sendSuccess(res, null, "Access revoked successfully", 200);
});

export const getMyShares = asyncHandler(async (req, res) => {
  const patientId = req.user.id;

  const { data: shares, error } = await supabase
    .from("report_shares")
    .select("report_id, doctor_id, shared_at")
    .eq("patient_id", patientId);

  if (error) {
    return sendError(res, "Failed to fetch shares", 500);
  }

  const shared_report_ids = shares ? shares.map(s => s.report_id) : [];

  return sendSuccess(res, {
    shared_report_ids,
    shares: shares || []
  }, "Shares fetched successfully", 200);
});

export const getSharesByDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const patientId = req.user.id;

  // Verify this doctor is linked to the patient
  const { data: link, error: linkErr } = await supabase
    .from("doctor_patient")
    .select("id")
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId)
    .single();

  if (linkErr || !link) {
    return sendError(res, "This doctor is not linked to you.", 403);
  }

  const { data: sharedReports, error } = await supabase
    .from("report_shares")
    .select(`
      id,
      shared_at,
      reports!inner(id, file_name, file_type, status, uploaded_at)
    `)
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId)
    .order("shared_at", { ascending: false });

  if (error) {
    return sendError(res, "Failed to fetch shared reports", 500);
  }

  const mappedReports = sharedReports.map((share) => ({
    id: share.id,
    shared_at: share.shared_at,
    report_id: share.reports.id,
    file_name: share.reports.file_name,
    file_type: share.reports.file_type,
    status: share.reports.status,
    uploaded_at: share.reports.uploaded_at
  }));

  return sendSuccess(res, {
    doctor_id: doctorId,
    shared_reports: mappedReports
  }, "Shared reports fetched successfully", 200);
});
