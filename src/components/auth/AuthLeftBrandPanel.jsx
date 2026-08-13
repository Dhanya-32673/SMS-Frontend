import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, UserCheck, GraduationCap } from 'lucide-react';

export const AuthLeftBrandPanel = ({ title = "Admin Portal", subtitle = "Student Information & Certificate Management System" }) => {
  return (
    <div className="relative w-full lg:w-[45%] bg-gradient-to-br from-[#0f4fff] via-[#2563eb] to-[#3b82f6] p-8 lg:p-12 text-white flex flex-col justify-between overflow-hidden min-h-[400px] lg:min-h-full rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[32px]">
      
      {/* Background Glows & Dot Grid Accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-6 left-6 grid grid-cols-4 gap-2 opacity-20 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
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

      {/* Top Header Logo Section */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3.5 bg-white/10 backdrop-blur-md p-2.5 pr-5 rounded-2xl border border-white/20 shadow-lg">
          <div className="w-11 h-11 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
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
            <div className="hidden w-full h-full rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-left">
            <span className="font-black text-white text-xl tracking-wider block leading-none">BHASHYAM</span>
            <span className="text-[9px] text-blue-100 font-extrabold uppercase tracking-widest block mt-0.5">EDUCATIONAL INSTITUTION</span>
          </div>
        </div>
      </div>

      {/* Center Branding Titles & Cyan Accent */}
      <div className="relative z-10 my-8 lg:my-auto space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-white tracking-tight leading-none"
        >
          {title}
        </motion.h1>
        
        <p className="text-base sm:text-lg text-white/90 font-medium max-w-md leading-relaxed">
          {subtitle}
        </p>

        {/* Decorative Cyan Gradient Line */}
        <div className="w-14 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300 my-4" />
      </div>

      {/* Bottom 3 Glassmorphism Feature Cards */}
      <div className="relative z-10 space-y-3.5 pt-4">
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-2xl border border-white/15 p-3.5 flex items-center gap-4 transition duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-snug">Secure Access</h4>
            <p className="text-xs text-white/80 font-normal">OTP based authentication</p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-2xl border border-white/15 p-3.5 flex items-center gap-4 transition duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-snug">Data Protection</h4>
            <p className="text-xs text-white/80 font-normal">Your data is safe with us</p>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-2xl border border-white/15 p-3.5 flex items-center gap-4 transition duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-snug">Easy Management</h4>
            <p className="text-xs text-white/80 font-normal">Manage students & certificates efficiently</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLeftBrandPanel;
