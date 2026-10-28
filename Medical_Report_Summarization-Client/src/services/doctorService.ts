import api from '../lib/axios';

export const getMyDoctors = async () => {
  const { data } = await api.get('/doctor/my-doctors');
  return data;
};

export const searchDoctors = async (name?: string, page = 1, limit = 10) => {
  const { data } = await api.get('/doctor/search', { params: { name, page, limit } });
  return data;
};

export const linkDoctor = async (doctorId: string) => {
  const { data } = await api.post(`/doctor/link/${doctorId}`);
  return data;
};

export const unlinkDoctor = async (doctorId: string) => {
  const { data } = await api.delete(`/doctor/unlink/${doctorId}`);
  return data;
};

export const getDoctorDashboard = async () => {
  const { data } = await api.get('/doctor/dashboard');
  return data;
};

export const getDoctorPatients = async (params?: { name?: string; page?: number; limit?: number }) => {
  const { data } = await api.get('/doctor/patients', { params });
  return data;
};

export const getSharedReportsByPatient = async (patientId: string) => {
  const { data } = await api.get(`/doctor/patients/${patientId}/reports`);
  return data;
};

export const getSharedReportsByDoctor = async (doctorId: string) => {
  const { data } = await api.get(`/shares/doctor/${doctorId}`);
  return data;
};

export const shareReport = async (reportId: string, doctorId: string) => {
  const { data } = await api.post(`/shares/${reportId}`, { doctor_id: doctorId });
  return data;
};

export const revokeReportShare = async (reportId: string, doctorId: string) => {
  const { data } = await api.delete(`/shares/${reportId}`, { data: { doctor_id: doctorId } });
  return data;
};
