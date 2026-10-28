import { useState } from 'react';
import ManageDoctorModal from './ManageDoctorModal';
import { useGetMyDoctors, useUnlinkDoctor, useGetSharedReportsByDoctor, useRevokeReportShare } from '../../hooks/useDoctors';
import { getAvatarColors, getInitials } from '../../utils/avatarColors';

export interface NetworkDoctor {
  id: string;
  full_name: string;
  specialisation?: string;
  bio?: string;
  linked_at: string;
}

function DoctorCard({ doctor, onManage }: { doctor: NetworkDoctor, onManage: (doc: NetworkDoctor) => void }) {
  const { data: sharesData, isLoading: isLoadingShares } = useGetSharedReportsByDoctor(doctor.id);
  
  // Handle both { data: { shared_reports: [] } } and { data: [] }
  const sharedReports = Array.isArray(sharesData?.data) 
    ? sharesData.data 
    : sharesData?.data?.shared_reports || [];
  
  const { mutate: unlinkDoctor, isPending: isUnlinking } = useUnlinkDoctor();
  const { mutate: revokeShare, isPending: isRevoking } = useRevokeReportShare();

  const { bg, text } = getAvatarColors(doctor.full_name);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row">
      {/* Left: Doctor Card */}
      <div className="lg:w-1/2 p-6 flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
        <div
          className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-xl shrink-0 basis-[80px] flex-none flex items-center justify-center text-2xl font-black"
          style={{ backgroundColor: bg, color: text }}>
           {getInitials(doctor.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{doctor.full_name}</h4>
          <p className="text-primary dark:text-accent-teal font-semibold text-sm truncate">{doctor.specialisation || 'General Practice'}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {doctor.bio ? doctor.bio.substring(0, 50) + '...' : `Linked since ${new Date(doctor.linked_at).toLocaleDateString()}`}
          </p>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => onManage(doctor)}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs transition-colors"
            >
              Manage
            </button>
            <button 
              onClick={() => unlinkDoctor(doctor.id)}
              disabled={isUnlinking}
              className="flex-1 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
            >
              Unlink
            </button>
          </div>
        </div>
      </div>
      
      {/* Right: Shared Reports */}
      <div className="lg:w-1/2 p-6 bg-slate-50 dark:bg-slate-800/20 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Shared Reports</h4>
          {sharedReports.length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-full">
              {sharedReports.length} Active
            </span>
          )}
        </div>
        
        {isLoadingShares ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary"></div>
          </div>
        ) : sharedReports.length > 0 ? (
          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
            {sharedReports.map((report: any) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">description</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{report.file_name || report.report_name || 'Report'}</span>
                </div>
                <button 
                  onClick={() => revokeShare({ reportId: report.report_id, doctorId: doctor.id })}
                  disabled={isRevoking}
                  className="shrink-0 ml-3 text-[10px] whitespace-nowrap font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  REMOVE ACCESS
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No reports shared yet</p>
            <button 
              onClick={() => onManage(doctor)}
              className="px-6 py-2 bg-primary dark:bg-accent-teal text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-all active:scale-95"
            >
              Give Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LinkedDoctors() {
  const [managingDoctor, setManagingDoctor] = useState<NetworkDoctor | null>(null);
  const { data, isLoading, error } = useGetMyDoctors();

  const doctors: NetworkDoctor[] = data?.data?.doctors || [];

  if (isLoading) {
    return (
      <section className="animate-pulse">
        <h3 className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 relative overflow-hidden">
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </h3>
        <div className="space-y-6">
          <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl">
        Failed to load doctors: {(error as any)?.message}
      </div>
    );
  }                                                       

  return (
    <>
      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary dark:text-accent-teal" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_1</span>
          Linked Doctors
        </h3>
        
        {doctors.length === 0 ? (
          <div className="py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">clinical_notes</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Doctors Linked</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Use the search bar above to find and connect with your healthcare providers.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} onManage={setManagingDoctor} />
            ))}
          </div>
        )}
      </section>

      {managingDoctor && (
        <ManageDoctorModal 
          doctor={managingDoctor} 
          isOpen={!!managingDoctor} 
          onClose={() => setManagingDoctor(null)} 
        />
      )}
    </>
  );
}
