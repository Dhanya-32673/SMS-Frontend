import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import dashboardService from '../../services/dashboardService';
import { useDataRefresh } from '../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../utils/studentDataFormatter';
import {
  Users,
  Award,
  Clock,
  Search,
  Eye,
  FileCheck,
  Loader2,
  ArrowUpRight
} from 'lucide-react';

export const FacultyDashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getFacultySummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load faculty summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);
  useDataRefresh(['dashboard'], fetchSummary);

  const assignedCount = typeof summary?.assignedStudentsCount === 'number'
    ? summary.assignedStudentsCount
    : typeof summary?.assignedStudents === 'number'
    ? summary.assignedStudents
    : Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents.length
    : 0;

  const totalDocsCount = summary?.totalDocumentsCount ?? summary?.totalCertificates ?? 0;
  const pendingDocsCount = summary?.pendingDocumentsCount ?? summary?.pendingDocuments ?? 0;

  const studentList = Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents
    : Array.isArray(summary?.recentStudents)
    ? summary.recentStudents
    : [];

  return (
    <FacultyLayout>
      <div className="space-y-8 font-sans">
        
        {/* Banner Welcome Card */}
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

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading assigned students and certificate statistics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Assigned Students</span>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {assignedCount}
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold block mt-1">Under Your Supervision</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Uploaded Documents</span>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {totalDocsCount}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-1">Certificates on Record</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Pending Verification</span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {pendingDocsCount}
                  </span>
                  <span className="text-[11px] text-amber-600 font-bold block mt-1">Awaiting Admin Action</span>
                </div>
              </div>

            </div>

            {/* Assigned Students Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Assigned Students List
                  </h3>
                  <p className="text-xs text-slate-400">Students assigned to your academic sections</p>
                </div>
                <button
                  onClick={() => navigate('/faculty/students/search')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
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
                    {studentList.length > 0 ? (
                      studentList.map((st) => (
                        <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {st.studentId}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                            <img
                              src={st.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={st.fullName}
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
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="View Student Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No students assigned to your sections.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
