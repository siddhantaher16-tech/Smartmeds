import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updateDoctorProfile } from "../../services/authService";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  SkipForward,
} from "lucide-react";
import { ROLES } from "../../constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientStep1Fields {
  date_of_birth: string;
  biological_sex: string;
  blood_group: string;
  height_cm: string;
  weight_kg: string;
}

interface PatientStep2Fields {
  known_conditions: string;
  current_medications: string;
  known_allergies: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
}

interface DoctorStep1Fields {
  specialisation: string;
  bio: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const splitTags = (val: string) =>
  val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {children}
      <span className="ml-1 text-xs font-normal text-slate-400">
        (optional)
      </span>
    </label>
  );
}

function TextInput({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
    />
  );
}

function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function TagsInput({
  id,
  placeholder,
  value,
  onChange,
  hint,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i + 1 < step
                ? "bg-primary text-white"
                : i + 1 === step
                  ? "bg-primary text-white ring-4 ring-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-10 rounded-full transition-all ${
                i + 1 < step ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        Step {step} of {total}
      </span>
    </div>
  );
}

// ─── Patient Step 1: Basic Medical Info ──────────────────────────────────────

function PatientFormStep1({
  fields,
  onChange,
}: {
  fields: PatientStep1Fields;
  onChange: (f: Partial<PatientStep1Fields>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Date of Birth</FieldLabel>
          <TextInput
            id="dob"
            type="date"
            placeholder=""
            value={fields.date_of_birth}
            onChange={(v) => onChange({ date_of_birth: v })}
          />
        </div>
        <div>
          <FieldLabel>Biological Sex</FieldLabel>
          <SelectInput
            id="sex"
            value={fields.biological_sex}
            onChange={(v) => onChange({ biological_sex: v })}
            placeholder="Select..."
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Blood Group</FieldLabel>
        <SelectInput
          id="blood_group"
          value={fields.blood_group}
          onChange={(v) => onChange({ blood_group: v })}
          placeholder="Select blood group..."
          options={[
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-",
            "Unknown",
          ].map((bg) => ({ label: bg, value: bg }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Height (cm)</FieldLabel>
          <TextInput
            id="height"
            type="number"
            placeholder="e.g. 170"
            value={fields.height_cm}
            onChange={(v) => onChange({ height_cm: v })}
          />
        </div>
        <div>
          <FieldLabel>Weight (kg)</FieldLabel>
          <TextInput
            id="weight"
            type="number"
            placeholder="e.g. 68"
            value={fields.weight_kg}
            onChange={(v) => onChange({ weight_kg: v })}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Patient Step 2: Health Background & Emergency Contact ───────────────────

function PatientFormStep2({
  fields,
  onChange,
}: {
  fields: PatientStep2Fields;
  onChange: (f: Partial<PatientStep2Fields>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Known Conditions</FieldLabel>
        <TagsInput
          id="conditions"
          placeholder="e.g. Diabetes Type 2, Hypertension"
          value={fields.known_conditions}
          onChange={(v) => onChange({ known_conditions: v })}
          hint="Separate multiple entries with commas"
        />
      </div>

      <div>
        <FieldLabel>Current Medications</FieldLabel>
        <TagsInput
          id="medications"
          placeholder="e.g. Metformin 500mg, Aspirin"
          value={fields.current_medications}
          onChange={(v) => onChange({ current_medications: v })}
          hint="Separate multiple entries with commas"
        />
      </div>

      <div>
        <FieldLabel>Known Allergies</FieldLabel>
        <TagsInput
          id="allergies"
          placeholder="e.g. Penicillin, Peanuts"
          value={fields.known_allergies}
          onChange={(v) => onChange({ known_allergies: v })}
          hint="Separate multiple entries with commas"
        />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          Emergency Contact
        </p>
        <div className="space-y-3">
          <div>
            <FieldLabel>Contact Name</FieldLabel>
            <TextInput
              id="ec_name"
              placeholder="e.g. John Doe"
              value={fields.emergency_contact_name}
              onChange={(v) => onChange({ emergency_contact_name: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Phone</FieldLabel>
              <TextInput
                id="ec_phone"
                type="tel"
                placeholder="+1-555-0100"
                value={fields.emergency_contact_phone}
                onChange={(v) => onChange({ emergency_contact_phone: v })}
              />
            </div>
            <div>
              <FieldLabel>Relation</FieldLabel>
              <TextInput
                id="ec_relation"
                placeholder="e.g. Spouse"
                value={fields.emergency_contact_relation}
                onChange={(v) => onChange({ emergency_contact_relation: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Step 1: Professional Info ────────────────────────────────────────

function DoctorFormStep1({
  fields,
  onChange,
}: {
  fields: DoctorStep1Fields;
  onChange: (f: Partial<DoctorStep1Fields>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Specialisation</FieldLabel>
        <TextInput
          id="specialisation"
          placeholder="e.g. Cardiologist"
          value={fields.specialisation}
          onChange={(v) => onChange({ specialisation: v })}
        />
      </div>
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          id="bio"
          rows={5}
          placeholder="Tell patients a bit about your experience and practice..."
          value={fields.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
}

// ─── Doctor Step 2: Confirmation ─────────────────────────────────────────────

function DoctorConfirmation() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
        <Check className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        You're all set!
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        Your profile is ready. You can always update these details later from
        your profile settings.
      </p>
    </div>
  );
}

// ─── Main Onboarding Page ────────────────────────────────────────────────────

export default function OnboardingStep1() {
  const { profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const isDoctor = profile?.role === ROLES.DOCTOR;

  const [step, setStep] = useState(1);

  // Patient state
  const [patientStep1, setPatientStep1] = useState<PatientStep1Fields>({
    date_of_birth: "",
    biological_sex: "",
    blood_group: "",
    height_cm: "",
    weight_kg: "",
  });

  const [patientStep2, setPatientStep2] = useState<PatientStep2Fields>({
    known_conditions: "",
    current_medications: "",
    known_allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  // Doctor state
  const [doctorFields, setDoctorFields] = useState<DoctorStep1Fields>({
    specialisation: "",
    bio: "",
  });

  const dashboard = isDoctor ? "/doctor/dashboard" : "/patient/dashboard";

  // ── Mutations ──────────────────────────────────────────────────────────────

  const patientMedicalMutation = useMutation({
    mutationFn: (fields: object) =>
      updateProfile(fields as Parameters<typeof updateProfile>[0]),
    onSuccess: (res) => {
      if (res?.data) setProfile({ ...profile, ...res.data });
      toast.success("Saved successfully");
    },
    onError: () => toast.error("Could not save profile, please try again."),
  });

  const doctorMutation = useMutation({
    mutationFn: updateDoctorProfile,
    onSuccess: (res) => {
      if (res?.data) setProfile({ ...profile, ...res.data });
      toast.success("Profile saved");
    },
    onError: () => toast.error("Could not save profile, please try again."),
  });

  const isSaving = patientMedicalMutation.isPending || doctorMutation.isPending;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSkip = () => {
    if (step === 1) {
      setStep(2);
    } else {
      navigate(dashboard);
    }
  };

  const handleSave = async () => {
    if (isDoctor) {
      if (step === 1) {
        // Save doctor profile then go to confirmation step
        const payload: { specialisation?: string; bio?: string } = {};
        if (doctorFields.specialisation)
          payload.specialisation = doctorFields.specialisation;
        if (doctorFields.bio) payload.bio = doctorFields.bio;

        if (Object.keys(payload).length > 0) {
          await doctorMutation.mutateAsync(payload);
        }
        setStep(2);
      } else {
        // On confirmation screen — just go to dashboard
        navigate(dashboard);
      }
    } else {
      // Patient
      if (step === 1) {
        const payload: Record<string, string | number> = {};
        if (patientStep1.date_of_birth)
          payload.date_of_birth = patientStep1.date_of_birth;
        if (patientStep1.biological_sex)
          payload.biological_sex = patientStep1.biological_sex;
        if (patientStep1.blood_group)
          payload.blood_group = patientStep1.blood_group;
        if (patientStep1.height_cm)
          payload.height_cm = Number(patientStep1.height_cm);
        if (patientStep1.weight_kg)
          payload.weight_kg = Number(patientStep1.weight_kg);

        if (Object.keys(payload).length > 0) {
          try {
            await patientMedicalMutation.mutateAsync(
              payload as Parameters<typeof updateProfile>[0],
            );
          } catch {
            return; // don't advance on error
          }
        }
        setStep(2);
      } else {
        // Step 2 — save and go to dashboard
        const payload: Record<string, string | string[]> = {};
        const conditions = splitTags(patientStep2.known_conditions);
        const medications = splitTags(patientStep2.current_medications);
        const allergies = splitTags(patientStep2.known_allergies);
        if (conditions.length) payload.known_conditions = conditions;
        if (medications.length) payload.current_medications = medications;
        if (allergies.length) payload.known_allergies = allergies;
        if (patientStep2.emergency_contact_name)
          payload.emergency_contact_name = patientStep2.emergency_contact_name;
        if (patientStep2.emergency_contact_phone)
          payload.emergency_contact_phone =
            patientStep2.emergency_contact_phone;
        if (patientStep2.emergency_contact_relation)
          payload.emergency_contact_relation =
            patientStep2.emergency_contact_relation;

        if (Object.keys(payload).length > 0) {
          try {
            await patientMedicalMutation.mutateAsync(
              payload as Parameters<typeof updateProfile>[0],
            );
          } catch {
            return;
          }
        }
        navigate(dashboard);
      }
    }
  };

  // ── Step meta ──────────────────────────────────────────────────────────────

  const stepTitles = isDoctor
    ? ["Professional Profile", "You're All Set"]
    : ["Your Health Profile", "Health History & Emergency Contact"];

  const stepSubtitles = isDoctor
    ? [
        "Help patients find you with a short professional introduction.",
        "Your profile has been set up successfully.",
      ]
    : [
        "A few basic details help the AI understand your reports better.",
        "Add your health history and an emergency contact for your profile.",
      ];

  const isLastStep = step === 2;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display antialiased">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent-teal/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SmartMeds AI</h1>
        </div>

        {/* Body */}
        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            One last step
            <br />
            <span className="text-accent-teal">before we begin.</span>
          </h2>
          <p className="text-slate-200 text-lg max-w-md leading-relaxed">
            Setting up your profile helps our AI personalise your medical report
            summaries and provide more accurate insights.
          </p>

          {/* Steps preview */}
          <div className="mt-12 space-y-4">
            {stepTitles.map((title, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 transition-all ${
                  step === i + 1 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step > i + 1
                      ? "bg-accent-teal text-white"
                      : step === i + 1
                        ? "bg-white text-primary"
                        : "bg-white/10 text-white"
                  }`}
                >
                  {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${step === i + 1 ? "text-white" : "text-slate-300"}`}
                  >
                    {title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          © {new Date().getFullYear()} SmartMeds AI. HIPAA Compliant &amp;
          Secure.
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white dark:bg-background-dark overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden flex items-center gap-2 text-primary dark:text-slate-100">
            <Activity className="h-8 w-8" />
            <span className="text-xl font-bold">SmartMeds AI</span>
          </div>

          <StepIndicator step={step} total={2} />

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {stepTitles[step - 1]}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {stepSubtitles[step - 1]}
            </p>
          </div>

          {/* Form Fields */}
          {isDoctor ? (
            step === 1 ? (
              <DoctorFormStep1
                fields={doctorFields}
                onChange={(f) => setDoctorFields((p) => ({ ...p, ...f }))}
              />
            ) : (
              <DoctorConfirmation />
            )
          ) : step === 1 ? (
            <PatientFormStep1
              fields={patientStep1}
              onChange={(f) => setPatientStep1((p) => ({ ...p, ...f }))}
            />
          ) : (
            <PatientFormStep2
              fields={patientStep2}
              onChange={(f) => setPatientStep2((p) => ({ ...p, ...f }))}
            />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8">
            {/* Skip button — hide on doctor confirmation step */}
            {!(isDoctor && step === 2) && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isLastStep ? (
                <>
                  Go to Dashboard <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Save &amp; Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            All fields are optional — you can update your profile anytime from
            settings.
          </p>
        </div>
      </div>
    </div>
  );
}
