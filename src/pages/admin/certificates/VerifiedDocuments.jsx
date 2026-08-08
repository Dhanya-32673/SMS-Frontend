import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import certificateService from '../../../services/certificateService';
import { useDataRefresh } from '../../../utils/dataSync';
import { Award, Eye, Download } from 'lucide-react';

export const VerifiedDocuments = () => {
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const Layout = rawRole === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchVerified = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getCertificates({
        status: 'VERIFIED',
        size: 50,
      });
      setDocuments(data.content || []);
    } catch (err) {
      console.error('Failed to load verified documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerified();
  }, []);
  useDataRefresh(['certificates'], fetchVerified);

  return (
    <Layout>
      <div className="space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Official Records Vault
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Verified Student Certificates
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Complete archive of officially approved and verified student certificates.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading verified document repository...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No verified certificates found in record.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Student ID</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Certificate Type</th>
                    <th className="px-4 py-3.5">Verification Date</th>
                    <th className="px-4 py-3.5">Verified By</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{doc.studentId}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{doc.studentName}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{doc.documentTypeName}</td>
                      <td className="px-4 py-3.5 text-slate-500">{doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3.5 text-slate-500">{doc.verifiedBy || 'Admin'}</td>
                      <td className="px-4 py-3.5">
                        <CertificateStatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right pr-6 space-x-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedDoc && (
          <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
      </div>
    </Layout>
  );
};

export default VerifiedDocuments;
