import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import certificateService from '../../../services/certificateService';
import studentService from '../../../services/studentService';
import DuplicateCertificateModal from '../../../components/certificates/DuplicateCertificateModal';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import AnimatedFileUpload from '../../../components/common/AnimatedFileUpload';
import StudentAvatar from '../../../components/common/StudentAvatar';
import {
  UploadCloud,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const UploadCertificate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const Layout = rawRole === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId') || '';

  // Student Selection State
  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Certificate Form State
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Status & Modal States
  const [submitting, setSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [duplicateModalData, setDuplicateModalData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Load student details if preselectedStudentId is present
  useEffect(() => {
    if (preselectedStudentId) {
      studentService.getStudentById(preselectedStudentId)
        .then((st) => {
          setSelectedStudent(st);
          setStudentId(st.studentId);
        })
        .catch(() => {
          setStudentId(preselectedStudentId);
        });
    }
  }, [preselectedStudentId]);

  // Load active certificate types
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const types = await certificateService.getActiveDocumentTypes();
        setDocumentTypes(types || []);
      } catch (err) {
        console.error('Failed to load document types:', err);
      }
    };
    fetchDocTypes();
  }, []);

  // Handle student search
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setStudentSearchQuery(val);
    setError('');

    if (!val || val.trim().length < 2) {
      setStudentOptions([]);
      return;
    }

    setSearchingStudents(true);
    try {
      const res = await studentService.searchStudents(val.trim());
      setStudentOptions(res || []);
    } catch (err) {
      console.error('Search failed:', err);
      setStudentOptions([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentId(student.studentId || student.id);
    setStudentSearchQuery('');
    setStudentOptions([]);
    setError('');
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setStudentId('');
    setStudentSearchQuery('');
    setStudentOptions([]);
  };

  // Main Upload Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict Frontend Validation
    if (!studentId || !selectedStudent) {
      const msg = 'Please select a student.';
      setError(msg);
      showWarning(msg);
      return;
    }

    if (!documentTypeId) {
      const msg = 'Please select a certificate type.';
      setError(msg);
      showWarning(msg);
      return;
    }

    if (!selectedFile) {
      const msg = 'Please select a certificate PDF file.';
      setError(msg);
      showWarning(msg);
      return;
    }

    const isPdfExt = selectedFile.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = selectedFile.type === 'application/pdf' || selectedFile.type === '';
    if (!isPdfExt || !isPdfMime) {
      const msg = 'Only PDF files are allowed.';
      setError(msg);
      showWarning(msg);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      const msg = 'File size exceeds the maximum allowed size (5 MB).';
      setError(msg);
      showWarning(msg);
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', selectedFile);

    if (documentNumber.trim()) formData.append('documentNumber', documentNumber.trim());
    if (issuedBy.trim()) formData.append('issuedBy', issuedBy.trim());
    if (notes.trim()) formData.append('notes', notes.trim());

    try {
      await certificateService.uploadCertificate(formData);
      setUploadSuccess(true);
      showSuccess('Certificate uploaded successfully');

      setTimeout(() => {
        navigate('/admin/certificates');
      }, 1200);
    } catch (err) {
      if (err.response?.status === 409) {
        const dupData = err.response.data || {};
        setDuplicateModalData({
          existingCertificateId: dupData.documentId || dupData.existingCertificateId,
          certificateType: dupData.certificateType || 'Selected Certificate Type',
          studentId: dupData.studentId || studentId,
        });
        setError('Certificate already exists for this student.');
      } else {
        const msg = err.response?.data?.message || 'Failed to upload certificate. Please try again.';
        setError(msg);
        showError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewExisting = async (existingCertId) => {
    try {
      const doc = await certificateService.getDocumentById(existingCertId);
      setPreviewDoc(doc);
    } catch (_err) {
      showError('Failed to fetch existing certificate details');
    }
  };

  const handleReplaceExisting = async (existingCertId) => {
    if (!selectedFile) {
      showError('Please select a PDF file to replace with.');
      return;
    }
    try {
      await certificateService.replaceCertificate(existingCertId, selectedFile);
      showSuccess('Certificate replaced successfully!');
      setDuplicateModalData(null);
      setTimeout(() => {
        navigate('/admin/certificates');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to replace certificate.';
      showError(msg);
      throw err;
    }
  };

  const handleDeleteExisting = async (existingCertId) => {
    try {
      await certificateService.deleteCertificate(existingCertId);
      showSuccess('Existing certificate deleted. You can now upload the new certificate.');
      setDuplicateModalData(null);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete existing certificate.';
      showError(msg);
      throw err;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Certificate Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Upload Student Certificate
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload a PDF certificate and attach it to a student record.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* 1. Search & Select Student * */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Search & Select Student <span className="text-rose-500">*</span>
              </label>

              {selectedStudent ? (
                /* Selected Student Display Card */
                <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <StudentAvatar
                      src={selectedStudent.profilePhotoUrl}
                      name={selectedStudent.fullName}
                      studentId={selectedStudent.studentId}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {selectedStudent.fullName}
                      </h4>
                      <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        {selectedStudent.studentId}
                        {selectedStudent.admissionNumber ? ` • Adm: ${selectedStudent.admissionNumber}` : (selectedStudent.rollNumber ? ` • Roll: ${selectedStudent.rollNumber}` : '')}
                      </p>
                    </div>
                  </div>

                  {!preselectedStudentId && (
                    <button
                      type="button"
                      onClick={handleClearStudent}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs transition shrink-0"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                /* Student Search Input */
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search Student ID, Full Name, or Admission No..."
                      value={studentSearchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    {searchingStudents && (
                      <span className="absolute right-3.5 top-3 text-[11px] text-slate-400 font-semibold">
                        Searching...
                      </span>
                    )}
                  </div>

                  {/* Student Search Dropdown */}
                  {studentOptions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-56 overflow-y-auto z-30 p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {studentOptions.map((st) => (
                        <button
                          key={st.id || st.studentId}
                          type="button"
                          onClick={() => handleStudentSelect(st)}
                          className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-3 cursor-pointer transition"
                        >
                          <StudentAvatar src={st.profilePhotoUrl} name={st.fullName} studentId={st.studentId} size="xs" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">{st.fullName}</span>
                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                              {st.studentId} • Adm: {st.admissionNumber || st.rollNumber || '—'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Certificate Type * */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Certificate Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={documentTypeId}
                onChange={(e) => {
                  setDocumentTypeId(e.target.value);
                  setError('');
                }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="">Select Certificate Type</option>
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} ({dt.code}) - {dt.category || 'ACADEMIC'}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Certificate PDF Document * */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Certificate PDF Document <span className="text-rose-500">*</span>
              </label>
              <AnimatedFileUpload
                selectedFile={selectedFile}
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  setError('');
                }}
                onFileRemove={() => {
                  setSelectedFile(null);
                  setError('');
                }}
                onValidationError={(validationMsg) => {
                  setError(validationMsg);
                  if (validationMsg) showWarning(validationMsg);
                }}
                uploading={submitting}
                accept=".pdf,application/pdf"
                maxSizeMB={5}
                label="Upload PDF Certificate"
                sublabel="Drag & drop your PDF file here or browse from your computer"
              />
            </div>

            {/* Optional Metadata Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Reference No. <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="e.g. SSC-2026-9901"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Issuing Authority / Board <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="e.g. Board of Secondary Education"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Remarks / Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add verification remarks..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Actions: Upload Certificate button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/admin/certificates')}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer min-h-[44px] flex items-center justify-center disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || uploadSuccess}
                className={`w-full sm:w-auto px-6 py-2.5 font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-2 min-h-[44px] ${
                  uploadSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Uploading...</span>
                  </>
                ) : uploadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span>Certificate Uploaded</span>
                  </>
                ) : (
                  <span>Upload Certificate</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Duplicate Certificate Action Modal */}
      {duplicateModalData && (
        <DuplicateCertificateModal
          duplicateData={duplicateModalData}
          onView={handleViewExisting}
          onReplace={handleReplaceExisting}
          onDelete={handleDeleteExisting}
          onCancel={() => setDuplicateModalData(null)}
        />
      )}

      {/* Certificate Preview Modal */}
      {previewDoc && (
        <CertificatePreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </Layout>
  );
};

export default UploadCertificate;
