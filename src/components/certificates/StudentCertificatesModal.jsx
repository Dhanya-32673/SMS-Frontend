import React, { useEffect, useState } from 'react';
import {
  Award,
  Upload,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  FileText,
  Plus
} from 'lucide-react';
import certificateService from '../../services/certificateService';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';
import CertificatePreviewModal from './CertificatePreviewModal';
import UploadCertificateModal from './UploadCertificateModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

export const StudentCertificatesModal = ({ student, onClose, onUpdated, isAdmin = true }) => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sub-modals
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [prefilledDocTypeId, setPrefilledDocTypeId] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  const fetchStudentData = async () => {
    if (!student) return;
    setLoading(true);
    setError('');
    try {
      const [docsData, typesData] = await Promise.all([
        certificateService.getStudentDocuments(student.studentId || student.id),
        certificateService.getActiveDocumentTypes(),
      ]);
      setDocuments(docsData || []);
      setDocumentTypes(typesData || []);
    } catch (err) {
      setError('Failed to load student certificate details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [student]);

  const handleVerify = async (id) => {
    try {
      await certificateService.verifyDocument(id);
      setSuccessMessage('Certificate verified successfully!');
      fetchStudentData();
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Verification failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await certificateService.rejectDocument(id, 'Rejected by Administrator');
      setSuccessMessage('Certificate rejected!');
      fetchStudentData();
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Rejection failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete || deletingDoc) return;
    setDeletingDoc(true);
    try {
      await certificateService.deleteCertificate(docToDelete.id);
      setSuccessMessage('Certificate deleted successfully!');
      setDocToDelete(null);
      fetchStudentData();
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete certificate');
    } finally {
      setDeletingDoc(false);
    }
  };

  if (!student) return null;

  const uploadedTypeMap = new Map();
  documents.forEach((d) => {
    if (d.documentTypeId) {
      uploadedTypeMap.set(d.documentTypeId, d);
    }
  });

  const fullCertificateList = documentTypes.map((dt) => {
    const uploadedDoc = uploadedTypeMap.get(dt.id);
    if (uploadedDoc) {
      return {
        isUploaded: true,
        typeId: dt.id,
        typeName: dt.name,
        typeCode: dt.code,
        category: dt.category || 'ACADEMIC',
        doc: uploadedDoc,
      };
    } else {
      return {
        isUploaded: false,
        typeId: dt.id,
        typeName: dt.name,
        typeCode: dt.code,
        category: dt.category || 'ACADEMIC',
        doc: null,
      };
    }
  });

  const uploadedCount = documents.filter((d) => d.status !== 'ARCHIVED').length;
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter((d) => d.status === 'PENDING' || d.status === 'PENDING_VERIFICATION' || d.status === 'UPLOADED').length;
  const totalRequired = documentTypes.length || 5;
  const missingCount = Math.max(0, totalRequired - uploadedCount);
  const completionPercentage = totalRequired > 0 ? Math.min(100, Math.round((uploadedCount / totalRequired) * 100)) : 100;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] font-sans">
          
          {/* Top Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={student.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-600 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {student.fullName || student.name}
                  </h3>
                  <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200">
                    {student.studentId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Roll: <strong className="text-slate-900 dark:text-white">{student.rollNumber || 'N/A'}</strong> • Group: <strong className="text-blue-600">{formatBranchGroup(student.branchGroup)}</strong> • Year: <strong>{formatIntermediateYear(student.intermediateYear)}</strong> • Section: <strong>{formatSectionName(student.section)}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setPrefilledDocTypeId(null);
                  setShowUploadModal(true);
                }}
                className="py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md inline-flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Certificate</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Main Scroll Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
            
            {/* Progress Bar Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Certificate Completion Progress</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{uploadedCount} / {totalRequired} Certificates Uploaded ({completionPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Total Required</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalRequired}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider block">Uploaded</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{uploadedCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">Verified</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{verifiedCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider block">Pending</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pendingCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400 tracking-wider block">Missing</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{missingCount}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider block">Completion</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{completionPercentage}%</span>
              </div>
            </div>

            {/* Certificates Table */}
            <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500">
                    <th className="p-3.5 px-4">Certificate Type</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Upload Date</th>
                    <th className="p-3.5">Verified By</th>
                    <th className="p-3.5">File Size</th>
                    <th className="p-3.5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <span className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mb-2" />
                        <p>Loading certificate records...</p>
                      </td>
                    </tr>
                  ) : fullCertificateList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No certificate types configured in system.
                      </td>
                    </tr>
                  ) : (
                    fullCertificateList.map((item, idx) => {
                      const doc = item.doc;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{item.typeName}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {item.isUploaded ? (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                doc.status === 'VERIFIED'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                  : doc.status === 'REJECTED'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                              }`}>
                                {doc.status === 'VERIFIED' ? 'VERIFIED' : doc.status === 'REJECTED' ? 'REJECTED' : 'PENDING VERIFICATION'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 rounded-full text-[10px] font-extrabold uppercase">
                                MISSING
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {item.isUploaded && doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {item.isUploaded ? doc.verifiedBy || '-' : '-'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                            {item.isUploaded && doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '-'}
                          </td>
                          <td className="p-3.5 pr-6 text-right space-x-1.5">
                            {item.isUploaded ? (
                              <>
                                <button
                                  onClick={() => setSelectedDocForPreview(doc)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                  title="View Certificate PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {doc.previewUrl && (
                                  <a
                                    href={`${doc.previewUrl}?download=true`}
                                    download
                                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition inline-flex items-center cursor-pointer"
                                    title="Download Certificate"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                {isAdmin && doc.status !== 'VERIFIED' && (
                                  <button
                                    onClick={() => handleVerify(doc.id)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                                    title="Verify Certificate"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                {isAdmin && doc.status !== 'REJECTED' && (
                                  <button
                                    onClick={() => handleReject(doc.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title="Reject Certificate"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={() => setDocToDelete(doc)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete Certificate"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setPrefilledDocTypeId(item.typeId);
                                  setShowUploadModal(true);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Upload Certificate</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2.5 px-6 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocForPreview && (
        <CertificatePreviewModal
          doc={selectedDocForPreview}
          onClose={() => setSelectedDocForPreview(null)}
        />
      )}

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <UploadCertificateModal
          prefilledStudentId={student.studentId}
          prefilledDocumentTypeId={prefilledDocTypeId}
          onClose={() => {
            setShowUploadModal(false);
            setPrefilledDocTypeId(null);
          }}
          onUploaded={() => {
            fetchStudentData();
            if (onUpdated) onUpdated();
          }}
        />
      )}

      {/* Delete Certificate Confirmation Modal */}
      {docToDelete && (
        <DeleteConfirmationModal
          title="Delete Certificate"
          subtitle="Certificate Purge • Supabase Storage Removal"
          entityDetails={[
            { label: 'Certificate Type', value: docToDelete.documentTypeName || docToDelete.documentType?.name || 'Certificate' },
            { label: 'Student ID', value: student.studentId },
            { label: 'Student Name', value: student.fullName || student.name },
            { label: 'File Name', value: docToDelete.originalFileName || 'document.pdf', fullWidth: true },
          ]}
          warningList={[
            'Certificate Database Record',
            'Uploaded Certificate PDF from Supabase Storage',
            'Verification & Audit Trail Records',
          ]}
          confirmationKeyword="DELETE CERTIFICATE"
          dangerButtonText="Delete Certificate"
          loading={deletingDoc}
          onClose={() => setDocToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};

export default StudentCertificatesModal;
