import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Award, UserCheck, FileText } from 'lucide-react';

export const QuickActions = ({ role = 'ADMIN' }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 gap-2.5">
        {/* Fully Functional Student Actions */}
        {role === 'ADMIN' && (
          <Link
            to="/admin/students/add"
            className="flex items-center space-x-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
          >
            <UserPlus className="w-4 h-4 text-purple-600" />
            <span>+ Add New Student</span>
          </Link>
        )}

        <Link
          to={role === 'ADMIN' ? '/faculty/students/search' : '/faculty/students/search'}
          className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition"
        >
          <Search className="w-4 h-4 text-purple-600" />
          <span>Search Student</span>
        </Link>

        {/* Future Part Placeholders */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-medium text-xs border border-slate-100 dark:border-slate-800 cursor-not-allowed">
          <div className="flex items-center space-x-3">
            <Award className="w-4 h-4 text-slate-400" />
            <span>Upload Certificate</span>
          </div>
          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">Part 3</span>
        </div>

        {role === 'ADMIN' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-medium text-xs border border-slate-100 dark:border-slate-800 cursor-not-allowed">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span>Add Faculty</span>
            </div>
            <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">Part 4</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-medium text-xs border border-slate-100 dark:border-slate-800 cursor-not-allowed">
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Generate Report</span>
          </div>
          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">Later</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
