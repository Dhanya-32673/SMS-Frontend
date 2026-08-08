import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CreditCard, Users, BookOpen, AlertCircle } from 'lucide-react';
import FacultyLayout from '../../../layouts/FacultyLayout';
import studentService from '../../../services/studentService';
import { formatSectionName, formatIntermediateYear } from '../../../utils/studentDataFormatter';

import { useDebounce } from '../../../hooks/useDebounce';

export const SearchStudent = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const executeSearch = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const res = await studentService.searchStudents(debouncedQuery.trim());
        setResults(res || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  const statusColor = (status) => {
    const map = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      INACTIVE: 'bg-slate-100 text-slate-500 border border-slate-200',
    };
    return map[(status || '').toUpperCase()] || map.INACTIVE;
  };

  return (
    <FacultyLayout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Faculty Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Search Student</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Search by Student ID, Roll Number, Name, or Department.
            </p>
          </div>

          {/* Search Form inside banner */}
          <form onSubmit={handleSearch} className="mt-5 flex items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter Student ID, Roll Number, or Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-2xl shadow-lg transition disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400">Searching student database...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-sm font-bold text-slate-700">No Student Found</p>
            <p className="text-xs text-slate-400">No active student record matches "{query}"</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {results.length} result{results.length > 1 ? 's' : ''} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((student) => (
                <div
                  key={student.studentId}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex items-start gap-4 hover:border-blue-300 hover:shadow-md transition group"
                >
                  <img
                    src={student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={student.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-100 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-black text-blue-600">{student.studentId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${statusColor(student.status)}`}>
                        {student.status || 'ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 truncate mt-0.5">{student.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Roll: <span className="font-mono font-bold">{student.rollNumber}</span></p>

                    <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                      <div>
                        <span className="text-slate-400">Dept:</span>{' '}
                        <span className="font-bold text-slate-700">{student.department || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Yr/Sec:</span>{' '}
                        <span className="font-bold text-slate-700">
                          {formatIntermediateYear(student.intermediateYear || student.currentYear)} • {formatSectionName(student.section)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/faculty/students/${student.studentId}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[11px] font-bold rounded-xl shadow-sm transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Profile
                      </button>
                      <button
                        onClick={() => navigate(`/faculty/students/${student.studentId}/id-card`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        ID Card
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

      </div>
    </FacultyLayout>
  );
};

export default SearchStudent;
