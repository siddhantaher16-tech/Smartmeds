import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadReport } from '../../hooks/useDocuments';
import UploadModal from './UploadModal';

export default function UploadZone() {
  const { isPending } = useUploadReport();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    noClick: true, // Specific buttons trigger the dialog
  });

  return (
    <section className="mb-8">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Upload New Report</h3>
      
      <div 
        {...getRootProps()} 
        className={`bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-dashed flex flex-col items-center text-center transition-colors ${
          isDragActive 
            ? 'border-accent-teal bg-accent-teal/5 dark:bg-accent-teal/10' 
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <input {...getInputProps()} />
        <div className="bg-accent-teal/10 p-4 rounded-full mb-4">
          <span className="material-symbols-outlined text-accent-teal text-4xl">cloud_upload</span>
        </div>
        
        <h4 className="text-lg font-semibold mb-1">
          {isDragActive ? 'Drop the file here...' : 'Drag and drop your medical reports here'}
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">Support for PDF, JPG, PNG up to 10MB. Make sure the text is clear and readable for best results.</p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={open}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Report</span>
            )}
          </button>
          <span className="text-slate-400 font-medium">or</span>
          <button 
            type="button"
            onClick={open}
            disabled={isPending}
            className="text-accent-teal font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            browse files
          </button>
        </div>
      </div>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        selectedFile={selectedFile} 
      />
    </section>
  );
}
