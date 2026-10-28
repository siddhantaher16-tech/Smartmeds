interface StatsRowProps {
  reportsAnalyzed?: number;
  criticalFlags?: number;
  linkedDoctors?: number;
}

export default function StatsRow({
  reportsAnalyzed = 0,
  criticalFlags = 0,
  linkedDoctors = 0,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Linked Doctors
          </p>
          <h3 className="text-3xl font-bold mt-1">{linkedDoctors}</h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
            group
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-center">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Reports Analyzed
          </p>
          <h3 className="text-3xl font-bold mt-1">{reportsAnalyzed}</h3>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
            analytics
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-l-4 border-rose-500 flex justify-between items-center">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Critical Flags
          </p>
          <h3 className="text-3xl font-bold mt-1 text-rose-600">
            {criticalFlags}
          </h3>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg">
          <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">
            warning
          </span>
        </div>
      </div>
    </div>
  );
}
