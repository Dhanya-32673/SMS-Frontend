import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import certificateService from '../../../services/certificateService';
import { FileText, Plus, Edit3, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const CertificateTypes = () => {
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'ACADEMIC',
    isMandatory: true,
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      // Fetch all document types for admin so inactive/active are shown
      const data = await certificateService.getDocumentTypes();
      setTypes(data || []);
    } catch (err) {
      console.error('Failed to load document types:', err);
      setError('Failed to load certificate types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);
  useDataRefresh(['certificates'], fetchTypes);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'ACADEMIC',
      isMandatory: true,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (type) => {
    setEditingId(type.id);
    setFormData({
      name: type.name || '',
      code: type.code || '',
      description: type.description || '',
      category: type.category || 'ACADEMIC',
      isMandatory: type.isMandatory !== false && type.requiredByDefault !== false,
    });
    setError('');
    setShowModal(true);
  };

  const { showSuccess, showError } = useToast();
  const [typeToDelete, setTypeToDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        category: formData.category,
        isMandatory: formData.isMandatory,
        requiredByDefault: formData.isMandatory,
        active: true,
      };

      if (editingId) {
        await certificateService.updateDocumentType(editingId, payload);
        showSuccess('Certificate type updated successfully');
      } else {
        await certificateService.createDocumentType(payload);
        showSuccess('Certificate type created successfully');
      }

      setShowModal(false);
    } catch (err) {
      console.error('Save failed:', err);
      const msg = err.response?.data?.message || 'Failed to save certificate type';
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;
    const { id, name } = typeToDelete;
    setDeleteLoadingId(id);
    setError('');
    try {
      await certificateService.deleteDocumentType(id);
      showSuccess(`Certificate type "${name}" deleted successfully`);
      setTypeToDelete(null);
      setTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.message || 'Failed to delete certificate type.';
      setError(msg);
      showError(msg);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans pb-12">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Certificate Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Certificate Types Directory
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              {isAdmin ? 'Define required academic document types, mandatory submission criteria, and codes.' : 'Directory of official college document types and submission categories.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="py-3 px-5 text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Certificate Type</span>
            </button>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-extrabold flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading document types...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Certificate Type Name</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Mandatory</th>
                    <th className="px-4 py-3.5">Status</th>
                    {isAdmin && <th className="px-4 py-3.5 text-right pr-6">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {types.map((type) => (
                    <tr key={type.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{type.code}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{type.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                          {type.category || 'ACADEMIC'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold">
                        {type.isMandatory !== false && type.requiredByDefault !== false ? (
                          <span className="text-emerald-600 font-extrabold">YES</span>
                        ) : (
                          <span className="text-slate-400">OPTIONAL</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                          ACTIVE
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3.5 text-right pr-6">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(type)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Edit Certificate Type"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTypeToDelete(type)}
                              disabled={deleteLoadingId === type.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer disabled:opacity-50"
                              title="Delete Certificate Type"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingId ? 'Edit Certificate Type' : 'Add New Certificate Type'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Certificate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aadhaar Card"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unique Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. AADHAAR_DOC"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ACADEMIC">ACADEMIC</option>
                    <option value="ADMISSION">ADMISSION</option>
                    <option value="IDENTITY">IDENTITY</option>
                    <option value="FINANCIAL">FINANCIAL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isMandatory"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isMandatory" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Mandatory for Student Registration
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Certificate Type' : 'Create Certificate Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {typeToDelete && (
          <DeleteConfirmationModal
            isOpen={Boolean(typeToDelete)}
            title="Delete Certificate Type"
            subtitle="Permanent Removal"
            entityDetails={[
              { label: 'Name', value: typeToDelete.name },
              { label: 'Code', value: typeToDelete.code },
              { label: 'Category', value: typeToDelete.category },
            ]}
            warningList={[
              'Students will no longer be able to upload certificates under this type.',
              'Existing documents mapped to this type may lose their type classification.',
            ]}
            dangerButtonText="Delete Certificate Type"
            loading={deleteLoadingId === typeToDelete.id}
            onClose={() => setTypeToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default CertificateTypes;
