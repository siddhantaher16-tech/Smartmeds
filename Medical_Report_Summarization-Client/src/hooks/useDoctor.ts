import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as doctorService from '../services/doctorService';
import type { ApiResponse, DoctorDashboardData, PaginatedPatients, PaginatedReports } from '../types';

export const useGetDoctorDashboard = () => {
  return useQuery<ApiResponse<DoctorDashboardData>>({
    queryKey: ['doctorDashboard'],
    queryFn: () => doctorService.getDoctorDashboard(),
  });
};

export const useGetDoctorPatients = (params?: { name?: string; page?: number; limit?: number }) => {
  return useQuery<ApiResponse<PaginatedPatients>>({
    queryKey: ['doctorPatients', params],
    queryFn: () => doctorService.getDoctorPatients(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetSharedReportsByPatient = (patientId: string) => {
  return useQuery<ApiResponse<PaginatedReports>>({
    queryKey: ['sharedReports', patientId],
    queryFn: () => doctorService.getSharedReportsByPatient(patientId),
    enabled: !!patientId,
  });
};
