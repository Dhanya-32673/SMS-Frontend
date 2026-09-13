import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, CheckSquare, Square, Users, AlertCircle, Building2 } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import { useToast } from '../../context/ToastContext';
import { formatBranchGroup } from '../../utils/studentDataFormatter';

export const AssignStudentsModal = (props) => {
  const { onClose, onAssigned } = props;
  const targetCampus = props.campus || props.section;
  const campusId = targetCampus?.id || targetCampus?.campusId;
  const campusName = targetCampus?.name || targetCampus?.campusName || '';

  const { showSuccess, showError } = useToast();
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableStudents('');
  }, []);

  const fetchAvailableStudents = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await studentService.searchStudents(searchQuery);
      setStudents(res || []);
    } catch (err) {
      setError('Failed to fetch students from directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchAvailableStudents(val);
  };

  const isAlreadyInThisCampus = (student) => {
    if (!student || !campusName) return false;
    const studentCampus = (student.campus || '').trim().toLowerCase();
    const currentCampus = campusName.trim().toLowerCase();
    return studentCampus === currentCampus;
  };

  const toggleSelect = (studentId, student) => {
    if (isAlreadyInThisCampus(student)) return;
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const eligibleStudents = students.filter((s) => !isAlreadyInThisCampus(s));

  const toggleSelectAll = () => {
    const eligibleIds = eligibleStudents.map((s) => s.studentId || s.id);
    if (selectedIds.length === eligibleIds.length && eligibleIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleIds);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0 || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await academicService.assignStudentsToCampus(campusId, selectedIds);
      showSuccess(`Students assigned to ${campusName} successfully.`);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to assign students to Campus ${campusName}`;
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 sm:pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Assign Students to Campus {campusName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {targetCampus?.code ? `Campus Code: ${targetCampus.code}` : 'Select eligible students to allocate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search bar & Select All */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search by student name, ID, or roll number..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 shrink-0 cursor-pointer"
            >
              {selectedIds.length === eligibleStudents.length && eligibleStudents.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Student Selection List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mb-2" />
                <p>Loading available students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching students found</div>
            ) : (
              students.map((student) => {
                const sId = student.studentId || student.id;
                const isAssignedToThisCampus = isAlreadyInThisCampus(student);
                const isChecked = selectedIds.includes(sId);

                return (
                  <div
                    key={sId}
                    onClick={() => toggleSelect(sId, student)}
                    className={`p-3 px-4 flex items-center justify-between transition ${
                      isAssignedToThisCampus
                        ? 'opacity-60 bg-slate-50/50 dark:bg-slate-800/30 cursor-not-allowed'
                        : isChecked
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 cursor-pointer'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600 dark:text-blue-400">
                        {isAssignedToThisCampus ? (
                          <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            —
                          </div>
                        ) : isChecked ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {student.fullName || student.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{student.studentId}</span>
                          {' • '}
                          <span>Adm: {student.admissionNumber || student.rollNumber || '—'}</span>
                          {' • '}
                          <span>Group: {formatBranchGroup(student.branchGroup)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isAssignedToThisCampus ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          Already Assigned
                        </span>
                      ) : student.campus ? (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                          Campus: {student.campus}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium tracking-wider px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Campus: Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {selectedIds.length} student(s) selected
          </span>
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-xl transition min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || submitting}
              className="py-2.5 px-5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              {submitting ? 'Assigning...' : 'Assign Selected Students'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsModal;
