import { useGetDoctorPatients, useGetSharedReportsByPatient } from '../../hooks/useDoctor';
import { Link } from 'react-router-dom';
import type { DoctorPatient } from '../../types';
import { getAvatarColors, getInitials } from '../../utils/avatarColors';

function PatientCard({ patient }: { patient: DoctorPatient }) {
  const { data: reportsData, isLoading: isLoadingReports } = useGetSharedReportsByPatient(patient.id);
  
  // The API returns the array directly in the data field for this endpoint
  const sharedReports = Array.isArray(reportsData?.data) 
    ? reportsData.data 
    : reportsData?.data?.reports || [];
    
  const { bg, text } = getAvatarColors(patient.full_name);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row">
      {/* Left: Patient Info */}
      <Link 
        to={`/doctor/patient/${patient.id}`}
        className="lg:w-1/3 p-6 flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
      >
        <div
          className="w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
          style={{ backgroundColor: bg, color: text }}>
          {getInitials(patient.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{patient.full_name}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">
            Linked since {new Date(patient.linked_at).toLocaleDateString()}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
              patient.status === 'critical' ? 'bg-rose-100 text-rose-700' : 
              patient.status === 'monitoring' ? 'bg-amber-100 text-amber-700' : 
              'bg-emerald-100 text-emerald-700'
            }`}>
              {patient.status}
            </span>
          </div>
        </div>
      </Link>
      
      {/* Right: Shared Documents */}
      <div className="lg:w-2/3 p-6 bg-slate-50 dark:bg-slate-800/20 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Shared Medical Records</h4>
          {sharedReports.length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-full">
              {sharedReports.length} Files
            </span>
          )}
        </div>
        
        {isLoadingReports ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary"></div>
          </div>
        ) : sharedReports.length > 0 ? (
          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
            {sharedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">description</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{report.file_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Shared on {new Date(report.uploaded_at || report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link 
                  to={`/doctor/summary/${report.id}`}
                  className="shrink-0 ml-3 text-[10px] font-bold text-primary dark:text-accent-teal border border-primary/20 dark:border-accent-teal/20 hover:bg-primary/5 dark:hover:bg-accent-teal/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  SUMMARY <span className="material-symbols-outlined text-[14px]">insights</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center italic text-slate-500 text-sm">
            No documents shared by this patient yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default function LinkedPatients({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading, error } = useGetDoctorPatients({ name: searchTerm, page: 1, limit: 100 });
  const patients = data?.data?.patients || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[200px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl">
        Failed to load patients: {(error as any)?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary dark:text-accent-teal" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
        Linked Patients
      </h3>
      
      {patients.length === 0 ? (
        <div className="py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500">
          <span className="material-symbols-outlined text-5xl mb-4">person_off</span>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">No Patients Found</h4>
          <p className="mt-1">No patients are currently linked to your practice.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
