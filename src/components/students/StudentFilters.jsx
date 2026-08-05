import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

export const StudentFilters = ({ filters, onFilterChange, onReset }) => {
  const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'EEE'];
  const years = [1, 2, 3, 4];
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'];

  const selectCls = 'w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition appearance-none cursor-pointer';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Roll No, Name..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Department */}
        <select value={filters.department || ''} onChange={(e) => onFilterChange('department', e.target.value)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Year */}
        <select value={filters.currentYear || ''} onChange={(e) => onFilterChange('currentYear', e.target.value)} className={selectCls}>
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>

        {/* Section */}
        <select value={filters.section || ''} onChange={(e) => onFilterChange('section', e.target.value)} className={selectCls}>
          <option value="">All Sections</option>
          {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>

        {/* Status */}
        <select value={filters.status || ''} onChange={(e) => onFilterChange('status', e.target.value)} className={selectCls}>
          <option value="">All Statuses</option>
          {statuses.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
      </div>

      {/* Reset row */}
      <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default StudentFilters;
