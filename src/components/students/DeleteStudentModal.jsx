import React from 'react';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';

export const DeleteStudentModal = ({ student, onClose, onConfirm, onDeleteConfirm, loading }) => {
  if (!student) return null;

  const handleConfirm = onConfirm || onDeleteConfirm;

  return (
    <DeleteConfirmationModal
      title="Delete Student"
      subtitle="Permanent Student Purge • Cannot Be Undone"
      entityPhoto={student.profilePhotoUrl}
      entityDetails={[
        { label: 'Student Name', value: student.fullName || student.name },
        { label: 'Student ID', value: student.studentId },
        { label: 'Roll Number', value: student.rollNumber || 'N/A' },
        { label: 'Group / Year', value: `${student.branchGroup || 'MPC'} • ${student.intermediateYear || '1st Year'}` },
        { label: 'Section', value: student.section ? `Section ${student.section}` : 'Unassigned', fullWidth: true },
      ]}
      warningList={[
        'Student Profile & Personal Records',
        'Uploaded Certificates & PDF Files from Supabase Storage',
        'Academic Section Assignment & Faculty Mappings',
        'Student QR Code, ID Card, and Linked Notifications',
      ]}
      confirmationKeyword="DELETE STUDENT"
      dangerButtonText="Delete Student"
      loading={loading}
      onClose={onClose}
      onConfirm={() => handleConfirm && handleConfirm(student.studentId || student.id)}
    />
  );
};

export default DeleteStudentModal;
