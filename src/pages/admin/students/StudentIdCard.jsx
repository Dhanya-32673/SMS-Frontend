import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Printer, Download, AlertCircle } from 'lucide-react';
import StudentIdCardDisplay from '../../../components/students/StudentIdCardDisplay';
import studentService from '../../../services/studentService';
import AdminLayout from '../../../layouts/AdminLayout';

export const StudentIdCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idCardData, setIdCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdCard = async () => {
      setLoading(true);
      try {
        const data = await studentService.getStudentIdCard(id);
        setIdCardData(data);
      } catch (err) {
        console.error('Failed to load ID card:', err);
        setError(err.response?.data?.message || 'Failed to load ID card data.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdCard();
  }, [id]);

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Student Identity
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Student ID Card</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Official college identity card for <span className="font-mono font-black">{id}</span>
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-2xl shadow-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm py-20 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400">Generating Student Identity Card...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-rose-200 shadow-sm p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 print:p-0 print:border-none print:shadow-none">
            <StudentIdCardDisplay idCardData={idCardData} />
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default StudentIdCard;
