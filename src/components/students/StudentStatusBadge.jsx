import React from 'react';

export const StudentStatusBadge = ({ status }) => {
  const normalized = (status || 'ACTIVE').toUpperCase();

  const styles = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/60',
    INACTIVE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
    PASSED_OUT: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200',
    SUSPENDED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${styles[normalized] || styles.ACTIVE}`}>
      {normalized.replace('_', ' ')}
    </span>
  );
};

export default StudentStatusBadge;
