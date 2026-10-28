import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../shared/StatusBadge";
import type { Report, PaginationMeta } from "../../types";
import { useDeleteReport } from "../../hooks/useDocuments";

interface Props {
  reports: Report[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onGoToPage?: (page: number) => void;
}

const getDisplayProperties = (type?: string) => {
  const normType = (type || "").toLowerCase();
  if (normType.includes('blood')) return { icon: "picture_as_pdf", iconColorClass: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", typeColorClass: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800/50" };
  if (normType.includes('heart')) return { icon: "picture_as_pdf", iconColorClass: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", typeColorClass: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800/50" };
  if (normType.includes('thyroid')) return { icon: "image", iconColorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30", typeColorClass: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" };
  if (normType.includes('lipid')) return { icon: "picture_as_pdf", iconColorClass: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", typeColorClass: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-800/50" };
  if (normType.includes('mri')) return { icon: "picture_as_pdf", iconColorClass: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", typeColorClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50" };
  if (normType.includes('ray')) return { icon: "image", iconColorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30", typeColorClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800/50" };
  if (normType.includes('urinalysis')) return { icon: "picture_as_pdf", iconColorClass: "text-rose-500 bg-rose-50 dark:bg-rose-900/30", typeColorClass: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800/50" };
  return { icon: "description", iconColorClass: "text-slate-500 bg-slate-50 dark:bg-slate-900/30", typeColorClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
};

export default function ReportsListTable({ reports = [], pagination, isLoading, onNextPage, onPrevPage, onGoToPage }: Props) {
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const { mutate: deleteReport, isPending: isDeleting } = useDeleteReport();

  const handleConfirmDelete = () => {
    if (!reportToDelete) return;
    deleteReport(reportToDelete.id, {
      onSuccess: () => {
        setReportToDelete(null);
      }
    });
  };
  
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800 relative min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Report Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                  <p className="text-sm">Fetching your clinical payload...</p>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No reports found.</p>
                  <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const styles = getDisplayProperties(report.report_type);
                const displayName = report.report_name || report.file_name;
                const formattedDate = new Date(report.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
                
                return (
                  <tr key={report.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150 ${isLoading ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-5 max-w-[200px] truncate">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined p-2 rounded-lg ${styles.iconColorClass}`} data-icon={styles.icon}>
                          {styles.icon}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded text-[10px] whitespace-nowrap font-bold uppercase border ${styles.typeColorClass}`}>
                        {report.report_type || "Other"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{formattedDate}</td>
                    <td className="px-6 py-5">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className={`flex items-center justify-end gap-3 ${report.status === 'processing' || report.status === 'pending' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        {report.status === 'failed' ? (
                          <button className="px-3 py-1.5 border border-orange-200 text-orange-600 dark:text-orange-400 dark:border-orange-800/50 text-xs font-bold rounded hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white transition-all">Retry</button>
                        ) : (
                          <Link to={`/patient/summary/${report.id}`}>
                            <button 
                              className={`px-3 py-1.5 border text-xs font-bold whitespace-nowrap rounded transition-all ${report.status === 'processing' || report.status === 'pending' ? 'border-slate-200 text-slate-400 dark:border-slate-700' : 'border-primary/20 text-primary dark:text-accent-teal hover:bg-primary hover:text-white dark:hover:bg-accent-teal dark:hover:text-slate-900'}`}
                              disabled={report.status === 'processing' || report.status === 'pending'}
                            >
                              View Summary
                            </button>
                          </Link>
                        )}
                        <span 
                          className="material-symbols-outlined text-slate-400 hover:text-rose-500 cursor-pointer text-xl select-none transition-colors"
                          onClick={() => setReportToDelete(report)}
                        >
                          delete
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {pagination && pagination.total_pages > 0 && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-teal transition-colors flex items-center gap-1 disabled:opacity-50 disabled:hover:text-slate-500" 
              disabled={pagination.page <= 1 || isLoading}
              onClick={onPrevPage}
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Prev
            </button>
            
            {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
              // Simple calculation to center the active page somewhat
              let startPage = Math.max(1, pagination.page - 2);
              if (startPage + 4 > pagination.total_pages) {
                startPage = Math.max(1, pagination.total_pages - 4);
              }
              const pageIdx = startPage + i;
              if (pageIdx > pagination.total_pages) return null;
              
              return (
                <button 
                  key={pageIdx}
                  onClick={() => onGoToPage?.(pageIdx)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded transition-colors ${
                    pagination.page === pageIdx 
                      ? 'bg-primary dark:bg-accent-teal text-white dark:text-slate-900 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50'
                  }`}
                >
                  {pageIdx}
                </button>
              );
            })}

            <button 
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-accent-teal transition-colors flex items-center gap-1 disabled:opacity-50 disabled:hover:text-slate-500"
              disabled={pagination.page >= pagination.total_pages || isLoading}
              onClick={onNextPage}
            >
              Next
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">warning</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Report</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{reportToDelete.report_name || reportToDelete.file_name}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-8">
                <button 
                  onClick={() => setReportToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
