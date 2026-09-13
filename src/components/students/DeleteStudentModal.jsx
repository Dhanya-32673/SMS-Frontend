import React from 'react';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';

export const DeleteStudentModal = ({ student, onClose, onConfirm, onDeleteConfirm, loading }) => {
  if (!student) return null;

  const handleConfirm = onConfirm || onDeleteConfirm;

  return (
    <DeleteConfirmationModal
      title="Delete Student"
      subtitle="Permanent Student & Login Account Purge • Cannot Be Undone"
      entityPhoto={student.profilePhotoUrl}
      entityDetails={[
        { label: 'Student Name', value: student.fullName || student.name },
        { label: 'Student ID', value: student.studentId },
        { label: 'Admission Number', value: student.admissionNumber || student.rollNumber || '—' },
        { label: 'Group / Year', value: `${formatBranchGroup(student.branchGroup)} • ${formatIntermediateYear(student.intermediateYear)}` },
        { label: 'Campus', value: student.campus || formatSectionName(student.section), fullWidth: true },
      ]}
      warningList={[
        'Student Profile & Personal Academic Records',
        'Student Login Account & Authentication Credentials',
        'Uploaded Certificates & PDF Files from Cloud Storage',
        'Campus Assignment & Faculty Mappings',
        'Student QR Code, ID Card, and Portal Sessions',
      ]}
      confirmationKeyword="DELETE STUDENT"
      dangerButtonText="Delete Student & Login Account"
      loading={loading}
      onClose={onClose}
      onConfirm={() => handleConfirm && handleConfirm(student.studentId || student.id)}
    />
  );
};

export default DeleteStudentModal;
