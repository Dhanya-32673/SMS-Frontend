import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle, Edit3 } from 'lucide-react';
import StudentForm from '../../../components/students/StudentForm';
import studentService from '../../../services/studentService';
import AdminLayout from '../../../layouts/AdminLayout';
import { useToast } from '../../../context/ToastContext';

export const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const data = await studentService.getStudentById(id);
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student:', err);
        setError('Failed to load student data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleSubmit = async (formData, photoFile) => {
    setSubmitting(true);
    setError('');
    try {
      await studentService.updateStudent(id, formData);
      if (photoFile) {
        try {
          await studentService.uploadStudentPhoto(id, photoFile);
        } catch (photoErr) {
          console.warn('Photo upload warning:', photoErr);
        }
      }
      showSuccess('Student updated successfully');
      navigate(`/admin/students/${id}`);
    } catch (err) {
      console.error('Failed to update student:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update student.';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading student details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !student) {
    return (
      <AdminLayout>
        <div className="py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Error Loading Student</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => navigate('/admin/students')}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Back to All Students
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
              <Link to={`/admin/students/${id}`} className="hover:text-white transition font-mono">{id}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-bold">Edit</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Edit Student Record</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Updating profile for <span className="font-mono font-black">{id}</span>
              {student?.fullName ? ` — ${student.fullName}` : ''}
            </p>
          </div>
          <button
            onClick={() => navigate(`/admin/students/${id}`)}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-2xl shadow-lg transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            Cancel & Back
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
              <Edit3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Edit Student Information</h2>
              <p className="text-xs text-slate-400">Update the fields below and save</p>
            </div>
          </div>
          <div className="p-6">
            <StudentForm
              initialValues={student}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admin/students/${id}`)}
              isEdit={true}
              submitting={submitting}
            />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default EditStudent;
