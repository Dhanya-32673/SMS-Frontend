import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileCheck } from 'lucide-react';

export const FacultyHeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="space-y-2 relative z-10 text-center sm:text-left">
        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
          Faculty Workspace
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Faculty Dashboard & Student Overview
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
          Access your assigned students, upload certificates, and verify student documents seamlessly.
        </p>
      </div>

      <div className="relative z-10 flex items-center space-x-3 shrink-0">
        <button
          onClick={() => navigate('/faculty/students/search')}
          className="py-3 px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Search Students</span>
        </button>

        <button
          onClick={() => navigate('/admin/certificates/upload')}
          className="py-3 px-5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl transition flex items-center space-x-2 cursor-pointer"
        >
          <FileCheck className="w-4 h-4 text-white" />
          <span>Upload Document</span>
        </button>
      </div>
    </div>
  );
};

export default FacultyHeroBanner;
