import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { getStatusColor, cn } from '../../lib/utils';

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  const colorClass = getStatusColor(normalizedStatus);

  const getIcon = () => {
    switch (normalizedStatus) {
      case 'done':
        return <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />;
      case 'processing':
        return <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
      case 'failed':
        return <XCircle className="mr-1.5 h-3.5 w-3.5" />;
      case 'pending':
      default:
        return <Clock className="mr-1.5 h-3.5 w-3.5" />;
    }
  };

  const getLabel = () => {
    switch (normalizedStatus) {
      case 'done': return 'Done';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      case 'pending': default: return 'Pending';
    }
  };

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', colorClass)}>
      {getIcon()}
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
