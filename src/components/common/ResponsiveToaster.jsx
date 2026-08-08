import React, { useState } from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Trash2, X, RotateCcw } from 'lucide-react';

// Styling variants matching SICMS enterprise aesthetic
export const toastVariants = {
  success: {
    title: 'Success',
    border: 'border-emerald-500/30 dark:border-emerald-500/40',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    titleColor: 'text-emerald-700 dark:text-emerald-400',
    progress: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    icon: CheckCircle2,
    glow: 'shadow-emerald-500/10 dark:shadow-emerald-500/20',
  },
  error: {
    title: 'Error',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    accent: 'bg-rose-500',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    titleColor: 'text-rose-700 dark:text-rose-400',
    progress: 'bg-gradient-to-r from-rose-500 to-red-400',
    icon: AlertCircle,
    glow: 'shadow-rose-500/10 dark:shadow-rose-500/20',
  },
  warning: {
    title: 'Warning',
    border: 'border-amber-500/30 dark:border-amber-500/40',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    titleColor: 'text-amber-700 dark:text-amber-400',
    progress: 'bg-gradient-to-r from-amber-500 to-orange-400',
    icon: AlertTriangle,
    glow: 'shadow-amber-500/10 dark:shadow-amber-500/20',
  },
  info: {
    title: 'Information',
    border: 'border-blue-500/30 dark:border-blue-500/40',
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    titleColor: 'text-blue-700 dark:text-blue-400',
    progress: 'bg-gradient-to-r from-blue-500 to-indigo-400',
    icon: Info,
    glow: 'shadow-blue-500/10 dark:shadow-blue-500/20',
  },
  delete: {
    title: 'Item Deleted',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    accent: 'bg-rose-600',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    titleColor: 'text-rose-700 dark:text-rose-400',
    progress: 'bg-gradient-to-r from-rose-600 to-pink-500',
    icon: Trash2,
    glow: 'shadow-rose-500/10 dark:shadow-rose-500/20',
  },
};

/**
 * Custom Animated Toast Component with Framer Motion physics, hover scaling,
 * progress bar timer pause, and glassmorphism styling.
 */
export const CustomToast = ({ t, message, type = 'info', title, duration = 2000, onUndo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = toastVariants[type] || toastVariants.info;
  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ y: -24, scale: 0.96, opacity: 0 }}
      animate={t.visible ? { y: 0, scale: isHovered ? 1.02 : 1, opacity: 1 } : { y: -16, scale: 0.98, opacity: 0 }}
      transition={{ duration: t.visible ? 0.28 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative min-w-[280px] max-w-[420px] w-full overflow-hidden rounded-2xl border ${theme.border} bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl ${theme.glow} backdrop-blur-xl transition-shadow duration-300 pointer-events-auto group`}
      style={{
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(59, 130, 246, 0.15)'
          : undefined,
      }}
    >
      {/* Left Accent Pillar */}
      <span className={`absolute inset-y-0 left-0 w-1.5 ${theme.accent}`} />

      <div className="flex items-center gap-3 pl-1">
        {/* Leading Icon with Pulse Animation */}
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} relative overflow-hidden`}>
          <Icon className="h-5 w-5 animate-pulse" aria-hidden="true" />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-1">
          <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.titleColor}`}>
            {title || theme.title}
          </p>
          <p className="mt-0.5 text-xs font-bold leading-5 text-slate-800 dark:text-slate-100 truncate">
            {message}
          </p>
        </div>

        {/* Undo Button (Optional) */}
        {onUndo && (
          <button
            type="button"
            onClick={() => {
              hotToast.dismiss(t.id);
              onUndo();
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Undo</span>
          </button>
        )}

        {/* Close Button with Fade-in on Hover */}
        <button
          type="button"
          onClick={() => hotToast.dismiss(t.id)}
          aria-label="Close notification"
          className="rounded-lg p-1 text-slate-400 opacity-60 hover:opacity-100 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Animated Progress Bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full ${theme.progress} toast-progress-line`}
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        />
      </div>

      <style>{`
        .toast-progress-line {
          width: 100%;
          animation-name: toastProgressDecrease;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes toastProgressDecrease {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </motion.div>
  );
};

/**
 * Top-level Responsive Toaster component positioning toasts at:
 * - Desktop (≥1024px): top-right
 * - Tablet (768px-1023px): top-center
 * - Mobile (<768px): top-center
 * Respects safe-area notch padding on iPhones.
 */
export const ResponsiveToaster = () => {
  const { position } = useIsMobile();

  return (
    <Toaster
      position={position}
      containerStyle={{
        top: position === 'top-center' ? '1rem' : '1.5rem',
        right: position === 'top-right' ? '1.5rem' : 'auto',
        left: position === 'top-center' ? '50%' : 'auto',
        transform: position === 'top-center' ? 'translateX(-50%)' : 'none',
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 2000,
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="contents">
              {message}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ResponsiveToaster;
