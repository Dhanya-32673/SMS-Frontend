import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, CheckSquare, Square, Users, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { academicService } from '../../services/academicService';

export const AssignStudentsModal = ({ section, onClose, onAssigned }) => {
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
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchAvailableStudents(val);
  };

  const toggleSelect = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.studentId || s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0 || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await academicService.assignStudentsToSection(section.id, selectedIds);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign students to section');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Assign Students to Section {section.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Academic Year: {section.academicYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline px-2 py-1 shrink-0"
            >
              {selectedIds.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Student Selection List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading available students...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching students found</div>
            ) : (
              students.map((student) => {
                const sId = student.studentId || student.id;
                const isChecked = selectedIds.includes(sId);

                return (
                  <div
                    key={sId}
                    onClick={() => toggleSelect(sId)}
                    className={`p-3 px-4 flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? 'bg-purple-50/60 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-purple-600 dark:text-purple-400">
                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{student.fullName || student.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {student.studentId} • Roll: {student.rollNumber} • {student.branchGroup || 'MPC'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {student.section ? `Section ${student.section}` : 'Unassigned'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedIds.length} student(s) selected
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || submitting}
              className="py-2.5 px-5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition"
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
