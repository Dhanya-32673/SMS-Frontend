import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, AlertCircle, X, RotateCcw, Loader2 } from 'lucide-react';
import StudentAvatar from '../common/StudentAvatar';

export const StudentPhotoUpload = ({
  photoUrl,
  studentName = 'Student',
  studentId = '',
  onPhotoSelect,
  uploading = false,
  disabled = false,
  errorMessage = '',
}) => {
  const [preview, setPreview] = useState(photoUrl || '');
  const [hasNewFile, setHasNewFile] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Sync with photoUrl if not actively previewing a newly picked file
  useEffect(() => {
    if (!hasNewFile) {
      setPreview(photoUrl || '');
    }
  }, [photoUrl, hasNewFile]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setLocalError('Only JPG, JPEG, and PNG image files are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('File size must be less than 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLocalError('');

    // Clean up prior object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setHasNewFile(true);

    if (onPhotoSelect) {
      onPhotoSelect(file, objectUrl);
    }
  };

  const handleRevert = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setHasNewFile(false);
    setPreview(photoUrl || '');
    setLocalError('');
    if (onPhotoSelect) {
      onPhotoSelect(null, photoUrl || '');
    }
  };

  const handleRemoveSaved = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setHasNewFile(false);
    setPreview('');
    setLocalError('');
    if (onPhotoSelect) {
      onPhotoSelect(null, '');
    }
  };

  const displayError = localError || errorMessage;
  const isBusy = uploading || disabled;

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 transition">
      <div className="relative w-28 h-28 mb-3 group">
        <StudentAvatar
          src={preview}
          name={studentName}
          studentId={studentId}
          size="2xl"
          rounded="rounded-full"
          className="w-28 h-28 border-2 border-blue-500 shadow-md"
        />

        {/* Uploading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white z-20 animate-fade-in">
            <Loader2 className="w-7 h-7 animate-spin mb-1 text-blue-400" />
            <span className="text-[10px] font-bold">Uploading...</span>
          </div>
        )}

        {/* Change Photo Hover Overlay */}
        {!isBusy && (
          <label
            htmlFor="photo-upload-input"
            className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition select-none z-10"
          >
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Change</span>
          </label>
        )}

        {/* Revert newly selected file button */}
        {!isBusy && hasNewFile && (
          <button
            type="button"
            onClick={handleRevert}
            className="absolute -top-1 -right-1 p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-md cursor-pointer transition z-20"
            title="Cancel new selection (keep existing photo)"
            aria-label="Cancel new selection"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Remove saved photo button */}
        {!isBusy && !hasNewFile && preview && (
          <button
            type="button"
            onClick={handleRemoveSaved}
            className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md cursor-pointer transition z-20"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        id="photo-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        disabled={isBusy}
        className="hidden"
      />

      <label
        htmlFor={isBusy ? undefined : 'photo-upload-input'}
        className={`inline-flex items-center px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shadow-xs transition ${
          isBusy
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60'
        }`}
      >
        <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
        {hasNewFile ? 'Choose Different Photo' : 'Choose Photo (JPG/PNG max 5MB)'}
      </label>

      {hasNewFile && !isBusy && (
        <span className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          New photo selected (click Update Student to save)
        </span>
      )}

      {displayError && (
        <div className="mt-2.5 flex items-center text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};

export default StudentPhotoUpload;
