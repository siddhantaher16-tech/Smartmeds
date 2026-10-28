import { useState, useEffect } from "react";
import PageLayout from "../../components/shared/PageLayout";
import TopBar from "../../components/shared/TopBar";
import ReportsStats from "../../components/reports/ReportsStats";
import ReportsFilterBar from "../../components/reports/ReportsFilterBar";
import ReportsListTable from "../../components/reports/ReportsListTable";
import { useGetReports } from "../../hooks/useDocuments";

export default function PatientReports() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) {
        setPage(1); // Reset to page 1 on new search
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  const { data: response, isLoading, isFetching } = useGetReports(page, limit, debouncedSearch);
  
  const reportsData = response?.data;

  return (
    <PageLayout role="patient">
      <div className="max-w-[1400px] mx-auto">
        <TopBar 
          title="My Reports" 
          subtitle="Manage and review your clinical analysis history." 
        />
        
        <div className="space-y-8 mt-6">
          <ReportsStats 
            total={reportsData?.reports_total || 0}
            analyzed={reportsData?.analyzed_total || 0}
            failed={reportsData?.failed_total || 0}
          />
          <ReportsFilterBar 
            search={search}
            onSearchChange={setSearch}
          />
          <ReportsListTable 
            reports={reportsData?.reports || []}
            pagination={reportsData?.pagination}
            isLoading={isLoading || isFetching}
            onNextPage={() => setPage(p => p + 1)}
            onPrevPage={() => setPage(p => Math.max(1, p - 1))}
            onGoToPage={setPage}
          />
        </div>
      </div>
    </PageLayout>
  );
}
