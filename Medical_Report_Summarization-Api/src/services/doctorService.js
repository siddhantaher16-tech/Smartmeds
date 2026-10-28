import supabase from "../config/supabase.js";

class DoctorService {
  async searchDoctors(searchTerm, page = 1, limit = 10) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("profiles")
      .select("id, full_name, specialisation, bio, created_at", { count: "exact" })
      .eq("role", "doctor");

    if (searchTerm) {
      query = query.ilike("full_name", `%${searchTerm}%`);
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      throw new Error(`Failed to search doctors: ${error.message}`);
    }

    return {
      doctors: data || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    };
  }

  async getMyDoctor(patientId) {
    const { data: link, error: linkError } = await supabase
      .from("doctor_patient")
      .select("doctor_id, created_at")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (linkError) {
      throw new Error(`Failed to fetch doctor link: ${linkError.message}`);
    }

    if (!link) return null;

    const { data: doctor, error: docError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", link.doctor_id)
      .single();

    if (docError) {
      throw new Error(`Failed to fetch doctor profile: ${docError.message}`);
    }

    return {
      id: doctor.id,
      full_name: doctor.full_name,
      linked_at: link.created_at,
    };
  }

  async linkDoctor(patientId, doctorId) {
    // Check if doctor exists and has role 'doctor'
    const { data: doctor, error: docError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", doctorId)
      .eq("role", "doctor")
      .maybeSingle();

    if (docError) throw new Error(docError.message);

    if (!doctor) {
      const error = new Error("Doctor not found");
      error.statusCode = 404;
      throw error;
    }

    // Check if already linked
    const { data: existingLink, error: linkError } = await supabase
      .from("doctor_patient")
      .select("id")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (linkError) throw new Error(linkError.message);

    if (existingLink) {
      const error = new Error(
        "You are already linked to a doctor. Unlink your current doctor first."
      );
      error.statusCode = 400;
      throw error;
    }

    // Insert new link
    const { data: newLink, error: insertError } = await supabase
      .from("doctor_patient")
      .insert([{ patient_id: patientId, doctor_id: doctorId }])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return newLink;
  }

  async unlinkDoctor(patientId) {
    // Check if exists first
    const { data: existing, error: findError } = await supabase
      .from("doctor_patient")
      .select("id")
      .eq("patient_id", patientId)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    if (!existing) {
      const err = new Error("No doctor linked");
      err.statusCode = 404;
      throw err;
    }

    const { error: deleteError } = await supabase
      .from("doctor_patient")
      .delete()
      .eq("patient_id", patientId);

    if (deleteError) throw new Error(deleteError.message);

    return true;
  }

  async getPatientsForDoctor(doctorId, page = 1, limit = 10, searchTerm = "") {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from("doctor_patient")
      .select(`
        linked_at,
        patient:profiles!patient_id (
          id,
          full_name,
          created_at
        )
      `, { count: "exact" })
      .eq("doctor_id", doctorId)
      .order("linked_at", { ascending: false });

    if (searchTerm) {
      // Use !inner to filter by patient name
      query = supabase
        .from("doctor_patient")
        .select(`
          linked_at,
          patient:profiles!patient_id!inner (
            id,
            full_name,
            created_at
          )
        `, { count: "exact" })
        .eq("doctor_id", doctorId)
        .ilike("patient.full_name", `%${searchTerm}%`)
        .order("linked_at", { ascending: false });
    }

    const { data: links, count, error } = await query.range(from, to);

    if (error) {
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }

    const patientsWithStats = await Promise.all(
      (links || []).map(async (link) => {
        const patient = link.patient;

        // stats aggregation
        const [
          { count: reports_count, error: rsError },
          { data: latestReport, error: rError },
          { data: summaries, error: sError }
        ] = await Promise.all([
          // 1. Total reports access
          supabase
            .from("report_shares")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", doctorId)
            .eq("patient_id", patient.id),
          
          // 2. latest report timestamp
          supabase
            .from("report_shares")
            .select(`
              reports:report_id (
                uploaded_at
              )
            `)
            .eq("doctor_id", doctorId)
            .eq("patient_id", patient.id)
            .order("reports(uploaded_at)", { ascending: false, foreignTable: "reports" })
            .limit(1)
            .maybeSingle(),

          // 3. critical flags
          supabase
            .from("report_shares")
            .select(`
              reports!report_id (
                summaries (summary_json)
              )
            `)
            .eq("doctor_id", doctorId)
            .eq("patient_id", patient.id)
        ]);

        if (rsError || rError || sError) {
          console.error("[DoctorService] Stats error for patient", patient.id, { rsError, rError, sError });
        }

        const total_critical_flags = (summaries || []).reduce((acc, curr) => {
          const summariesArr = curr.reports?.summaries;
          const summaryData = Array.isArray(summariesArr) ? summariesArr[0] : summariesArr;
          if (!summaryData || !summaryData.summary_json) return acc;
          const flags = summaryData.summary_json.critical_flags || [];
          return acc + flags.length;
        }, 0);

        return {
          id: patient.id,
          full_name: patient.full_name,
          linked_at: link.linked_at,
          reports_total: reports_count || 0,
          critical_flags: total_critical_flags,
          latest_report_at: latestReport?.reports?.uploaded_at || null,
          status: total_critical_flags > 0 ? "critical" : "clear",
        };
      })
    );

    return {
      patients: patientsWithStats,
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    };
  }

  async getDoctorDashboard(doctorId) {
    const [
      { count: total_patients, error: pError },
      { count: total_reports, error: rCountError },
      { data: recent_shares, error: recentError },
      { data: flagShares, error: flagError }
    ] = await Promise.all([
      // 1. Total patients
      supabase.from("doctor_patient").select("*", { count: "exact", head: true }).eq("doctor_id", doctorId),
      
      // 2. Total reports
      supabase.from("report_shares").select("*", { count: "exact", head: true }).eq("doctor_id", doctorId),

      // 3. Recent activity (latest 10 shares)
      supabase
        .from("report_shares")
        .select(`
          shared_at,
          patient:profiles!patient_id (full_name),
          reports!report_id (id, file_name, file_type, status, uploaded_at)
        `)
        .eq("doctor_id", doctorId)
        .order("shared_at", { ascending: false })
        .limit(10),

      // 4. Critical flags aggregation
      supabase
        .from("report_shares")
        .select(`
          report_id,
          patient:profiles!patient_id (full_name),
          reports!report_id (
            summaries (summary_json)
          )
        `)
        .eq("doctor_id", doctorId)
    ]);

    if (pError) throw new Error(`Failed to fetch total patients: ${pError.message}`);
    if (rCountError) throw new Error(`Failed to fetch total reports: ${rCountError.message}`);
    if (recentError) throw new Error(`Failed to fetch recent activity: ${recentError.message}`);
    if (flagError) throw new Error(`Failed to fetch flags: ${flagError.message}`);

    // Flatten critical flags
    const flattenedFlags = [];
    (flagShares || []).forEach(share => {
      const patientName = share.patient?.full_name || "Unknown Patient";
      const reportId = share.report_id;
      // Accessing summaries through reports: reports.summaries is typically an array for joined children
      const summariesArr = share.reports?.summaries;
      const summaryData = Array.isArray(summariesArr) ? summariesArr[0] : summariesArr;
      const flags = summaryData?.summary_json?.critical_flags || [];
      
      flags.forEach(f => {
        flattenedFlags.push({
          report_id: reportId,
          patient_name: patientName,
          flag: typeof f === 'string' ? f : (f.flag || f.title || "Critical Finding"),
          severity: f.severity || f.level || "critical",
          ...(typeof f === 'object' ? f : {})
        });
      });
    });

    return {
      total_patients: total_patients || 0,
      total_reports: total_reports || 0,
      shared_reports: total_reports || 0, // as requested
      recent_activity: (recent_shares || []).map(s => ({
        shared_at: s.shared_at,
        patient_name: s.patient?.full_name || "Unknown Patient",
        report: s.reports
      })),
      critical_flags: {
        total: flattenedFlags.length,
        flags: flattenedFlags
      }
    };
  }
}

export default new DoctorService();
