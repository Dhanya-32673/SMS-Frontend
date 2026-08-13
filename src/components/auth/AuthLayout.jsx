import React from 'react';
import { motion } from 'framer-motion';
import AuthLeftBrandPanel from './AuthLeftBrandPanel';

export const AuthLayout = ({ children, title = "Admin Portal", subtitle = "Student Information & Certificate Management System" }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      
      {/* Background Soft Ambient Light Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1200px] w-full bg-white rounded-[32px] shadow-[0_25px_60px_rgba(15,23,42,0.12)] border border-[#eef2ff] flex flex-col lg:flex-row overflow-hidden relative z-10 my-auto"
      >
        {/* Left Branding Panel (45% Width on Desktop) */}
        <AuthLeftBrandPanel title={title} subtitle={subtitle} />

        {/* Right Authentication Content Container (55% Width on Desktop) */}
        <div className="w-full lg:w-[55%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
