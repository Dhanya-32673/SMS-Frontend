import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import StudentStatusBadge from '../../../components/students/StudentStatusBadge';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import studentService from '../../../services/studentService';
import certificateService from '../../../services/certificateService';
import DeleteStudentModal from '../../../components/students/DeleteStudentModal';
import {
  CreditCard,
  Edit3,
  Trash2,
  User,
  Phone,
  Users,
  BookOpen,
  Award,
  Upload,
  Lock,
  Eye,
  CheckCircle2,
  ChevronLeft,
  FileText
} from 'lucide-react';

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PERSONAL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
        const docs = await certificateService.getStudentDocuments(id);
        setDocuments(docs || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Student profile not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await studentService.deleteStudent(student.studentId || id);
      navigate('/admin/students');
    } catch (err) {
      setError('Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center text-slate-400 font-sans">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
          <p className="text-xs font-bold">Loading student profile record...</p>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="py-16 text-center text-slate-500 font-sans space-y-4">
          <p className="text-base font-bold text-slate-800 dark:text-white">{error || 'Student not found.'}</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
          >
            Back to Students Directory
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 font-sans">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/students')}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Students List</span>
          </button>
        </div>

        {/* Header Profile Banner Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <img
              src={student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {student.fullName}
                </h1>
                <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md text-white font-mono text-[10px] font-extrabold rounded-lg border border-white/20">
                  {student.studentId}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                Roll No: <strong className="text-white">{student.rollNumber || 'N/A'}</strong> • Group: <strong className="text-white">{student.branchGroup || student.academicDetail?.branchGroup || 'MPC'}</strong> • Year: <strong>{student.intermediateYear || student.academicDetail?.intermediateYear || '1st Year'}</strong> • Section: <strong>Section {student.section || student.academicDetail?.section || 'A'}</strong>
              </p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                <StudentStatusBadge status={student.status} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 shrink-0">
            <button
              onClick={() => navigate(`/admin/students/${student.studentId}/id-card`)}
              className="py-2.5 px-4 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>ID Card</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => navigate(`/admin/students/${id}/edit`)}
                  className="py-2.5 px-4 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2.5 text-white/90 hover:text-white bg-rose-500/30 hover:bg-rose-500/40 border border-white/20 rounded-xl transition cursor-pointer"
                  title="Delete Student"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'PERSONAL', label: '1. Personal Info', icon: User },
            { id: 'CONTACT', label: '2. Contact Details', icon: Phone },
            { id: 'PARENT', label: '3. Parent Details', icon: Users },
            { id: 'ACADEMIC', label: '4. Academic Info', icon: BookOpen },
            { id: 'CERTIFICATES', label: '5. Certificates & Documents', icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Card Contents */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs space-y-6 animate-fadeIn">
          
          {activeTab === 'PERSONAL' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">First Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.firstName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Middle Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.middleName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Last Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.lastName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Date of Birth</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.dateOfBirth || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Gender</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.gender || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Blood Group</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.bloodGroup || '-'}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/40 col-span-full sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Encrypted Aadhaar Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{student.maskedAadhaar || 'XXXX XXXX 1234'}</span>
                </div>
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          )}

          {activeTab === 'CONTACT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Mobile Number</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.mobileNumber || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Email Address</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">{student.email || '-'}</p>
              </div>
              <div className="space-y-1 col-span-full">
                <span className="text-[11px] font-bold text-slate-400 block">Residential Address</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.address || '-'}</p>
              </div>
            </div>
          )}

          {activeTab === 'PARENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Father Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.fatherName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Mother Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.motherName || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Parent Mobile</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.parentMobile || '-'}</p>
              </div>
            </div>
          )}

          {activeTab === 'ACADEMIC' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Intermediate Group</span>
                <p className="font-extrabold text-blue-600 dark:text-blue-400">{student.branchGroup || 'MPC'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Academic Year</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{student.intermediateYear || '1st Year'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Assigned Section</span>
                <p className="font-extrabold text-slate-900 dark:text-white">Section {student.section || 'A'}</p>
              </div>
            </div>
          )}

          {activeTab === 'CERTIFICATES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Uploaded PDF Documents ({documents.length})
                </h3>
                <button
                  onClick={() => navigate(`/admin/certificates/upload?studentId=${student.studentId}`)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Certificate</span>
                </button>
              </div>

              {documents.length === 0 ? (
                <p className="text-center py-8 text-slate-400 font-medium">No certificates uploaded for this student yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{doc.documentTypeName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{doc.originalFileName || 'certificate.pdf'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition cursor-pointer"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {selectedDoc && (
        <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          student={student}
          loading={deleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Layout>
  );
};

export default StudentProfile;
