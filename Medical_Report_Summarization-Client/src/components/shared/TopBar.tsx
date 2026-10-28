import { useAuth } from "../../context/AuthContext";

interface TopBarProps {
  title?: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { profile } = useAuth();
  
  // Format current date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const firstName = profile?.full_name?.split(' ')[0] || "John";

  const displayTitle = title || `Good morning, ${firstName} 👋`;
  const displaySubtitle = subtitle || today;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{displayTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{displaySubtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">settings</span>
        </button>
      </div>
    </header>
  );
}
