import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, Eye, X, AlertCircle, UserX, CheckSquare, Square } from 'lucide-react';
import { academicService } from '../../services/academicService';
import studentService from '../../services/studentService';
import { formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';
import AssignStudentsModal from './AssignStudentsModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DeleteStudentModal from '../students/DeleteStudentModal';

export const SectionMembersModal = ({ section, onClose, onUpdated, isAdmin = true }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [removing, setRemoving] = useState(false);
  const [bulkUnassigning, setBulkUnassigning] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [showBulkUnassignConfirm, setShowBulkUnassignConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const targetSectionId = section?.id || section?.sectionId;

  useEffect(() => {
    fetchMembers();
  }, [section]);

  const fetchMembers = async () => {
    if (!targetSectionId) return;
    setLoading(true);
    setError('');
    try {
      const data = await academicService.getSectionMembers(targetSectionId);
      setMembers(data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to load section members:', err);
      setError('Failed to load section members');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(members.map((m) => m.studentId || m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkUnassign = () => {
    if (selectedIds.length === 0 || bulkUnassigning) return;
    setShowBulkUnassignConfirm(true);
  };

  const handleBulkUnassignConfirmed = async () => {
    setShowBulkUnassignConfirm(false);
    setBulkUnassigning(true);
    setError('');
    setSuccessMessage('');
    try {
      await academicService.removeStudentsFromSection(targetSectionId, selectedIds);
      setSuccessMessage(`${selectedIds.length} student(s) unassigned successfully.`);
      setSelectedIds([]);
      fetchMembers();
      if (onUpdated) onUpdated();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed bulk unassigning students:', err);
      setError(err.response?.data?.message || err.response?.data || err.message || 'Failed to unassign selected students');
    } finally {
      setBulkUnassigning(false);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove || removing) return;

    setRemoving(true);
    try {
      const studentName = studentToRemove.fullName || studentToRemove.name || 'Student';
      await academicService.removeStudentFromSection(targetSectionId, studentToRemove.studentId || studentToRemove.id);
      setSuccessMessage(`${studentName} unassigned successfully.`);
      setStudentToRemove(null);
      fetchMembers();
      if (onUpdated) onUpdated();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student from section');
    } finally {
      setRemoving(false);
    }
  };

  const handleConfirmDeleteStudent = async (studentIdParam) => {
    if (deletingStudent) return;
    const targetId = studentIdParam || studentToDelete?.studentId || studentToDelete?.id;
    if (!targetId) return;

    setDeletingStudent(true);
    try {
      await studentService.deleteStudent(targetId);
      setStudentToDelete(null);
      fetchMembers();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete student profile');
    } finally {
      setDeletingStudent(false);
    }
  };

  const isAllSelected = members.length > 0 && selectedIds.length === members.length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
        <div className="bg-white dark:bg-slate-900 w-[calc(100%-16px)] sm:w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                {section?.name || 'S'}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Section {section?.name} Members
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {section?.branchGroup} • {section?.intermediateYear} ({members.length} Enrolled)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isAdmin && (
                <>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkUnassign}
                      disabled={bulkUnassigning}
                      className="py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 min-h-[36px]"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Unassign ({selectedIds.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="py-2 px-3.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition inline-flex items-center space-x-1.5 cursor-pointer min-h-[36px]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Assign Students</span>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2 animate-fadeIn">
                <span className="w-4 h-4 text-emerald-600 shrink-0">✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading section members...</div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No students currently assigned to Section {section?.name}</p>
                {isAdmin && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="py-2 px-4 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition inline-flex items-center space-x-1.5 cursor-pointer min-h-[40px]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign First Student</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Stacked Card View (< md) */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {members.map((student) => {
                    const sid = student.studentId || student.id;
                    const isSelected = selectedIds.includes(sid);
                    return (
                      <div key={sid} className={`p-3.5 space-y-2 rounded-2xl transition ${isSelected ? 'bg-purple-50/50 dark:bg-purple-950/30' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(sid)}
                                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.fullName || student.name}</h4>
                              <p className="text-[11px] font-mono text-blue-600 font-bold">{student.studentId}</p>
                              <p className="text-[10px] text-slate-400">Roll: {student.rollNumber || 'N/A'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            student.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {student.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/admin/students/${student.studentId}`);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setStudentToRemove(student)}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Unassign"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View (md+) */}
                <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {isAdmin && (
                          <th className="p-3.5 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleSelectAll}
                              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="p-3.5 px-4">Student ID</th>
                        <th className="p-3.5">Roll No</th>
                        <th className="p-3.5">Admission No</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Group</th>
                        <th className="p-3.5">Year</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {members.map((student) => {
                        const sid = student.studentId || student.id;
                        const isSelected = selectedIds.includes(sid);
                        return (
                          <tr key={sid} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}`}>
                            {isAdmin && (
                              <td className="p-3.5 px-4">
                                <input
                                 type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(sid)}
                                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                            )}
                            <td className="p-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{student.studentId}</td>
                            <td className="p-3.5 font-medium">{student.rollNumber || 'N/A'}</td>
                            <td className="p-3.5 text-slate-500">{student.admissionNumber || 'N/A'}</td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">{student.fullName || student.name}</td>
                            <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{formatBranchGroup(student.branchGroup)}</td>
                            <td className="p-3.5 text-slate-500">{formatIntermediateYear(student.intermediateYear)}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                student.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              }`}>
                                {student.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="p-3.5 pr-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate(`/admin/students/${student.studentId}`);
                                }}
                                title="View Student Profile"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition inline-flex items-center cursor-pointer min-w-[32px] min-h-[32px]"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => setStudentToRemove(student)}
                                  title="Unassign Student from Section"
                                  className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition inline-flex items-center cursor-pointer min-w-[32px] min-h-[32px]"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assign Students Modal */}
      {showAssignModal && (
        <AssignStudentsModal
          section={section}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            fetchMembers();
            if (onUpdated) onUpdated();
          }}
        />
      )}

      {/* Unassign Single Student Confirmation Modal */}
      {studentToRemove && (
        <DeleteConfirmationModal
          isOpen={!!studentToRemove}
          title="Unassign Student from Section"
          subtitle="Section Membership Removal"
          entityDetails={[
            { label: 'Student Name', value: studentToRemove.fullName || studentToRemove.name },
            { label: 'Student ID', value: studentToRemove.studentId },
            { label: 'Section', value: `Section ${section.name}` },
          ]}
          warningList={[
            'Removes this student from this section roster',
            'Student record itself is NOT deleted and remains active in Student Directory',
          ]}
          dangerButtonText="Unassign Student"
          loading={removing}
          onClose={() => setStudentToRemove(null)}
          onConfirm={handleConfirmRemoveStudent}
        />
      )}

      {/* Bulk Unassign Confirmation Modal */}
      {showBulkUnassignConfirm && (
        <DeleteConfirmationModal
          isOpen={showBulkUnassignConfirm}
          title={`Unassign ${selectedIds.length} Students`}
          subtitle="Bulk Section Removal"
          entityDetails={[
            { label: 'Section', value: `Section ${section.name}` },
            { label: 'Selected Students', value: `${selectedIds.length} student(s)` },
          ]}
          warningList={[
            'Removes all selected students from Section ' + section.name,
            'Students will remain active in the college directory',
          ]}
          dangerButtonText="Unassign Selected"
          loading={bulkUnassigning}
          onClose={() => setShowBulkUnassignConfirm(false)}
          onConfirm={handleBulkUnassignConfirmed}
        />
      )}
    </>
  );
};

export default SectionMembersModal;
