export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id?: string;
  full_name?: string;
  role?: string;
  date_of_birth?: string;
  biological_sex?: string;
  blood_group?: string;
  height_cm?: number;
  weight_kg?: number;
  known_conditions?: string[];
  current_medications?: string[];
  known_allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  avatar_url?: string;
  bio?: string;
  specialisation?: string;
}

export interface Report {
  id: string;
  patient_id?: string;
  file_name: string;
  file_url: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  report_type?: string;
  report_name?: string;
  created_at: string;
  uploaded_at?: string;
}

export interface CriticalFlag {
  id: string;
  flag_name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface Metric {
  name: string;
  value: string;
  unit: string;
  is_abnormal: boolean;
  reference_range: string;
}

export interface Finding {
  category: string;
  metrics: Metric[];
}

export interface SummaryData {
  summary: string;
  report_date: string;
  all_findings: Finding[];
  patient_name: string;
  document_type: string;
  report_status: string;
  critical_flags: any[]; // Using any for now to handle potential variations
  pending_results: string[];
  doctor_recommendation: string;
}

export interface Summary {
  id: string;
  report_id: string;
  summary_json: SummaryData;
  created_at: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedReports {
  reports: Report[];
  reports_total: number;
  analyzed_total: number;
  failed_total: number;
  pagination: PaginationMeta;
  patient?: Profile;
}

export interface DoctorDashboardData {
  total_patients: number;
  total_reports: number;
  shared_reports: number;
  recent_activity: {
    shared_at: string;
    patient_name: string;
    report: Report;
  }[];
  critical_flags: {
    total: number;
    flags: {
      report_id: string;
      patient_name: string;
      flag: string;
      severity: "low" | "medium" | "high" | "critical";
      metric?: string;
      value?: string;
      unit?: string;
      status?: string;
      note?: string;
    }[];
  };
}

export interface DoctorPatient {
  id: string;
  full_name: string;
  linked_at: string;
  reports_total: number;
  critical_flags: number;
  latest_report_at: string;
  status: "stable" | "monitoring" | "critical";
}

export interface PaginatedPatients {
  patients: DoctorPatient[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OverallClinicalConcern {
  concern: string;
  findings: string;
  severity: 'high' | 'moderate' | 'low';
  clinical_note: string;
}

export interface OverallHealthTrend {
  category: string;
  description: string;
}

export interface OverallSummaryData {
  overall_status: 'Excellent' | 'Stable' | 'Monitor' | 'Action Required' | 'Critical';
  executive_summary: string;
  active_clinical_concerns: OverallClinicalConcern[];
  health_trends: OverallHealthTrend[];
  consolidated_allergies_and_risks: {
    allergies: string[];
    risks: string[];
  };
  recommended_actions: string[];
}

export interface OverallSummaryResponse {
  overall_summary: OverallSummaryData | null;
  reports_count: number;
}

export interface ReportNote {
  id: string;
  report_id: string;
  note: string;
  created_at: string;
  doctor: {
    full_name: string;
  };
}


