import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetSharedReportsByPatient } from "../../hooks/useDoctor";
import PageLayout from "../../components/shared/PageLayout";
import { ROLES } from "../../constants";
import { getAvatarColors, getInitials } from "../../utils/avatarColors";

export default function DoctorPatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const { data: reportsResponse, isLoading } = useGetSharedReportsByPatient(patientId!);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  
  // The API returns the array directly in the data field
  const reports = Array.isArray(reportsResponse?.data) 
    ? reportsResponse.data 
    : reportsResponse?.data?.reports || [];

  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.uploaded_at || a.created_at || 0).getTime();
    const dateB = new Date(b.uploaded_at || b.created_at || 0).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });
    
  const patient = reportsResponse?.data?.patient;
  const { bg, text } = getAvatarColors(patient?.full_name || '');

  return (
    <PageLayout role={ROLES.DOCTOR}>
      <div className="max-w-[1440px] mx-auto">
        {/* Breadcrumbs / Back */}
        <Link to="/doctor/patients" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 text-sm font-medium">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Patients
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl"
              style={{ backgroundColor: bg, color: text }}
            >
              {getInitials(patient?.full_name || '')}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{patient?.full_name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm font-bold text-slate-500 uppercase">Patient ID: <span className="text-slate-900 dark:text-slate-300 font-mono">{patientId?.slice(0, 8)}</span></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-sm font-bold text-slate-500 uppercase">Shared Reports: <span className="text-slate-900 dark:text-slate-300">{reports.length}</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/doctor/overall-summary/${patientId}`}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">insights</span>
              Overall Summary
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Shared Medical Records</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by:</span>
              <div className="relative flex items-center">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                  className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all duration-200"
                >
                  <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Newest First</option>
                  <option value="oldest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Oldest First</option>
                </select>
                <span className="material-symbols-outlined text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none text-xs flex items-center justify-center">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading ? (
              <div className="p-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : sortedReports.length === 0 ? (
              <div className="p-20 text-center text-slate-500 italic">No reports have been shared by this patient yet.</div>
            ) : (
              sortedReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{report.file_name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Shared on {new Date(report.uploaded_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Status</p>
                      <span className="text-xs font-bold text-emerald-600 uppercase">Analysis Ready</span>
                    </div>
                    <Link 
                      to={`/doctor/summary/${report.id}`}
                      className="px-5 py-2 bg-primary text-white rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      View Insights <span className="material-symbols-outlined text-[14px]">insights</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
