import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getReports, getReportById, uploadReport, deleteReport } from '../services/documentService';
import * as documentService from '../services/documentService';
import { toast } from 'sonner';

export const useGetReports = (page: number, limit: number, name?: string) => {
  return useQuery({
    queryKey: ['reports', page, limit, name],
    queryFn: () => getReports(page, limit, name),
    placeholderData: keepPreviousData,
  });
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => documentService.getDashboardStats()
  });
};

export const useGetReportById = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
};

export const useGetReportSummary = (id: string) => {
  return useQuery({
    queryKey: ['reportSummary', id],
    queryFn: () => documentService.getReportSummary(id),
    enabled: !!id,
  });
};

export const useGetOverallSummary = (patientId?: string) => {
  return useQuery({
    queryKey: ['overallSummary', patientId || 'patient'],
    queryFn: () => patientId 
      ? documentService.getPatientOverallSummary(patientId)
      : documentService.getOverallSummary(),
  });
};

export const useUploadReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      file, 
      patientId,
      name,
      type
    }: { 
      file: File; 
      patientId?: string;
      name?: string;
      type?: string;
    }) => uploadReport(file, patientId, name, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report uploaded successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Failed to upload report';
      toast.error(message);
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Failed to delete report';
      toast.error(message);
    },
  });
};

export const useAddReportNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, note }: { reportId: string; note: string }) => 
      documentService.addReportNote(reportId, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      toast.success('Note added successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Failed to add note';
      toast.error(message);
    },
  });
};
