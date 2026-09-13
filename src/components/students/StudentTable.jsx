import React from 'react';
import { Eye, Edit3, UserX, CreditCard, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import StudentAvatar from '../common/StudentAvatar';
import { useAuth } from '../../context/AuthContext';
import { formatSectionName, formatIntermediateYear } from '../../utils/studentDataFormatter';

const statusBadge = (status) => {
  const map = {
    ACTIVE:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
    INACTIVE:   'bg-slate-100 text-slate-500 border border-slate-200',
    GRADUATED:  'bg-blue-50 text-blue-700 border border-blue-200',
    SUSPENDED:  'bg-rose-50 text-rose-700 border border-rose-200',
  };
  return map[(status || '').toUpperCase()] || map.INACTIVE;
};

export const StudentTable = ({
  students = [],
  pageData = {},
  onPageChange,
  onView,
  onEdit,
  onDeactivate,
  onViewIdCard,
  loading = false,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { page = 0, totalPages = 1, totalElements = 0 } = pageData;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm py-16 flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading student records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm py-16 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
          <Users className="w-7 h-7 text-blue-500" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No students found</p>
        <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* MOBILE STACKED CARDS (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {students.map((student) => (
          <div key={student.studentId} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <StudentAvatar
                  src={student.profilePhotoUrl}
                  name={student.fullName}
                  studentId={student.studentId}
                  size="md"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.fullName}</h4>
                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{student.studentId}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Adm No: {student.admissionNumber || '—'}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${statusBadge(student.status)}`}>
                {student.status || 'ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Branch / Group</span>
                <span className="font-bold text-blue-700 dark:text-blue-300 truncate block">
                  {student.branchGroup || student.department || '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Year & Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {formatIntermediateYear(student.intermediateYear)} · {student.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}
                </span>
              </div>
            </div>

            {/* Mobile Action Buttons Bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onView && onView(student.studentId)}
                className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                title="View Profile"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>

              {onEdit && (
                <button
                  onClick={() => onEdit(student.studentId)}
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                  title="Edit Student"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}

              {onViewIdCard && (
                <button
                  onClick={() => onViewIdCard(student.studentId)}
                  className="py-2 px-3 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                  title="View ID Card"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden xs:inline">ID Card</span>
                </button>
              )}

              {isAdmin && student.status === 'ACTIVE' && onDeactivate && (
                <button
                  onClick={() => onDeactivate(student.studentId)}
                  className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                  title="Deactivate Student"
                >
                  <UserX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-4 py-3.5">Adm No</th>
              <th className="px-4 py-3.5">Student ID</th>
              <th className="px-4 py-3.5">Branch / Group</th>
              <th className="px-4 py-3.5">Year</th>
              <th className="px-4 py-3.5">Hostel / Day</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                {/* Student column with photo + name */}
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={student.profilePhotoUrl}
                      name={student.fullName}
                      studentId={student.studentId}
                      size="sm"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">{student.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">{student.admissionNumber || '—'}</td>
                <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{student.studentId}</td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                    {student.branchGroup || '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200">
                  {formatIntermediateYear(student.intermediateYear)}
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                  {student.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${statusBadge(student.status)}`}>
                    {student.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right pr-6 space-x-1">
                  <button
                    onClick={() => onView && onView(student.studentId)}
                    title="View Profile"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(student.studentId)}
                      title="Edit Student"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onViewIdCard && (
                    <button
                      onClick={() => onViewIdCard(student.studentId)}
                      title="View ID Card"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  )}
                  {isAdmin && student.status === 'ACTIVE' && onDeactivate && (
                    <button
                      onClick={() => onDeactivate(student.studentId)}
                      title="Deactivate Student"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Page <span className="font-extrabold text-slate-700 dark:text-slate-200">{page + 1}</span> of{' '}
          <span className="font-extrabold text-slate-700 dark:text-slate-200">{totalPages}</span>
          <span className="ml-2 text-slate-400">({totalElements} total)</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 min-w-[2rem] text-center">{page + 1}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
