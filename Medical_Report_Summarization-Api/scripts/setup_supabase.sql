-- ============================================================
-- SmartMeds AI — Full Supabase Setup Script
-- Run this ONCE in the Supabase SQL Editor on a fresh project.
-- Every statement is idempotent (safe to re-run).
-- ============================================================


-- ============================================================
-- TABLE 1: profiles
-- Extends Supabase's built-in auth.users table.
-- Includes all onboarding / medical profile fields.
-- ============================================================

create table if not exists profiles (
  id                           uuid references auth.users(id) on delete cascade primary key,
  full_name                    text not null,
  role                         text not null check (role in ('patient', 'doctor')),

  -- Medical onboarding fields (nullable — safe to add after signup)
  date_of_birth                date,
  biological_sex               text check (biological_sex in ('male', 'female', 'other')),
  blood_group                  text check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown')),
  height_cm                    numeric(5,1),
  weight_kg                    numeric(5,1),
  known_conditions             text[],
  current_medications          text[],
  known_allergies              text[],
  emergency_contact_name       text,
  emergency_contact_phone      text,
  emergency_contact_relation   text,

  created_at                   timestamptz default now()
);


-- ============================================================
-- TABLE 2: reports
-- Metadata for every uploaded medical file.
-- The actual file lives in Supabase Storage.
-- ============================================================

create table if not exists reports (
  id           uuid default gen_random_uuid() primary key,
  patient_id   uuid not null references profiles(id) on delete cascade,
  file_name    text not null,
  file_url     text not null,
  file_type    text not null,
  report_type  text,
  report_name  text,
  status       text not null default 'pending'
                 check (status in ('pending', 'processing', 'done', 'failed')),
  uploaded_at  timestamptz default now()
);


-- ============================================================
-- TABLE 3: summaries
-- AI-generated summary stored as JSONB.
-- One summary per report (unique constraint enforces this).
-- ============================================================

create table if not exists summaries (
  id          uuid default gen_random_uuid() primary key,
  report_id   uuid not null references reports(id) on delete cascade unique,
  summary_json jsonb not null,
  created_at  timestamptz default now()
);


-- ============================================================
-- TABLE 4: doctor_patient
-- Many-to-many join table linking doctors to their patients.
-- ============================================================

create table if not exists doctor_patient (
  id         uuid default gen_random_uuid() primary key,
  doctor_id  uuid not null references profiles(id) on delete cascade,
  patient_id uuid not null references profiles(id) on delete cascade,
  linked_at  timestamptz default now(),
  unique(doctor_id, patient_id)
);

-- Drop any leftover unique constraint on patient_id alone (from earlier schema versions)
alter table doctor_patient
  drop constraint if exists doctor_patient_patient_id_key;


-- ============================================================
-- TABLE 5: report_shares
-- Tracks which reports a patient explicitly shared with a doctor.
-- Reports are private by default.
-- ============================================================

create table if not exists report_shares (
  id         uuid default gen_random_uuid() primary key,
  report_id  uuid not null references reports(id)   on delete cascade,
  patient_id uuid not null references profiles(id)  on delete cascade,
  doctor_id  uuid not null references profiles(id)  on delete cascade,
  shared_at  timestamptz default now(),
  unique(report_id, doctor_id)
);


-- ============================================================
-- INDEXES
-- Speed up the most common query patterns.
-- ============================================================

create index if not exists idx_reports_patient_id          on reports(patient_id);
create index if not exists idx_summaries_report_id         on summaries(report_id);
create index if not exists idx_doctor_patient_doctor_id    on doctor_patient(doctor_id);
create index if not exists idx_report_shares_report_id     on report_shares(report_id);
create index if not exists idx_report_shares_doctor_id     on report_shares(doctor_id);
create index if not exists idx_report_shares_patient_id    on report_shares(patient_id);


-- ============================================================
-- STORAGE BUCKET
-- Private bucket — files accessible only via the service key.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('medical-docs', 'medical-docs', false)
on conflict (id) do nothing;


-- ============================================================
-- STORAGE RLS POLICIES
-- storage.objects has its own RLS layer separate from tables.
-- ============================================================

-- Service role gets full access (needed by the backend API)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Service role full access to medical-docs'
  ) then
    execute $pol$
      create policy "Service role full access to medical-docs"
      on storage.objects for all to service_role
      using     (bucket_id = 'medical-docs')
      with check (bucket_id = 'medical-docs');
    $pol$;
  end if;
end $$;

-- Authenticated patients can upload into their own folder ({userId}/...)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Patients can upload their own files'
  ) then
    execute $pol$
      create policy "Patients can upload their own files"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'medical-docs'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
    $pol$;
  end if;
end $$;

-- Authenticated patients can read files in their own folder
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Patients can read their own files'
  ) then
    execute $pol$
      create policy "Patients can read their own files"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'medical-docs'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
    $pol$;
  end if;
end $$;

-- Authenticated patients can delete files in their own folder
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Patients can delete their own files'
  ) then
    execute $pol$
      create policy "Patients can delete their own files"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'medical-docs'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
    $pol$;
  end if;
end $$;


-- ============================================================
-- DONE
-- All tables, indexes, storage bucket, and RLS policies are set up.
-- ============================================================
