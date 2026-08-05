import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import StudentStatusBadge from '../../../components/students/StudentStatusBadge';
import studentService from '../../../services/studentService';
import DeleteStudentModal from '../../../components/students/DeleteStudentModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

export const AllStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filtering & Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [branchGroup, setBranchGroup] = useState('');
  const [intermediateYear, setIntermediateYear] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents({
        page,
        size: 10,
        section: section || undefined,
        status: status || undefined,
        search: search || undefined,
      });

      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, section, status, search]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete || deleting) return;
    setDeleting(true);
    try {
      await studentService.deleteStudent(studentToDelete.studentId || studentToDelete.id);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="text-xs text-slate-400 font-semibold mb-1 flex items-center space-x-1">
              <Link to={isAdmin ? "/admin/dashboard" : "/faculty/dashboard"} className="hover:text-blue-600">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-700 dark:text-slate-200">Students Directory</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              All Students Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive list of enrolled students across academic groups and sections.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/students/add"
              className="py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md inline-flex items-center space-x-2 transition cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Student</span>
            </Link>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by ID, Full Name, Admission No, Roll No..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PASSED_OUT">Passed Out</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Roll Number</th>
                  <th className="py-3.5 px-4">Group & Year</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <span className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mb-2" />
                      <p>Loading student directory...</p>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No student profiles found.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
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
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                          {st.branchGroup || st.academicDetail?.branchGroup || 'MPC'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        Section {st.section || st.academicDetail?.section || 'A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StudentStatusBadge status={st.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="View Student Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => navigate(`/admin/students/${st.studentId || st.id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Student Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStudentToDelete(st)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} Total Students)
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

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <DeleteStudentModal
          student={studentToDelete}
          loading={deleting}
          onClose={() => setStudentToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Layout>
  );
};

export default AllStudents;
