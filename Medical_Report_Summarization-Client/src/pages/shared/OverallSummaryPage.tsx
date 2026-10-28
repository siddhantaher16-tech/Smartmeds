import { useParams, useNavigate } from "react-router-dom";
import { useGetOverallSummary } from "../../hooks/useDocuments";
import PageLayout from "../../components/shared/PageLayout";
import { ROLES } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { getAvatarColors, getInitials } from "../../utils/avatarColors";

export default function OverallSummaryPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isDoctor = profile?.role === ROLES.DOCTOR;

  // If doctor, we query by patientId from url. If patient, patientId is undefined (gets own summary)
  const { data: response, isLoading, error } = useGetOverallSummary(patientId);

  const data = response?.data?.overall_summary;
  const reportsCount = response?.data?.reports_count || 0;

  const handleBack = () => {
    if (isDoctor && patientId) {
      navigate(`/doctor/patient/${patientId}`);
    } else {
      navigate("/patient/reports");
    }
  };

  const getStatusColor = (status?: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("critical")) {
      return "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50";
    }
    if (s.includes("action") || s.includes("required")) {
      return "text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50";
    }
    if (s.includes("monitor")) {
      return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50";
    }
    if (s.includes("stable")) {
      return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50";
    }
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50";
  };

  const getSeverityBadgeColor = (severity?: string) => {
    const s = severity?.toLowerCase() || "";
    if (s === "high") {
      return "text-rose-700 bg-rose-100 dark:bg-rose-900/30";
    }
    if (s === "moderate") {
      return "text-amber-700 bg-amber-100 dark:bg-amber-900/30";
    }
    return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30";
  };

  if (isLoading) {
    return (
      <PageLayout role={profile?.role}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">
              Synthesizing holistic clinical records...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !data) {
    const noReportsMessage = reportsCount === 0 
      ? (isDoctor ? "This patient hasn't shared any fully analyzed reports with you yet." : "You haven't uploaded any fully analyzed medical reports yet.")
      : "Could not generate overall summary. Please verify your reports are fully analyzed and try again.";

    return (
      <PageLayout role={profile?.role}>
        <div className="max-w-[1400px] mx-auto p-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="text-slate-500 hover:text-primary font-medium text-sm flex items-center gap-2 transition-colors group"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back
            </button>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center">
            <span className="material-symbols-outlined text-slate-400 text-5xl mb-4">clinical_feasibility</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Overall Summary Unavailable
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto font-medium">
              {noReportsMessage}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
            >
              {isDoctor ? "Back to Patients" : "Back to Reports"}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const patientName = isDoctor ? "Patient Profile" : (profile?.full_name || "Patient");
  const initials = getInitials(patientName);
  const avatarColors = getAvatarColors(patientName);

  return (
    <PageLayout role={profile?.role}>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
        {/* Back Link */}
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="text-slate-500 hover:text-primary dark:hover:text-accent-teal font-medium text-sm flex items-center gap-2 transition-colors group"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {isDoctor ? "Back to Patient Record" : "Back to My Reports"}
          </button>
        </div>

        {/* Header Dashboard Banner */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0"
              style={{ backgroundColor: avatarColors.bg, color: avatarColors.text }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                Holistic Health Intelligence Summary
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Analyzed Records: <span className="text-slate-800 dark:text-white font-mono">{reportsCount} reports</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-xs text-slate-400 font-medium">
                  Generated on {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2.5 font-bold ${getStatusColor(data.overall_status)}`}>
            <span className="material-symbols-outlined text-lg">medical_services</span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest opacity-60 leading-none mb-0.5">Health Status</p>
              <p className="text-sm font-black leading-none uppercase">{data.overall_status}</p>
            </div>
          </div>
        </section>

        {/* Executive Summary Card */}
        <section className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-9xl text-primary dark:text-accent-teal">psychology</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary dark:text-accent-teal text-2xl">insights</span>
            <h3 className="text-xl font-bold text-primary dark:text-accent-teal">
              Executive Synthesis
            </h3>
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-lg max-w-5xl">
            {data.executive_summary}
          </p>
        </section>

        {/* Two-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center: Clinical Concerns & Health Trends (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Concerns section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">warning</span>
                Active Clinical Concerns
              </h3>
              
              <div className="space-y-4">
                {data.active_clinical_concerns?.length > 0 ? (
                  data.active_clinical_concerns.map((concern, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {concern.concern}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getSeverityBadgeColor(concern.severity)}`}>
                          {concern.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3 uppercase tracking-wide">
                        Findings: <span className="text-slate-800 dark:text-slate-200 normal-case font-medium">{concern.findings}</span>
                      </p>
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                          "{concern.clinical_note}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm">No critical concerns identified from report history.</p>
                )}
              </div>
            </div>

            {/* Trends Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-accent-teal">trending_up</span>
                Physiological Health Trends
              </h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.health_trends?.length > 0 ? (
                  data.health_trends.map((trend, idx) => (
                    <div key={idx} className={`py-4 ${idx === 0 ? "pt-0" : ""} ${idx === data.health_trends.length - 1 ? "pb-0" : ""}`}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1.5">
                        {trend.category}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {trend.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm">No long-term physiological trends found in records.</p>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column: Risks & Actions (1/3 width) */}
          <div className="space-y-8">
            
            {/* Allergies & Risks */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">health_and_safety</span>
                Allergies & Risks Matrix
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Consolidated Allergies</h4>
                  {data.consolidated_allergies_and_risks?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {data.consolidated_allergies_and_risks.allergies.map((allergy, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-100 dark:border-rose-900/50">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No allergies noted.</p>
                  )}
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Identified Risks</h4>
                  {data.consolidated_allergies_and_risks?.risks?.length > 0 ? (
                    <ul className="space-y-2">
                      {data.consolidated_allergies_and_risks.risks.map((risk, i) => (
                        <li key={i} className="flex gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No secondary risks noted.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Action Checklist */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl shadow-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-teal">assignment_turned_in</span>
                Recommended Plan
              </h3>
              
              <ul className="space-y-4">
                {data.recommended_actions?.length > 0 ? (
                  data.recommended_actions.map((action, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-200 leading-relaxed align-top">
                      <span className="material-symbols-outlined text-accent-teal shrink-0 select-none text-base mt-0.5">task_alt</span>
                      <span>{action}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs">No actionable items recommended at this time.</p>
                )}
              </ul>
            </div>
            
          </div>
          
        </div>
      </div>

      <div className="py-12 text-center border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
          This AI-synthesized health summary compiles findings across multiple clinical documents and profile details for analytical support. Always review diagnostic details with a registered medical practitioner.
        </p>
      </div>
    </PageLayout>
  );
}
