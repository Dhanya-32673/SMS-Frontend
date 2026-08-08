import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyForm from '../../../components/faculty/FacultyForm';
import facultyService from '../../../services/facultyService';
import { Edit } from 'lucide-react';

import { useToast } from '../../../context/ToastContext';

export const EditFaculty = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadFaculty = async () => {
      setLoading(true);
      try {
        const data = await facultyService.getFacultyById(facultyId);
        setFacultyData(data);
      } catch (err) {
        console.error('Failed to load faculty:', err);
        setErrorMsg('Failed to load faculty details.');
      } finally {
        setLoading(false);
      }
    };
    loadFaculty();
  }, [facultyId]);

  const handleSubmit = async (formData, photoFile) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await facultyService.updateFaculty(facultyId, formData);
      if (photoFile && facultyData && (facultyData.id || facultyId)) {
        try {
          await facultyService.uploadFacultyPhoto(facultyData.id || facultyId, photoFile);
        } catch (photoErr) {
          console.warn('Faculty photo update warning:', photoErr);
        }
      }
      showSuccess('Faculty updated successfully');
      navigate(`/admin/faculty/${facultyId}`);
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
        <div className="py-20 text-center text-slate-400">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#5b50e5] border-t-transparent mb-2" />
          <p className="text-xs">Loading Faculty Details...</p>
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
            <Link to="/admin/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/faculty" className="hover:text-indigo-600">Faculty Management</Link>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-200">Edit Faculty</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <Edit className="w-6 h-6 mr-2 text-amber-600" />
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
