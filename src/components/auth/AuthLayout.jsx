import React from 'react';
import { motion } from 'framer-motion';
import AuthLeftBrandPanel from './AuthLeftBrandPanel';

export const AuthLayout = ({ children, title = "Admin Portal", subtitle = "Student Information & Certificate Management System" }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-3 sm:p-4 lg:p-6 font-sans relative overflow-x-hidden">
      
      {/* Background Soft Ambient Light Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Card Container (Compact 1040px Max Width, 620px Desktop Height) */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1040px] w-full bg-white rounded-[24px] shadow-[0_20px_50px_rgba(15,23,42,0.1)] border border-[#eef2ff] flex flex-col lg:flex-row overflow-hidden relative z-10 my-auto lg:h-[620px]"
      >
        {/* Left Branding Panel (42% Width on Desktop) */}
        <AuthLeftBrandPanel title={title} subtitle={subtitle} />

        {/* Right Authentication Content Container (58% Width on Desktop) */}
        <div className="w-full lg:w-[58%] p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white relative overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
