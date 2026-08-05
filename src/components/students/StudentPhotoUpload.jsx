import React, { useState } from 'react';
import { Upload, Camera, AlertCircle } from 'lucide-react';

export const StudentPhotoUpload = ({ photoUrl, onPhotoSelect }) => {
  const [preview, setPreview] = useState(photoUrl || '');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
    onPhotoSelect(file, objectUrl);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
      <div className="relative w-28 h-28 mb-3 group">
        <img
          src={preview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
          alt="Student Preview"
          className="w-28 h-28 rounded-full object-cover border-2 border-purple-500 shadow-md"
        />
        <label
          htmlFor="photo-upload-input"
          className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition"
        >
          <Camera className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Change Photo</span>
        </label>
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
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer hover:bg-slate-50"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
        Upload Photo (JPG/PNG max 5MB)
      </label>

      {error && (
        <div className="mt-2 flex items-center text-xs text-rose-500">
          <AlertCircle className="w-3.5 h-3.5 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default StudentPhotoUpload;
