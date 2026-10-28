import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import PageLayout from '../../components/shared/PageLayout';
import { ROLES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updateDoctorProfile } from '../../services/authService';
import { getAvatarColors, getInitials } from '../../utils/avatarColors';

// ─── Field components ─────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function ProfileInput({
  value,
  onChange,
  disabled,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none
        ${disabled
          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-not-allowed'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-accent-teal'
        }`}
    />
  );
}

function ProfileSelect({
  value,
  onChange,
  disabled,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none
        ${disabled
          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-not-allowed'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-accent-teal'
        }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ProfileTextarea({
  value,
  onChange,
  disabled,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none resize-none leading-relaxed
        ${disabled
          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-not-allowed'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-accent-teal'
        }`}
    />
  );
}

// ─── Tag list for conditions / medications / allergies ──────────────────────

function TagListInput({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <ProfileInput value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} />
      {!disabled && (
        <p className="text-[10px] text-slate-400 pl-1">Separate entries with commas</p>
      )}
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
      <span className="material-symbols-outlined text-primary dark:text-accent-teal text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{title}</h3>
    </div>
  );
}

// ─── Main ProfilePage component ──────────────────────────────────────────────

export default function ProfilePage({ role }: { role: 'patient' | 'doctor' }) {
  const { profile, setProfile } = useAuth();
  const isDoctor = role === ROLES.DOCTOR;

  // ── form state ──
  const [editing, setEditing] = useState(false);

  // Shared
  const [fullName, setFullName] = useState('');

  // Doctor fields
  const [specialisation, setSpecialisation] = useState('');
  const [bio, setBio] = useState('');

  // Patient fields – step 1
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Patient fields – step 2
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecRelation, setEcRelation] = useState('');

  // ── Populate from profile ──
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setSpecialisation(profile.specialisation || '');
    setBio(profile.bio || '');
    setDob(profile.date_of_birth || '');
    setSex(profile.biological_sex || '');
    setBloodGroup(profile.blood_group || '');
    setHeight(profile.height_cm ? String(profile.height_cm) : '');
    setWeight(profile.weight_kg ? String(profile.weight_kg) : '');
    setConditions((profile.known_conditions || []).join(', '));
    setMedications((profile.current_medications || []).join(', '));
    setAllergies((profile.known_allergies || []).join(', '));
    setEcName(profile.emergency_contact_name || '');
    setEcPhone(profile.emergency_contact_phone || '');
    setEcRelation(profile.emergency_contact_relation || '');
  }, [profile]);

  // ── Cancel restores original values ──
  const handleCancel = () => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setSpecialisation(profile.specialisation || '');
    setBio(profile.bio || '');
    setDob(profile.date_of_birth || '');
    setSex(profile.biological_sex || '');
    setBloodGroup(profile.blood_group || '');
    setHeight(profile.height_cm ? String(profile.height_cm) : '');
    setWeight(profile.weight_kg ? String(profile.weight_kg) : '');
    setConditions((profile.known_conditions || []).join(', '));
    setMedications((profile.current_medications || []).join(', '));
    setAllergies((profile.known_allergies || []).join(', '));
    setEcName(profile.emergency_contact_name || '');
    setEcPhone(profile.emergency_contact_phone || '');
    setEcRelation(profile.emergency_contact_relation || '');
    setEditing(false);
  };

  // ── Mutations ──
  const splitTags = (s: string) =>
    s.split(',').map((t) => t.trim()).filter(Boolean);

  const patientMutation = useMutation({
    mutationFn: () =>
      updateProfile({
        full_name: fullName || undefined,
        date_of_birth: dob || undefined,
        biological_sex: sex || undefined,
        blood_group: bloodGroup || undefined,
        height_cm: height ? Number(height) : undefined,
        weight_kg: weight ? Number(weight) : undefined,
        known_conditions: splitTags(conditions),
        current_medications: splitTags(medications),
        known_allergies: splitTags(allergies),
        emergency_contact_name: ecName || undefined,
        emergency_contact_phone: ecPhone || undefined,
        emergency_contact_relation: ecRelation || undefined,
      }),
    onSuccess: (res) => {
      // Check for backend-level success status
      if (res.statusCode === 200 || res.statusCode === 201) {
        setProfile((prev: any) => ({ ...prev, ...res.data }));
        setEditing(false);
        toast.success(res.message || 'Profile updated successfully');
      } else {
        toast.error(res.message || 'Failed to update profile info');
      }
    },
    onError: (err: any) => {
      console.error('Patient mutation error:', err);
      toast.error(err.response?.data?.message || 'Failed to connect to the server');
    },
  });

  const doctorMutation = useMutation({
    mutationFn: () =>
      updateDoctorProfile({
        specialisation: specialisation || undefined,
        bio: bio || undefined,
      }),
    onSuccess: (res) => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Merge with existing profile to avoid losing fields like full_name or role
        setProfile((prev: any) => ({ ...prev, ...res.data }));
        setEditing(false);
        toast.success(res.message || 'Doctor profile updated successfully');
      } else {
        toast.error(res.message || 'Failed to update doctor specific info');
      }
    },
    onError: (err: any) => {
      console.error('Doctor mutation error:', err);
      toast.error(err.response?.data?.message || 'Failed to connect to the server');
    },
  });

  const isSaving = patientMutation.isPending || doctorMutation.isPending;

  const handleSave = () => {
    if (isDoctor) {
      doctorMutation.mutate();
    } else {
      patientMutation.mutate();
    }
  };

  // ── Avatar ──
  const { bg, text } = getAvatarColors(profile?.full_name || '');
  const initials = getInitials(profile?.full_name || '');

  const sexOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => ({
    label: b,
    value: b,
  }));

  return (
    <PageLayout role={role}>
      <div className="max-w-[1440px] mx-auto pb-12">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-[28px] font-bold text-slate-900 dark:text-white leading-tight">
              Account Profile
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and professional details.</p>
          </div>
        </div>

        {/* ── Banner + Avatar + Edit button ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-linear-to-br from-primary/10 via-primary/5 to-accent-teal/10 dark:from-primary/20 dark:via-slate-800 dark:to-accent-teal/10 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent-teal/5 blur-xl" />
            </div>
          </div>

          {/* Avatar + name row */}
          <div className="px-8 pb-6 pt-0 flex items-end justify-between -mt-12 relative">
            <div className="flex items-end gap-5">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black ring-4 ring-white dark:ring-slate-900 shadow-md"
                style={{ backgroundColor: bg, color: text }}
              >
                {initials}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{profile?.full_name || '—'}</h1>
                <p className="text-sm font-semibold text-primary dark:text-accent-teal mt-0.5">
                  {isDoctor ? (profile?.specialisation || 'Medical Professional') : 'Patient'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pb-1 flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary dark:bg-accent-teal text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Confirm Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Form sections ── */}
        {isDoctor ? (
          /* ── DOCTOR ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-6">
            <SectionHeader icon="badge" title="Professional Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup label="Full Name">
                <ProfileInput value={fullName} onChange={setFullName} disabled={!editing} placeholder="Dr. John Smith" />
              </FieldGroup>
              <FieldGroup label="Specialisation">
                <ProfileInput value={specialisation} onChange={setSpecialisation} disabled={!editing} placeholder="e.g. Cardiology" />
              </FieldGroup>
            </div>
            <FieldGroup label="Professional Bio">
              <ProfileTextarea value={bio} onChange={setBio} disabled={!editing} placeholder="Brief description of your clinical expertise..." rows={5} />
            </FieldGroup>

            {editing && (
              <p className="text-[11px] text-slate-400 pt-2">
                <span className="material-symbols-outlined text-[13px] align-middle mr-1 text-amber-500">info</span>
                Changes will be reflected app-wide immediately after saving.
              </p>
            )}
          </div>
        ) : (
          /* ── PATIENT ── */
          <div className="space-y-6">
            {/* Health Profile */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <SectionHeader icon="person" title="Personal & Health Profile" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Full Name">
                  <ProfileInput value={fullName} onChange={setFullName} disabled={!editing} placeholder="Jane Doe" />
                </FieldGroup>
                <FieldGroup label="Date of Birth">
                  <ProfileInput value={dob} onChange={setDob} disabled={!editing} type="date" />
                </FieldGroup>
                <FieldGroup label="Biological Sex">
                  <ProfileSelect value={sex} onChange={setSex} disabled={!editing} options={sexOptions} placeholder="Select..." />
                </FieldGroup>
                <FieldGroup label="Blood Group">
                  <ProfileSelect value={bloodGroup} onChange={setBloodGroup} disabled={!editing} options={bloodGroupOptions} placeholder="Select blood group..." />
                </FieldGroup>
                <FieldGroup label="Height (cm)">
                  <ProfileInput value={height} onChange={setHeight} disabled={!editing} placeholder="e.g. 170" type="number" />
                </FieldGroup>
                <FieldGroup label="Weight (kg)">
                  <ProfileInput value={weight} onChange={setWeight} disabled={!editing} placeholder="e.g. 68" type="number" />
                </FieldGroup>
              </div>
            </div>

            {/* Health History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <SectionHeader icon="medical_information" title="Health History" />
              <div className="grid grid-cols-1 gap-6">
                <FieldGroup label="Known Conditions">
                  <TagListInput value={conditions} onChange={setConditions} disabled={!editing} placeholder="e.g. Diabetes Type 2, Hypertension" />
                </FieldGroup>
                <FieldGroup label="Current Medications">
                  <TagListInput value={medications} onChange={setMedications} disabled={!editing} placeholder="e.g. Metformin 500mg, Aspirin" />
                </FieldGroup>
                <FieldGroup label="Known Allergies">
                  <TagListInput value={allergies} onChange={setAllergies} disabled={!editing} placeholder="e.g. Penicillin, Peanuts" />
                </FieldGroup>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <SectionHeader icon="emergency" title="Emergency Contact" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FieldGroup label="Contact Name">
                  <ProfileInput value={ecName} onChange={setEcName} disabled={!editing} placeholder="John Doe" />
                </FieldGroup>
                <FieldGroup label="Phone Number">
                  <ProfileInput value={ecPhone} onChange={setEcPhone} disabled={!editing} placeholder="+91 9876543210" type="tel" />
                </FieldGroup>
                <FieldGroup label="Relation">
                  <ProfileInput value={ecRelation} onChange={setEcRelation} disabled={!editing} placeholder="e.g. Spouse, Parent" />
                </FieldGroup>
              </div>

              {editing && (
                <p className="text-[11px] text-slate-400 pt-4">
                  <span className="material-symbols-outlined text-[13px] align-middle mr-1 text-amber-500">info</span>
                  All fields are optional — leave blank to keep unchanged.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
