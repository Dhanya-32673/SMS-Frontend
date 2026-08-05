import React, { useState } from 'react';
import StudentPhotoUpload from '../students/StudentPhotoUpload';

export const FacultyForm = ({ initialValues = {}, onSubmit, onCancel, isEdit = false, submitting = false }) => {
  const [formData, setFormData] = useState({
    employeeId: initialValues.employeeId || '',
    firstName: initialValues.firstName || '',
    middleName: initialValues.middleName || '',
    lastName: initialValues.lastName || '',
    gender: initialValues.gender || 'MALE',
    dateOfBirth: initialValues.dateOfBirth || '',
    photoUrl: initialValues.photoUrl || '',
    mobileNumber: initialValues.mobileNumber || '',
    alternateMobile: initialValues.alternateMobile || '',
    email: initialValues.email || '',
    address: initialValues.address || '',
    city: initialValues.city || 'Hyderabad',
    district: initialValues.district || 'Hyderabad',
    state: initialValues.state || 'Telangana',
    pinCode: initialValues.pinCode || '500001',
    designation: initialValues.designation || 'Lecturer',
    qualification: initialValues.qualification || 'M.Sc., B.Ed',
    department: initialValues.department || 'Mathematics & Sciences',
    primaryGroup: initialValues.primaryGroup || 'MPC',
    joiningDate: initialValues.joiningDate || new Date().toISOString().split('T')[0],
    employmentType: initialValues.employmentType || 'PERMANENT',
    experience: initialValues.experience || '5 Years',
    password: '',
    status: initialValues.status || 'ACTIVE',
  });

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, selectedPhotoFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* 1. Photo Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          Faculty Photo
        </h3>
        <StudentPhotoUpload
          photoUrl={formData.photoUrl}
          onPhotoSelect={(file, previewUrl) => {
            setSelectedPhotoFile(file);
            setFormData((prev) => ({ ...prev, photoUrl: previewUrl }));
          }}
        />
      </div>

      {/* 2. Personal Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          1. Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Ramesh"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => handleChange('middleName', e.target.value)}
              placeholder="Middle Name"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Rao"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Contact Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          2. Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              placeholder="e.g. 9849012345"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. ramesh.rao@college.edu"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alternate Mobile
            </label>
            <input
              type="tel"
              value={formData.alternateMobile}
              onChange={(e) => handleChange('alternateMobile', e.target.value)}
              placeholder="Secondary Mobile"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Residential address"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>
        </div>
      </div>

      {/* 4. Professional Information */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          3. Professional Details & Login Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              placeholder="e.g. EMP-202601"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Designation *
            </label>
            <select
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 font-semibold"
            >
              <option value="Lecturer">Lecturer</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Head of Department">Head of Department (HOD)</option>
              <option value="Principal">Principal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => handleChange('qualification', e.target.value)}
              placeholder="e.g. M.Sc., Ph.D."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Group *
            </label>
            <select
              value={formData.primaryGroup}
              onChange={(e) => handleChange('primaryGroup', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 font-bold text-[#5b50e5]"
            >
              <option value="MPC">MPC (Maths, Physics, Chem)</option>
              <option value="BiPC">BiPC (Biology, Physics, Chem)</option>
              <option value="MEC">MEC (Maths, Economics, Commerce)</option>
              <option value="CEC">CEC (Civics, Economics, Commerce)</option>
              <option value="HEC">HEC (History, Economics, Civics)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Employment Type
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => handleChange('employmentType', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            >
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="GUEST">Guest / Visiting</option>
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Login Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Initial login password"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Controls */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-xs font-bold text-white bg-[#5b50e5] hover:bg-[#4b40d5] rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center"
        >
          {submitting ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving Faculty...
            </>
          ) : (
            isEdit ? 'Update Faculty' : 'Save Faculty'
          )}
        </button>
      </div>
    </form>
  );
};

export default FacultyForm;
