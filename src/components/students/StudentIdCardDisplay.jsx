import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GraduationCap, ShieldCheck, Printer } from 'lucide-react';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';

export const StudentIdCardDisplay = ({ idCardData }) => {
  if (!idCardData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Identity Card Container */}
      <div className="w-[380px] bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 text-white rounded-3xl border-2 border-purple-500/30 shadow-2xl overflow-hidden p-6 space-y-5 print:shadow-none print:border-slate-300">

        {/* Card Header: College Logo & Name */}
        <div className="flex items-center space-x-3.5 border-b border-purple-500/30 pb-4">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-white/20">
            <img
              src="https://ookzjdmkoaunbrufvmvq.supabase.co/storage/v1/object/public/student-profile-photos/info/ChatGPT%20Image%20Aug%206,%202026,%2012_07_23%20AM.png"
              alt="Bhashyam Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-wider uppercase text-purple-200">
              {idCardData.collegeName || 'BHASHYAM EDUCATIONAL INSTITUTION'}
            </h2>
            <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-extrabold tracking-widest uppercase border border-purple-500/30">
              STUDENT IDENTITY CARD
            </span>
          </div>
        </div>

        {/* Card Body: Photo & Key Details */}
        <div className="flex items-start space-x-4">
          <img
            src={idCardData.studentPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
            alt={idCardData.studentName}
            className="w-24 h-28 rounded-2xl object-cover border-2 border-purple-400/40 shadow-lg shrink-0"
          />

          <div className="flex-1 min-w-0 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Student Name</span>
              <p className="font-extrabold text-sm text-white truncate">{idCardData.studentName}</p>
            </div>

            <div>
              <span className="text-[10px] text-purple-400 block uppercase tracking-wider font-bold">Student ID</span>
              <p className="font-mono font-bold text-xs text-purple-300">{idCardData.studentId}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-[9px] text-slate-400 block">Roll No</span>
                <span className="font-semibold text-slate-200">{idCardData.rollNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block">Group</span>
                <span className="font-bold text-purple-400">{formatBranchGroup(idCardData.branchGroup)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details Row */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-center text-[10px]">
          <div>
            <span className="text-slate-400 block text-[9px]">Year</span>
            <span className="font-bold text-slate-200">{formatIntermediateYear(idCardData.intermediateYear)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">Section</span>
            <span className="font-bold text-slate-200">{formatSectionName(idCardData.section)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">Academic Year</span>
            <span className="font-bold text-purple-300">{idCardData.academicYear || '2026-2027'}</span>
          </div>
        </div>

        {/* Card Footer: Non-PII Verification QR Code */}
        <div className="flex items-center justify-between border-t border-purple-500/20 pt-4">
          <div className="space-y-1">
            <div className="flex items-center text-[10px] text-emerald-400 font-bold space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Record Verified</span>
            </div>
            <p className="text-[9px] text-slate-400">Scan QR Code for Safe Online Verification</p>
          </div>

          <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
            <QRCodeSVG
              value={idCardData.qrCodePayload || `https://sicms.example.com/student/verify/${idCardData.studentId}`}
              size={64}
              level="H"
            />
          </div>
        </div>
      </div>

      {/* Print Action Button */}
      <button
        onClick={handlePrint}
        className="px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-600/20 flex items-center space-x-2 print:hidden"
      >
        <Printer className="w-4 h-4" />
        <span>Print Identity Card</span>
      </button>
    </div>
  );
};

export default StudentIdCardDisplay;
