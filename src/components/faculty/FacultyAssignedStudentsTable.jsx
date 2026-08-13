import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatSectionName, formatBranchGroup } from '../../utils/studentDataFormatter';
import { Eye, ArrowUpRight, Users } from 'lucide-react';

export const FacultyAssignedStudentsTable = ({ studentList }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden font-sans">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Assigned Students List
          </h3>
          <p className="text-xs text-slate-400">Students assigned to your academic sections</p>
        </div>
        <button
          onClick={() => navigate('/faculty/students/search')}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>Search All Students</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px]">
            <tr>
              <th className="p-3.5 px-6">Student ID</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Roll Number</th>
              <th className="p-3.5">Group & Year</th>
              <th className="p-3.5">Section</th>
              <th className="p-3.5 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {studentList && studentList.length > 0 ? (
              studentList.map((st) => (
                <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {st.studentId}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                    <img
                      src={st.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.fullName || 'Student')}&background=2563eb&color=fff`}
                      alt={st.fullName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(st.fullName || 'Student')}&background=2563eb&color=fff`;
                      }}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <span>{st.fullName}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-500">
                    {st.rollNumber || 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md font-extrabold text-[10px]">
                      {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {formatSectionName(st.section || st.academicDetail?.section)}
                  </td>
                  <td className="p-3.5 pr-6 text-right">
                    <button
                      onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
                      title="View Student Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      No students assigned to your sections.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyAssignedStudentsTable;
