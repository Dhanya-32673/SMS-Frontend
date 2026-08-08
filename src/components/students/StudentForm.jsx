import React, { useEffect, useState } from 'react';
import StudentPhotoUpload from './StudentPhotoUpload';
import { useAuth } from '../../context/AuthContext';
import facultyService from '../../services/facultyService';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const StudentForm = ({ initialValues = {}, onSubmit, onCancel, isEdit = false, submitting = false }) => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'FACULTY';

  const [facultyAssignments, setFacultyAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(isFaculty);

  const [formData, setFormData] = useState({
    rollNumber: initialValues.rollNumber || '',
    admissionNumber: initialValues.admissionNumber || '',
    firstName: initialValues.firstName || '',
    middleName: initialValues.middleName || '',
    lastName: initialValues.lastName || '',
    fullName: initialValues.fullName || '',
    gender: initialValues.gender || '',
    dateOfBirth: initialValues.dateOfBirth || '',
    bloodGroup: initialValues.bloodGroup || '',
    nationality: initialValues.nationality || '',
    religion: initialValues.religion || '',
    casteCategory: initialValues.casteCategory || '',
    aadhaarNumber: initialValues.aadhaarNumber || '',
    panNumber: initialValues.panNumber || '',
    identificationMarks: initialValues.identificationMarks || '',
    profilePhotoUrl: initialValues.profilePhotoUrl || '',
    status: initialValues.status || '',

    // Contact
    mobileNumber: initialValues.mobileNumber || '',
    alternateMobile: initialValues.alternateMobile || '',
    email: initialValues.email || '',
    address: initialValues.address || '',
    city: initialValues.city || '',
    district: initialValues.district || '',
    state: initialValues.state || '',
    pinCode: initialValues.pinCode || '',
    country: initialValues.country || '',

    // Parent
    fatherName: initialValues.fatherName || '',
    motherName: initialValues.motherName || '',
    parentMobile: initialValues.parentMobile || '',
    parentEmail: initialValues.parentEmail || '',
    occupation: initialValues.occupation || '',
    annualIncome: initialValues.annualIncome || '',

    // Academic
    universityId: initialValues.universityId || '',
    department: initialValues.department || '',
    branchGroup: initialValues.branchGroup || '',
    intermediateYear: initialValues.intermediateYear || '',
    semester: initialValues.semester || '',
    section: initialValues.section || '',
    batch: initialValues.batch || '',
    academicYear: initialValues.academicYear || '',
    admissionDate: initialValues.admissionDate || '',
    regulation: initialValues.regulation || '',
    admissionType: initialValues.admissionType || '',
    hostelDayScholar: initialValues.hostelDayScholar || '',
    medium: initialValues.medium || '',
  });

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
              section: first.section || prev.section,
              academicYear: first.academicYear || prev.academicYear
            }));
          }
        })
        .catch((err) => console.error("Failed to load faculty assignments:", err))
        .finally(() => setLoadingAssignments(false));
    }
  }, [isFaculty, isEdit]);

  // Derived options for Faculty
  const allGroups = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC', 'Other'];
  const allYears = ['1st Year', '2nd Year'];
  const allSections = ['A', 'B', 'C', 'D'];

  const availableGroups = isFaculty && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.branchGroup)))
    : allGroups;

  const availableYears = isFaculty && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.filter(a => a.branchGroup === formData.branchGroup).map(a => a.intermediateYear)))
    : allYears;

  const availableSections = isFaculty && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.filter(a => a.branchGroup === formData.branchGroup && a.intermediateYear === formData.intermediateYear).map(a => a.section)))
    : allSections;

  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (isFaculty && facultyAssignments.length > 0) {
        if (field === 'branchGroup') {
          const yearsForGrp = facultyAssignments.filter(a => a.branchGroup === value).map(a => a.intermediateYear);
          if (yearsForGrp.length > 0 && !yearsForGrp.includes(updated.intermediateYear)) {
            updated.intermediateYear = yearsForGrp[0];
          }
          const secsForGrpYr = facultyAssignments.filter(a => a.branchGroup === value && a.intermediateYear === updated.intermediateYear).map(a => a.section);
          if (secsForGrpYr.length > 0 && !secsForGrpYr.includes(updated.section)) {
            updated.section = secsForGrpYr[0];
          }
        } else if (field === 'intermediateYear') {
          const secsForGrpYr = facultyAssignments.filter(a => a.branchGroup === updated.branchGroup && a.intermediateYear === value).map(a => a.section);
          if (secsForGrpYr.length > 0 && !secsForGrpYr.includes(updated.section)) {
            updated.section = secsForGrpYr[0];
          }
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Do not send temporary blob: URLs to backend
    const payload = { ...formData };
    if (payload.profilePhotoUrl && payload.profilePhotoUrl.startsWith('blob:')) {
      delete payload.profilePhotoUrl;
    }
    onSubmit(payload, selectedPhotoFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* 1. Student Photo Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          Student Photo
        </h3>
        <StudentPhotoUpload
          photoUrl={formData.profilePhotoUrl}
          onPhotoSelect={(file) => {
            setSelectedPhotoFile(file);
          }}
        />
      </div>

      {/* 2. Personal Information Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          1. Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Roll Number *
            </label>
            <input
              type="text"
              required
              value={formData.rollNumber}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              placeholder="e.g. 26INT101"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admission Number
            </label>
            <input
              type="text"
              value={formData.admissionNumber}
              onChange={(e) => handleChange('admissionNumber', e.target.value)}
              placeholder="e.g. ADM202688"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="First Name"
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
              placeholder="Last Name"
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
              <option value="" disabled>Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            >
              <option value="" disabled>Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nationality
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="e.g. Indian"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Caste Category
            </label>
            <input
              type="text"
              value={formData.casteCategory}
              onChange={(e) => handleChange('casteCategory', e.target.value)}
              placeholder="e.g. General / OBC / SC / ST"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Aadhaar Number (Optional)
            </label>
            <input
              type="text"
              maxLength={12}
              value={formData.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
              placeholder="12 digit Aadhaar"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              PAN Number (Optional)
            </label>
            <input
              type="text"
              maxLength={10}
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
              placeholder="10 char PAN (e.g. ABCDE1234F)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Identification Marks
            </label>
            <input
              type="text"
              value={formData.identificationMarks}
              onChange={(e) => handleChange('identificationMarks', e.target.value)}
              placeholder="e.g. Mole on left cheek"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Contact Information Card */}
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
              placeholder="e.g. 9876543210"
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
              placeholder="Secondary contact"
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
              placeholder="e.g. student@college.edu"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street address / House No"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter City"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              District *
            </label>
            <input
              type="text"
              required
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="Enter District"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Enter State"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              PIN Code *
            </label>
            <input
              type="text"
              required
              value={formData.pinCode}
              onChange={(e) => handleChange('pinCode', e.target.value)}
              placeholder="Enter PIN Code"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Country *
            </label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Enter Country"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>
        </div>
      </div>

      {/* 4. Parent / Guardian Details Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          3. Parent / Guardian Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Father Name *
            </label>
            <input
              type="text"
              required
              value={formData.fatherName}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              placeholder="Father's full name"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mother Name *
            </label>
            <input
              type="text"
              required
              value={formData.motherName}
              onChange={(e) => handleChange('motherName', e.target.value)}
              placeholder="Mother's full name"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parent Mobile *
            </label>
            <input
              type="tel"
              required
              value={formData.parentMobile}
              onChange={(e) => handleChange('parentMobile', e.target.value)}
              placeholder="Parent mobile number"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Parent Email
            </label>
            <input
              type="email"
              value={formData.parentEmail}
              onChange={(e) => handleChange('parentEmail', e.target.value)}
              placeholder="Parent email"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Occupation
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="e.g. Business / Government Employee"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Annual Income (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.annualIncome}
              onChange={(e) => handleChange('annualIncome', e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>
        </div>
      </div>

      {/* 5. Academic Information Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b pb-2.5 dark:border-slate-800">
          4. Academic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Intermediate Group / Branch * {isFaculty && <span className="text-blue-600 text-[10px]">(Assigned)</span>}
            </label>
            <select
              value={formData.branchGroup}
              onChange={(e) => handleChange('branchGroup', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 font-bold text-blue-600"
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
              value={formData.intermediateYear}
              onChange={(e) => handleChange('intermediateYear', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 font-semibold"
            >
              <option value="" disabled>Select Year</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Section * {isFaculty && <span className="text-blue-600 text-[10px]">(Assigned)</span>}
            </label>
            <select
              value={formData.section}
              onChange={(e) => handleChange('section', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20 font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="" disabled>Select Section</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

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
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admission Date *
            </label>
            <input
              type="date"
              required
              value={formData.admissionDate}
              onChange={(e) => handleChange('admissionDate', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hostel / Day Scholar *
            </label>
            <select
              value={formData.hostelDayScholar}
              onChange={(e) => handleChange('hostelDayScholar', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            >
              <option value="" disabled>Select Hostel Type</option>
              <option value="DAY_SCHOLAR">Day Scholar</option>
              <option value="HOSTELLER">Hosteller</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Medium
            </label>
            <input
              type="text"
              value={formData.medium}
              onChange={(e) => handleChange('medium', e.target.value)}
              placeholder="e.g. English / Telugu"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#5b50e5] focus:ring-2 focus:ring-[#5b50e5]/20"
            >
              <option value="" disabled>Select Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DISCONTINUED">DISCONTINUED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
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
