import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import academicService from '../../../services/academicService';
import SectionMembersModal from '../../../components/academic/SectionMembersModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { Plus, Users, Edit, Trash2, Search, AlertCircle, CheckCircle2, X, Building2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useDataRefresh } from '../../../utils/dataSync';
import { useApiCache, invalidateCache } from '../../../utils/useApiCache';
import { useDeleteAnimation } from '../../../hooks/useDeleteAnimation';
import DeleteConfirmModal from '../../../components/common/DeleteConfirmModal';
import AnimatedDeleteWrapper from '../../../components/common/AnimatedDeleteWrapper';
import DeleteLoadingOverlay from '../../../components/common/DeleteLoadingOverlay';

export const SectionManagement = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';

  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const { data: rawSections, loading, refetch: fetchSections } = useApiCache(
    'academic-sections',
    () => academicService.getAllSections()
  );
  const sections = rawSections || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSectionForMembers, setSelectedSectionForMembers] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    intermediateYear: '1st Year',
    branchGroup: 'MPC',
    academicYear: '2026-2027',
    description: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useDataRefresh(['sections', 'students', 'faculty'], () => {
    invalidateCache('academic-sections');
    fetchSections();
  });

  const handleOpenAddModal = () => {
    setEditingSection(null);
    setFormData({
      name: '',
      intermediateYear: '1st Year',
      branchGroup: 'MPC',
      academicYear: '2026-2027',
      description: '',
      active: true,
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (sec) => {
    setEditingSection(sec);
    setFormData({
      name: sec.name || '',
      intermediateYear: sec.intermediateYear || '1st Year',
      branchGroup: sec.branchGroup || 'MPC',
      academicYear: sec.academicYear || '2026-2027',
      description: sec.description || '',
      active: sec.active ?? true,
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingSection) {
        await academicService.updateSection(editingSection.id, formData);
        showSuccess('Section updated successfully!');
      } else {
        await academicService.createSection(formData);
        showSuccess('New section created successfully!');
      }
      setShowFormModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save section';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const { confirmDelete, closeModal, handleProceedDelete, modalState, isDeleting, showOverlay } = useDeleteAnimation();

  const handleDeleteSectionClick = (sec) => {
    confirmDelete({
      id: sec.id,
      item: sec,
      title: 'Delete Academic Section',
      message: `Are you sure you want to delete Section "${sec.name}" (${sec.branchGroup} - ${sec.intermediateYear})? The item will animate into the 3D trash bin and be deleted.`,
      deleteApiFn: (id) => academicService.deleteSection(id),
      onOptimisticRemove: (id) => {
        invalidateCache('academic-sections');
        fetchSections();
      },
      onRestore: (id) => {
        invalidateCache('academic-sections');
        fetchSections();
      },
    });
  };

  const filteredSections = sections.filter(
    (sec) =>
      sec.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.branchGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.academicYear?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Academic Infrastructure
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Academic Section Management
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Manage section assignments, capacity limits, and student enrollments across academic streams.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Create New Section</span>
            </button>
          )}
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search section name, group, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
            />
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading academic sections...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
              No sections found.
            </div>
          ) : (
            <AnimatePresence>
              {filteredSections.map((sec) => (
                <AnimatedDeleteWrapper
                  key={sec.id}
                  as="div"
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-900/40">
                        {sec.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Section {sec.name}</h3>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold block">{sec.academicYear || '2026-2027'}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      sec.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {sec.active !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Branch & Year:</span>
                      <strong className="text-slate-900 dark:text-white">{sec.branchGroup} ({sec.intermediateYear})</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Assigned Faculty:</span>
                      <strong className={`font-bold ${sec.assignedFacultyName && sec.assignedFacultyName !== 'Not Assigned' ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                        {sec.assignedFacultyName || 'Not Assigned'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Enrolled Students:</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{sec.totalStudents ?? sec.studentCount ?? 0} Students</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSectionForMembers(sec)}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 transition inline-flex items-center space-x-1 cursor-pointer min-h-[40px]"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Members</span>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(sec)}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                          title="Edit Section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSectionClick(sec)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </AnimatedDeleteWrapper>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Section Members Modal */}
        {selectedSectionForMembers && (
          <SectionMembersModal
            section={selectedSectionForMembers}
            onClose={() => setSelectedSectionForMembers(null)}
            onUpdated={fetchSections}
          />
        )}

        {/* Live Crumple & Toss 3D Animation Overlay */}
        <DeleteLoadingOverlay isVisible={showOverlay} item={modalState.item} durationMs={1200} />

        {/* Glassmorphic Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          onConfirm={handleProceedDelete}
          onClose={closeModal}
          isDeleting={isDeleting}
        />

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[calc(100%-32px)] max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingSection ? 'Edit Section' : 'Create New Section'}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. A, B, C"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Group *</label>
                    <select
                      value={formData.branchGroup}
                      onChange={(e) => setFormData({ ...formData, branchGroup: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold min-h-[44px]"
                    >
                      <option value="MPC">MPC</option>
                      <option value="BiPC">BiPC</option>
                      <option value="MEC">MEC</option>
                      <option value="CEC">CEC</option>
                      <option value="HEC">HEC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Year *</label>
                    <select
                      value={formData.intermediateYear}
                      onChange={(e) => setFormData({ ...formData, intermediateYear: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold min-h-[44px]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t">
                  <button type="button" onClick={() => setShowFormModal(false)} className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 rounded-xl font-bold min-h-[44px]">Cancel</button>
                  <button type="submit" disabled={submitting} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold min-h-[44px]">{submitting ? 'Saving...' : 'Save Section'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default SectionManagement;
