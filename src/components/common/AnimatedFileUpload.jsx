import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

/**
 * AnimatedFileUpload - Clean, Professional PDF Certificate Dropzone
 * 
 * Features:
 * - PDF only (.pdf / application/pdf)
 * - Max file size validation (default 5 MB)
 * - Clean dashed border with Bhashyam blue hover/drag states
 * - Clear instructional text: "Upload PDF Certificate", "Drag & drop your PDF file here or Browse from your computer", "PDF files only • Maximum 5 MB"
 * - Clean selected file state: PDF icon, filename, size, and [Remove] button
 * - Keyboard accessible (Enter / Space to browse)
 */
export const AnimatedFileUpload = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  onValidationError,
  accept = '.pdf,application/pdf',
  maxSizeMB = 5,
  uploading = false,
  error = '',
  label = 'Upload PDF Certificate',
  sublabel = 'Drag & drop your PDF file here or browse from your computer'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const validateAndHandleFile = (file) => {
    if (!file) return;

    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf' || file.type === '';

    if (!isPdfExt || !isPdfMime) {
      const msg = 'Only PDF files (.pdf) are allowed.';
      if (onValidationError) {
        onValidationError(msg);
      }
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      const msg = `File size exceeds maximum allowed size (${maxSizeMB} MB).`;
      if (onValidationError) {
        onValidationError(msg);
      }
      return;
    }

    if (onValidationError) {
      onValidationError('');
    }
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndHandleFile(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndHandleFile(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="w-full font-sans">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id="certificate-pdf-input"
        aria-label="Upload PDF Certificate"
        disabled={uploading}
      />

      {!selectedFile ? (
        /* Empty Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          tabIndex={uploading ? -1 : 0}
          role="button"
          aria-label="Upload PDF Certificate dropzone"
          className={`w-full rounded-2xl border-2 border-dashed p-7 sm:p-9 text-center transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
            isDragOver
              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-inner'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-800/70'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center pointer-events-none">
            {/* Upload Icon */}
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            {/* Main Title */}
            <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white tracking-tight">
              {label}
            </h4>

            {/* Clean Subtitle Instructions */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
              Drag & drop your PDF file here{' '}
              <span className="text-slate-400 font-normal">or</span>{' '}
              <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                browse from your computer
              </span>
            </p>

            {/* Format Notice */}
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2.5">
              PDF only • Maximum {maxSizeMB} MB
            </p>
          </div>
        </div>
      ) : (
        /* Clean Selected File State */
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left transition-all">
          <div className="flex items-center space-x-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {formatFileSize(selectedFile.size)} • PDF Document
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={(e) => {
              e.stopPropagation();
              if (onFileRemove) onFileRemove();
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900 transition flex items-center space-x-1 shrink-0 self-end sm:self-center cursor-pointer disabled:opacity-50"
            aria-label="Remove selected PDF"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Inline Dropzone Error Display if present */}
      {error && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedFileUpload;
