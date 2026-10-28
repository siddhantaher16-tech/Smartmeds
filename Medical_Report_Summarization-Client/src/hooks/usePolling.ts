import { useQuery } from '@tanstack/react-query';
import { getReportById } from '../services/documentService';
import { POLLING_INTERVAL } from '../constants';

export const usePolling = (reportId: string, currentStatus?: string) => {
  const shouldPoll = currentStatus === 'processing' || currentStatus === 'pending';

  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => getReportById(reportId),
    enabled: !!reportId && shouldPoll,
    refetchInterval: shouldPoll ? POLLING_INTERVAL : false,
  });
};
