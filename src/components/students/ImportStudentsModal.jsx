import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Loader2,
  Search,
  ArrowRight,
  ShieldCheck,
  FileDown,
  School,
  Lock,
  Check
} from 'lucide-react';
import studentService from '../../services/studentService';
import academicService from '../../services/academicService';
import facultyService from '../../services/facultyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const OFFICIAL_CAMPUSES = [
  'TITANIC',
  'SUSRUTHA',
  'DHANVANTARI',
  'GIRLS',
  'VAIDEHI',
  'MEDEX',
  'AIIMS CCO',
  'CCO',
  'ABDUL KALAM',
  'DCO',
  'INDRA BHAVAN',
  'APARNA',
  'VISWAKARMA',
  'VASISTA',
  'GARUDA',
  'GCO',
  'ADITHYA CO',
  'VAARAHI'
];

export const ImportStudentsModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const rawRole = (
    typeof user?.role === 'string'
      ? user.role
      : user?.role?.roleName || user?.role?.name || ''
  )
    .replace('ROLE_', '')
    .toUpperCase();

  const isAdmin = rawRole === 'ADMIN' || rawRole === 'SUPER_ADMIN';
  const isFaculty = rawRole === 'FACULTY';

  // Steps: 'UPLOAD' | 'PREVIEW' | 'IMPORTING' | 'RESULT'
  const [step, setStep] = useState('UPLOAD');

  // File state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Admin Campus & Academic Selection State
  const [campusList, setCampusList] = useState([]);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('');

  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');

  const [yearOptions, setYearOptions] = useState([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [yearError, setYearError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  // Faculty Assignment State
  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState(0);

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

  // Load database records when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (isAdmin) {
      setLoadingCampuses(true);
      academicService.getCampuses()
        .then((campuses) => {
          const list = Array.isArray(campuses) ? campuses : [];
          const names = list
            .map((c) => (typeof c === 'string' ? c : c?.name || ''))
            .filter(Boolean);
          setCampusList(names.length > 0 ? names : OFFICIAL_CAMPUSES);
        })
        .catch((err) => {
          console.error('Failed to load campuses from database:', err);
          setCampusList(OFFICIAL_CAMPUSES);
        })
        .finally(() => setLoadingCampuses(false));
    } else {
      setLoadingAssignments(true);
      facultyService
        .getCurrentFacultyAssignments()
        .then((assignments) => {
          const list = Array.isArray(assignments) ? assignments : [];
          setFacultyAssignments(list);
          if (list.length > 0) {
            setSelectedAssignmentIndex(0);
          }
        })
        .catch((err) => {
          console.error('Failed to load faculty assignments:', err);
          setFacultyAssignments([]);
        })
        .finally(() => setLoadingAssignments(false));
    }
  }, [isOpen, isAdmin]);

  // Cascade 1: Handle Campus change for Admin
  const handleCampusChange = async (e) => {
    const campusVal = e.target.value;
    setSelectedCampus(campusVal);
    setSelectedGroup('');
    setSelectedYear('');
    setGroupOptions([]);
    setYearOptions([]);
    setYearError(null);

    if (!campusVal) return;

    setLoadingGroups(true);
    try {
      const groups = await academicService.getGroupsByCampus(campusVal);
      const list = Array.isArray(groups) ? groups : [];
      const codes = list
        .filter((g) => g.active !== false)
        .map((g) => (typeof g === 'string' ? g : g.code || g.name || '').trim())
        .filter(Boolean);
      setGroupOptions(Array.from(new Set(codes)).sort());
    } catch (err) {
      console.error('Failed to load groups for campus:', err);
      showError('Failed to load groups for selected campus.');
      setGroupOptions([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Cascade 2: Dynamic Academic Year loader
  const loadAcademicYears = async (campusVal, groupVal) => {
    if (!groupVal) {
      setYearOptions([]);
      setSelectedYear('');
      setYearError(null);
      return;
    }

    setLoadingYears(true);
    setYearError(null);
    setYearOptions([]);
    setSelectedYear('');

    try {
      const years = await academicService.getAcademicYears(campusVal, groupVal);
      const list = Array.isArray(years) ? years : [];
      setYearOptions(list);
    } catch (err) {
      console.error('Failed to load academic years:', err);
      setYearError('Unable to load academic years.');
      setYearOptions([]);
    } finally {
      setLoadingYears(false);
    }
  };

  // Handle Group change for Admin
  const handleGroupChange = (e) => {
    const val = e.target.value;
    setSelectedGroup(val);
    setSelectedYear('');
    loadAcademicYears(selectedCampus, val);
  };

  // Retry loading years if API failed
  const handleRetryYears = () => {
    if (selectedGroup) {
      loadAcademicYears(selectedCampus, selectedGroup);
    }
  };

  // Handle Year change for Admin
  const handleYearChange = (e) => {
    const val = e.target.value;
    setSelectedYear(val);
  };

  // Active faculty assignment record
  const currentFacultyAssignment = useMemo(() => {
    if (facultyAssignments.length === 0) return null;
    return facultyAssignments[selectedAssignmentIndex] || facultyAssignments[0];
  }, [facultyAssignments, selectedAssignmentIndex]);

  if (!isOpen) return null;

  // Handle template download
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await studentService.downloadImportTemplate(isFaculty);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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

    if (isAdmin) {
      if (!selectedCampus) {
        showError('Please select a Campus.');
        return;
      }
      if (!selectedGroup) {
        showError('Please select an Academic Group.');
        return;
      }
      if (!selectedYear) {
        showError('Please select an Academic Year.');
        return;
      }
    } else {
      if (!currentFacultyAssignment) {
        showError('No active assignment found for your faculty account.');
        return;
      }
    }

    setValidating(true);
    try {
      let data;
      if (isAdmin) {
        data = await studentService.validateAdminImport(selectedFile, {
          campus: selectedCampus,
          branchGroup: selectedGroup,
          intermediateYear: selectedYear
        });
      } else {
        data = await studentService.validateFacultyImport(selectedFile, {
          campus: currentFacultyAssignment.campus,
          branchGroup: currentFacultyAssignment.branchGroup,
          intermediateYear: currentFacultyAssignment.intermediateYear,
          section: currentFacultyAssignment.section
        });
      }

      setPreviewData(data);
      if (data.headerErrors && data.headerErrors.length > 0) {
        showError(data.headerErrors[0]);
      } else {
        setStep('PREVIEW');
      }
    } catch (err) {
      console.error('Validation error:', err);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to validate Excel file.';
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
      let result;
      if (isAdmin) {
        result = await studentService.confirmAdminImport(selectedFile, {
          campus: selectedCampus,
          branchGroup: selectedGroup,
          intermediateYear: selectedYear,
          skipDuplicates,
          updateExisting
        });
      } else {
        result = await studentService.confirmFacultyImport(selectedFile, {
          campus: currentFacultyAssignment.campus,
          branchGroup: currentFacultyAssignment.branchGroup,
          intermediateYear: currentFacultyAssignment.intermediateYear,
          section: currentFacultyAssignment.section,
          skipDuplicates,
          updateExisting
        });
      }

      setImportResult(result);
      setStep('RESULT');
      showSuccess(result.message || 'Students imported successfully.');
    } catch (err) {
      console.error('Import confirmation error:', err);
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to import students.';
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
      const response = await studentService.downloadImportErrorReport(
        importResult.failedRows,
        isFaculty
      );
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
    const shouldRefresh =
      step === 'RESULT' &&
      importResult &&
      (importResult.importedCount > 0 || importResult.updatedCount > 0);

    setStep('UPLOAD');
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setFilterTab('ALL');
    setSearchQuery('');
    setSelectedCampus('');
    setSelectedGroup('');
    setSelectedYear('');
    setGroupOptions([]);
    setYearOptions([]);
    setYearError(null);
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
      const matchAdm = (row.admissionNumber || row.rollNumber || '').toLowerCase().includes(q);
      const matchName = (row.fullName || '').toLowerCase().includes(q);
      const matchEmail = (row.emailAddress1 || row.email || '').toLowerCase().includes(q);
      const matchPhone = (row.mobileNumber || '').toLowerCase().includes(q);
      const matchGroup = (row.branchGroup || '').toLowerCase().includes(q);
      return matchAdm || matchName || matchEmail || matchPhone || matchGroup;
    }
    return true;
  });

  // Effective destination labels for display
  const displayCampus = isAdmin
    ? previewData?.targetCampus || selectedCampus
    : currentFacultyAssignment?.campus || '—';

  const displayGroup = isAdmin
    ? previewData?.targetGroup || selectedGroup
    : currentFacultyAssignment?.branchGroup || '—';

  const displayYear = isAdmin
    ? previewData?.targetYear || selectedYear
    : currentFacultyAssignment?.intermediateYear || '—';

  const isValidationDisabled =
    !selectedFile ||
    validating ||
    (isAdmin && (!selectedCampus || !selectedGroup || !selectedYear)) ||
    (!isAdmin && (!currentFacultyAssignment || facultyAssignments.length === 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Import Students from Excel
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}
                >
                  {isAdmin ? 'Admin Mode' : 'Faculty Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? 'Select destination Campus, Group, and Year to bulk create students'
                  : 'Bulk upload students directly into your authenticated section assignment'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={importing}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ============================================================ */}
          {/* STEP 1: UPLOAD & SECTION ASSIGNMENT                          */}
          {/* ============================================================ */}
          {step === 'UPLOAD' && (
            <div className="space-y-6">
              {/* Template Download Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Official Student Registration Template</span>
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Use our standardized Excel template with pre-configured headers matching the student registration form.
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

              {/* DESTINATION CAMPUS ASSIGNMENT CARD */}
              {isAdmin ? (
                /* ADMIN: Dependent Database Dropdowns */
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center space-x-2">
                    <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      🏫 ASSIGN DESTINATION CAMPUS <span className="text-rose-500">*</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All imported students will be assigned to this database Campus, Group, and Academic Year.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {/* Campus Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Campus <span className="text-rose-500">*</span></span>
                        {loadingCampuses && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </label>
                      <select
                        id="admin-import-campus-select"
                        value={selectedCampus}
                        onChange={handleCampusChange}
                        disabled={loadingCampuses}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                      >
                        <option value="">
                          {loadingCampuses ? 'Loading campuses...' : 'Select Campus'}
                        </option>
                        {campusList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Group Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Academic Group <span className="text-rose-500">*</span></span>
                        {loadingGroups && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </label>
                      <select
                        id="admin-import-group-select"
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        disabled={!selectedCampus || loadingGroups}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                      >
                        <option value="">
                          {!selectedCampus
                            ? 'Choose Campus First'
                            : loadingGroups
                            ? 'Loading groups...'
                            : 'Select Academic Group'}
                        </option>
                        {groupOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Year Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Academic Year <span className="text-rose-500">*</span></span>
                        {loadingYears && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                      </label>
                      <select
                        id="admin-import-year-select"
                        value={selectedYear}
                        onChange={handleYearChange}
                        disabled={!selectedCampus || !selectedGroup || loadingYears || yearOptions.length === 0}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                      >
                        <option value="">
                          {!selectedCampus
                            ? 'Choose Campus First'
                            : !selectedGroup
                            ? 'Choose Group First'
                            : loadingYears
                            ? 'Loading academic years...'
                            : yearOptions.length === 0
                            ? 'No academic years available'
                            : 'Select Academic Year'}
                        </option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>

                      {/* Error state with retry */}
                      {yearError && (
                        <div className="pt-1 flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400">
                          <span>{yearError}</span>
                          <button
                            type="button"
                            onClick={handleRetryYears}
                            className="font-bold underline hover:text-rose-800 dark:hover:text-rose-300 cursor-pointer ml-2"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* FACULTY: Automatic Assignment Card (Security Enforced) */
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Assigned Destination Section (Read-Only)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Authenticated</span>
                    </span>
                  </div>

                  {loadingAssignments ? (
                    <div className="py-4 flex items-center space-x-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Loading your section assignments...</span>
                    </div>
                  ) : facultyAssignments.length === 0 ? (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <p className="font-bold">No Active Section Assignment Found</p>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                          You do not currently have any active section assignments linked to your faculty account. Please contact an administrator to be assigned to a section before importing students.
                        </p>
                      </div>
                    </div>
                  ) : facultyAssignments.length === 1 ? (
                    /* Exactly 1 Assignment: Automatically applied & fully locked */
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Assigned Section
                        </span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 flex items-center space-x-2">
                          <span className="text-blue-600 dark:text-blue-400">
                            {currentFacultyAssignment.branchGroup}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{currentFacultyAssignment.intermediateYear}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Sec {currentFacultyAssignment.section?.replace(/^(section\s*)/i, '')}
                          </span>
                        </div>
                        {currentFacultyAssignment.academicYear && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Academic Year: {currentFacultyAssignment.academicYear}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg shrink-0">
                        Automatically determined from your account
                      </div>
                    </div>
                  ) : (
                    /* Multiple Assignments: Controlled radio selector for ONLY faculty's assignments */
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Select which of your authorized sections to import students into:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {facultyAssignments.map((fa, idx) => {
                          const isSelected = selectedAssignmentIndex === idx;
                          return (
                            <label
                              key={fa.id || idx}
                              onClick={() => setSelectedAssignmentIndex(idx)}
                              className={`p-3 rounded-xl border cursor-pointer transition flex items-center space-x-3 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="facultySectionAssignment"
                                checked={isSelected}
                                onChange={() => setSelectedAssignmentIndex(idx)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {fa.branchGroup} • {fa.intermediateYear} • Sec{' '}
                                  {fa.section?.replace(/^(section\s*)/i, '')}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {fa.subjectName ? `${fa.subjectName} • ` : ''}
                                  {fa.academicYear || ''}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
              {/* Destination Campus & Group Header Banner */}
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      {isAdmin ? 'Import Destination' : 'Your Assigned Destination'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Campus: {displayCampus} • Group: {displayGroup} • Year: {displayYear}
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  {isAdmin
                    ? 'Selected from database'
                    : 'Enforced by faculty account'}
                </div>
              </div>

              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    Total Rows
                  </span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-0.5">
                    {previewData.totalRows}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Valid Rows
                  </span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
                    {previewData.validRows}
                  </p>
                </div>

                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                    Duplicates
                  </span>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-0.5">
                    {previewData.duplicateRows}
                  </p>
                </div>

                <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                    Invalid Rows
                  </span>
                  <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-0.5">
                    {previewData.invalidRows}
                  </p>
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
                    <span>
                      <strong>Safe Mode:</strong> Skip existing student duplicates and continue
                    </span>
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
                    <span>Update existing records with matching Admission No</span>
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
                    { id: 'ERROR', label: `Errors (${previewData.invalidRows})` }
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
                      <th className="py-2.5 px-3">Adm No</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Campus</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">Year</th>
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
                              {r.admissionNumber || r.rollNumber || '—'}
                            </td>

                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {r.fullName ||
                                `${r.firstName || ''} ${r.lastName || ''}`.trim() ||
                                '—'}
                            </td>

                             <td className="py-2 px-3 font-bold text-purple-600 dark:text-purple-400">
                              {displayCampus || r.campus || '—'}
                            </td>

                            <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                              {displayGroup || r.branchGroup || '—'}
                            </td>

                            <td className="py-2 px-3">
                              {displayYear || r.intermediateYear || '—'}
                            </td>

                            <td className="py-2 px-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              <div>{r.mobileNumber || '—'}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {r.emailAddress1 || r.email || ''}
                              </div>
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
                  Executing transactional creation of student profiles, academic details, and parent contact records for destination{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Campus: {displayCampus} • Group: {displayGroup} • Year: {displayYear}
                  </span>
                  . Please do not close this window.
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

                {/* Destination Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Destination: {importResult.targetCampus || displayCampus} —{' '}
                    {importResult.targetGroup || displayGroup} —{' '}
                    {importResult.targetYear || displayYear}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Created
                  </span>
                  <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                    {importResult.importedCount}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    Updated
                  </span>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">
                    {importResult.updatedCount}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Skipped
                  </span>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
                    {importResult.skippedCount}
                  </p>
                </div>

                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                    Failed
                  </span>
                  <p className="text-2xl font-black text-rose-900 dark:text-rose-100 mt-1">
                    {importResult.failedCount}
                  </p>
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
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {step === 'UPLOAD' && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidationDisabled}
                className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
                className="w-full sm:w-auto py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Upload Different File
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={previewData?.validRows === 0 || importing}
                  className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
                className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer min-h-[44px] flex items-center justify-center"
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
