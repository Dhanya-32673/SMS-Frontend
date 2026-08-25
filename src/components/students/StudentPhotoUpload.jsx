import React, { useState, useEffect } from 'react';
import { Upload, Camera, AlertCircle, X } from 'lucide-react';
import StudentAvatar from '../common/StudentAvatar';

export const StudentPhotoUpload = ({ photoUrl, studentName = 'Student', studentId = '', onPhotoSelect }) => {
  const [preview, setPreview] = useState(photoUrl || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setPreview(photoUrl || '');
  }, [photoUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Only JPG, JPEG, and PNG image files are allowed.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.');
      return;
    }

    setError('');
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onPhotoSelect) {
      onPhotoSelect(file, objectUrl);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview('');
    setError('');
    if (onPhotoSelect) {
      onPhotoSelect(null, '');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="relative w-28 h-28 mb-3 group">
        <StudentAvatar
          src={preview}
          name={studentName}
          studentId={studentId}
          size="2xl"
          rounded="rounded-full"
          className="w-28 h-28 border-2 border-blue-500 shadow-md"
        />

        <label
          htmlFor="photo-upload-input"
          className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition select-none"
        >
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Change</span>
        </label>

        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md cursor-pointer transition z-10"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        id="photo-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      <label
        htmlFor="photo-upload-input"
        className="inline-flex items-center px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
        Choose Photo (JPG/PNG max 5MB)
      </label>

      {error && (
        <div className="mt-2.5 flex items-center text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default StudentPhotoUpload;
