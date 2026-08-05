import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Trash2, Eye, X, AlertCircle } from 'lucide-react';
import { academicService } from '../../services/academicService';
import AssignStudentsModal from './AssignStudentsModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

export const SectionMembersModal = ({ section, onClose, onUpdated, isAdmin = true }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [section]);

  const fetchMembers = async () => {
    if (!section) return;
    setLoading(true);
    setError('');
    try {
      const data = await academicService.getSectionMembers(section.id);
      setMembers(data || []);
    } catch (err) {
      setError('Failed to load section members');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove || removing) return;

    setRemoving(true);
    try {
      await academicService.removeStudentFromSection(section.id, studentToRemove.studentId || studentToRemove.id);
      setStudentToRemove(null);
      fetchMembers();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student from section');
    } finally {
      setRemoving(false);
    }
  };

  if (!section) return null;

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
                    {members.map((student) => (
                      <tr key={student.studentId || student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">{student.studentId}</td>
                        <td className="p-3.5 font-medium">{student.rollNumber || 'N/A'}</td>
                        <td className="p-3.5 text-slate-500">{student.admissionNumber || 'N/A'}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{student.fullName || student.name}</td>
                        <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{student.branchGroup || 'MPC'}</td>
                        <td className="p-3.5 text-slate-500">{student.intermediateYear || '1st Year'}</td>
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
                            title="View Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition inline-flex items-center cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setStudentToRemove(student)}
                              title="Remove From Section"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition inline-flex items-center cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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

      {/* Remove Student From Section Confirmation Modal */}
      {studentToRemove && (
        <DeleteConfirmationModal
          title="Remove Student From Section"
          subtitle="Section Unassignment Only"
          entityPhoto={studentToRemove.profilePhotoUrl}
          entityDetails={[
            { label: 'Student Name', value: studentToRemove.fullName || studentToRemove.name },
            { label: 'Student ID', value: studentToRemove.studentId },
            { label: 'Roll Number', value: studentToRemove.rollNumber },
            { label: 'Section', value: `Section ${section.name}` },
          ]}
          warningList={[
            `Section assignment for Section ${section.name}`,
            'Note: Student profile and certificates will NOT be deleted',
          ]}
          confirmationKeyword="REMOVE STUDENT"
          dangerButtonText="Remove Student"
          loading={removing}
          onClose={() => setStudentToRemove(null)}
          onConfirm={handleConfirmRemoveStudent}
        />
      )}
    </>
  );
};

export default SectionMembersModal;
