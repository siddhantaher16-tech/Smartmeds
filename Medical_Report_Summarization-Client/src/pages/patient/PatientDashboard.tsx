import PageLayout from "../../components/shared/PageLayout";
import TopBar from "../../components/shared/TopBar";
import StatsRow from "../../components/dashboard/StatsRow";
import UploadZone from "../../components/documents/UploadZone";
import RecentReportsTable from "../../components/dashboard/RecentReportsTable";
import { useGetDashboardStats } from "../../hooks/useDocuments";

export default function PatientDashboard() {
  const { data: dashboardData, isLoading, error } = useGetDashboardStats();

  // The envelope pattern gives us data.data
  const stats = dashboardData?.data;

  // We map the raw total metrics across from the endpoint wrapper,
  // and simply pass the inner 'recent_reports' payload to the table mapping UI.
  
  return (
    <PageLayout role="patient">
      <TopBar />
      
      {isLoading ? (
        <div className="space-y-6 pt-6">
          <div className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      ) : error ? (
        <div className="p-6 mt-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl">
          Failed to load dashboard statistics.
        </div>
      ) : (
        <>
          <StatsRow 
            linkedDoctors={stats?.linked_doctors || 0}
            reportsAnalyzed={stats?.reports_analyzed || 0}
            criticalFlags={stats?.critical_flags || 0}
          />
          <UploadZone />
          <RecentReportsTable reports={stats?.recent_reports || []} />
        </>
      )}

    </PageLayout>
  );
}
