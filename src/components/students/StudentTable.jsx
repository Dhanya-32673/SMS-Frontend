import React from 'react';
import { Eye, Edit3, UserX, CreditCard, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading student records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Users className="w-7 h-7 text-blue-300" />
        </div>
        <p className="text-sm font-bold text-slate-700">No students found</p>
        <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-4 py-3.5">Student ID</th>
              <th className="px-4 py-3.5">Roll Number</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Year / Sec</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-slate-50/80 transition">
                {/* Student column with photo + name */}
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={student.fullName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <span className="font-bold text-slate-900">{student.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{student.studentId}</td>
                <td className="px-4 py-3.5 font-mono text-slate-500">{student.rollNumber}</td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-extrabold">
                    {student.department || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-700">
                  {student.currentYear ? `Year ${student.currentYear}` : '—'} / {student.section || '—'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${statusBadge(student.status)}`}>
                    {student.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right pr-6 space-x-1">
                  <button
                    onClick={() => onView(student.studentId)}
                    title="View Profile"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(student.studentId)}
                    title="Edit Student"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewIdCard(student.studentId)}
                    title="View ID Card"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                  {isAdmin && student.status === 'ACTIVE' && (
                    <button
                      onClick={() => onDeactivate(student.studentId)}
                      title="Deactivate Student"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          Page <span className="font-extrabold text-slate-700">{page + 1}</span> of{' '}
          <span className="font-extrabold text-slate-700">{totalPages}</span>
          <span className="ml-2 text-slate-400">({totalElements} total)</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 min-w-[2rem] text-center">{page + 1}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
