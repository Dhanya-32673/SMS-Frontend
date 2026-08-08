import React from 'react';
import { motion } from 'framer-motion';

/**
 * Modern Enterprise Light & Theme-Aware Animated Trash Bin Component
 */
export const TrashBinAnimation = ({ isLidOpen = false, isLanding = false }) => {
  return (
    <div className="relative flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Soft Blue Accent Glow (Light Theme Default) */}
      <motion.div
        animate={{
          scale: isLidOpen ? [1, 1.35, 1.15] : 1,
          opacity: isLidOpen ? [0.45, 0.85, 0.55] : 0.4,
        }}
        transition={{ duration: 0.4 }}
        className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-blue-600/25 dark:from-blue-600/30 dark:via-indigo-500/30 dark:to-rose-500/30 blur-2xl -z-10"
      />

      {/* Trash Bin Container with Squash / Bounce Physics */}
      <motion.div
        animate={
          isLanding
            ? { scaleY: [1, 0.82, 1.15, 0.95, 1], scaleX: [1, 1.18, 0.9, 1.05, 1] }
            : { scaleY: 1, scaleX: 1 }
        }
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-28 h-36 flex flex-col items-center justify-end"
      >
        {/* Animated Light Metallic Lid */}
        <motion.div
          animate={
            isLidOpen
              ? { rotate: -42, y: -16, x: -8 }
              : { rotate: 0, y: 0, x: 0 }
          }
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="origin-bottom-left relative z-20 w-32 -mb-1"
        >
          {/* Lid Handle */}
          <div className="w-10 h-3 mx-auto bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-600/80 rounded-t-lg shadow-xs" />
          {/* Lid Top Plate */}
          <div className="w-full h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600/80 rounded-full shadow-sm dark:shadow-xl" />
        </motion.div>

        {/* Light Gray Metallic Bin Body */}
        <div className="relative z-10 w-28 h-28 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-slate-950 rounded-b-3xl border-2 border-slate-300 dark:border-slate-700/80 shadow-lg dark:shadow-2xl overflow-hidden flex flex-col items-center justify-between p-2">
          {/* Inner Cavity */}
          <div className="w-full h-3 bg-slate-300 dark:bg-slate-950 rounded-full shadow-inner border-b border-slate-400 dark:border-slate-800" />

          {/* Rib Lines / Texture */}
          <div className="w-full flex justify-around px-2 py-1">
            <div className="w-1.5 h-16 bg-slate-400/60 dark:bg-slate-700/50 rounded-full shadow-inner" />
            <div className="w-1.5 h-16 bg-slate-400/60 dark:bg-slate-700/50 rounded-full shadow-inner" />
            <div className="w-1.5 h-16 bg-slate-400/60 dark:bg-slate-700/50 rounded-full shadow-inner" />
            <div className="w-1.5 h-16 bg-slate-400/60 dark:bg-slate-700/50 rounded-full shadow-inner" />
          </div>

          {/* Bottom Rim Glow */}
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500/40 to-indigo-500/40 rounded-full blur-xs" />
        </div>
      </motion.div>
    </div>
  );
};
export default TrashBinAnimation;
