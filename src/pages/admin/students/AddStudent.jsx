import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle, UserPlus, Users } from 'lucide-react';
import StudentForm from '../../../components/students/StudentForm';
import studentService from '../../../services/studentService';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const Layout = user?.role === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData, photoFile) => {
    setSubmitting(true);
    setError('');
    try {
      const createdStudent = await studentService.createStudent(formData);
      if (photoFile && createdStudent.studentId) {
        try {
          await studentService.uploadStudentPhoto(createdStudent.studentId, photoFile);
        } catch (photoErr) {
          console.warn('Photo upload warning:', photoErr);
        }
      }
      showSuccess('Student added successfully');
      navigate(`/admin/students/${createdStudent.studentId}`);
    } catch (err) {
      console.error('Failed to create student:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create student. Check duplicate Roll Number or Email.';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <nav className="flex items-center gap-1.5 text-[11px] text-blue-200 font-medium">
              <Link to="/admin/dashboard" className="hover:text-white transition">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/admin/students" className="hover:text-white transition">Students</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-bold">Add Student</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Enroll New Student</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Fill in all required fields to create a new student record in the system.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/students')}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-2xl shadow-lg transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            Back to All Students
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Student Registration Form</h2>
              <p className="text-xs text-slate-400">All fields marked with * are required</p>
            </div>
          </div>
          <div className="p-6">
            <StudentForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admin/students')}
              submitting={submitting}
            />
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AddStudent;
