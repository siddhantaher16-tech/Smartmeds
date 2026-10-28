import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as doctorService from '../services/doctorService';
import { toast } from 'sonner';

// queries
export const useGetMyDoctors = () => {
  return useQuery({
    queryKey: ['my-doctors'],
    queryFn: doctorService.getMyDoctors
  });
};

export const useSearchDoctors = (name?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['search-doctors', name, page, limit],
    queryFn: () => doctorService.searchDoctors(name, page, limit),
    placeholderData: keepPreviousData
  });
};

export const useGetSharedReportsByDoctor = (doctorId?: string) => {
  return useQuery({
    queryKey: ['shared-reports', doctorId],
    queryFn: () => doctorService.getSharedReportsByDoctor(doctorId!),
    enabled: !!doctorId
  });
};

// mutations
export const useLinkDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => doctorService.linkDoctor(doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['search-doctors'] });
      toast.success('Successfully linked with doctor');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to link doctor';
      toast.error(message);
    }
  });
};

export const useUnlinkDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => doctorService.unlinkDoctor(doctorId),
    onSuccess: (_, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['my-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['search-doctors'] });
      queryClient.removeQueries({ queryKey: ['shared-reports', doctorId] });
      toast.success('Doctor unlinked successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to unlink doctor';
      toast.error(message);
    }
  });
};

export const useShareReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, doctorId }: { reportId: string, doctorId: string }) => 
      doctorService.shareReport(reportId, doctorId),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ['shared-reports', doctorId] });
      toast.success('Report access granted');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to grant access';
      toast.error(message);
    }
  });
};

export const useRevokeReportShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, doctorId }: { reportId: string, doctorId: string }) => 
      doctorService.revokeReportShare(reportId, doctorId),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ['shared-reports', doctorId] });
      toast.success('Report access revoked');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to revoke access';
      toast.error(message);
    }
  });
};
