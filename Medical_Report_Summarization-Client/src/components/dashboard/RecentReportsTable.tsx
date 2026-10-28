import { Link } from "react-router-dom";
import type { Report } from "../../types";

interface RecentReportsTableProps {
  reports?: Report[];
}

export default function RecentReportsTable({ reports = [] }: RecentReportsTableProps) {
  
  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'done':
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'processing':
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
      case 'error': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Reports</h3>
        <Link to="/patient/reports" className="text-primary dark:text-accent-teal font-semibold text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left pl-0">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No comprehensive reports available.
                </td>
              </tr>
            ) : (
              reports.map((report, idx) => (
                <tr key={report.id} className={`${idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-800/20' : ''} hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">description</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{report.report_name || report.file_name || 'Clinical Report'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(report.created_at || new Date()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {report.report_type || 'General'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
