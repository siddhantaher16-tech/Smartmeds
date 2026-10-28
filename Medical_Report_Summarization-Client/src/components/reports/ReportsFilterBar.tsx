import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UploadModal from "../documents/UploadModal";

interface Props {
  search?: string;
  onSearchChange?: (val: string) => void;
}

export default function ReportsFilterBar({ search = "", onSearchChange }: Props) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIsModalOpen(true);
      // Reset input so the same file could be selected again if cancelled
      e.target.value = "";
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  return (
    <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96 group">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 select-none">search</span>
        <input 
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 rounded-lg text-sm transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder:text-slate-400" 
          placeholder="Search by report name or ID..." 
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">

        {/* Upload Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <button 
          onClick={() => navigate('/patient/overall-summary')}
          className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">insights</span>
          Overall Summary
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">cloud_upload</span>
          Upload
        </button>
      </div>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        selectedFile={selectedFile} 
      />
    </section>
  );
}
