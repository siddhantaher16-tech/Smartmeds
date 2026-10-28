interface PatientSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PatientSearch({ value, onChange }: PatientSearchProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-slate-400">search</span>
      </div>
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-14 pr-14 py-5 bg-white dark:bg-slate-900 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200 dark:border-slate-800 shadow-sm outline-none" 
        placeholder="Search patients by name..." 
        type="text"
      />
    </div>
  );
}
