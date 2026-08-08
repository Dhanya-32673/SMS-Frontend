import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import certificateService from '../../services/certificateService';
import AnimatedFileUpload from '../common/AnimatedFileUpload';
import { useToast } from '../../context/ToastContext';

export const UploadCertificateModal = ({ prefilledStudentId, prefilledDocumentTypeId, onClose, onUploaded }) => {
  const { showWarning } = useToast();
  const [studentId, setStudentId] = useState(prefilledStudentId || '');
  const [documentTypeId, setDocumentTypeId] = useState(prefilledDocumentTypeId || '');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await certificateService.getActiveDocumentTypes();
        setDocumentTypes(types || []);
        if (!prefilledDocumentTypeId && types && types.length > 0) {
          setDocumentTypeId(types[0].id);
        }
      } catch (err) {
        setError('Failed to load document types');
      }
    };
    fetchTypes();
  }, [prefilledDocumentTypeId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('Only PDF files (.pdf) are allowed.');
        showWarning('Invalid file format. Please upload a PDF.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds maximum 5 MB limit.');
        showWarning('File size exceeds the limit.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !documentTypeId || !file) {
      setError('Please select a student, document type, and PDF file.');
      showWarning('Please fill all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    try {
      await certificateService.uploadCertificate(formData);
      setSuccess(true);
      if (onUploaded) onUploaded();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Upload Certificate PDF
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Certificate uploaded successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. STU2026001001"
              required
              disabled={Boolean(prefilledStudentId)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Certificate Type *
            </label>
            <select
              value={documentTypeId}
              onChange={(e) => setDocumentTypeId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">Select Certificate Type</option>
              {documentTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name} ({dt.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Certificate PDF File * (Max 5 MB)
            </label>
            <AnimatedFileUpload
              selectedFile={file}
              onFileSelect={(selected) => {
                if (selected) {
                  const isPdfExt = selected.name.toLowerCase().endsWith('.pdf');
                  const isPdfMime = selected.type === 'application/pdf' || selected.type === '';
                  if (!isPdfExt || !isPdfMime) {
                    setError('Only PDF files (.pdf) are allowed.');
                    setFile(null);
                    return;
                  }
                  if (selected.size > 5 * 1024 * 1024) {
                    setError('PDF file size exceeds maximum 5 MB limit.');
                    setFile(null);
                    return;
                  }
                  setError('');
                  setFile(selected);
                }
              }}
              onFileRemove={() => setFile(null)}
              uploading={loading}
              accept=".pdf,application/pdf"
              maxSizeMB={5}
              label="Drag & drop PDF certificates or any document"
              sublabel="or browse files on your computer"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional remarks..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
            >
              {loading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCertificateModal;
