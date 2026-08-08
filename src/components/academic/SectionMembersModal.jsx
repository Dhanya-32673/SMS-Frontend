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
      console.error('Failed deleting student:', err);
      setError('Failed to delete student record.');
    } finally {
      setDeletingStudent(false);
    }
  };

  if (!section) return null;

  const isAllSelected = members.length > 0 && selectedIds.length === members.length;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Section {section.name} Members
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Academic Year: <span className="font-bold text-slate-700 dark:text-slate-300">{section.academicYear}</span> • Total Students: <span className="font-bold text-purple-600 dark:text-purple-400">{members.length}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isAdmin && selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkUnassign}
                  disabled={bulkUnassigning}
                  className="py-2 px-3.5 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 rounded-xl border border-amber-300/80 inline-flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <UserX className="w-4 h-4 text-amber-600" />
                  <span>Unassign Selected ({selectedIds.length})</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="py-2.5 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-500/20 inline-flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Students</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6 overflow-y-auto flex-1">
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
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No students currently assigned to Section {section.name}</p>
                {isAdmin && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="py-2 px-4 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign First Student</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                      {isAdmin && (
                        <th className="p-3.5 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                          />
                        </th>
                      )}
                      <th className="p-3.5 px-4">Student ID</th>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Admission No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Group</th>
                      <th className="p-3.5">Year</th>
                      <th className="p-3.5">Mobile</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {members.map((student) => {
                      const sid = student.studentId || student.id;
                      const isSelected = selectedIds.includes(sid);
                      return (
                        <tr key={sid} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${isSelected ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''}`}>
                          {isAdmin && (
                            <td className="p-3.5 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(sid)}
                                className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="p-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">{student.studentId}</td>
                          <td className="p-3.5 font-medium">{student.rollNumber || 'N/A'}</td>
                          <td className="p-3.5 text-slate-500">{student.admissionNumber || 'N/A'}</td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{student.fullName || student.name}</td>
                          <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{formatBranchGroup(student.branchGroup)}</td>
                          <td className="p-3.5 text-slate-500">{formatIntermediateYear(student.intermediateYear)}</td>
                          <td className="p-3.5 font-mono text-slate-500">{student.mobileNumber || 'N/A'}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              student.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            }`}>
                              {student.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-3.5 pr-4 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                onClose();
                                navigate(`/admin/students/${student.studentId}`);
                              }}
                              title="View Student Profile"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition inline-flex items-center cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => setStudentToRemove(student)}
                                title="Unassign Student from Section"
                                className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition inline-flex items-center cursor-pointer"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => setStudentToDelete(student)}
                                title="Delete Student Record"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition inline-flex items-center cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              {selectedIds.length > 0 ? `${selectedIds.length} student(s) selected` : `${members.length} student(s) listed`}
            </span>
            <button
              onClick={onClose}
              className="py-2 px-5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

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

      {/* Unassign Student From Section Modal */}
      {studentToRemove && (
        <DeleteConfirmationModal
          title="Unassign Student From Section"
          subtitle="Section Unassignment Only"
          entityPhoto={studentToRemove.profilePhotoUrl}
          entityDetails={[
            { label: 'Student Name', value: studentToRemove.fullName || studentToRemove.name },
            { label: 'Student ID', value: studentToRemove.studentId },
            { label: 'Roll Number', value: studentToRemove.rollNumber },
            { label: 'Section', value: `Section ${section.name}` },
          ]}
          warningList={[
            `Unassign from Section ${section.name}`,
            'Note: Student profile, records, and certificates will NOT be deleted',
          ]}
          confirmationKeyword="REMOVE STUDENT"
          dangerButtonText="Unassign Student"
          loading={removing}
          onClose={() => setStudentToRemove(null)}
          onConfirm={handleConfirmRemoveStudent}
        />
      )}

      {/* Delete Student Record Modal */}
      {studentToDelete && (
        <DeleteStudentModal
          student={studentToDelete}
          loading={deletingStudent}
          onClose={() => setStudentToDelete(null)}
          onConfirm={handleConfirmDeleteStudent}
        />
      )}

      {/* Bulk Unassign Confirmation Modal */}
      {showBulkUnassignConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Confirm Student Unassignment</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to unassign <strong className="text-slate-900 dark:text-white">{selectedIds.length} selected student(s)</strong> from this section?
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-800 dark:text-slate-200">This action will:</p>
              <ul className="space-y-1 list-disc ml-4">
                <li>Remove the student(s) from the current section.</li>
                <li>Update the database immediately.</li>
                <li>The student records will <strong className="text-slate-800 dark:text-white">NOT</strong> be deleted.</li>
                <li>Only the section assignment will be removed.</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                autoFocus
                onClick={() => setShowBulkUnassignConfirm(false)}
                disabled={bulkUnassigning}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUnassignConfirmed}
                disabled={bulkUnassigning}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {bulkUnassigning ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Unassigning...
                  </>
                ) : (
                  'Unassign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionMembersModal;
