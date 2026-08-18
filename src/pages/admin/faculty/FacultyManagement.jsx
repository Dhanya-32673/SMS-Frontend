import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import facultyService from '../../../services/facultyService';
import { Eye, Edit3, Plus, Search, UserCheck, AlertCircle, Trash2, Users } from 'lucide-react';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';

export const FacultyManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const data = await facultyService.getFacultyList({ size: 100 });
      setFacultyList(data?.content || data || []);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);
  useDataRefresh(['faculty', 'sections', 'students'], fetchFaculty);

  const handleConfirmDelete = async () => {
    if (!facultyToDelete || deleting) return;
    const targetId = facultyToDelete.id;
    setDeleting(true);
    setError('');
    try {
      await facultyService.deleteFaculty(targetId);
      showSuccess('Faculty deleted successfully');
      setFacultyToDelete(null);
      setFacultyList((prev) => prev.filter((f) => f.id !== targetId));
      fetchFaculty();
    } catch (err) {
      console.error('Failed to delete faculty:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete faculty';
      if (err.response?.status === 404 || msg.toLowerCase().includes('not found')) {
        setFacultyToDelete(null);
        setFacultyList((prev) => prev.filter((f) => f.id !== targetId));
        showSuccess('Faculty record removed.');
      } else {
        setError(msg);
        showError(msg);
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredFaculty = facultyList.filter(
    (fac) =>
      fac.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Faculty Directory & Operations
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Faculty Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Manage faculty profiles, academic section assignments, and teaching responsibilities.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/faculty/add')}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-white hover:bg-slate-50 text-slate-900 text-xs font-black rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add New Faculty</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search faculty by name, email, employee ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
            />
          </div>
        </div>

        {/* Faculty Table & Card Stack */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading faculty roster...</p>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFaculty.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">No faculty members found.</div>
                ) : (
                  filteredFaculty.map((fac) => (
                    <div key={fac.id || fac.employeeId} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={fac.photoUrl || fac.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={fac.fullName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{fac.fullName}</h4>
                            <p className="text-xs font-mono font-bold text-blue-600">{fac.employeeId || 'FAC-1001'}</p>
                            <p className="text-[11px] text-slate-400">{fac.email}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-full text-[10px] font-extrabold shrink-0">
                          ACTIVE
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Department</span>
                          <span className="font-bold text-blue-700 dark:text-blue-300">{fac.department || 'General'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Assignments</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {fac.assignments && fac.assignments.length > 0
                              ? fac.assignments.map(a => `Sec ${a.section}`).join(', ')
                              : (fac.assignedSection ? `Sec ${fac.assignedSection}` : 'Unassigned')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => navigate(`/admin/faculty/${fac.id || fac.employeeId}`)}
                          className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/faculty/${fac.id || fac.employeeId}/edit`)}
                          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setError('');
                            setFacultyToDelete(fac);
                          }}
                          className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP TABLE (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5">Employee ID</th>
                      <th className="px-4 py-3.5">Faculty Name</th>
                      <th className="px-4 py-3.5">Email Address</th>
                      <th className="px-4 py-3.5">Department</th>
                      <th className="px-4 py-3.5">Assigned Section</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredFaculty.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                          No faculty members found.
                        </td>
                      </tr>
                    )}
                    {filteredFaculty.map((fac) => (
                      <tr key={fac.id || fac.employeeId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{fac.employeeId || 'FAC-1001'}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                          <img
                            src={fac.photoUrl || fac.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={fac.fullName}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span>{fac.fullName}</span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-500">{fac.email}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                            {fac.department || 'Mathematics'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {fac.assignments && fac.assignments.length > 0
                            ? fac.assignments.map(a => `Section ${a.section}`).join(', ')
                            : (fac.assignedSection ? `Section ${fac.assignedSection}` : 'Unassigned')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                            ACTIVE
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right pr-6 whitespace-nowrap">
                          <div className="inline-flex items-center justify-end space-x-1">
                            <button
                              onClick={() => navigate(`/admin/faculty/${fac.id || fac.employeeId}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="View Faculty Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/faculty/${fac.id || fac.employeeId}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="Edit Faculty"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setError('');
                                setFacultyToDelete(fac);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="Delete Faculty"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {facultyToDelete && (
          <DeleteConfirmationModal
            isOpen={!!facultyToDelete}
            onClose={() => setFacultyToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Delete Faculty Member"
            message={`Are you sure you want to permanently delete faculty member '${facultyToDelete?.fullName}'? This action cannot be undone.`}
            confirmText="Permanently Delete"
            isDeleting={deleting}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default FacultyManagement;
