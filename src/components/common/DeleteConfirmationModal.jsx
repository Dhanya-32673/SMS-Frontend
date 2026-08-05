import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Users, ArrowRight } from 'lucide-react';

export const DeleteConfirmationModal = ({
  title = 'Delete Item',
  subtitle = 'Permanent Action • Cannot Be Undone',
  entityPhoto,
  entityDetails = [],
  warningList = [],
  cannotDelete = false,
  cannotDeleteMessage = '',
  cannotDeleteActionText = 'View Members',
  onCannotDeleteAction,
  confirmationKeyword = '',
  dangerButtonText = 'Delete Permanently',
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [inputText, setInputText] = useState('');

  const requiresInput = Boolean(confirmationKeyword && confirmationKeyword.trim() !== '');
  const normalizeStr = (str) => (str || '').trim().replace(/\s+/g, ' ').toUpperCase();
  const isInputMatched = !requiresInput || normalizeStr(inputText) === normalizeStr(confirmationKeyword);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (cannotDelete || !isInputMatched || loading) return;
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-rose-100 dark:border-rose-950/50 bg-rose-50/60 dark:bg-rose-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {/* Entity Details Card */}
          {(entityPhoto || (entityDetails && entityDetails.length > 0)) && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start space-x-4">
              {entityPhoto && (
                <img
                  src={entityPhoto}
                  alt="Entity"
                  className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 shrink-0 shadow-sm"
                />
              )}
              <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                {entityDetails.map((detail, idx) => (
                  <div key={idx} className={detail.fullWidth ? 'col-span-2' : 'col-span-1'}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {detail.label}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CASE 1: Cannot Delete Warning Box */}
          {cannotDelete ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-3">
              <div className="flex items-start space-x-2.5 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{cannotDeleteMessage || 'This item cannot be deleted because it has active dependencies.'}</div>
              </div>

              {onCannotDeleteAction && (
                <button
                  type="button"
                  onClick={onCannotDeleteAction}
                  className="w-full py-2 px-3 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 rounded-xl border border-amber-300/60 flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{cannotDeleteActionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* CASE 2: Normal Allowed Deletion Warning & Input */
            <>
              {warningList && warningList.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-2">
                  <p className="font-bold">This action will permanently remove:</p>
                  <ul className="space-y-1 pl-4 list-disc text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {warningList.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {requiresInput && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    To continue, type <span className="text-rose-600 dark:text-rose-400 font-black">{confirmationKeyword}</span> below:
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type ${confirmationKeyword}`}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                  />
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            {!cannotDelete && (
              <button
                type="submit"
                disabled={!isInputMatched || loading}
                className={`py-2.5 px-5 text-xs font-bold text-white rounded-xl shadow-md flex items-center space-x-2 transition ${
                  isInputMatched && !loading
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25 cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{dangerButtonText}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
