import { useState } from 'react';
import type { NetworkDoctor } from './LinkedDoctors';
import { useGetSharedReportsByDoctor, useShareReport, useRevokeReportShare, useUnlinkDoctor } from '../../hooks/useDoctors';
import { useGetReports } from '../../hooks/useDocuments';

export interface ManageDoctorModalProps {
  doctor: NetworkDoctor;
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageDoctorModal({ doctor, isOpen, onClose }: ManageDoctorModalProps) {
  const [search, setSearch] = useState("");

  const { data: reportsData } = useGetReports(1, 100);
  const { data: sharesData, isLoading: isLoadingShares } = useGetSharedReportsByDoctor(doctor?.id);
  
  const { mutate: shareReport, isPending: isSharing } = useShareReport();
  const { mutate: revokeShare, isPending: isRevoking } = useRevokeReportShare();
  const { mutate: unlinkDoctor, isPending: isUnlinking } = useUnlinkDoctor();

  if (!isOpen || !doctor) return null;

  const allReports = reportsData?.data?.reports || [];
  
  // Handle both { data: { shared_reports: [] } } and { data: [] }
  const sharedReports = Array.isArray(sharesData?.data) 
    ? sharesData.data 
    : sharesData?.data?.shared_reports || [];
    
  const sharedReportIds = new Set(sharedReports.map((r: any) => r.report_id));

  const filteredReports = allReports.filter((r: any) => {
    const name = r.file_name || r.report_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleToggleStatus = (reportId: string, isLinked: boolean) => {
    if (isLinked) {
      revokeShare({ reportId, doctorId: doctor.id });
    } else {
      shareReport({ reportId, doctorId: doctor.id });
    }
  };

  const handleUnlink = () => {
    unlinkDoctor(doctor.id, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manage Access</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure clinical reports shared with {doctor.full_name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search reports by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-accent-teal outline-none transition-all placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Available Reports</h3>
            {isLoadingShares ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary mx-auto"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">No reports found matching your search.</p>
              </div>
            ) : (
              filteredReports.map((report: any) => {
                const isLinked = sharedReportIds.has(report.id);
                return (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {report.file_name || report.report_name || 'Report'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isLinked 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {isLinked ? 'Linked' : 'Unlinked'}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToggleStatus(report.id, isLinked)}
                      disabled={isSharing || isRevoking}
                      className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                        isLinked
                          ? 'border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                          : 'bg-primary dark:bg-accent-teal text-white dark:text-slate-900 hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {isLinked ? 'Revoke Access' : 'Give Access'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
          <button 
            onClick={handleUnlink}
            disabled={isUnlinking}
            className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">person_remove</span>
            Unlink Doctor
          </button>
          
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-all active:scale-95"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
