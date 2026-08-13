import React from 'react';
import { Users, Award, Clock } from 'lucide-react';

export const FacultyStatsCards = ({ assignedCount, totalDocsCount, pendingDocsCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-sans">
      
      {/* Assigned Students Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Assigned Students
          </span>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
            {assignedCount}
          </span>
          <span className="text-[11px] text-blue-600 font-bold block mt-1">
            Under Your Supervision
          </span>
        </div>
      </div>

      {/* Uploaded Documents Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Uploaded Documents
          </span>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
            {totalDocsCount}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Certificates on Record
          </span>
        </div>
      </div>

      {/* Pending Verification Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Pending Verification
          </span>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
            {pendingDocsCount}
          </span>
          <span className="text-[11px] text-amber-600 font-bold block mt-1">
            Awaiting Admin Action
          </span>
        </div>
      </div>

    </div>
  );
};

export default FacultyStatsCards;
