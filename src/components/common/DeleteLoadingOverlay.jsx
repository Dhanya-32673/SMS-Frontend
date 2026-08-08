import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrashBinAnimation from './TrashBinAnimation';
import { Trash2 } from 'lucide-react';

/**
 * Enterprise SaaS Light & Dark Theme-Aware Delete Loading Overlay Component
 */
export const DeleteLoadingOverlay = ({
  isVisible = false,
  item = null,
  durationMs = 1200,
}) => {
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 1. Open Lid at 100ms
      const lidTimer = setTimeout(() => setIsLidOpen(true), 100);

      // 2. Item lands in bin at 650ms -> Trigger Squash / Bounce & close lid
      const landTimer = setTimeout(() => {
        setIsLanding(true);
        setIsLidOpen(false);
      }, 650);

      // 3. Reset landing bounce state at 1050ms
      const resetLandTimer = setTimeout(() => setIsLanding(false), 1050);

      return () => {
        clearTimeout(lidTimer);
        clearTimeout(landTimer);
        clearTimeout(resetLandTimer);
      };
    } else {
      setIsLidOpen(false);
      setIsLanding(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const itemLabel = item?.fullName || item?.name || item?.documentName || item?.title || 'Selected Item';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/85 backdrop-blur-md p-4 select-none"
      >
        {/* Animated Responsive Modal Card (Clean Light SaaS Theme Default) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="w-[92%] sm:max-w-md md:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center space-y-6 relative overflow-hidden"
        >
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <span className="px-3.5 py-1 bg-red-50 text-red-600 border border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-xs">
              Live Delete Action
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight pt-1">
              Deleting Item...
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[260px] sm:max-w-[340px]">
              "{itemLabel}"
            </p>
          </div>

          {/* Crumple & Toss Physics Area */}
          <div className="relative w-full h-44 flex items-center justify-center">
            
            {/* Flying Crumpled Object */}
            <motion.div
              initial={{ scale: 1, x: -80, y: -40, rotate: 0, opacity: 1 }}
              animate={{
                scale: [1, 0.65, 0.15],
                x: [-80, 0, 0],
                y: [-40, -70, 30],
                rotate: [0, 180, 360],
                opacity: [1, 0.9, 0],
              }}
              transition={{
                duration: 0.7,
                times: [0, 0.5, 1],
                ease: [0.25, 1, 0.5, 1],
              }}
              className="absolute z-30 p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/30 border border-red-400/40 flex items-center space-x-2"
            >
              <Trash2 className="w-5 h-5 shrink-0" />
              <span className="text-xs font-black truncate max-w-[110px]">{itemLabel}</span>
            </motion.div>

            {/* Light Metallic Trash Bin */}
            <TrashBinAnimation isLidOpen={isLidOpen} isLanding={isLanding} />
          </div>

          {/* Linear Progress Indicator (Clean Light SaaS Theme) */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-400">
              <span>Permanently Removing...</span>
              <span className="text-blue-600 dark:text-rose-400 font-mono font-bold">1.2s</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-700/50">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: durationMs / 1000, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-rose-500 rounded-full shadow-xs"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default DeleteLoadingOverlay;
