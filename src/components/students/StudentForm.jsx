import React, { useEffect, useState } from 'react';
import StudentPhotoUpload from './StudentPhotoUpload';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';

import { OFFICIAL_CAMPUSES } from '../../services/academicService';

export const StudentForm = ({ initialValues = {}, onSubmit, onCancel, isEdit = false, submitting = false }) => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'FACULTY';

  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(isFaculty);

  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    studentId: initialValues.studentId || '',
    admissionNumber: initialValues.admissionNumber || '',
    fullName: initialValues.fullName || '',
    gender: initialValues.gender || '',
    dateOfBirth: initialValues.dateOfBirth || '',
    nationality: initialValues.nationality || 'Indian',
    religion: initialValues.religion || '',
    category: initialValues.category || '',
    aadhaarNumber: initialValues.aadhaarNumber || '',
    profilePhotoUrl: initialValues.profilePhotoUrl || '',

    // Section 2: Contact Information
    mobileNumber: initialValues.mobileNumber || '',
    alternateMobile: initialValues.alternateMobile || '',
    emailAddress1: initialValues.emailAddress1 || initialValues.email || '',
    emailAddress2: initialValues.emailAddress2 || '',

    // Section 3: Family Information
    fatherName: initialValues.fatherName || '',
    motherName: initialValues.motherName || '',

    // Section 4: Academic Information
    academicYear: initialValues.academicYear || '',
    branchGroup: initialValues.branchGroup || '',
    intermediateYear: initialValues.intermediateYear || '',
    batch: initialValues.batch || '',
    admissionType: initialValues.admissionType || 'REGULAR',
    hostelDayScholar: initialValues.hostelDayScholar || 'DAY_SCHOLAR',
    campus: initialValues.campus || '',

    // Technical Fields
    status: initialValues.status || 'ACTIVE',
    section: initialValues.section || 'Unassigned',
  });

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        nationality: initialValues.nationality || prev.nationality || 'Indian',
        emailAddress1: initialValues.emailAddress1 || initialValues.email || prev.emailAddress1 || '',
        admissionType: initialValues.admissionType || prev.admissionType || 'REGULAR',
        hostelDayScholar: initialValues.hostelDayScholar || prev.hostelDayScholar || 'DAY_SCHOLAR',
        status: initialValues.status || prev.status || 'ACTIVE',
        profilePhotoUrl: initialValues.profilePhotoUrl || prev.profilePhotoUrl || '',
      }));
    }
  }, [initialValues]);

  useEffect(() => {
    if (isFaculty) {
      facultyService.getCurrentFacultyAssignments()
        .then((data) => {
          const activeAssignments = (data || []).filter(a => a.active);
          setFacultyAssignments(activeAssignments);
          if (activeAssignments.length > 0 && !isEdit) {
            const first = activeAssignments[0];
            setFormData(prev => ({
              ...prev,
              branchGroup: first.branchGroup || prev.branchGroup,
              intermediateYear: first.intermediateYear || prev.intermediateYear,
              section: (first.section || prev.section || 'Unassigned').replace(/^section\s+/i, '').trim(),
              academicYear: first.academicYear || prev.academicYear
            }));
          }
        })
        .catch((err) => console.error("Failed to load faculty assignments:", err))
        .finally(() => setLoadingAssignments(false));
    }
  }, [isFaculty, isEdit]);

  // Derived options for Groups and Years
  const allGroups = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
  const allYears = ['1st Year', '2nd Year'];

  const availableGroups = isFaculty && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.branchGroup).filter(Boolean)))
    : allGroups;

  const availableYears = isFaculty && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.filter(a => a.branchGroup === formData.branchGroup).map(a => a.intermediateYear).filter(Boolean)))
    : allYears;

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (isFaculty && facultyAssignments.length > 0) {
        if (field === 'branchGroup') {
          const yearsForGrp = facultyAssignments.filter(a => a.branchGroup === value).map(a => a.intermediateYear);
          if (yearsForGrp.length > 0 && !yearsForGrp.includes(updated.intermediateYear)) {
            updated.intermediateYear = yearsForGrp[0];
          }
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    // Trim string fields
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
      }
    });

    if (payload.profilePhotoUrl && payload.profilePhotoUrl.startsWith('blob:')) {
      delete payload.profilePhotoUrl;
    }

    onSubmit(payload, selectedPhotoFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* 1. Student Photo & Basic Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          1. Basic Information
        </h3>

        {/* Profile Photo Component */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Profile Photo
          </label>
          <StudentPhotoUpload
            photoUrl={formData.profilePhotoUrl}
            studentName={formData.fullName || 'Student'}
            studentId={initialValues?.studentId || formData.studentId || ''}
            uploading={submitting && !!selectedPhotoFile}
            disabled={submitting}
            onPhotoSelect={(file, previewUrl) => {
              setSelectedPhotoFile(file);
              if (file === null) {
                setFormData(prev => ({ ...prev, profilePhotoUrl: previewUrl || '' }));
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student ID {isEdit ? '(Read-only)' : '(Auto-generated if omitted)'}
            </label>
            <input
              type="text"
              disabled={isEdit}
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              placeholder="e.g. STU2026001001"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admission Number *
            </label>
            <input
              type="text"
              required
              value={formData.admissionNumber}
              onChange={(e) => handleChange('admissionNumber', e.target.value)}
              placeholder="e.g. 001245 or ADM202688"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Full Name as per official records"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gender *
            </label>
            <select
              required
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="" disabled>Select Gender</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nationality
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="Default: Indian"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Religion
            </label>
            <input
              type="text"
              value={formData.religion}
              onChange={(e) => handleChange('religion', e.target.value)}
              placeholder="e.g. Hindu / Muslim / Christian"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select Category</option>
              <option value="OC">OC (Open Competition)</option>
              <option value="BC-A">BC-A</option>
              <option value="BC-B">BC-B</option>
              <option value="BC-C">BC-C</option>
              <option value="BC-D">BC-D</option>
              <option value="BC-E">BC-E</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="General">General</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Aadhaar Number (12 Digits)
            </label>
            <input
              type="text"
              maxLength={12}
              pattern="^[0-9]{12}$"
              value={formData.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="12 digit Aadhaar number"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          2. Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              pattern="^[0-9]{10,15}$"
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="Primary mobile (10-15 digits)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alternate Mobile
            </label>
            <input
              type="tel"
              pattern="^$|^[0-9]{10,15}$"
              value={formData.alternateMobile}
              onChange={(e) => handleChange('alternateMobile', e.target.value.replace(/\D/g, ''))}
              placeholder="Secondary mobile (10-15 digits)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address - 1 *
            </label>
            <input
              type="email"
              required
              value={formData.emailAddress1}
              onChange={(e) => handleChange('emailAddress1', e.target.value)}
              placeholder="Primary official email address"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address - 2 *
            </label>
            <input
              type="email"
              required
              value={formData.emailAddress2}
              onChange={(e) => handleChange('emailAddress2', e.target.value)}
              placeholder="Secondary/parent email address"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Family Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          3. Family Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Father Name *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.fatherName}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              placeholder="Father's full name"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mother Name *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.motherName}
              onChange={(e) => handleChange('motherName', e.target.value)}
              placeholder="Mother's full name"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 4. Academic Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          4. Academic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Academic Year *
            </label>
            <input
              type="text"
              required
              value={formData.academicYear}
              onChange={(e) => handleChange('academicYear', e.target.value)}
              placeholder="e.g. 2026-2027"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Branch / Group * {isFaculty && <span className="text-blue-600 text-[10px]">(Assigned)</span>}
            </label>
            <select
              required
              value={formData.branchGroup}
              onChange={(e) => handleChange('branchGroup', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-600"
            >
              <option value="" disabled>Select Group</option>
              {availableGroups.map(grp => (
                <option key={grp} value={grp}>{grp}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Intermediate Year * {isFaculty && <span className="text-blue-600 text-[10px]">(Assigned)</span>}
            </label>
            <select
              required
              value={formData.intermediateYear}
              onChange={(e) => handleChange('intermediateYear', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-semibold"
            >
              <option value="" disabled>Select Year</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Batch *
            </label>
            <input
              type="text"
              required
              value={formData.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              placeholder="e.g. 2026-2028"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admission Type
            </label>
            <select
              value={formData.admissionType}
              onChange={(e) => handleChange('admissionType', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="REGULAR">REGULAR</option>
              <option value="MANAGEMENT">MANAGEMENT</option>
              <option value="SPORTS">SPORTS</option>
              <option value="CONCESSION">CONCESSION</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hostel / Day Scholar *
            </label>
            <select
              required
              value={formData.hostelDayScholar}
              onChange={(e) => handleChange('hostelDayScholar', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="DAY_SCHOLAR">DAY_SCHOLAR</option>
              <option value="HOSTEL">HOSTEL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campus *
            </label>
            <select
              value={formData.campus || ''}
              onChange={(e) => handleChange('campus', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-bold text-blue-600"
            >
              <option value="">Select Campus</option>
              {OFFICIAL_CAMPUSES.map((cmp) => (
                <option key={cmp} value={cmp}>
                  {cmp}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center min-h-[44px] cursor-pointer"
        >
          {submitting ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving Student...
            </>
          ) : (
            isEdit ? 'Update Student' : 'Save Student'
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
