import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FacultyLayout from '../../../layouts/FacultyLayout';
import CertificateStatusBadge from '../../../components/certificates/CertificateStatusBadge';
import CertificateProgress from '../../../components/certificates/CertificateProgress';
import CertificatePreviewModal from '../../../components/certificates/CertificatePreviewModal';
import studentService from '../../../services/studentService';
import certificateService from '../../../services/certificateService';
import {
  ArrowLeft, CreditCard, User, Phone, Users, BookOpen, Award, Lock, Eye, AlertCircle
} from 'lucide-react';

const InfoField = ({ label, value, mono = false, highlight = false }) => (
  <div className={`p-3 rounded-xl border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
    <span className={`block text-[10px] font-extrabold uppercase tracking-wide mb-0.5 ${highlight ? 'text-blue-500' : 'text-slate-400'}`}>
      {label}
    </span>
    <span className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>
      {value || '—'}
    </span>
  </div>
);

export const FacultyStudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PERSONAL');
  const [selectedDoc, setSelectedDoc] = useState(null);

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
        setError('Student profile not found or unauthorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;

  if (loading) {
    return (
      <FacultyLayout>
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading student profile...</p>
        </div>
      </FacultyLayout>
    );
  }

  if (error || !student) {
    return (
      <FacultyLayout>
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Profile Unavailable</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate('/faculty/students/search')}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Back to Search
          </button>
        </div>
      </FacultyLayout>
    );
  }

  const TABS = [
    { id: 'PERSONAL',      label: 'Personal',      icon: User },
    { id: 'CONTACT',       label: 'Contact',        icon: Phone },
    { id: 'PARENT',        label: 'Parent',         icon: Users },
    { id: 'ACADEMIC',      label: 'Academic',       icon: BookOpen },
    { id: 'CERTIFICATES',  label: 'Certificates',   icon: Award },
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <img
              src={student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/10 text-white/70 border border-white/20'}`}>
                  {student.status || 'ACTIVE'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{student.fullName}</h1>
              <div className="flex flex-wrap gap-3 text-[11px] text-blue-100">
                <span className="font-mono font-bold">{student.studentId}</span>
                <span>·</span>
                <span>Roll: <span className="font-mono font-bold text-white">{student.rollNumber}</span></span>
                <span>·</span>
                <span>Section <span className="font-bold text-white">{student.section || 'A'}</span></span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/faculty/students/search')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => navigate(`/faculty/students/${student.studentId}/id-card`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-2xl shadow-lg transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              ID Card
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Group',    value: student.branchGroup || 'MPC',                color: 'blue'   },
            { label: 'Year',     value: student.intermediateYear || '1st Year',       color: 'blue'   },
            { label: 'Section',  value: `Section ${student.section || 'A'}`,          color: 'blue'   },
            { label: 'Certs',    value: `${verifiedCount} Verified / ${documents.length} Total`, color: 'green' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-sm font-black text-blue-600 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabbed Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[11px] font-extrabold uppercase tracking-wide border-b-2 transition shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'PERSONAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="First Name"     value={student.firstName} />
                <InfoField label="Middle Name"    value={student.middleName} />
                <InfoField label="Last Name"      value={student.lastName} />
                <InfoField label="Date of Birth"  value={student.dateOfBirth} />
                <InfoField label="Gender"         value={student.gender} />
                <InfoField label="Blood Group"    value={student.bloodGroup} />
                <InfoField label="Nationality"    value={student.nationality || 'Indian'} />
                <InfoField label="Religion"       value={student.religion} />
                <InfoField label="Caste Category" value={student.casteCategory} />
                <InfoField label="Masked Aadhaar" value={student.maskedAadhaar || 'XXXX XXXX 1234'} mono highlight />
              </div>
            )}

            {activeTab === 'CONTACT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Mobile Number" value={student.mobileNumber} />
                <InfoField label="Email Address" value={student.email} />
                <InfoField label="Address" value={student.address} />
              </div>
            )}

            {activeTab === 'PARENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Father Name"  value={student.fatherName} />
                <InfoField label="Mother Name"  value={student.motherName} />
                <InfoField label="Parent Mobile" value={student.parentMobile} />
              </div>
            )}

            {activeTab === 'ACADEMIC' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoField label="Intermediate Group" value={student.branchGroup} />
                <InfoField label="Intermediate Year"  value={student.intermediateYear} />
                <InfoField label="Section"            value={student.section} />
                <InfoField label="Batch"              value={student.batch} />
                <InfoField label="Academic Year"      value={student.academicYear} />
                <InfoField label="Admission Date"     value={student.admissionDate} />
                <InfoField label="Hostel / Day"       value={student.hostelDayScholar} />
              </div>
            )}

            {activeTab === 'CERTIFICATES' && (
              <div className="space-y-4">
                <CertificateProgress completedCount={verifiedCount} totalCount={10} />

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Certificate Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {documents.length > 0 ? documents.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">{d.documentTypeName}</td>
                          <td className="px-4 py-3 text-slate-500">{d.category}</td>
                          <td className="px-4 py-3">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3"><CertificateStatusBadge status={d.status} /></td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedDoc(d)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-xl transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Preview
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                            No certificates uploaded for this student yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {selectedDoc && (
        <CertificatePreviewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </FacultyLayout>
  );
};

export default FacultyStudentProfile;
