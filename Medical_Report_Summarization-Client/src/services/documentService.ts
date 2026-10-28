import api from '../lib/axios';
import type { Report, Summary, ApiResponse, PaginatedReports, OverallSummaryResponse, ReportNote } from '../types';

export const uploadReport = async (
  file: File, 
  patientId?: string,
  name?: string,
  type?: string
): Promise<ApiResponse<Report>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (patientId) formData.append('patient_id', patientId);
  if (name) formData.append('report_name', name);
  if (type) formData.append('report_type', type);
  
  const response = await api.post('/reports/upload', formData);
  return response.data;
};

export const getReports = async (page = 1, limit = 10, name?: string): Promise<ApiResponse<PaginatedReports>> => {
  const params = new URLSearchParams({ 
    page: page.toString(), 
    limit: limit.toString() 
  });
  if (name) params.append('name', name);
  
  const response = await api.get(`/reports?${params.toString()}`);
  return response.data;
};

export const getReportById = async (id: string): Promise<ApiResponse<{ report: Report; summary?: Summary; notes?: ReportNote[] }>> => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const deleteReport = async (id: string): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export interface DashboardStats {
  linked_doctors: number;
  reports_analyzed: number;
  critical_flags: number;
  recent_reports: Report[];
}

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

export const getReportSummary = async (reportId: string): Promise<ApiResponse<Summary>> => {
  const response = await api.get(`/summary/${reportId}`);
  return response.data;
};

export const getOverallSummary = async (): Promise<ApiResponse<OverallSummaryResponse>> => {
  const response = await api.get('/summary/overall');
  return response.data;
};

export const getPatientOverallSummary = async (patientId: string): Promise<ApiResponse<OverallSummaryResponse>> => {
  const response = await api.get(`/summary/overall/${patientId}`);
  return response.data;
};

export const addReportNote = async (reportId: string, note: string): Promise<ApiResponse<ReportNote>> => {
  const response = await api.post(`/reports/${reportId}/notes`, { note });
  return response.data;
};

