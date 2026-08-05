import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyForm from '../../../components/faculty/FacultyForm';
import facultyService from '../../../services/facultyService';
import { UserPlus } from 'lucide-react';

export const AddFaculty = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (formData, photoFile) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const created = await facultyService.createFaculty(formData);
      if (photoFile && created && created.id) {
        try {
          await facultyService.uploadFacultyPhoto(created.id, photoFile);
        } catch (photoErr) {
          console.warn('Faculty photo upload warning:', photoErr);
        }
      }
      navigate('/admin/faculty');
    } catch (err) {
      console.error('Failed to create faculty:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create faculty member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans max-w-5xl mx-auto">
        {/* Header & Breadcrumbs */}
        <div>
          <nav className="text-xs text-slate-400 font-semibold mb-1 flex items-center space-x-1">
            <Link to="/admin/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/faculty" className="hover:text-indigo-600">Faculty Management</Link>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-200">Add Faculty</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <UserPlus className="w-6 h-6 mr-2 text-[#5b50e5]" />
            Add New Faculty Member
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register a new faculty record and auto-generate their login credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <FacultyForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/faculty')}
          submitting={submitting}
        />
      </div>
    </AdminLayout>
  );
};

export default AddFaculty;
