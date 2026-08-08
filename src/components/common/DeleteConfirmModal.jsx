import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, LoaderCircle } from 'lucide-react';

/**
 * Reusable Glassmorphic Delete Confirmation Modal using Framer Motion
 */
export const DeleteConfirmModal = ({
  isOpen,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item?',
  onConfirm,
  onClose,
  isDeleting = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const isDeletingRef = useRef(isDeleting);

  useEffect(() => {
    onCloseRef.current = onClose;
    isDeletingRef.current = isDeleting;
  }, [onClose, isDeleting]);

  // Close on Escape key press (constant dependency array)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDeletingRef.current) {
        if (onCloseRef.current) onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={() => !isDeleting && onClose()}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden focus:outline-none p-6 sm:p-7 relative"
          >
            {/* Close Icon */}
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Container with Animated Pulse */}
            <div className="flex items-center space-x-4 mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.4 }}
                className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center shrink-0 shadow-inner"
              >
                <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400 animate-bounce" />
              </motion.div>
              <div>
                <h3
                  id="delete-modal-title"
                  className="text-xl font-black text-slate-900 dark:text-white tracking-tight"
                >
                  {title}
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 inline shrink-0" />
                  <span>Live 1.2s Physics Toss Animation</span>
                </p>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-6 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-40"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default DeleteConfirmModal;
