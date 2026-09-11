import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Loader2,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  FileDown
} from 'lucide-react';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

export const ImportStudentsModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();

  // Steps: 'UPLOAD' | 'PREVIEW' | 'IMPORTING' | 'RESULT'
  const [step, setStep] = useState('UPLOAD');

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Validation / Preview state
  const [validating, setValidating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'VALID' | 'DUPLICATE' | 'ERROR'
  const [searchQuery, setSearchQuery] = useState('');

  // Import options
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);

  // Execution & Result state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [downloadingErrorReport, setDownloadingErrorReport] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle template download
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await studentService.downloadImportTemplate();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Student_Registration_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Template downloaded successfully.');
    } catch (err) {
      console.error('Failed to download template:', err);
      showError('Failed to download template. Please try again.');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      showError('Please upload an Excel file with .xlsx extension.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError('File size exceeds the 25MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Validate uploaded Excel
  const handleValidate = async () => {
    if (!selectedFile) {
      showError('Please select an Excel file first.');
      return;
    }

    setValidating(true);
    try {
      const data = await studentService.validateStudentImport(selectedFile);
      setPreviewData(data);
      if (data.headerErrors && data.headerErrors.length > 0) {
        showError(data.headerErrors[0]);
      } else {
        setStep('PREVIEW');
      }
    } catch (err) {
      console.error('Validation error:', err);
      const msg = err.response?.data?.message || 'Failed to validate Excel file.';
      showError(msg);
    } finally {
      setValidating(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setStep('IMPORTING');
    try {
      const result = await studentService.confirmStudentImport(selectedFile, {
        skipDuplicates,
        updateExisting,
      });
      setImportResult(result);
      setStep('RESULT');
      showSuccess(result.message || 'Students imported successfully.');
    } catch (err) {
      console.error('Import confirmation error:', err);
      const msg = err.response?.data?.message || 'Failed to import students.';
      showError(msg);
      setStep('PREVIEW');
    } finally {
      setImporting(false);
    }
  };

  // Download error report Excel
  const handleDownloadErrorReport = async () => {
    if (!importResult?.failedRows || importResult.failedRows.length === 0) return;

    setDownloadingErrorReport(true);
    try {
      const response = await studentService.downloadImportErrorReport(importResult.failedRows);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Student_Import_Errors.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Error report downloaded.');
    } catch (err) {
      console.error('Failed to download error report:', err);
      showError('Failed to download error report.');
    } finally {
      setDownloadingErrorReport(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    if (importing) return;
    const shouldRefresh = step === 'RESULT' && importResult && (importResult.importedCount > 0 || importResult.updatedCount > 0);
    setStep('UPLOAD');
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setFilterTab('ALL');
    setSearchQuery('');
    onClose();
    if (shouldRefresh && typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  // Filter preview rows
  const filteredRows = (previewData?.preview || []).filter((row) => {
    if (filterTab === 'VALID' && row.status !== 'VALID') return false;
    if (filterTab === 'DUPLICATE' && row.status !== 'DUPLICATE') return false;
    if (filterTab === 'ERROR' && row.status !== 'ERROR') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = (row.rollNumber || '').toLowerCase().includes(q);
      const matchName = (row.fullName || '').toLowerCase().includes(q);
      const matchAdm = (row.admissionNumber || '').toLowerCase().includes(q);
      const matchEmail = (row.email || '').toLowerCase().includes(q);
      const matchGroup = (row.branchGroup || '').toLowerCase().includes(q);
      return matchRoll || matchName || matchAdm || matchEmail || matchGroup;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Import Students from Excel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bulk create student records with complete profiles and database verification
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ============================================================ */}
          {/* STEP 1: UPLOAD EXCEL                                         */}
          {/* ============================================================ */}
          {step === 'UPLOAD' && (
            <div className="space-y-6">
              
              {/* Template Download Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Official Student Registration Template</span>
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Use our standardized Excel template with pre-configured headers to prevent validation errors.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {downloadingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Template...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Excel Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3.5 ${
                  dragActive
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-4 ring-blue-500/10'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/40 dark:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {selectedFile ? selectedFile.name : 'Drag & Drop your Excel file here'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace`
                      : 'or click to browse from your device (.xlsx up to 25MB)'}
                  </p>
                </div>
              </div>

              {/* Selected File Summary Card */}
              {selectedFile && (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Header Errors if any */}
              {previewData?.headerErrors && previewData.headerErrors.length > 0 && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-1.5">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Template Header Validation Errors:</span>
                  </p>
                  <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-1 pl-1">
                    {previewData.headerErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: PREVIEW & VALIDATION RESULTS                         */}
          {/* ============================================================ */}
          {step === 'PREVIEW' && previewData && (
            <div className="space-y-5">
              
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">Total Rows</span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-0.5">{previewData.totalRows}</p>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Valid Rows</span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-0.5">{previewData.validRows}</p>
                </div>

                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Duplicates</span>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-0.5">{previewData.duplicateRows}</p>
                </div>

                <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">Invalid Rows</span>
                  <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-0.5">{previewData.invalidRows}</p>
                </div>
              </div>

              {/* Duplicate Handling Options Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Duplicate Handling Preferences:
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                  <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => {
                        setSkipDuplicates(e.target.checked);
                        if (!e.target.checked) setUpdateExisting(false);
                      }}
                      className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                    />
                    <span><strong>Safe Mode:</strong> Skip existing student duplicates and continue</span>
                  </label>

                  <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateExisting}
                      onChange={(e) => {
                        setUpdateExisting(e.target.checked);
                        if (e.target.checked) setSkipDuplicates(false);
                      }}
                      className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                    />
                    <span>Update existing records with matching Roll/Admission No</span>
                  </label>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 overflow-x-auto text-xs font-bold">
                  {[
                    { id: 'ALL', label: `All (${previewData.totalRows})` },
                    { id: 'VALID', label: `Valid (${previewData.validRows})` },
                    { id: 'DUPLICATE', label: `Duplicates (${previewData.duplicateRows})` },
                    { id: 'ERROR', label: `Errors (${previewData.invalidRows})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id)}
                      className={`py-2 px-3 rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                        filterTab === tab.id
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 font-extrabold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search preview rows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Preview Rows Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden overflow-x-auto max-h-[350px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Roll Number</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Mobile / Email</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No rows match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r) => {
                        const isVal = r.status === 'VALID';
                        const isDup = r.status === 'DUPLICATE';
                        const isErr = r.status === 'ERROR';

                        return (
                          <tr
                            key={r.rowNumber}
                            className={`transition ${
                              isErr
                                ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70'
                                : isDup
                                ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70'
                                : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono font-bold text-slate-400">
                              {r.rowNumber}
                            </td>

                            <td className="py-2 px-3 whitespace-nowrap">
                              {isVal && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  VALID
                                </span>
                              )}
                              {isDup && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  DUPLICATE
                                </span>
                              )}
                              {isErr && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  ERROR
                                </span>
                              )}
                            </td>

                            <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                              {r.rollNumber || '—'}
                            </td>

                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || '—'}
                            </td>

                            <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                              {r.branchGroup || '—'}
                            </td>

                            <td className="py-2 px-3">
                              {r.intermediateYear || '—'}
                            </td>

                            <td className="py-2 px-3 font-bold">
                              {r.section ? `Sec ${r.section}` : '—'}
                            </td>

                            <td className="py-2 px-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              <div>{r.mobileNumber || '—'}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{r.email || ''}</div>
                            </td>

                            <td className="py-2 px-3 text-[11px]">
                              {r.errors && r.errors.length > 0 ? (
                                <span className="text-rose-600 dark:text-rose-400 font-medium">
                                  {r.errors.join('; ')}
                                </span>
                              ) : r.warnings && r.warnings.length > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  {r.warnings.join('; ')}
                                </span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Ready to import
                                </span>
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
          )}

          {/* ============================================================ */}
          {/* STEP 3: IMPORTING IN PROGRESS                                */}
          {/* ============================================================ */}
          {step === 'IMPORTING' && (
            <div className="py-16 text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-md" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Importing Students into Database...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Executing transactional creation of student profiles, academic details, and parent contact records. Please do not close or navigate away from this page.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: IMPORT COMPLETED RESULT                              */}
          {/* ============================================================ */}
          {step === 'RESULT' && importResult && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Student Import Completed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {importResult.message}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Created</span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{importResult.importedCount}</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Updated</span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">{importResult.updatedCount}</p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Skipped</span>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">{importResult.skippedCount}</p>
                </div>

                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Failed</span>
                  <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-1">{importResult.failedCount}</p>
                </div>
              </div>

              {/* Download Error Report if there are failures */}
              {importResult.failedCount > 0 && (
                <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
                  <div>
                    <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {importResult.failedCount} rows could not be imported
                    </h5>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      Download the error report Excel file to review exact failure reasons per row.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    disabled={downloadingErrorReport}
                    className="py-2 px-3.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:text-rose-200 rounded-xl transition flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {downloadingErrorReport ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Download Error Report</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          {step === 'UPLOAD' && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={!selectedFile || validating}
                className="py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating Excel...</span>
                  </>
                ) : (
                  <>
                    <span>Validate Excel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 'PREVIEW' && (
            <>
              <button
                type="button"
                onClick={() => setStep('UPLOAD')}
                disabled={importing}
                className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Upload Different File
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={previewData?.validRows === 0 || importing}
                  className="py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Confirm & Import ({previewData?.validRows || 0}) Students</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 'RESULT' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Done • View Student Directory
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportStudentsModal;
