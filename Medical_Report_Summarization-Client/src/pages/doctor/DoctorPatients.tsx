import { useState, useEffect } from "react";
import PageLayout from "../../components/shared/PageLayout";
import TopBar from "../../components/shared/TopBar";
import LinkedPatients from "../../components/patients/LinkedPatients";
import PatientSearch from "../../components/patients/PatientSearch";
import { ROLES } from "../../constants";

export default function DoctorPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <PageLayout role={ROLES.DOCTOR}>
      <div className="max-w-[1400px] mx-auto">
        <TopBar
          title="My Patients"
          subtitle="Review patient clinical history and analyze shared diagnostic reports with AI-powered insights."
        />

        <div className="mt-8 space-y-12 pb-12">
          {/* Search Section */}

          <PatientSearch value={searchTerm} onChange={setSearchTerm} />

          {/* Linked Patients Section */}
          <LinkedPatients searchTerm={debouncedSearch} />
        </div>
      </div>
    </PageLayout>
  );
}
