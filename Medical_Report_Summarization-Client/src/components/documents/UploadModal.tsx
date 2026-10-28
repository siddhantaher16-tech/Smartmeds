import { useState, useEffect } from "react";
import { useUploadReport } from "../../hooks/useDocuments";
import { X } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile: File | null;
}

export default function UploadModal({ isOpen, onClose, selectedFile }: UploadModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const { mutate: uploadReport, isPending } = useUploadReport();

  // Populate default name from file if provided
  useEffect(() => {
    if (selectedFile && isOpen) {
      // Remove extension for default name
      const defaultName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(defaultName);
      setType(""); // Reset type
    }
  }, [selectedFile, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !name.trim() || !type.trim()) return;

    uploadReport(
      { file: selectedFile, name: name.trim(), type: type.trim() },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Upload Report Detail
          </h3>
          <button 
            onClick={onClose} 
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 border-none">
              Selected File
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-accent-teal">description</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {selectedFile?.name || "No file selected"}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="docName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="docName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Blood Test June 2024"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="docType" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="docType"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 rounded-lg text-sm text-slate-900 dark:text-slate-100 transition-all"
              disabled={isPending}
            >
              <option value="" disabled>Select a report type...</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Heart Health">Heart Health</option>
              <option value="Thyroid Test">Thyroid Test</option>
              <option value="Lipid Profile">Lipid Profile</option>
              <option value="MRI Report">MRI Report</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !type.trim() || isPending}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Uploading...
                </>
              ) : (
                "Upload Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
