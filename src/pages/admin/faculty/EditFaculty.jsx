import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyForm from '../../../components/faculty/FacultyForm';
import facultyService from '../../../services/facultyService';
import { Edit, AlertCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export const EditFaculty = () => {
  const params = useParams();
  const facultyId = params.id || params.facultyId;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadFaculty = async () => {
    if (!facultyId) {
      setLoading(false);
      setErrorMsg('No faculty identifier provided in the route.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await facultyService.getFacultyById(facultyId);
      setFacultyData(data);
    } catch (err) {
      console.error('Failed to load faculty:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load faculty details from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [facultyId]);

  const handleSubmit = async (formData, photoFile) => {
    const targetId = facultyData?.id || facultyId;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await facultyService.updateFaculty(targetId, formData);
      if (photoFile && targetId) {
        try {
          await facultyService.uploadFacultyPhoto(targetId, photoFile);
        } catch (photoErr) {
          console.warn('Faculty photo update warning:', photoErr);
        }
      }
      showSuccess('Faculty record updated successfully');
      navigate(`/admin/faculty/${targetId}`);
    } catch (err) {
      console.error('Failed to update faculty:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update faculty.';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center font-sans space-y-3">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent shadow-md" />
          <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">Loading faculty details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!facultyData && !loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center font-sans max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Faculty Record Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {errorMsg || `The requested faculty member (${facultyId}) could not be found.`}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={loadFaculty}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/admin/faculty')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Back to Faculty Directory
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans max-w-5xl mx-auto">
        {/* Header & Breadcrumb */}
        <div>
          <nav className="text-xs text-slate-400 font-semibold mb-1 flex items-center space-x-1">
            <Link to="/admin/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/faculty" className="hover:text-blue-600">Faculty Management</Link>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-200">Edit Faculty</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <Edit className="w-6 h-6 mr-2 text-blue-600" />
            Edit Faculty: {facultyData?.fullName}
          </h1>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <FacultyForm
          initialValues={facultyData}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/faculty')}
          isEdit={true}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

export default EditFaculty;
