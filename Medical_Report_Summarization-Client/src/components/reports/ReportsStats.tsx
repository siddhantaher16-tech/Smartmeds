interface Props {
  total?: number;
  analyzed?: number;
  failed?: number;
}

export default function ReportsStats({ total = 0, analyzed = 0, failed = 0 }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Reports */}
      <div className="bg-white dark:bg-slate-900 p-6 flex flex-col gap-1 rounded-xl shadow-sm border-l-4 border-blue-500">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Reports</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{total}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Files</span>
        </div>
      </div>
      
      {/* Analyzed */}
      <div className="bg-white dark:bg-slate-900 p-6 flex flex-col gap-1 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Successfully Analyzed</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{analyzed}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Completed</span>
        </div>
      </div>
      
      {/* Failed */}
      <div className="bg-white dark:bg-slate-900 p-6 flex flex-col gap-1 rounded-xl shadow-sm border-l-4 border-rose-500">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Analysis Failed</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">{failed}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Attention Required</span>
        </div>
      </div>
    </section>
  );
}
