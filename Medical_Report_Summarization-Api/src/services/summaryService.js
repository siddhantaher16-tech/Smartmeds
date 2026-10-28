import supabase from "../config/supabase.js";
import * as geminiService from "./geminiService.js";

class SummaryService {
  async getSummaryForReport(reportId) {
    const { data: summary, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("report_id", reportId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const err = new Error("Summary not found");
        err.statusCode = 404;
        throw err;
      }
      throw new Error(`Failed to fetch summary: ${error.message}`);
    }

    return summary;
  }

  async getOverallSummary(patientId, doctorId = null) {
    let reports = [];

    if (doctorId) {
      // Fetch report shares for this patient shared with this doctor
      const { data: shares, error: sharesError } = await supabase
        .from("report_shares")
        .select("report_id")
        .eq("doctor_id", doctorId)
        .eq("patient_id", patientId);

      if (sharesError) {
        throw new Error(`Failed to fetch shared reports: ${sharesError.message}`);
      }

      const sharedReportIds = shares.map((s) => s.report_id);
      if (sharedReportIds.length === 0) {
        return { overall_summary: null, reports_count: 0 };
      }

      // Fetch completed reports matching those IDs
      const { data: matchedReports, error: reportsError } = await supabase
        .from("reports")
        .select("id, report_name, report_type, uploaded_at")
        .in("id", sharedReportIds)
        .eq("status", "done");

      if (reportsError) {
        throw new Error(`Failed to fetch matched reports: ${reportsError.message}`);
      }

      reports = matchedReports || [];
    } else {
      // Fetch patient's own completed reports
      const { data: patientReports, error: reportsError } = await supabase
        .from("reports")
        .select("id, report_name, report_type, uploaded_at")
        .eq("patient_id", patientId)
        .eq("status", "done");

      if (reportsError) {
        throw new Error(`Failed to fetch patient reports: ${reportsError.message}`);
      }

      reports = patientReports || [];
    }

    if (reports.length === 0) {
      return { overall_summary: null, reports_count: 0 };
    }

    const reportIds = reports.map((r) => r.id);

    // Fetch individual report summaries
    const { data: summaries, error: summariesError } = await supabase
      .from("summaries")
      .select("id, report_id, summary_json, created_at")
      .in("report_id", reportIds);

    if (summariesError) {
      throw new Error(`Failed to fetch report summaries: ${summariesError.message}`);
    }

    if (!summaries || summaries.length === 0) {
      return { overall_summary: null, reports_count: reports.length };
    }

    // Fetch patient medical profile to pass to Gemini
    const { data: patientProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, date_of_birth, biological_sex, blood_group, height_cm, weight_kg, known_conditions, current_medications, known_allergies")
      .eq("id", patientId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw new Error(`Failed to fetch patient profile: ${profileError.message}`);
    }

    // Generate holistic summary using geminiService
    const overallSummary = await geminiService.generateOverallSummary(patientProfile, summaries);

    return {
      overall_summary: overallSummary,
      reports_count: reports.length,
    };
  }
}

export default new SummaryService();

