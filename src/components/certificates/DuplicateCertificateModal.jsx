import React, { useState } from 'react';
import { AlertTriangle, Eye, RefreshCw, Trash2, X, Loader2 } from 'lucide-react';

export const DuplicateCertificateModal = ({

  duplicateData,
  onView,
  onReplace,
  onDelete,
  onCancel,
}) => {
  if (!duplicateData) return null;

  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { existingCertificateId, certificateType, studentId } = duplicateData;

  const handleExecuteReplace = async () => {
    setLoading(true);
    setError('');
    try {
      await onReplace(existingCertificateId);
    } catch (err) {
      console.error('Replace error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to replace certificate.');
      setLoading(false);
    }
  };

  const handleExecuteDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await onDelete(existingCertificateId);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete certificate.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/80 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 sm:pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Certificate Already Exists
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                Student ID: <span className="font-mono font-bold">{studentId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}

          {confirmReplace ? (
            <div className="p-4 bg-purple-50 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-900/50 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                Confirm Replacement
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to replace this certificate? The existing PDF file in storage will be replaced by the newly selected PDF.
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setConfirmReplace(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteReplace}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Replace Document</span>
                </button>
              </div>
            </div>
          ) : confirmDelete ? (
            <div className="p-4 bg-rose-50 dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                Confirm Deletion
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete the existing certificate? This will remove the PDF file from storage and clear the record, allowing you to upload a fresh certificate.
              </p>
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteDelete}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Delete Document</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This student already has an uploaded certificate of type{' '}
                <strong className="text-slate-900 dark:text-white font-bold">{certificateType}</strong>.
              </p>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  You cannot upload another certificate until you:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>Replace the existing certificate</li>
                  <li>Delete the existing certificate</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!confirmReplace && !confirmDelete && (
          <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => onView(existingCertificateId)}
              className="px-4 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-xl inline-flex items-center justify-center space-x-1.5 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Existing</span>
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl inline-flex items-center justify-center space-x-1.5 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Existing</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmReplace(true)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm inline-flex items-center justify-center space-x-1.5 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Replace Existing</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateCertificateModal;
