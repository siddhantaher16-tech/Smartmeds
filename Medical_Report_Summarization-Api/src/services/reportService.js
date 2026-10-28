import supabase from "../config/supabase.js";
import * as geminiService from "./geminiService.js";

class ReportService {
  async uploadReport(userId, fileBuffer, originalName, mimeType, report_type, report_name) {
    // Check for duplicate: same file_name already uploaded by this user
    const { data: existing, error: dupError } = await supabase
      .from("reports")
      .select("id")
      .eq("patient_id", userId)
      .eq("file_name", originalName)
      .maybeSingle();

    if (dupError) {
      throw new Error(`Failed to check for duplicate report: ${dupError.message}`);
    }

    if (existing) {
      const err = new Error(
        `A report named "${originalName}" has already been uploaded by you.`
      );
      err.statusCode = 409;
      throw err;
    }

    const timestamp = Date.now();
    const storagePath = `${userId}/${timestamp}-${originalName}`;
    const bucketName = "medical-docs";

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload file to storage: ${uploadError.message}`,
      );
    }

    // the bucket is private, fileUrl is just the storage path now
    const fileUrl = storagePath;

    // Insert row into reports table
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert([
        {
          patient_id: userId,
          file_name: originalName,
          file_url: fileUrl,
          file_type: mimeType,
          status: "processing",
          report_type: report_type || null,
          report_name: report_name || null,
        },
      ])
      .select()
      .single();

    if (reportError) {
      console.error(
        "[ReportService] Failed to insert into 'reports' table:",
        reportError,
      );
      console.error("Payload was:", {
        patient_id: userId,
        file_name: originalName,
        file_url: fileUrl,
        file_type: mimeType,
        status: "processing",
        report_type: report_type || null,
        report_name: report_name || null,
      });

      // Rollback storage upload
      await supabase.storage.from(bucketName).remove([storagePath]);
      throw new Error(`Failed to insert report record: ${reportError.message}`);
    }

    // Call geminiService.processReport() in the background
    setImmediate(() => {
      try {
        geminiService.processReport(reportData.id, fileUrl, originalName);
      } catch (err) {
        console.error(
          "[ReportService] setImmediate background processing error",
          err,
        );
      }
    });

    return reportData;
  }

  async getDashboardStats(userId) {
    // 1. We replace total_reports query with linked_doctors query against doctor_patient
    const [
      { count: linked_doctors, error: doctorsError },
      { count: analyzed_reports, error: analyzedError },
      { data: recent_reports, error: recentError },
      { data: summaries, error: summariesError }
    ] = await Promise.all([
      supabase.from("doctor_patient").select("*", { count: "exact", head: true }).eq("patient_id", userId),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("patient_id", userId).eq("status", "done"),
      supabase.from("reports").select("*").eq("patient_id", userId).order("uploaded_at", { ascending: false }).limit(5),
      supabase.from("summaries").select("summary_json, reports!inner(patient_id)").eq("reports.patient_id", userId)
    ]);

    if (doctorsError) throw new Error(`Failed to fetch linked doctors: ${doctorsError.message}`);
    if (analyzedError) throw new Error(`Failed to fetch analyzed reports: ${analyzedError.message}`);
    if (recentError) throw new Error(`Failed to fetch recent reports: ${recentError.message}`);
    if (summariesError) throw new Error(`Failed to fetch summaries: ${summariesError.message}`);

    const critical_flags = summaries.reduce((acc, curr) => {
      const flags = curr.summary_json?.critical_flags || [];
      return acc + flags.length;
    }, 0);

    return {
      linked_doctors: linked_doctors || 0,
      reports_analyzed: analyzed_reports || 0,
      critical_flags,
      recent_reports: recent_reports || []
    };
  }

  async getReportsForUser(userId, page = 1, limit = 10, name = "") {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const buildCountQuery = (status) => {
      let q = supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", userId);
      if (name) q = q.ilike("report_name", `%${name}%`);
      if (status) q = q.eq("status", status);
      return q;
    };

    let reportsQuery = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("patient_id", userId)
      .order("uploaded_at", { ascending: false })
      .range(from, to);

    if (name) {
      reportsQuery = reportsQuery.ilike("report_name", `%${name}%`);
    }

    // We can run these in parallel to speed up the response
    const [
      { data: reports, count: reports_total, error: reportsError },
      { count: analyzed_total, error: analyzedError },
      { count: failed_total, error: failedError },
    ] = await Promise.all([
      reportsQuery,
      buildCountQuery("done"),
      buildCountQuery("failed"),
    ]);

    if (reportsError) {
      throw new Error(`Failed to fetch reports: ${reportsError.message}`);
    }
    if (analyzedError) {
      throw new Error(`Failed to fetch analyzed count: ${analyzedError.message}`);
    }
    if (failedError) {
      throw new Error(`Failed to fetch failed count: ${failedError.message}`);
    }

    return {
      reports,
      reports_total: reports_total || 0,
      analyzed_total: analyzed_total || 0,
      failed_total: failed_total || 0,
      pagination: {
        page,
        limit,
        total_pages: Math.ceil((reports_total || 0) / limit),
      },
    };
  }

  async getReportById(reportId) {
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (reportError) {
      if (reportError.code === "PGRST116") {
        const err = new Error("Report not found");
        err.statusCode = 404;
        throw err;
      }
      throw new Error(`Failed to fetch report: ${reportError.message}`);
    }

    let summary = null;
    if (report.status === "done") {
      const { data: summaryData, error: sumError } = await supabase
        .from("summaries")
        .select("*")
        .eq("report_id", reportId)
        .single();

      if (!sumError && summaryData) {
        summary = summaryData;
      }
    }

    // Fetch report notes
    const { data: notes, error: notesError } = await supabase
      .from("report_notes")
      .select(`
        id,
        note,
        created_at,
        doctor:profiles(full_name)
      `)
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    return { 
      report, 
      summary, 
      notes: notesError ? [] : (notes || [])
    };
  }

  async updateReport(reportId, userId, fileBuffer, originalName, mimeType, report_type, report_name) {
    const bucketName = "medical-docs";

    // 1. Fetch the existing report — verify it exists and belongs to this user
    const { data: existing, error: fetchError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .eq("patient_id", userId)
      .single();

    if (fetchError || !existing) {
      const err = new Error("Report not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    // 2. Upload the new file to storage (new path with fresh timestamp)
    const timestamp = Date.now();
    const newStoragePath = `${userId}/${timestamp}-${originalName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(newStoragePath, fileBuffer, { contentType: mimeType });

    if (uploadError) {
      throw new Error(`Failed to upload replacement file: ${uploadError.message}`);
    }

    // 3. Delete the old file from storage (best-effort, don't fail if missing)
    if (existing.file_url) {
      try {
        await supabase.storage.from(bucketName).remove([existing.file_url]);
      } catch (err) {
        console.warn(
          `[ReportService] Could not remove old file from storage: ${err.message}`,
        );
      }
    }

    // 4. Delete any existing summary so Gemini will write a fresh one
    await supabase.from("summaries").delete().eq("report_id", reportId);

    // 5. Update the report record
    const updatePayload = {
      file_name: originalName,
      file_url: newStoragePath,
      file_type: mimeType,
      status: "processing",
    };
    if (report_type !== undefined) {
      updatePayload.report_type = report_type;
    }
    if (report_name !== undefined) {
      updatePayload.report_name = report_name;
    }

    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update(updatePayload)
      .eq("id", reportId)
      .select()
      .single();

    if (updateError) {
      // Rollback: remove the newly uploaded file so storage doesn't have orphans
      await supabase.storage.from(bucketName).remove([newStoragePath]);
      throw new Error(`Failed to update report record: ${updateError.message}`);
    }

    // 6. Re-trigger Gemini processing in the background
    setImmediate(() => {
      try {
        geminiService.processReport(reportId, newStoragePath, originalName);
      } catch (err) {
        console.error(
          "[ReportService] setImmediate background reprocessing error",
          err,
        );
      }
    });

    return updatedReport;
  }

  async deleteReport(reportId) {
    // Fetch report first to get the storage path
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("file_url")
      .eq("id", reportId)
      .single();

    if (fetchError) {
      const err = new Error("Report not found");
      err.statusCode = 404;
      throw err;
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (deleteError) {
      throw new Error(
        `Failed to delete report record: ${deleteError.message}`,
      );
    }

    // Delete from storage
    try {
      if (report.file_url) {
        await supabase.storage.from("medical-docs").remove([report.file_url]);
      }
    } catch (err) {
      console.warn(
        `[ReportService] Could not delete file from storage: ${err.message}`,
      );
    }

    return true;
  }
}

export default new ReportService();
