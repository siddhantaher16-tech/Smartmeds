import { useAuth } from "../../context/AuthContext";
import { useGetDoctorDashboard } from "../../hooks/useDoctor";
import { Link } from "react-router-dom";
import PageLayout from "../../components/shared/PageLayout";
import { ROLES } from "../../constants";
import { getAvatarColors, getInitials } from "../../utils/avatarColors";

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const { data: dashboardResponse, isLoading } = useGetDoctorDashboard();

  const doctorName = profile?.full_name || "Doctor";
  const stats = dashboardResponse?.data;

  // Format current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (isLoading) {
    return (
      <PageLayout role={ROLES.DOCTOR}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading dashboard data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout role={ROLES.DOCTOR}>
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-[28px] font-bold text-slate-900 dark:text-white leading-tight">
              Good morning, Dr. {doctorName.split(' ')[doctorName.split(' ').length - 1]} 👋
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is your patient overview for today.</p>
          </div>
          <div className="text-[13px] font-medium text-slate-400 flex items-center gap-2 pb-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {today}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-6 mb-10 grid-cols-1 md:grid-cols-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-primary flex flex-col justify-between h-32 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium uppercase tracking-wider">Total Patients</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.total_patients || 0}</span>
              {/* <span className="text-xs font-semibold text-emerald-600 flex items-center">+2 this month</span> */}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-emerald-500 flex flex-col justify-between h-32 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium uppercase tracking-wider">Shared Reports</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.shared_reports || 0}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-rose-500 flex flex-col justify-between h-32 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium uppercase tracking-wider">Critical Cases</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600">{stats?.critical_flags?.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-12">
          {/* Recent Activity (6/10) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <Link to="/doctor/patients" className="text-primary dark:text-accent-teal text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity">
                View All
              </Link>
            </div>
            <div className="space-y-6">
              {stats?.recent_activity?.length === 0 ? (
                <p className="text-center py-8 text-slate-500 italic">No recent activity detected.</p>
              ) : (
                stats?.recent_activity?.map((activity, idx) => {
                  const timeAgo = new Date(activity.shared_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const { bg, text } = getAvatarColors(activity.patient_name);
                  
                  return (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: bg, color: text }}
                        >
                          {getInitials(activity.patient_name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.patient_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Report "{activity.report.file_name}" shared for review</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-tight">
                          Report
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Critical Cases (4/10) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Critical Cases</h3>
            <div className="space-y-4">
              {stats?.critical_flags?.flags?.length === 0 ? (
                <p className="text-center py-8 text-slate-500 italic">No critical flags detected.</p>
              ) : (
                stats?.critical_flags?.flags?.map((flag, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-l-2 border-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{flag.patient_name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${
                        flag.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {flag.status || (flag.severity === 'critical' ? 'CRITICAL' : 'ABNORMAL')}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">
                        {flag.metric || "Clinical Flag"}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-rose-600">
                          {flag.value || flag.flag}
                        </span>
                        {flag.unit && <span className="text-[10px] text-slate-500 font-bold uppercase">{flag.unit}</span>}
                      </div>
                    </div>

                    {flag.note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-4 leading-relaxed line-clamp-2">
                        "{flag.note}"
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Shared records analysis</span>
                      <Link 
                        to={`/doctor/summary/${flag.report_id}`} 
                        className="text-xs font-bold text-primary dark:text-accent-teal flex items-center gap-1 hover:underline"
                      >
                        Review Summary <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}


