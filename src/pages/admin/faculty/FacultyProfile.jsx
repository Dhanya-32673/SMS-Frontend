import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import facultyService from '../../../services/facultyService';
import academicService from '../../../services/academicService';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Layers,
  Users,
  PlusCircle,
  Edit,
  CheckCircle,
  Calendar,
  Award,
  BookOpen,
  ChevronLeft,
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  AlertCircle,
  Trash2
} from 'lucide-react';

export const FacultyProfile = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  // New assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allSections, setAllSections] = useState([]);
  const [assignError, setAssignError] = useState('');
  const [assignForm, setAssignForm] = useState({
    branchGroup: 'MPC',
    intermediateYear: '1st Year',
    section: 'A',
    academicYear: '2026-2027',
  });
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [assignmentToRemove, setAssignmentToRemove] = useState(null);
  const [removingAssignment, setRemovingAssignment] = useState(false);

  const handleConfirmRemoveAssignment = async () => {
    if (!assignmentToRemove || removingAssignment) return;
    setRemovingAssignment(true);
    try {
      await facultyService.removeAssignment(faculty.id || facultyId, assignmentToRemove.id);
      showSuccess(`Section ${assignmentToRemove.section} (${assignmentToRemove.branchGroup} ${assignmentToRemove.intermediateYear}) unassigned successfully.`);
      setAssignmentToRemove(null);
      fetchProfile();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove section assignment');
    } finally {
      setRemovingAssignment(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await facultyService.getFacultyById(facultyId);
      setFaculty(data);
    } catch (err) {
      console.error('Failed to load faculty profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [facultyId]);
  useDataRefresh(['faculty', 'sections', 'students'], fetchProfile);

  useEffect(() => {
    if (showAssignModal) {
      setAssignError('');
      academicService.getAllSections()
        .then((secData) => setAllSections(secData || []))
        .catch((err) => console.error('Failed to load sections for assignment check:', err));
    }
  }, [showAssignModal]);

  // Compute unassigned sections for the selected group/year from the database
  const availableSectionsForAssign = React.useMemo(() => {
    return allSections.filter((sec) => {
      const groupMatch = sec.branchGroup?.toLowerCase() === assignForm.branchGroup?.toLowerCase();
      const yearMatch = sec.intermediateYear?.toLowerCase() === assignForm.intermediateYear?.toLowerCase();
      const isAssigned = sec.assignedFacultyName && sec.assignedFacultyName !== 'Not Assigned';
      return groupMatch && yearMatch && !isAssigned;
    });
  }, [allSections, assignForm.branchGroup, assignForm.intermediateYear]);

  // Auto-select the first available unassigned section when group/year changes
  React.useEffect(() => {
    if (availableSectionsForAssign.length > 0) {
      const firstName = availableSectionsForAssign[0].name || '';
      if (!availableSectionsForAssign.find((s) => (s.name || '').trim().toLowerCase() === (assignForm.section || '').trim().toLowerCase())) {
        setAssignForm((prev) => ({ ...prev, section: firstName }));
      }
    } else {
      setAssignForm((prev) => ({ ...prev, section: '' }));
    }
  }, [availableSectionsForAssign]);

  const assignedConflictSection = React.useMemo(() => {
    const targetSecClean = (assignForm.section || '').trim().toLowerCase().replace('section ', '');
    return allSections.find((sec) => {
      const groupMatch = sec.branchGroup?.toLowerCase() === assignForm.branchGroup?.toLowerCase();
      const yearMatch = sec.intermediateYear?.toLowerCase() === assignForm.intermediateYear?.toLowerCase();
      const secClean = (sec.name || '').trim().toLowerCase().replace('section ', '');
      const isAssigned = sec.assignedFacultyName && sec.assignedFacultyName !== 'Not Assigned';
      return groupMatch && yearMatch && secClean === targetSecClean && isAssigned;
    });
  }, [allSections, assignForm]);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    setAssignError('');

    if (assignedConflictSection) {
      setAssignError(`Section ${assignForm.section} (${assignForm.branchGroup} ${assignForm.intermediateYear}) is already assigned to ${assignedConflictSection.assignedFacultyName}.`);
      return;
    }

    setAssignSubmitting(true);
    try {
      await facultyService.addAssignment(faculty?.id || facultyId, assignForm);
      showSuccess('Section assigned to faculty successfully');
      setShowAssignModal(false);
      fetchProfile();
    } catch (err) {
      console.error('Failed to add assignment:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to assign section to faculty.';
      setAssignError(msg);
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Helper formatter to satisfy "Zero N/A Policy"
  const formatVal = (val, suffix = '') => {
    if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).toUpperCase() !== 'N/A') {
      return `${val}${suffix}`;
    }
    return <span className="text-slate-400 font-medium italic">Not Provided</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-24 text-center font-sans space-y-3">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent shadow-md" />
          <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Loading faculty profile record...</p>
        </div>
      </Layout>
    );
  }

  if (!faculty) {
    return (
      <Layout>
        <div className="py-16 text-center text-slate-500 font-sans space-y-4">
          <p className="text-base font-bold text-slate-800 dark:text-white">Faculty record not found.</p>
          <button
            onClick={() => navigate('/admin/faculty')}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
          >
            Back to Faculty Directory
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/faculty')}
            className="text-xs font-extrabold text-slate-500 hover:text-blue-600 flex items-center space-x-1.5 cursor-pointer transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Faculty Management</span>
          </button>
        </div>

        {/* Enterprise Website Theme Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={faculty.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={faculty.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white/30 shadow-2xl shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Active Staff" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {faculty.fullName}
                </h1>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white font-mono text-xs font-black rounded-lg border border-white/30">
                  {faculty.facultyId || faculty.employeeId}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-blue-100 font-medium">
                <span>Designation: <strong className="text-white font-bold">{faculty.designation || 'Lecturer'}</strong></span>
                <span>Department: <strong className="text-white font-bold">{faculty.department || 'General Sciences'}</strong></span>
                <span>Primary Group: <strong className="text-white font-bold">{faculty.primaryGroup || 'MPC'}</strong></span>
                <span>Emp ID: <strong className="text-white font-bold">{faculty.employeeId || 'EMP-1001'}</strong></span>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                <span className="px-3 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {faculty.status || 'ACTIVE'}
                </span>
                <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-md text-[11px] font-extrabold border border-white/20">
                  {faculty.assignments?.length || 0} Assigned Sections
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setShowAssignModal(true)}
                className="py-2.5 px-4 text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Assign Section</span>
              </button>

              <Link
                to={`/admin/faculty/${faculty.id}/edit`}
                className="py-2.5 px-4 text-xs font-extrabold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition flex items-center space-x-1.5 backdrop-blur-md cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
          )}
        </div>

        {/* Responsive Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1.5 text-xs font-extrabold overflow-x-auto pb-0.5">
          {[
            { id: 'personal', label: '1. Personal Information', icon: User },
            { id: 'contact', label: '2. Contact Details', icon: Phone },
            { id: 'professional', label: '3. Professional Details', icon: Briefcase },
            { id: 'assignments', label: `4. Section Assignments (${faculty.assignments?.length || 0})`, icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 sm:px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Card Contents Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs space-y-6 animate-fadeIn">
          
          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">First Name</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.firstName)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Last Name</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.lastName)}</p>
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                  <p className="font-black text-slate-900 dark:text-white text-sm">{formatVal(faculty.fullName)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Gender</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.gender)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Date of Birth</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.dateOfBirth)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Blood Group</span>
                  <p className="font-extrabold text-rose-600 dark:text-rose-400">{formatVal(faculty.bloodGroup)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Employment Status</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-full text-[10px] inline-block">
                    {faculty.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT DETAILS */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Email Address</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{formatVal(faculty.email)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Mobile Number</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.mobileNumber)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Alternate Mobile</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.alternateMobile)}</p>
                </div>

                <div className="space-y-1 col-span-full">
                  <span className="text-[11px] font-bold text-slate-400 block">Residential Address</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.address)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">City</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.city)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">State</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.state)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">PIN Code</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.pinCode)}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFESSIONAL DETAILS */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Professional Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Faculty ID</span>
                  <p className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">{formatVal(faculty.facultyId || faculty.employeeId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Employee ID</span>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.employeeId)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Designation</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.designation)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Department</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.department)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Primary Group</span>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400">{formatVal(faculty.primaryGroup)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Qualification</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.qualification)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Employment Type</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.employmentType)}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Experience</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.experience, ' Years')}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">Joining Date</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{formatVal(faculty.joiningDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECTION ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Academic Section Assignments ({faculty.assignments?.length || 0})</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Class sections, academic years, and subjects assigned to this faculty member.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Assignment</span>
                  </button>
                )}
              </div>

              {!faculty.assignments || faculty.assignments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                  <Layers className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No section assignments created yet.</p>
                  <p className="text-xs text-slate-400 font-medium">Click "Add New Assignment" above to assign classes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {faculty.assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {asg.branchGroup} - {asg.intermediateYear}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-black rounded text-[10px]">
                            Section {asg.section}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Academic Year: <strong className="text-slate-800 dark:text-slate-200">{asg.academicYear}</strong>{asg.subjectName ? ` • Subject: ${asg.subjectName}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-full text-[10px]">
                          ACTIVE
                        </span>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setAssignmentToRemove(asg)}
                            title="Unassign Section"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Assign Section to Faculty
              </h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                {faculty.fullName}
              </span>
            </div>

            {(assignError || assignedConflictSection) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  {assignError || `Section ${assignForm.section} (${assignForm.branchGroup} ${assignForm.intermediateYear}) is already assigned to ${assignedConflictSection?.assignedFacultyName}. Please choose an unassigned section.`}
                </div>
              </div>
            )}

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Branch / Group</label>
                <select
                  value={assignForm.branchGroup}
                  onChange={(e) => setAssignForm({ ...assignForm, branchGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600 outline-none"
                >
                  <option value="MPC">MPC</option>
                  <option value="BiPC">BiPC</option>
                  <option value="MEC">MEC</option>
                  <option value="CEC">CEC</option>
                  <option value="HEC">HEC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Intermediate Year</label>
                <select
                  value={assignForm.intermediateYear}
                  onChange={(e) => setAssignForm({ ...assignForm, intermediateYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section <span className="text-[10px] text-slate-400 font-medium">(Only Unassigned Sections Shown)</span>
                </label>
                {availableSectionsForAssign.length === 0 ? (
                  <div className="w-full px-3.5 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>No unassigned sections available for {assignForm.branchGroup} — {assignForm.intermediateYear}. All sections already have faculty assigned.</span>
                  </div>
                ) : (
                  <select
                    value={assignForm.section}
                    onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none"
                  >
                    {availableSectionsForAssign.map((sec) => (
                      <option key={sec.id} value={sec.name} className="text-slate-900 font-bold">
                        Section {sec.name} ✅ (Available)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={assignForm.academicYear}
                  onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting || Boolean(assignedConflictSection) || availableSectionsForAssign.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignSubmitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unassign Section Confirmation Modal */}
      {assignmentToRemove && (
        <DeleteConfirmationModal
          isOpen={!!assignmentToRemove}
          onClose={() => setAssignmentToRemove(null)}
          onConfirm={handleConfirmRemoveAssignment}
          title="Unassign Section"
          message={`Are you sure you want to unassign Section ${assignmentToRemove?.section} (${assignmentToRemove?.branchGroup} ${assignmentToRemove?.intermediateYear}) from ${faculty?.fullName}?`}
          confirmText="Unassign Section"
          isDeleting={removingAssignment}
        />
      )}
    </Layout>
  );
};

export default FacultyProfile;
