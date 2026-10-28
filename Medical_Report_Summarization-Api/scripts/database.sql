-- ============================================================
-- SmartMeds AI — Database Schema
-- Run this entire file in Supabase SQL Editor once
-- ============================================================


-- ============================================================
-- TABLE 1: profiles
-- Extends Supabase's built-in auth.users table
-- Supabase handles email, password, and tokens automatically
-- We only store the extra information we need here
-- ============================================================

create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  -- id must match the auth.users id exactly so we can link them
  -- on delete cascade means if the auth user is deleted, profile is too

  full_name text not null,
  -- Storing full name as one field keeps it simple
  -- No need to split into first/last for this project

  role text not null check (role in ('patient', 'doctor')),
  -- Role determines which dashboard the user sees
  -- check constraint prevents any value other than patient or doctor
  -- being inserted at the database level, not just the app level

  created_at timestamptz default now()
  -- timestamptz stores timezone-aware timestamp
  -- default now() means we never have to pass this manually
);


-- ============================================================
-- TABLE 2: reports
-- Stores metadata about every uploaded file
-- The actual file lives in Supabase Storage, not here
-- This table just tracks information ABOUT the file
-- ============================================================

create table reports (
  id uuid default gen_random_uuid() primary key,
  -- gen_random_uuid() auto generates a unique id for every row
  -- uuid is better than integer ids for security (not guessable)

  patient_id uuid not null references profiles(id) on delete cascade,
  -- Links report to the patient who uploaded it
  -- on delete cascade means if patient is deleted, their reports are too

  file_name text not null,
  -- Original name of the file as uploaded by the patient
  -- Used for display purposes in the UI

  file_url text not null,
  -- The full URL to the file in Supabase Storage
  -- This is what we pass to Gemini for processing

  file_type text not null,
  -- Stores the mime type: application/pdf, image/jpeg, image/png
  -- Useful for the frontend to show the right icon per file type

  report_type text,
  -- Provides information regarding the type of the report like Lipid Test, Thyroid Test

  report_name text,
  -- A custom name provided by the user for the report

  status text not null default 'pending' 
    check (status in ('pending', 'processing', 'done', 'failed')),
  -- Tracks exactly where in the pipeline the report is
  -- pending: just uploaded, not yet sent to Gemini
  -- processing: currently being analyzed by Gemini
  -- done: summary successfully generated and stored
  -- failed: something went wrong, user should retry
  -- Frontend polls this field every few seconds to update the UI

  uploaded_at timestamptz default now()
  -- When the file was uploaded
  -- Used for sorting reports newest first in the UI
);


-- ============================================================
-- TABLE 3: summaries
-- Stores the AI generated summary output for each report
-- Kept as a separate table from reports intentionally
-- so a report can exist without a summary (while processing)
-- ============================================================

create table summaries (
  id uuid default gen_random_uuid() primary key,

  report_id uuid not null references reports(id) on delete cascade unique,
  -- Links to the report this summary belongs to
  -- unique constraint ensures one report can only ever 
  -- have one summary, prevents duplicate processing

  summary_json jsonb not null,
  -- jsonb is PostgreSQL's binary JSON type
  -- We store the entire Gemini response here as structured JSON
  -- jsonb is better than json because it is indexed and queryable
  -- meaning you can later query specific fields inside the JSON
  -- For example: summary_json->>'report_type' = 'Blood Test'
  -- The structure inside matches exactly what our Gemini prompt returns:
  -- report_type, patient_name, report_date, summary,
  -- critical_flags, all_findings, doctor_recommendation

  created_at timestamptz default now()
  -- When the summary was generated
  -- Useful for knowing how fresh the analysis is
);


-- ============================================================
-- TABLE 4: doctor_patient
-- A simple join table that links doctors to their patients
-- This is a many-to-many relationship:
-- One doctor can have many patients
-- One patient could theoretically be linked to many doctors
-- ============================================================

