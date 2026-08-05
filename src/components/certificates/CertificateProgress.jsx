import React from 'react';

export const CertificateProgress = ({ completedCount = 0, totalCount = 10 }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((completedCount / (totalCount || 1)) * 100)));

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Certificate Completion Rate
        </span>
        <span className="text-purple-600 dark:text-purple-400 font-mono">
          {completedCount} / {totalCount} Documents ({percentage}%)
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
        <div
          className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CertificateProgress;
