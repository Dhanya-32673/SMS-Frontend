import React from 'react';
import { AlertCircle, HelpCircle, X, Check } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen = true,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  warningList = [],
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'warning' | 'danger' | 'info'
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (isOpen === false) return null;

  const isDanger = variant === 'danger';
  const isInfo = variant === 'info';

  const iconBg = isDanger
    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
    : isInfo
    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400';

  const btnBg = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 text-white'
    : isInfo
    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white'
    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
              {isInfo ? <HelpCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="leading-relaxed font-medium">{message}</p>

          {warningList && warningList.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-slate-200">Notice:</p>
              <ul className="space-y-1 pl-4 list-disc text-[11px]">
                {warningList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              autoFocus
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`py-2.5 px-5 text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition cursor-pointer disabled:opacity-50 ${btnBg}`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
