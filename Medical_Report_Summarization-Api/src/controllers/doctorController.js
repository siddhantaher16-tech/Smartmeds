import doctorService from "../services/doctorService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import supabase from "../config/supabase.js";

export const searchDoctors = asyncHandler(async (req, res) => {
  const { name, page, limit } = req.query;

  const result = await doctorService.searchDoctors(name, page, limit);
  return sendSuccess(res, result, "Doctors fetched successfully", 200);
});

export const getMyDoctors = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('doctor_patient')
    .select(`
      linked_at,
      profiles:doctor_id (
        id,
        full_name,
        specialisation,
        bio
      )
    `)
    .eq('patient_id', req.user.id)
    .order('linked_at', { ascending: false });

  if (error) {
    return sendError(res, "Failed to fetch doctors", 500);
  }

  const payload = {
    doctors: data ? data.map(row => ({
      ...row.profiles,
      linked_at: row.linked_at
    })) : [],
    count: data ? data.length : 0
  };

  return sendSuccess(res, payload, "Doctors fetched successfully", 200);
});

export const linkDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const patientId = req.user.id;

  const { data: existingLink } = await supabase
    .from('doctor_patient')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .single();

  if (existingLink) {
    return sendError(res, "You are already linked to this doctor.", 400);
  }

  // Insert link
  const { data: link, error: insertError } = await supabase
      .from("doctor_patient")
      .insert([{ patient_id: patientId, doctor_id: doctorId }])
      .select()
      .single();
  
  if (insertError) {
      return sendError(res, "Failed to link doctor", 500);
  }

  return sendSuccess(res, link, "Linked to doctor successfully", 201);
});

export const unlinkDoctor = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const patientId = req.user.id;

  const { data: link } = await supabase
    .from('doctor_patient')
    .select('id')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .single();

  if (!link) {
    return sendError(res, "This doctor is not linked to you.", 404);
  }

  await supabase
    .from('doctor_patient')
    .delete()
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId);

  await supabase
    .from('report_shares')
    .delete()
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId);

  return sendSuccess(res, null, "Doctor unlinked successfully. All shared report access has been revoked.", 200);
});

export const getPatientReports = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { patientId } = req.params;

  // Verify the doctor is linked
  const { data: link, error: linkErr } = await supabase
    .from("doctor_patient")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    .single();

  if (linkErr || !link) {
    return sendError(res, "You are not linked to this patient.", 403);
  }

  // Fetch only shared reports
  const { data: reports, error } = await supabase
    .from("report_shares")
    .select(`
      reports!inner(*)
    `)
    .eq("doctor_id", doctorId)
    .eq("patient_id", patientId)
    // Actually we order locally or by the inner block, but reports(uploaded_at) fails postgREST validation sometimes
    // Doing standard JS sort for perfection:
    
  if (error) {
    return sendError(res, "Failed to fetch patient reports", 500);
  }

  // Map to flat report records and sort natively to avoid postgREST complex join ordering syntax
  const flatReports = reports ? reports.map(r => r.reports) : [];
  flatReports.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  return sendSuccess(res, flatReports, "Patient reports fetched successfully", 200);
});

export const getPatients = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const { page, limit, name } = req.query;

  const result = await doctorService.getPatientsForDoctor(doctorId, page, limit, name);
  return sendSuccess(res, result, "Patients fetched successfully", 200);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  const result = await doctorService.getDoctorDashboard(doctorId);
  return sendSuccess(res, result, "Doctor dashboard fetched successfully", 200);
});
