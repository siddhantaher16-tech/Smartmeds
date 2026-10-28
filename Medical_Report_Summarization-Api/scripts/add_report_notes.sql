-- ============================================================
-- TABLE 6: report_notes
-- Stores clinical notes added by doctors to specific reports
-- ============================================================

create table if not exists report_notes (
  id uuid default gen_random_uuid() primary key,
  report_id uuid not null references reports(id) on delete cascade,
  doctor_id uuid not null references profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

-- Index for fast retrievals
create index if not exists idx_report_notes_report_id on report_notes(report_id);
