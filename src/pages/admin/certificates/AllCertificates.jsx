import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import facultyService from '../../../services/facultyService';
import StudentCertificatesModal from '../../../components/certificates/StudentCertificatesModal';
import {
  Award,
  Search,
  Filter,
  Eye,
  FolderOpen,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';

export const AllCertificates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';

  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [studentSummaries, setStudentSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('studentId');
  const [sortDir, setSortDir] = useState('asc');

  // Modal State
  const [selectedStudentForCertificates, setSelectedStudentForCertificates] = useState(null);

  const fetchStudentSummaries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await certificateService.getStudentSummaries({
        page,
        size: 10,
        group: groupFilter || undefined,
        year: yearFilter || undefined,
        section: sectionFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        sortBy,
        sortDir,
      });
      setStudentSummaries(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load student certificate summaries:', err);
      setError('Unable to load certificate records. Please check server connectivity or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSummaries();
  }, [page, search, groupFilter, yearFilter, sectionFilter, statusFilter, sortBy, sortDir]);

  // Faculty assignments for filtering options
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      facultyService.getCurrentFacultyAssignments()
        .then((data) => {
          setFacultyAssignments((data || []).filter(a => a.active));
        })
        .catch((err) => console.error("Failed to load faculty assignments for filter:", err));
    }
  }, [isAdmin]);

  const allGroups = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
  const allYears = ['1st Year', '2nd Year'];
  const allSections = ['A', 'B', 'C', 'D'];

  const availableGroups = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.branchGroup)))
    : allGroups;

  const availableYears = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.intermediateYear)))
    : allYears;

  const availableSections = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.section)))
    : allSections;

  return (
    <Layout>
      <div className="space-y-6 font-sans">
        
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="text-xs text-slate-400 font-semibold mb-1 flex items-center space-x-1">
              <Link to={isAdmin ? "/admin/dashboard" : "/faculty/dashboard"} className="hover:text-blue-600">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-700 dark:text-slate-200">Certificate Management</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Student Certificates Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {!isAdmin ? 'Student-wise certificate completion status for your assigned sections.' : 'Student-wise certificate completion status, uploaded PDF documents, and verification tracking.'}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Student ID, Name, Roll No..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600 dark:text-blue-400 focus:outline-none"
              >
                <option value="">All Groups</option>
                {availableGroups.map(grp => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => {
                  setSectionFilter(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Sections</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PARTIALLY COMPLETED">Partially Completed</option>
                <option value="PENDING VERIFICATION">Pending Verification</option>
                <option value="NEEDS ATTENTION">Needs Attention</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="studentId">Sort by ID</option>
                <option value="fullName">Sort by Name</option>
                <option value="completionPercentage">Sort by Completion %</option>
                <option value="pendingCount">Sort by Pending</option>
                <option value="missingCount">Sort by Missing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Certificates Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll No</th>
                  <th className="py-3.5 px-4">Group & Year</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Certificates Progress</th>
                  <th className="py-3.5 px-4">Overall Status</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Loading student certificate records...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{error}</p>
                        <button
                          onClick={fetchStudentSummaries}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : studentSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {!isAdmin ? "No students are assigned to your sections yet." : "No certificate records found."}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {!isAdmin ? "Contact Admin to assign sections to your faculty account." : "Try adjusting your search query or filters."}
                        </p>
                        <button
                          onClick={fetchStudentSummaries}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Refresh Records
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  studentSummaries.map((st) => (
                    <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {st.studentId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={st.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={st.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{st.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{st.admissionNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        {st.rollNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                            {st.branchGroup || 'MPC'}
                          </span>
                          <span className="text-slate-500 font-semibold text-[11px]">
                            {st.intermediateYear || '1st Year'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        Section {st.section || 'A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-700 dark:text-slate-300">
                              {st.uploadedCount} / {st.totalRequired} Uploaded
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono">{st.completionPercentage}%</span>
                          </div>
                          <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                              style={{ width: `${st.completionPercentage}%` }}
                            />
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold pt-0.5">
                            {st.pendingCount > 0 && <span className="text-amber-600 font-bold">• {st.pendingCount} Pending</span>}
                            {st.missingCount > 0 && <span className="text-rose-600 font-bold">• {st.missingCount} Missing</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          st.overallStatus === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : st.overallStatus === 'PENDING VERIFICATION'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                            : st.overallStatus === 'PARTIALLY COMPLETED'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                        }`}>
                          {st.overallStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right pr-6 space-x-1.5">
                        <button
                          onClick={() => setSelectedStudentForCertificates(st)}
                          className="py-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>View Certificates</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => navigate(`/admin/students/${st.studentId}/edit`)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition inline-flex items-center cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} Students)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Certificates Detail Modal */}
      {selectedStudentForCertificates && (
        <StudentCertificatesModal
          student={selectedStudentForCertificates}
          onClose={() => setSelectedStudentForCertificates(null)}
          onUpdated={fetchStudentSummaries}
          isAdmin={isAdmin}
        />
      )}
    </Layout>
  );
};

export default AllCertificates;
