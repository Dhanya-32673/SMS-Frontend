import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import StudentStatusBadge from '../../../components/students/StudentStatusBadge';
import studentService from '../../../services/studentService';
import ExportExcelButton from '../../../components/students/ExportExcelButton';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDataRefresh } from '../../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../../utils/studentDataFormatter';
import { useDeleteAnimation } from '../../../hooks/useDeleteAnimation';
import DeleteConfirmModal from '../../../components/common/DeleteConfirmModal';
import AnimatedDeleteWrapper from '../../../components/common/AnimatedDeleteWrapper';
import DeleteLoadingOverlay from '../../../components/common/DeleteLoadingOverlay';

export const AllStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents({
        page,
        size: 10,
        section: section || undefined,
        status: status || undefined,
        search: debouncedSearch || undefined,
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
  }, [page, section, status, debouncedSearch]);
  useDataRefresh(['students'], fetchStudents);

  const { confirmDelete, closeModal, handleProceedDelete, modalState, isDeleting, showOverlay } = useDeleteAnimation();

  const handleDeleteStudentClick = (st) => {
    const targetId = st.studentId || st.id;
    confirmDelete({
      id: targetId,
      item: st,
      title: 'Delete Student Profile',
      message: `Are you sure you want to delete ${st.fullName || 'this student'} (${targetId})? The item will animate into the 3D trash bin and be permanently removed.`,
      deleteApiFn: (id) => studentService.deleteStudent(id),
      onOptimisticRemove: (id) => {
        setStudents((prev) => prev.filter((s) => s.studentId !== id && s.id !== id));
        setTotalElements((prev) => Math.max(0, prev - 1));
      },
      onRestore: (id, restoredItem) => {
        setStudents((prev) => [restoredItem, ...prev]);
        setTotalElements((prev) => prev + 1);
      },
      onFinalized: () => {
        // Automatic refresh if needed
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? 'Student Directory' : 'Assigned Students'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student enrollment records, sections, and certificates ({totalElements} total enrolled)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/students/add')}
                className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            )}

            <div className="flex-1 sm:flex-none">
              <ExportExcelButton />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by ID, Full Name, Admission No, Roll No..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
              <select
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
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
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
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

        {/* Student List View: Mobile Stacked Cards (< md) + Desktop Table (md+) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Loading State */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <span className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold">Loading student directory...</p>
            </div>
          ) : students.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center text-slate-400 p-6">
              <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {!isAdmin ? 'No students assigned to you yet.' : 'No student profiles found.'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {!isAdmin
                      ? 'Contact college administration to assign sections or add new students.'
                      : 'Try adjusting your search query or filter criteria.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {students.map((st) => (
                    <AnimatedDeleteWrapper
                      key={st.id || st.studentId}
                      as="div"
                      className="p-4 space-y-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={st.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={st.fullName}
                            loading="lazy"
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{st.fullName}</h4>
                            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{st.studentId}</p>
                            <p className="text-[11px] text-slate-400">Roll: {st.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <StudentStatusBadge status={st.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Group & Year</span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Section</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Section {formatSectionName(st.section || st.academicDetail?.section)}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Action Buttons Bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                          className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => navigate(`/admin/students/${st.studentId || st.id}/edit`)}
                              className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                              title="Edit Student"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudentClick(st)}
                              className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </AnimatedDeleteWrapper>
                  ))}
                </AnimatePresence>
              </div>

              {/* DESKTOP TABLE VIEW (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="py-3.5 px-6">Student ID</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Student Name</th>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Group & Year</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right pr-6 min-w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <AnimatePresence>
                      {students.map((st) => (
                        <AnimatedDeleteWrapper
                          key={st.id || st.studentId}
                          as="tr"
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition"
                        >
                          <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {st.studentId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={st.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={st.fullName}
                                loading="lazy"
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
                              {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {formatSectionName(st.section || st.academicDetail?.section)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StudentStatusBadge status={st.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                            <div className="inline-flex items-center justify-end space-x-1">
                              <button
                                onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                title="View Student Profile"
                                aria-label="View Student Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => navigate(`/admin/students/${st.studentId || st.id}/edit`)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                    title="Edit Student Profile"
                                    aria-label="Edit Student Profile"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudentClick(st)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                    title="Delete Student"
                                    aria-label="Delete Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </AnimatedDeleteWrapper>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Page <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({totalElements} items)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3D Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleProceedDelete}
        title={modalState.title}
        message={modalState.message}
        itemName={modalState.item?.fullName || modalState.item?.name || modalState.id}
      />

      {/* 3D Trash Bin Loading Overlay during delete */}
      <DeleteLoadingOverlay isVisible={showOverlay} message="Moving to Recycle Bin..." />
    </Layout>
  );
};

export default AllStudents;
