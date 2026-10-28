-- ============================================================
-- MIGRATION: Rename "documents" to "reports"
-- Run this in your Supabase SQL Editor if you already have the 
-- "documents" table populated and want to keep your data.
-- ============================================================

-- 1. Rename the main table
ALTER TABLE documents RENAME TO reports;

-- 2. Rename the document_name column we added earlier
ALTER TABLE reports RENAME COLUMN document_name TO report_name;

-- 3. Rename the foreign key column in the summaries table
ALTER TABLE summaries RENAME COLUMN document_id TO report_id;

-- 4. Rename the indexes to match the new terminology
ALTER INDEX idx_documents_patient_id RENAME TO idx_reports_patient_id;
ALTER INDEX idx_summaries_document_id RENAME TO idx_summaries_report_id;

-- (Optional) If you want to be extremely thorough, you can also rename the constraint on the summaries table 
-- by default Postgres names it "summaries_document_id_fkey". You can rename it like this:
-- ALTER TABLE summaries RENAME CONSTRAINT summaries_document_id_fkey TO summaries_report_id_fkey;
