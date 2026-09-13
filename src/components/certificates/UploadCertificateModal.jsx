import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, FileText, CheckCircle2, User, Search } from 'lucide-react';
import certificateService from '../../services/certificateService';
import studentService from '../../services/studentService';
import AnimatedFileUpload from '../common/AnimatedFileUpload';
import StudentAvatar from '../common/StudentAvatar';
import { useToast } from '../../context/ToastContext';
import { formatSectionName, formatBranchGroup } from '../../utils/studentDataFormatter';

export const UploadCertificateModal = ({
  student,
  prefilledStudentId,
  prefilledDocTypeId,
  prefilledDocumentTypeId,
  documentTypes: initialDocTypes,
  onClose,
  onUploaded,
}) => {
  const { showWarning, showSuccess } = useToast();

  const effectivePrefilledDocTypeId = prefilledDocTypeId || prefilledDocumentTypeId || '';
  const initialStudentId = student?.studentId || prefilledStudentId || '';

  const [studentContext, setStudentContext] = useState(student || null);
  const [studentId, setStudentId] = useState(initialStudentId);
  const [documentTypeId, setDocumentTypeId] = useState(effectivePrefilledDocTypeId);
  const [documentTypes, setDocumentTypes] = useState(initialDocTypes || []);
  const [file, setFile] = useState(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // For global mode when student context is missing
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  const hasFixedStudent = Boolean(studentContext?.studentId || initialStudentId);

  // If student object is not fully loaded but we have studentId, load student details for display
  useEffect(() => {
    if (initialStudentId && (!studentContext || !studentContext.fullName)) {
      studentService.getStudentById(initialStudentId)
        .then((res) => {
          setStudentContext(res);
          setStudentId(res.studentId);
        })
        .catch(() => {
          // Fallback to basic ID if full record fetch fails
          setStudentId(initialStudentId);
        });
    }
  }, [initialStudentId]);

  // Load document types if not provided
  useEffect(() => {
    if (!initialDocTypes || initialDocTypes.length === 0) {
      certificateService.getActiveDocumentTypes()
        .then((types) => {
          setDocumentTypes(types || []);
          if (!effectivePrefilledDocTypeId && types && types.length > 0) {
            setDocumentTypeId(types[0].id);
          }
        })
        .catch(() => setError('Failed to load document types'));
    } else {
      setDocumentTypes(initialDocTypes);
      if (!effectivePrefilledDocTypeId && initialDocTypes.length > 0) {
        setDocumentTypeId(initialDocTypes[0].id);
      }
    }
  }, [initialDocTypes, effectivePrefilledDocTypeId]);

  // Handle student search in global mode
  useEffect(() => {
    if (hasFixedStudent || !studentSearchQuery || studentSearchQuery.trim().length < 2) {
      setStudentSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const res = await studentService.searchStudents(studentSearchQuery.trim());
        setStudentSearchResults(res || []);
      } catch (err) {
        console.warn('Student search failed:', err);
      } finally {
        setSearchingStudents(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [studentSearchQuery, hasFixedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalStudentId = studentContext?.studentId || studentId;

    if (!finalStudentId) {
      setError('Please select or specify a student.');
      showWarning('Please select a student.');
      return;
    }

    if (!documentTypeId) {
      setError('Please select a certificate type.');
      showWarning('Please select a certificate type.');
      return;
    }

    if (!file) {
      setError('Please choose a valid PDF file.');
      showWarning('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('studentId', finalStudentId);
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', file);
    if (documentNumber.trim()) formData.append('documentNumber', documentNumber.trim());
    if (notes.trim()) formData.append('notes', notes.trim());

    try {
      await certificateService.uploadCertificate(formData);
      setSuccess(true);
      if (showSuccess) showSuccess('Certificate uploaded successfully!');
      if (onUploaded) onUploaded();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload certificate.';
      setError(msg);
      if (showWarning) showWarning(msg);
    } finally {
      setLoading(false);
    }
  };

  const studentDisplayName = studentContext?.fullName || studentContext?.studentName || studentContext?.name || 'Student';
  const studentDisplayAdm = studentContext?.admissionNumber || studentContext?.rollNumber || '';
  const studentDisplayGroup = studentContext?.branchGroup || studentContext?.academicDetail?.branchGroup || '';
  const studentDisplaySection = studentContext?.section || studentContext?.academicDetail?.section || '';
  const studentDisplayYear = studentContext?.intermediateYear || studentContext?.academicDetail?.intermediateYear || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Upload Certificate PDF
              </h3>
              <p className="text-[11px] text-slate-400">
                {hasFixedStudent ? 'Uploading certificate for preselected student' : 'Attach student certificate document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2.5 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Certificate uploaded and linked successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="upload-certificate-form" className="space-y-4">
            
            {/* Student Identification Section */}
            {hasFixedStudent ? (
              // READ-ONLY STUDENT CONTEXT CARD (NO EDITABLE STUDENT ID INPUT)
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center space-x-3">
                <StudentAvatar
                  src={studentContext?.profilePhotoUrl}
                  name={studentDisplayName}
                  studentId={studentContext?.studentId || initialStudentId}
                  size="md"
                  rounded="rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400 block tracking-wider">
                    Student Context (Read-Only)
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                    {studentDisplayName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      ID: {studentContext?.studentId || initialStudentId}
                    </span>
                    {studentDisplayAdm && (
                      <>
                        <span>•</span>
                        <span>Adm: {studentDisplayAdm}</span>
                      </>
                    )}
                    {studentDisplayGroup && (
                      <>
                        <span>•</span>
                        <span>{formatBranchGroup(studentDisplayGroup)} {studentDisplaySection ? `(Sec ${formatSectionName(studentDisplaySection)})` : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // GLOBAL SEARCH & SELECT STUDENT (When modal is opened globally)
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Select Student *
                </label>
                {studentContext ? (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <StudentAvatar
                        src={studentContext.profilePhotoUrl}
                        name={studentContext.fullName}
                        studentId={studentContext.studentId}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{studentContext.fullName}</p>
                        <p className="text-[10px] font-mono text-blue-600">{studentContext.studentId} • Adm: {studentContext.admissionNumber || studentContext.rollNumber || '—'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentContext(null);
                        setStudentId('');
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline cursor-pointer ml-2"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search student by Name, Admission No, or ID..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {searchingStudents && (
                      <span className="absolute right-3 top-3 text-[10px] text-slate-400">Searching...</span>
                    )}

                    {studentSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100 dark:divide-slate-800">
                        {studentSearchResults.map((st) => (
                          <button
                            key={st.id || st.studentId}
                            type="button"
                            onClick={() => {
                              setStudentContext(st);
                              setStudentId(st.studentId);
                              setStudentSearchQuery('');
                              setStudentSearchResults([]);
                            }}
                            className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 transition flex items-center space-x-2.5 cursor-pointer"
                          >
                            <StudentAvatar src={st.profilePhotoUrl} name={st.fullName} studentId={st.studentId} size="xs" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{st.fullName}</p>
                              <p className="text-[10px] font-mono text-slate-400">{st.studentId} • Adm: {st.admissionNumber || st.rollNumber || '—'}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Certificate Type Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Certificate / Document Type *
              </label>
              <select
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select Certificate Type</option>
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} {dt.requiredByDefault ? '(Mandatory)' : ''} — {dt.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Number / Reference (Optional) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Certificate / Memo Number (Optional)
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. TC-2026-9842 or Memo No."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* PDF Upload Dropzone */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Certificate PDF File * (PDF only, Max 5 MB)
              </label>
              <AnimatedFileUpload
                selectedFile={file}
                onFileSelect={(selected) => {
                  if (selected) {
                    const isPdfExt = selected.name.toLowerCase().endsWith('.pdf');
                    const isPdfMime = selected.type === 'application/pdf' || selected.type === '';
                    if (!isPdfExt || !isPdfMime) {
                      setError('Only valid PDF files (.pdf) are allowed.');
                      showWarning('Invalid file. Only PDF files are allowed.');
                      setFile(null);
                      return;
                    }
                    if (selected.size > 5 * 1024 * 1024) {
                      setError('PDF file size exceeds maximum 5 MB limit.');
                      showWarning('File size exceeds 5 MB limit.');
                      setFile(null);
                      return;
                    }
                    setError('');
                    setFile(selected);
                  }
                }}
                onFileRemove={() => setFile(null)}
                uploading={loading}
                accept=".pdf,application/pdf"
                maxSizeMB={5}
                label="Click or drag certificate PDF here"
                sublabel="Official PDF format (max 5 MB)"
              />
            </div>

            {/* Notes / Remarks */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Remarks (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes for verification..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-certificate-form"
            disabled={loading || success || !file || (!studentContext?.studentId && !studentId)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center space-x-2 min-h-[44px]"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Certificate</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCertificateModal;
