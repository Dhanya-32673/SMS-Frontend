import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileCheck } from 'lucide-react';

export const FacultyHeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="space-y-2 relative z-10 text-left">
        <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
          Faculty Workspace
        </span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
          Faculty Dashboard & Student Overview
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
          Access your assigned students, upload certificates, and verify student documents seamlessly.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
        <button
          onClick={() => navigate('/faculty/students/search')}
          className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Search Students</span>
        </button>

        <button
          onClick={() => navigate('/admin/certificates/upload')}
          className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
        >
          <FileCheck className="w-4 h-4 text-white" />
          <span>Upload Document</span>
        </button>
      </div>
    </div>
  );
};

export default FacultyHeroBanner;