create table doctor_patient (
  id uuid default gen_random_uuid() primary key,
  -- Own primary key so rows are easy to reference and delete

  doctor_id uuid not null references profiles(id) on delete cascade,
  -- The doctor who has access to this patient's reports

  patient_id uuid not null references profiles(id) on delete cascade,
  -- The patient whose reports the doctor can see

  linked_at timestamptz default now(),
  -- When the doctor-patient relationship was created
  -- Good to have for audit purposes

  unique(doctor_id, patient_id)
  -- Prevents the same doctor-patient pair from being inserted twice
  -- Without this you could accidentally link them multiple times
);

alter table doctor_patient 
drop constraint if exists doctor_patient_patient_id_key;

-- ============================================================
-- INDEXES
-- Indexes make lookups faster on columns we query often
-- Without indexes Postgres scans the entire table every time
-- ============================================================

create index idx_reports_patient_id on reports(patient_id);
-- We very frequently fetch all reports WHERE patient_id = X
-- This index makes that query fast

create index idx_summaries_report_id on summaries(report_id);
-- We frequently fetch summary WHERE report_id = X
-- This index makes that lookup instant

create index idx_doctor_patient_doctor_id on doctor_patient(doctor_id);
-- We frequently fetch all patients WHERE doctor_id = X
-- This index speeds that up


-- ============================================================
-- STORAGE BUCKET
-- Run this to create the storage bucket for file uploads
-- ============================================================

insert into storage.buckets (id, name, public)
values ('medical-docs', 'medical-docs', false);
-- public: false means files are not accessible via public URL
-- Files can only be accessed through the Supabase service key
-- This is important for medical data privacy


-- ============================================================
-- STORAGE RLS POLICIES
-- Storage has its own RLS layer (storage.objects table) that is
-- separate from regular table RLS. Without these policies, even
-- the service role key can be blocked on storage operations.
-- ============================================================

-- Allow the backend service role full access to the bucket
create policy "Service role full access to medical-docs"
on storage.objects
for all
to service_role
using (bucket_id = 'medical-docs')
with check (bucket_id = 'medical-docs');

-- Allow authenticated users to upload files into their own folder
-- The storage path is: {userId}/{timestamp}-{filename}
-- so the first folder segment must match the authenticated user's id
create policy "Patients can upload their own files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'medical-docs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read files in their own folder
create policy "Patients can read their own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'medical-docs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete files in their own folder
create policy "Patients can delete their own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'medical-docs'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- MIGRATION: Medical profile onboarding fields
-- Run once in the Supabase SQL Editor
-- All columns are nullable — existing rows are unaffected
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth               date,
  ADD COLUMN IF NOT EXISTS biological_sex              text CHECK (biological_sex IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS blood_group                 text CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown')),
  ADD COLUMN IF NOT EXISTS height_cm                   numeric(5,1),
  ADD COLUMN IF NOT EXISTS weight_kg                   numeric(5,1),
  ADD COLUMN IF NOT EXISTS known_conditions            text[],
  ADD COLUMN IF NOT EXISTS current_medications         text[],
  ADD COLUMN IF NOT EXISTS known_allergies             text[],
  ADD COLUMN IF NOT EXISTS emergency_contact_name      text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone     text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation  text;

-- ============================================================
-- MIGRATION: Add report_type to reports
-- ============================================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS report_type text,
  ADD COLUMN IF NOT EXISTS report_name text;



-- ============================================================
-- TABLE 5: report_shares
-- Tracks which reports a patient has explicitly shared
-- with a specific doctor. A report is private by default
-- and only appears here when the patient grants access.
-- ============================================================

create table report_shares (
  id uuid default gen_random_uuid() primary key,

  report_id uuid not null references reports(id) 
    on delete cascade,
  -- When a report is deleted, its shares are 
  -- automatically deleted too

  patient_id uuid not null references profiles(id) 
    on delete cascade,
  -- The patient who owns the report and granted access

  doctor_id uuid not null references profiles(id) 
    on delete cascade,
  -- The doctor who was granted access

  shared_at timestamptz default now(),
  -- When the patient shared this report

  unique(report_id, doctor_id)
  -- A report can only be shared with the same 
  -- doctor once. Prevents duplicate share rows.
);

create index idx_report_shares_report_id 
  on report_shares(report_id);

create index idx_report_shares_doctor_id 
  on report_shares(doctor_id);

create index idx_report_shares_patient_id 
  on report_shares(patient_id);