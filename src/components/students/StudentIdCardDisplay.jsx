import React from 'react';
import { Printer } from 'lucide-react';
import StudentIdCard from './StudentIdCard';

/**
 * StudentIdCardDisplay
 * Wraps the StudentIdCard component with print functionality and container layout.
 */
export const StudentIdCardDisplay = ({ idCardData, student }) => {
  if (!idCardData && !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full px-2 sm:px-0">
      {/* Printable ID Card Container */}
      <div className="id-card-print-target w-full flex justify-center">
        <StudentIdCard idCardData={idCardData} student={student} />
      </div>

      {/* Print Action Button */}
      <div className="flex items-center justify-center gap-3 w-full max-w-[360px] sm:max-w-[380px] print:hidden">
        <button
          onClick={handlePrint}
          className="w-full py-3 px-6 text-xs font-black uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition cursor-pointer min-h-[44px] active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" />
          <span>Print Identity Card</span>
        </button>
      </div>
    </div>
  );
};

export { StudentIdCard };
export default StudentIdCardDisplay;
