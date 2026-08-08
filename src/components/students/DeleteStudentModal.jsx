import React from 'react';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';

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
        { label: 'Group / Year', value: `${formatBranchGroup(student.branchGroup)} • ${formatIntermediateYear(student.intermediateYear)}` },
        { label: 'Section', value: formatSectionName(student.section), fullWidth: true },
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
