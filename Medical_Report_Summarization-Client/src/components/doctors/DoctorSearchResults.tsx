import { useSearchDoctors, useLinkDoctor, useGetMyDoctors } from '../../hooks/useDoctors';
import { getAvatarColors, getInitials } from '../../utils/avatarColors';
import type { NetworkDoctor } from './LinkedDoctors';

interface DoctorSearchResultsProps {
  searchTerm: string;
}

export default function DoctorSearchResults({ searchTerm }: DoctorSearchResultsProps) {
  const { data: searchData, isLoading: isSearching, error } = useSearchDoctors(searchTerm);
  const { data: myDoctorsData } = useGetMyDoctors();
  const { mutate: linkDoctor, isPending: isLinking } = useLinkDoctor();

  const linkedDoctorIds = new Set(
    (myDoctorsData?.data?.doctors || []).map((doc: NetworkDoctor) => doc.id)
  );

  const searchResults: NetworkDoctor[] = searchData?.data?.doctors || [];

  if (isSearching) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl text-sm">
        Failed to fetch search results.
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3">group_off</span>
        <p className="text-slate-500 dark:text-slate-400 font-medium">No healthcare providers found matching your search.</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your terms or searching by a broader specialty.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {searchResults.map((doctor) => {
        const isLinked = linkedDoctorIds.has(doctor.id);
        
          const { bg, text } = getAvatarColors(doctor.full_name);
        
        return (
          <div 
            key={doctor.id} 
            className={`bg-white dark:bg-slate-900 p-6 rounded-xl flex flex-col gap-6 shadow-sm border ${
              isLinked ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:border-primary/30 dark:hover:border-accent-teal/30 transition-all duration-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-lg shrink-0 basis-[64px] flex-none flex items-center justify-center text-xl font-black"
                style={{ backgroundColor: bg, color: text }}
              >
                {getInitials(doctor.full_name)}
              </div>
              <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest whitespace-nowrap ml-4 ${
                isLinked 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
              }`}>
                {isLinked ? 'Linked' : 'New'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{doctor.full_name}</h4>
              <p className="text-primary dark:text-accent-teal font-medium text-sm">{doctor.specialisation || 'General Practice'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {doctor.bio ? (doctor.bio.length > 80 ? doctor.bio.substring(0, 80) + '...' : doctor.bio) : 'Verified healthcare professional available for clinical engagements and digital report sharing.'}
              </p>
            </div>
            
            {isLinked ? (
              <button 
                disabled 
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg font-bold text-sm cursor-default"
              >
                In Network
              </button>
            ) : (
              <button 
                onClick={() => linkDoctor(doctor.id)}
                disabled={isLinking}
                className="w-full py-3 bg-primary text-white dark:bg-accent-teal dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                Link Doctor
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
