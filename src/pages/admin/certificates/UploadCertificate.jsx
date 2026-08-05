import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import studentService from '../../../services/studentService';
import DuplicateCertificateModal from '../../../components/certificates/DuplicateCertificateModal';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import {
  UploadCloud,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  User,
  ArrowRight
} from 'lucide-react';

export const UploadCertificate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const Layout = rawRole === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [studentSearchQuery, setStudentSearchQuery] = useState(preselectedStudentId);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicateModalData, setDuplicateModalData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const types = await certificateService.getActiveDocumentTypes();
        setDocumentTypes(types || []);
        if (types && types.length > 0) setDocumentTypeId(types[0].id);
      } catch (err) {
        console.error('Failed to load document types:', err);
      }
    };
    fetchDocTypes();
  }, []);

  useEffect(() => {
    if (studentSearchQuery.trim().length > 1) {
      const searchSt = async () => {
        try {
          const results = await studentService.searchStudents(studentSearchQuery);
          setStudentOptions(results || []);
        } catch (err) {
          console.error('Search error:', err);
        }
      };
      searchSt();
    } else {
      setStudentOptions([]);
    }
  }, [studentSearchQuery]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
      const isPdfMime = file.type === 'application/pdf' || file.type === '';

      if (!isPdfExt || !isPdfMime) {
        setError('Only PDF files (.pdf) are allowed.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('PDF file size exceeds maximum 5 MB limit.');
        setSelectedFile(null);
        return;
      }

      setError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please select or enter a valid Student ID.');
      return;
    }
    if (!documentTypeId) {
      setError('Please select a certificate type.');
      return;
    }
    if (!selectedFile) {
      setError('Please attach a PDF certificate file.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', selectedFile);
    if (documentNumber) formData.append('documentNumber', documentNumber);
    if (issueDate) formData.append('issueDate', issueDate);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    if (issuedBy) formData.append('issuedBy', issuedBy);
    if (notes) formData.append('notes', notes);

    try {
      await certificateService.uploadCertificate(formData);
      setSuccess('Certificate PDF uploaded successfully to Supabase Private Bucket!');
      setSelectedFile(null);
      setNotes('');
      setDocumentNumber('');
      setTimeout(() => {
        navigate('/admin/certificates');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.existingDocument) {
        setDuplicateModalData({
          existingDoc: err.response.data.existingDocument,
          formData,
        });
      } else {
        setError(err.response?.data?.message || 'Failed to upload certificate.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        
        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Certificate Upload Module
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Upload Student Certificate
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Attach and upload student PDF certificates to Supabase Private Storage with instant metadata indexing.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <UploadCloud className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-xs">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Student Search & Select */}
            <div className="space-y-1 relative">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Search & Select Student *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Type Student ID, Full Name, or Roll No..."
                  value={studentSearchQuery}
                  onChange={(e) => {
                    setStudentSearchQuery(e.target.value);
                    setStudentId(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-blue-600 dark:text-blue-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Student Search Dropdown */}
              {studentOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-30 p-2 space-y-1">
                  {studentOptions.map((st) => (
                    <button
                      key={st.id || st.studentId}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(st);
                        setStudentId(st.studentId);
                        setStudentSearchQuery(`${st.fullName} (${st.studentId})`);
                        setStudentOptions([]);
                      }}
                      className="w-full text-left p-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900 dark:text-white">{st.fullName}</span>
                      </div>
                      <span className="font-mono text-[11px] font-extrabold text-blue-600">{st.studentId}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate Type Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Certificate Type *
              </label>
              <select
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
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

            {/* File Input */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Certificate PDF Document * (Max 5 MB)
              </label>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-2">
                <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Select a valid PDF document to attach. File storage will be encrypted on Supabase.
                </p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full max-w-sm mx-auto text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white"
                />
              </div>
              {selectedFile && (
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  ✓ Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Optional Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Reference No. (optional)
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
                  Issuing Authority / Board (optional)
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

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks / Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add verification remarks..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/admin/certificates')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold rounded-xl shadow-md shadow-blue-500/30 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Uploading PDF...' : 'Upload Certificate PDF'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UploadCertificate;
