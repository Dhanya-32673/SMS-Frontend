import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import OtpInput from '../../components/OtpInput';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  KeyRound,
  Mail,
  Check
} from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'standard' ? 'STANDARD' : 'FACULTY';

  const [mode, setMode] = useState(initialMode); // 'FACULTY' | 'STANDARD'
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !cleanOtp || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (cleanOtp.length !== 6) {
      setError('OTP must be a 6-digit number');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'FACULTY') {
        await authService.adminResetFacultyPassword({
          facultyEmail: cleanEmail,
          otp: cleanOtp,
          newPassword,
          confirmPassword,
        });
      } else {
        await authService.resetPassword(cleanEmail, cleanOtp, newPassword, confirmPassword);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fbff] via-[#eef4ff] to-[#e8f1ff] p-4 sm:p-6 relative font-sans overflow-hidden">
      
      {/* Dashboard Style Floating Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Admin Dashboard Style Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[560px] w-full bg-white rounded-[32px] border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-8 sm:p-12 space-y-6 relative z-10"
      >
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header Branding Section */}
        <div className="text-center space-y-3">
          
          {/* Top Enterprise Security Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 text-blue-700 font-extrabold uppercase tracking-widest text-[11px] rounded-full border border-blue-200/60 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>ENTERPRISE SECURITY</span>
          </div>

          {/* Bhashyam Educational Institution Logo Header */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="bg-[#2563eb] rounded-2xl p-3.5 px-6 shadow-xl shadow-blue-500/25 border border-blue-500/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md shrink-0">
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
                  <ShieldCheck className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <span className="font-black text-white text-2xl tracking-wider block leading-none">BHASHYAM</span>
                <span className="text-[10px] text-blue-100 font-extrabold uppercase tracking-widest block mt-1">EDUCATIONAL INSTITUTION</span>
              </div>
            </div>
          </div>

          {/* 42px Dashboard Typography */}
          <h1 className="text-3xl sm:text-[42px] leading-tight font-black text-slate-900 tracking-tight">
            {mode === 'FACULTY' ? 'Faculty Reset' : 'Reset Password'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 text-center leading-relaxed">
            {mode === 'FACULTY'
              ? 'Enter Faculty Email, the 6-digit OTP code sent to Admin email, and new password.'
              : 'Enter the 6-digit code sent to your email and set your new password.'}
          </p>
        </div>

        {/* Dashboard Role Selector Toggle Container */}
        <div className="flex bg-slate-100 p-1.5 rounded-[18px] border border-slate-200/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('STANDARD'); setError(''); }}
            className={`flex-1 py-3 rounded-[14px] transition-all cursor-pointer ${
              mode === 'STANDARD' ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            General User
          </button>
          <button
            type="button"
            onClick={() => { setMode('FACULTY'); setError(''); }}
            className={`flex-1 py-3 rounded-[14px] transition-all cursor-pointer ${
              mode === 'FACULTY' ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin User
          </button>
        </div>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Card State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-[28px] bg-emerald-50 border border-emerald-200 text-center space-y-4 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-emerald-900">Password Reset Successful!</h3>
            <p className="text-xs sm:text-sm text-emerald-700 font-medium">Your password has been updated securely. Redirecting to login page...</p>
          </motion.div>
        ) : (
          /* Form (64px Inputs, 18px Radius) */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                {mode === 'FACULTY' ? 'Faculty Email Address' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'FACULTY' ? "faculty.email@college.edu" : "Registered Email"}
                  required
                  className="w-full pl-12 pr-4 h-[64px] bg-white border-2 border-slate-200 rounded-[18px] text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_5px_rgba(37,99,235,0.15)] transition-all duration-200"
                />
              </div>
            </div>

            {/* OTP Code */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                {mode === 'FACULTY' ? '6-Digit Admin Authorization OTP' : '6-Digit Verification Code'}
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-12 pr-12 h-[64px] bg-white border-2 border-slate-200 rounded-[18px] text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_5px_rgba(37,99,235,0.15)] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-12 pr-12 h-[64px] bg-white border-2 border-slate-200 rounded-[18px] text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_5px_rgba(37,99,235,0.15)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Dashboard CTA Button (64px Height, 18px Radius, Hover Lift & Shine) */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -3 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="relative w-full h-[64px] rounded-[18px] text-white font-bold text-base sm:text-lg bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 shadow-[0_15px_40px_rgba(37,99,235,0.35)] overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {/* Moving Light Shine Hover Effect */}
              <div className="absolute inset-0 -translate-x-full hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{mode === 'FACULTY' ? 'Approve & Reset Faculty Password' : 'Reset Password'}</span>
              )}
            </motion.button>

          </form>
        )}

      </motion.div>
    </div>
  );
};

export default ResetPassword;
