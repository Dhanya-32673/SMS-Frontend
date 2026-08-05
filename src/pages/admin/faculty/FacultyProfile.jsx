import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import facultyService from '../../../services/facultyService';
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
  BookOpen
} from 'lucide-react';

export const FacultyProfile = () => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  // New assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    branchGroup: 'MPC',
    intermediateYear: '1st Year',
    section: 'A',
    academicYear: '2026-2027',
    subjectName: 'Mathematics I',
  });
  const [assignSubmitting, setAssignSubmitting] = useState(false);

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

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    setAssignSubmitting(true);
    try {
      await facultyService.addAssignment(facultyId, assignForm);
      setShowAssignModal(false);
      fetchProfile();
    } catch (err) {
      console.error('Failed to add assignment:', err);
    } finally {
      setAssignSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-slate-400">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#5b50e5] border-t-transparent mb-2" />
          <p className="text-xs">Loading Faculty Profile...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!faculty) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-slate-500 font-semibold">
          Faculty record not found.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="text-xs text-slate-400 font-semibold mb-1 flex items-center space-x-1">
              <Link to="/admin/dashboard" className="hover:text-indigo-600">Dashboard</Link>
              <span>›</span>
              <Link to="/admin/faculty" className="hover:text-indigo-600">Faculty Management</Link>
              <span>›</span>
              <span className="text-slate-700 dark:text-slate-200">Faculty Profile</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {faculty.fullName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty ID: <span className="font-mono font-bold text-[#5b50e5]">{faculty.facultyId}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#5b50e5] hover:bg-[#4b40d5] rounded-xl shadow-md shadow-indigo-500/20 transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Assign Section
            </button>
            <Link
              to={`/admin/faculty/${faculty.id}/edit`}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Container: Left Card + Right Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Summary Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
              <img
                src={faculty.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={faculty.fullName}
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-md mb-3"
              />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{faculty.fullName}</h2>
              <p className="text-xs text-slate-500 font-medium">{faculty.designation}</p>
              <span className="mt-2 px-2.5 py-0.5 text-[10px] font-extrabold bg-indigo-50 text-[#5b50e5] rounded-md">
                Group: {faculty.primaryGroup}
              </span>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{faculty.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{faculty.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-bold text-emerald-600">{faculty.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tab Navigation & Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap gap-1">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'contact', label: 'Contact Details', icon: Phone },
                { id: 'professional', label: 'Professional Details', icon: Briefcase },
                { id: 'assignments', label: `Assignments (${faculty.assignments?.length || 0})`, icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 text-xs font-bold rounded-xl transition ${
                      activeTab === tab.id
                        ? 'bg-[#5b50e5] text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Personal Info */}
            {activeTab === 'personal' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">First Name</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.firstName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Name</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.lastName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.dateOfBirth || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Contact Info */}
            {activeTab === 'contact' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b pb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alternate Mobile</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.alternateMobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Residential Address</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Professional Info */}
            {activeTab === 'professional' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b pb-2">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Designation</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Qualification</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.qualification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Employment Type</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Experience</span>
                    <span className="font-bold text-slate-800 dark:text-white">{faculty.experience || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Assignments */}
            {activeTab === 'assignments' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Academic Section Assignments
                  </h3>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="text-xs font-bold text-[#5b50e5] hover:underline"
                  >
                    + Add New Assignment
                  </button>
                </div>

                {!faculty.assignments || faculty.assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center font-medium">
                    No section assignments created for this faculty member yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {faculty.assignments.map((asg) => (
                      <div key={asg.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {asg.branchGroup} - {asg.intermediateYear} (Sec {asg.section})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Academic Year: {asg.academicYear} • Subject: {asg.subjectName || 'General'}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">
              Assign Section to Faculty
            </h3>
            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Group</label>
                <select
                  value={assignForm.branchGroup}
                  onChange={(e) => setAssignForm({ ...assignForm, branchGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#5b50e5]"
                >
                  <option value="MPC">MPC</option>
                  <option value="BiPC">BiPC</option>
                  <option value="MEC">MEC</option>
                  <option value="CEC">CEC</option>
                  <option value="HEC">HEC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intermediate Year</label>
                <select
                  value={assignForm.intermediateYear}
                  onChange={(e) => setAssignForm({ ...assignForm, intermediateYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                <select
                  value={assignForm.section}
                  onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={assignForm.academicYear}
                  onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="px-4 py-2 bg-[#5b50e5] text-white rounded-xl font-bold shadow-md shadow-indigo-500/20"
                >
                  {assignSubmitting ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default FacultyProfile;
