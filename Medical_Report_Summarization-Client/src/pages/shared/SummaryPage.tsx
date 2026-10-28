import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetReportSummary, useGetReportById, useAddReportNote } from '../../hooks/useDocuments';
import PageLayout from '../../components/shared/PageLayout';
import { ROLES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function UnifiedSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isDoctor = profile?.role === ROLES.DOCTOR;
  const [noteText, setNoteText] = useState('');

  const { data: summaryResponse, isLoading: isLoadingSummary, error: summaryError } = useGetReportSummary(id || '');
  const { data: reportResponse, isLoading: isLoadingReport } = useGetReportById(id || '');
  const { mutate: addNote, isPending: isAddingNote } = useAddReportNote();

  const summaryData = summaryResponse?.data?.summary_json;
  const report = reportResponse?.data?.report;
  const notes = reportResponse?.data?.notes || [];

  const handleSubmitNote = () => {
    if (!noteText.trim() || !id) return;
    addNote(
      { reportId: id, note: noteText.trim() },
      {
        onSuccess: () => {
          setNoteText('');
        }
      }
    );
  };

  if (isLoadingSummary || isLoadingReport) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">
              {isDoctor ? "Loading clinical analysis..." : "Analyzing report data..."}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (summaryError || !summaryData) {
    return (
      <PageLayout>
        <div className="p-8">
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 p-6 rounded-2xl text-center">
            <span className="material-symbols-outlined text-rose-500 text-4xl mb-4">error</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {isDoctor ? "Summary Unavailable" : "Failed to load summary"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              {(summaryError as any)?.message || "The AI analysis for this report is not yet available or failed to load."}
            </p>
            <Link 
              to={isDoctor ? "/doctor/patients" : "/patient/reports"} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
            >
              {isDoctor ? "Back to Patients" : "Back to Reports"}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (isAbnormal: boolean) => {
    return isAbnormal 
      ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 ring-rose-500/30' 
      : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-500/30';
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isDoctor ? '/doctor/dashboard' : '/patient/dashboard');
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
        {/* Back Link */}
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="text-slate-500 hover:text-primary dark:hover:text-accent-teal font-medium text-sm flex items-center gap-2 transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {isDoctor ? "Back to Records" : "Back to My Reports"}
          </button>
        </div>

        {/* Header Card */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-primary/10 text-primary dark:bg-accent-teal/10 dark:text-accent-teal rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isDoctor ? "clinical_notes" : "picture_as_pdf"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">
                {report?.report_name || report?.file_name || 'Clinical Report'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {summaryData.report_date || new Date().toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                    {summaryData.document_type}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                    summaryData.report_status === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {(summaryData.report_status || 'normal').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pr-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {isDoctor ? "Patient Name" : "Patient"}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{summaryData.patient_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {isDoctor ? "Record ID" : "Analysis ID"}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">#{id?.substring(0, 8)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {isDoctor ? "Department" : "Category"}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{summaryData.all_findings[0]?.category || 'General'}</p>
            </div>
          </div>
        </section>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border-l-4 border-amber-400 ring-1 ring-amber-200 dark:ring-amber-900/30">
            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined">pending_actions</span>
              <h2 className="text-lg font-bold">Pending Results</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {summaryData.pending_results.length > 0 ? (
                summaryData.pending_results.map((res: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-white/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 font-mono text-xs rounded border border-amber-200/50">
                    {res}
                  </span>
                ))
              ) : (
                <p className="text-amber-800 dark:text-amber-400 text-sm">No results currently pending.</p>
              )}
            </div>
          </div>

          <div className={`${summaryData.critical_flags.length > 0 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-400' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400'} p-6 rounded-2xl border-l-4 ring-1 ring-black/5`}>
            <div className={`flex items-center gap-3 mb-4 ${summaryData.critical_flags.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              <span className="material-symbols-outlined">{summaryData.critical_flags.length > 0 ? 'warning' : 'check_circle'}</span>
              <h2 className="text-lg font-bold">
                {isDoctor ? "Clinical Critical Flags" : (summaryData.critical_flags.length > 0 ? "Critical Observations" : "No Critical Flags")}
              </h2>
            </div>
            <div className="space-y-2">
              {summaryData.critical_flags.length > 0 ? (
                summaryData.critical_flags.map((flag: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 p-3 bg-rose-500/5 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                            {flag.metric || flag.flag_name || flag.flag || 'Clinical Observation'}
                          </p>
                          {(flag.status || flag.severity) && (
                            <span className="text-[9px] font-black uppercase bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                              {flag.status || flag.severity}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-rose-800 dark:text-rose-200 leading-relaxed mb-1">
                          {typeof flag === 'string' ? flag : (flag.note || flag.description || 'Action required')}
                        </p>
                        {flag.value && (
                          <div className="flex items-baseline gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-100">
                            <span className="opacity-60 text-[10px] font-medium italic">Value:</span> {flag.value} <span className="text-[10px] font-normal opacity-70">{flag.unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-emerald-800 dark:text-emerald-400 text-sm leading-relaxed">
                  All processed biomarkers are within safe clinical ranges based on current interim analysis.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Findings Table */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {isDoctor ? "Quantitative Biomarkers" : "Comprehensive Findings"}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {summaryData.all_findings.reduce((acc: number, cat: any) => acc + cat.metrics.length, 0)} Biomarkers Analyzed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-black">Test Parameter</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-black text-center">Result</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-black">Reference Range</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-black text-right">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summaryData.all_findings.map((category: any) => (
                  category.metrics.map((metric: any, idx: number) => (
                    <tr key={`${category.category}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{metric.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{category.category}</p>
                      </td>
                      <td className="px-8 py-5 text-center font-black dark:text-slate-100">
                        <span className={metric.is_abnormal ? 'text-rose-600 underline underline-offset-4 decoration-rose-200' : 'text-slate-900 dark:text-white'}>
                          {metric.value} <span className="text-[10px] text-slate-400 font-normal">{metric.unit}</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-300 font-medium">
                        {metric.reference_range}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${getStatusColor(metric.is_abnormal)}`}>
                            {metric.is_abnormal ? (isDoctor ? 'Abnormal' : 'Flagged') : (isDoctor ? 'Standard' : 'Normal')}
                          </span>
                          <div className={`w-2 h-2 rounded-full shrink-0 ${metric.is_abnormal ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Interpretation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-9xl text-primary dark:text-accent-teal">psychology</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary dark:text-accent-teal">insights</span>
              <h3 className="text-xl font-bold text-primary dark:text-accent-teal">
                {isDoctor ? "AI Clinical Interpretation" : "AI Clinical Summary"}
              </h3>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-lg">
                {summaryData.summary}
              </p>
            </div>
          </div>

          <div className={`rounded-2xl p-8 border flex flex-col justify-between ${
            isDoctor ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm" : "bg-slate-900 dark:bg-slate-800 border-slate-800"
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className={`material-symbols-outlined ${isDoctor ? "text-primary" : "text-accent-teal"}`}>
                  {isDoctor ? "assignment" : "medical_services"}
                </span>
                <h3 className={`text-xl font-bold ${isDoctor ? "text-slate-900 dark:text-white" : "text-white"}`}>
                  {isDoctor ? "Further Actions Recommended" : "Physician's Note"}
                </h3>
              </div>
              <div className={`p-4 rounded-xl border-l-4 mb-6 ${
                isDoctor ? "bg-slate-50 dark:bg-slate-800 border-primary" : "bg-white/5 border-accent-teal"
              }`}>
                <p className={`text-sm italic leading-relaxed ${isDoctor ? "text-slate-600 dark:text-slate-400" : "text-slate-300"}`}>
                  "{summaryData.doctor_recommendation}"
                </p>
              </div>
            </div>
            {/* {!isDoctor && (
              <button className="w-full py-3 bg-accent-teal text-slate-900 font-black text-sm rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                Request Doctor Review
              </button>
            )}
            {isDoctor && (
              <button className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-sm rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                Sign Off Records
              </button>
            )} */}
          </div>
        </div>

        {/* Doctor Notes Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="material-symbols-outlined text-primary dark:text-accent-teal text-2xl">comment_bank</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Clinical Notes & Consultations
            </h3>
          </div>

          {/* List of existing notes */}
          <div className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-accent-teal/10 text-primary dark:text-accent-teal flex items-center justify-center font-bold text-sm shrink-0">
                    {note.doctor?.full_name ? note.doctor.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "Dr"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {note.doctor?.full_name || "Doctor"}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium italic mt-1">
                      "{note.note}"
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic text-sm py-4">
                No clinical notes have been added to this report summary yet.
              </p>
            )}
          </div>

          {/* Doctor Input Panel */}
          {isDoctor && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 animate-in fade-in duration-200">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Clinical Note</h4>
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type a clinical note, recommendation, or observation..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitNote}
                    disabled={isAddingNote || !noteText.trim()}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isAddingNote ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Saving Note...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="py-12 text-center">
        <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
          This AI-generated summary is for informational purposes only. Always consult with a qualified healthcare professional before making any medical decisions.
        </p>
      </div>
    </PageLayout>
  );
}
