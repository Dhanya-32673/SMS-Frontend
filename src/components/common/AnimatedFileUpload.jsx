import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Award,
  FileCheck,
  X,
  CheckCircle2,
  AlertCircle,
  MousePointer
} from 'lucide-react';

/**
 * AnimatedFileUpload - Framer Motion Drag & Drop File Upload Component
 * Customized specifically for PDF Certificates & Academic Documents:
 * - Floating fan of PDF document cards & badges
 * - Curved decorative SVG arrows
 * - Floating cursor + PDF thumbnail badge (+ Copy)
 * - Purple highlighted text ("PDF certificates or any document")
 * - Gray pill "Upload" button
 * - Live progress bar & smooth Framer Motion state transitions
 */
export const AnimatedFileUpload = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  accept = '.pdf,application/pdf',
  maxSizeMB = 5,
  uploading = false,
  progress = 0,
  error = '',
  label = 'Drag & drop PDF certificates or any document',
  sublabel = 'or browse PDF files on your computer'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className="w-full font-sans max-w-xl mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Outer Card Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden"
      >
        {/* Inner Dashed Dropzone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !selectedFile && inputRef.current?.click()}
          animate={{
            scale: isDragOver ? 1.015 : 1,
            borderColor: isDragOver ? '#818cf8' : '#c7d2fe'
          }}
          transition={{ duration: 0.2 }}
          className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-colors cursor-pointer select-none ${
            isDragOver
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400'
              : selectedFile
              ? 'bg-purple-50/40 dark:bg-slate-800/60 border-purple-300 dark:border-purple-800'
              : 'bg-indigo-50/20 dark:bg-slate-900/50 border-indigo-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'
          }`}
        >
          {/* Decorative Floating PDF Cards Header */}
          {!selectedFile && (
            <div className="relative h-24 mb-3 flex items-center justify-center pointer-events-none">
              
              {/* Left Curved Arrow SVG */}
              <motion.svg
                animate={{
                  x: isDragOver ? -4 : [0, -3, 0],
                  y: isDragOver ? -2 : [0, -2, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute left-6 sm:left-14 top-4 w-9 h-9 text-indigo-400 dark:text-indigo-400"
                viewBox="0 0 60 60"
                fill="none"
              >
                <path
                  d="M45 10 C 30 15, 20 28, 15 45 M 15 45 L 26 38 M 15 45 L 20 28"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>

              {/* Floating PDF Card 1: Left (Certificate / Award) */}
              <motion.div
                animate={{
                  y: isDragOver ? -10 : [0, -6, 0],
                  rotate: isDragOver ? -22 : -14,
                  x: isDragOver ? -28 : -22
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute w-12 h-14 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-800 shadow-md flex flex-col items-center justify-center text-purple-600 z-10"
              >
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-[8px] font-black text-purple-500 mt-0.5">CERT</span>
              </motion.div>

              {/* Floating PDF Card 2: Center (PDF Main Badge) */}
              <motion.div
                animate={{
                  y: isDragOver ? -14 : [0, -8, 0],
                  scale: isDragOver ? 1.08 : 1
                }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute w-14 h-16 bg-gradient-to-b from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-purple-400 dark:border-purple-500 shadow-xl flex flex-col items-center justify-center text-purple-600 dark:text-purple-400 z-20"
              >
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="text-[9px] font-black tracking-wider text-purple-600 dark:text-purple-400 mt-0.5">PDF</span>
              </motion.div>

              {/* Floating PDF Card 3: Right (Verified Doc) */}
              <motion.div
                animate={{
                  y: isDragOver ? -10 : [0, -6, 0],
                  rotate: isDragOver ? 22 : 14,
                  x: isDragOver ? 28 : 22
                }}
                transition={{ duration: 2.7, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute w-12 h-14 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-md flex flex-col items-center justify-center text-indigo-500 z-10"
              >
                <FileCheck className="w-5 h-5 text-indigo-500" />
                <span className="text-[8px] font-black text-indigo-500 mt-0.5">DOC</span>
              </motion.div>

              {/* Right Curved Arrow SVG */}
              <motion.svg
                animate={{
                  x: isDragOver ? 4 : [0, 3, 0],
                  y: isDragOver ? -2 : [0, -2, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute right-6 sm:right-14 top-4 w-9 h-9 text-indigo-400 dark:text-indigo-400"
                viewBox="0 0 60 60"
                fill="none"
              >
                <path
                  d="M15 10 C 30 15, 40 28, 45 45 M 45 45 L 34 38 M 45 45 L 40 28"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>

              {/* Animated Floating Mouse Cursor & PDF Badge (+ Copy) */}
              <motion.div
                animate={{
                  x: isDragOver ? [-5, -15, -5] : [0, 8, 0],
                  y: isDragOver ? [5, -5, 5] : [0, -6, 0],
                  rotate: isDragOver ? -4 : 0
                }}
                transition={{ duration: 3.2, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute -right-2 sm:right-2 -bottom-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-purple-200 dark:border-slate-700 shadow-2xl flex items-center space-x-1.5 z-30 pointer-events-none"
              >
                <div className="w-9 h-10 rounded-lg overflow-hidden border border-purple-200 dark:border-slate-700 bg-gradient-to-tr from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white font-black text-[10px]">
                  <span>PDF</span>
                  <span className="text-[7px] font-semibold text-purple-200">.pdf</span>
                </div>
                <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 flex items-center space-x-1 pr-1">
                  <MousePointer className="w-3 h-3 text-purple-600 fill-purple-600 transform -rotate-45" />
                  <span>+ Copy</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Central PDF Specific Header Text */}
          {!selectedFile ? (
            <div className="space-y-2 relative z-10">
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                Drag & drop{' '}
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">PDF</span> certificates, or any{' '}
                <span className="text-purple-600 dark:text-purple-400 font-extrabold">document</span>
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                or{' '}
                <span className="text-purple-600 dark:text-purple-400 underline underline-offset-4 font-extrabold hover:text-purple-700 transition">
                  browse PDF files on your computer
                </span>
              </p>

              {/* Bottom Gray Rounded Pill Upload Button */}
              <div className="pt-4 flex justify-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-8 py-2.5 bg-slate-200/80 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-600 dark:text-slate-300 font-bold text-xs rounded-full shadow-xs transition"
                >
                  Upload
                </motion.button>
              </div>
            </div>
          ) : (
            /* Selected File Card with Framer Motion Animation */
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -12 }}
                className="p-4 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFileRemove) onFileRemove();
                      if (inputRef.current) inputRef.current.value = '';
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Upload Progress Animation */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-purple-50/90 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2 text-left"
            >
              <div className="flex items-center justify-between text-xs font-extrabold text-purple-700 dark:text-purple-300">
                <span className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full"
                  />
                  <span>Uploading Certificate...</span>
                </span>
                <span>{progress > 0 ? `${progress}%` : 'Processing...'}</span>
              </div>

              {/* Animated Shimmer Progress Bar */}
              <div className="w-full h-2.5 bg-purple-200/60 dark:bg-purple-900/60 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: progress > 0 ? `${progress}%` : '80%' }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
                />
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedFileUpload;
