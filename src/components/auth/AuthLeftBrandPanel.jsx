import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, UserCheck, GraduationCap } from 'lucide-react';

export const AuthLeftBrandPanel = ({ title = "Admin Portal", subtitle = "Student Information & Certificate Management System" }) => {
  return (
    <div className="relative w-full lg:w-[42%] bg-gradient-to-br from-[#0f4fff] via-[#2563eb] to-[#3b82f6] p-6 lg:p-7 text-white flex flex-col justify-between overflow-hidden min-h-[360px] lg:min-h-full rounded-t-[24px] lg:rounded-t-none lg:rounded-l-[24px] shrink-0">
      
      {/* Background Glows & Dot Grid Accent */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 left-4 grid grid-cols-4 gap-1.5 opacity-20 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-full" />
        ))}
      </div>

      {/* Faded Campus Building Overlay at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none overflow-hidden opacity-15">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1000&q=80"
          alt="Campus Architecture"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f4fff] via-[#2563eb]/60 to-transparent" />
      </div>

      {/* Top Header Logo Section (Height 56px, Badge Width 220px) */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-4 rounded-xl border border-white/20 shadow-md h-[56px] max-w-[230px]">
          <div className="w-[42px] h-[42px] bg-white rounded-lg p-1 flex items-center justify-center shadow-md shrink-0">
            <img
              src="https://ookzjdmkoaunbrufvmvq.supabase.co/storage/v1/object/public/student-profile-photos/info/ChatGPT%20Image%20Aug%206,%202026,%2012_07_23%20AM.png"
              alt="Bhashyam Educational Institution"
              className="w-full h-full object-contain"
              loading="eager"
              onError={(e) => {
                e.target.classList.add('hidden');
                if (e.target.nextSibling) e.target.nextSibling.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full rounded-md bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-black text-white text-lg tracking-wider block leading-none">BHASHYAM</span>
            <span className="text-[8.5px] text-blue-100 font-extrabold uppercase tracking-widest block mt-0.5">EDUCATIONAL INSTITUTION</span>
          </div>
        </div>
      </div>

      {/* Center Branding Titles & Cyan Accent (Compact Font Sizes) */}
      <div className="relative z-10 my-4 lg:my-auto space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-none"
        >
          {title}
        </motion.h1>
        
        <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xs leading-relaxed">
          {subtitle}
        </p>

        {/* Decorative Cyan Gradient Line */}
        <div className="w-10 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300 my-2.5" />
      </div>

      {/* Bottom 3 Glassmorphism Feature Cards (Height 92px, Icon 44px, Gap space-y-2) */}
      <div className="relative z-10 space-y-2 pt-2">
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Secure Access</h4>
            <p className="text-[11px] text-white/80 font-normal">OTP based authentication</p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <RefreshCw className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Data Protection</h4>
            <p className="text-[11px] text-white/80 font-normal">Your data is safe with us</p>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Easy Management</h4>
            <p className="text-[11px] text-white/80 font-normal">Manage students & certificates efficiently</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLeftBrandPanel;
