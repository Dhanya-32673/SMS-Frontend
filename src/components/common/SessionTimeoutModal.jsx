import React from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export const SessionTimeoutModal = ({
  secondsRemaining,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Session Expiring
            </h3>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
              Inactivity Timeout Warning
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You have been inactive for a while. Your session will automatically expire in:
          </p>

          {/* Countdown Clock Display */}
          <div className="py-4 px-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 inline-block mx-auto shadow-inner">
            <div className="font-mono text-3xl font-black text-amber-600 dark:text-amber-400 tracking-wider">
              {formattedTime}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1 block">
              Remaining Time
            </span>
          </div>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Would you like to stay signed in to continue your work?
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onLogoutNow}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-800/50 inline-flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Now</span>
          </button>

          <button
            type="button"
            onClick={onStayLoggedIn}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 inline-flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
