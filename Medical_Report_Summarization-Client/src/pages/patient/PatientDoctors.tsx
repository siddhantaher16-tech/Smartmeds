import { useState, useEffect } from "react";
import PageLayout from "../../components/shared/PageLayout";
import TopBar from "../../components/shared/TopBar";
import LinkedDoctors from "../../components/doctors/LinkedDoctors";
import DoctorSearch from "../../components/doctors/DoctorSearch";
import DoctorSearchResults from "../../components/doctors/DoctorSearchResults";

export default function PatientDoctors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <PageLayout role="patient">
      <div className="max-w-[1400px] mx-auto">
        <TopBar 
          title="My Doctor" 
          subtitle="Manage your clinical relationships and secure access to your diagnostic history through verified medical professionals." 
        />
        
        <div className="mt-8 space-y-12">
          <LinkedDoctors />
          
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Find Your Doctor</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Search by name or specialty to initiate a clinical connection.</p>
            </div>
            <DoctorSearch value={searchTerm} onChange={setSearchTerm} />
            <div className="mt-8">
              <DoctorSearchResults searchTerm={debouncedSearch} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
