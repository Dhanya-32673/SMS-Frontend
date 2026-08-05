import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import { FileText, Plus, CheckCircle2, AlertCircle, Edit3, Trash2 } from 'lucide-react';

export const CertificateTypes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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
      const data = await certificateService.getActiveDocumentTypes();
      setTypes(data || []);
    } catch (err) {
      setError('Failed to load certificate types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await certificateService.createDocumentType(formData);
      setShowModal(false);
      setFormData({ name: '', code: '', description: '', category: 'ACADEMIC', isMandatory: true });
      fetchTypes();
    } catch (err) {
      setError('Failed to create certificate type');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans">
        
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
              onClick={() => setShowModal(true)}
              className="py-3 px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Certificate Type</span>
            </button>
          )}
        </div>

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
                        {type.isMandatory !== false ? (
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
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition cursor-pointer">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">
                Add New Certificate Type
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Certificate Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aadhaar Card"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. AADHAAR"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CertificateTypes;
