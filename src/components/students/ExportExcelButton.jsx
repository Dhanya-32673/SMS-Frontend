import React, { useState } from 'react';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import toast from '../../utils/toastService';
import studentService from '../../services/studentService';

export const ExportExcelButton = ({ className = '' }) => {
  const { user, isAdmin: contextIsAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  // Button status states: 'IDLE' | 'LOADING' | 'DOWNLOADED'
  const [status, setStatus] = useState('IDLE');

  // Role verification: ADMIN, SUPER_ADMIN, and FACULTY can view and use
  const rawRole = (
    typeof user?.role === 'string'
      ? user.role
      : user?.role?.roleName || user?.role?.name || ''
  )
    .replace('ROLE_', '')
    .toUpperCase();

  const isAuthorized =
    contextIsAdmin ||
    rawRole === 'ADMIN' ||
    rawRole === 'SUPER_ADMIN' ||
    rawRole === 'FACULTY';

  if (!isAuthorized) {
    return null;
  }

  const handleExport = async () => {
    if (status === 'LOADING') return;

    setStatus('LOADING');

    try {
      const response = await studentService.exportStudentsToExcel();

      // Extract filename from response headers if available
      let filename = '';
      const disposition =
        response.headers?.['content-disposition'] ||
        response.headers?.['Content-Disposition'];

      if (disposition && disposition.includes('filename=')) {
        const filenameMatch = disposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
        }
      }

      // Fallback filename formatted as students_directory_yyyy_MM_dd_HH_mm.xlsx
      if (!filename) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const min = pad(now.getMinutes());
        filename = `students_directory_${yyyy}_${mm}_${dd}_${hh}_${min}.xlsx`;
      }

      // Create a Blob from the response data stream
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Trigger automatic browser download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Transition to 'Downloaded' state
      setStatus('DOWNLOADED');

      // Success notification
      if (typeof showSuccess === 'function') {
        showSuccess('Excel downloaded successfully');
      } else {
        toast.success('Excel downloaded successfully');
      }

      // Revert back to 'IDLE' ("Export Excel") after exactly 2 seconds
      setTimeout(() => {
        setStatus('IDLE');
      }, 2000);
    } catch (err) {
      console.error('Failed to export students Excel:', err);
      setStatus('IDLE');

      // Failure notification
      const errorMsg = 'Failed to export student data';
      if (typeof showError === 'function') {
        showError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  return (
    <button
      type="button"
      id="export-students-excel-btn"
      onClick={handleExport}
      disabled={status === 'LOADING'}
      className={`py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-md inline-flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer select-none disabled:cursor-not-allowed ${
        status === 'DOWNLOADED'
          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 ring-2 ring-emerald-400/30'
          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98]'
      } ${className}`}
      title={
        status === 'LOADING'
          ? 'Generating Excel document...'
          : 'Export all students data to Excel (.xlsx)'
      }
    >
      {status === 'LOADING' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
          <span>Preparing Excel...</span>
        </>
      )}

      {status === 'DOWNLOADED' && (
        <>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white animate-bounce" />
          <span>Downloaded</span>
        </>
      )}

      {status === 'IDLE' && (
        <>
          <Download className="w-4 h-4 shrink-0" />
          <span>Export Excel</span>
        </>
      )}
    </button>
  );
};

export default ExportExcelButton;
